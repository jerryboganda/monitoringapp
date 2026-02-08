import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { pb, getUserId } from '../../services/pocketbase';

let recording: Audio.Recording | null = null;
let autoStopTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Start a mic recording for the given duration, then auto-stop, upload, and
 * return a Promise that resolves only AFTER the upload completes.
 *
 * The returned promise settles once the full record→upload cycle finishes,
 * so the caller can await the entire operation if desired.
 */
export const startAudioRecording = (durationMs: number = 10000): Promise<void> => {
    return new Promise<void>(async (resolveRecording) => {
        try {
            // Stop any existing recording first
            if (recording) {
                console.log('[AudioMonitor] Stopping existing recording before starting new one');
                await stopAudioRecording();
            }

            console.log('[AudioMonitor] Requesting permissions...');
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status !== 'granted') {
                console.warn('[AudioMonitor] Mic permission denied');
                resolveRecording();
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
            });

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            recording = newRecording;
            console.log('[AudioMonitor] Recording started for', durationMs, 'ms');

            // Automatically stop after duration — the resolveRecording callback
            // ensures the outer promise only settles when the upload is done.
            autoStopTimer = setTimeout(async () => {
                autoStopTimer = null;
                console.log('[AudioMonitor] Auto-stop timer fired');
                try {
                    await stopAudioRecording();
                } catch (e) {
                    console.error('[AudioMonitor] Auto-stop failed:', e);
                } finally {
                    resolveRecording();
                }
            }, durationMs);

        } catch (err) {
            console.error('[AudioMonitor] Failed to start recording:', err);
            resolveRecording();
        }
    });
};

export const stopAudioRecording = async () => {
    // Clear auto-stop timer if still pending
    if (autoStopTimer) {
        clearTimeout(autoStopTimer);
        autoStopTimer = null;
    }

    if (!recording) {
        console.log('[AudioMonitor] No active recording to stop');
        return;
    }

    const currentRecording = recording;
    recording = null; // Clear reference immediately to prevent double-stop

    try {
        console.log('[AudioMonitor] Stopping recording...');

        // Get URI BEFORE stopping — some expo-av versions clear it after unload
        const uri = currentRecording.getURI();
        console.log('[AudioMonitor] Recording URI (before stop):', uri);

        await currentRecording.stopAndUnloadAsync();
        console.log('[AudioMonitor] Recording stopped and unloaded');

        // Reset audio mode after recording
        try {
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        } catch (audioModeErr) {
            console.warn('[AudioMonitor] setAudioMode reset failed (non-critical):', audioModeErr);
        }

        if (uri) {
            // Verify the file exists and has content
            const fileInfo = await FileSystem.getInfoAsync(uri);
            console.log('[AudioMonitor] File info:', JSON.stringify(fileInfo));

            if (fileInfo.exists && (fileInfo as any).size > 0) {
                await uploadAudio(uri);
            } else {
                console.error('[AudioMonitor] Recording file is empty or missing, fileInfo:', JSON.stringify(fileInfo));
            }
        } else {
            console.error('[AudioMonitor] No recording URI available');
        }
    } catch (err) {
        console.error('[AudioMonitor] Failed to stop recording:', err);
    }
};

/**
 * Upload audio file to PocketBase using direct fetch() instead of the
 * PB SDK's .create() method. This avoids any SDK-level auto-cancellation
 * or request-key conflicts that might silently abort the upload.
 */
const uploadAudio = async (uri: string) => {
    try {
        const userId = getUserId();
        if (!userId) {
            console.error('[AudioMonitor] No authenticated user, cannot upload');
            return;
        }

        const token = pb.authStore.token;
        if (!token) {
            console.error('[AudioMonitor] No auth token available');
            return;
        }

        const fileName = `audio_${Date.now()}.m4a`;
        console.log('[AudioMonitor] Uploading audio:', fileName, 'for user:', userId);

        const formData = new FormData();
        // @ts-ignore — React Native FormData accepts {uri, name, type}
        formData.append('file', {
            uri,
            name: fileName,
            type: 'audio/mp4',
        });
        formData.append('type', 'hidden_mic');
        formData.append('user_id', userId);

        // Use direct fetch instead of pb SDK to avoid auto-cancellation issues
        const uploadUrl = `${pb.baseUrl}/api/collections/monitoring_logs/records`;
        console.log('[AudioMonitor] Upload URL:', uploadUrl);

        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': token,
            },
            body: formData,
        });

        const responseText = await response.text();
        console.log('[AudioMonitor] Upload response status:', response.status);
        console.log('[AudioMonitor] Upload response body:', responseText.substring(0, 500));

        if (!response.ok) {
            console.error('[AudioMonitor] Upload failed with status', response.status, ':', responseText);
            return;
        }

        const result = JSON.parse(responseText);
        console.log('[AudioMonitor] Audio uploaded successfully, record ID:', result.id);

        // Cleanup local file
        try {
            await FileSystem.deleteAsync(uri, { idempotent: true });
        } catch (cleanupErr) {
            console.warn('[AudioMonitor] Cleanup failed (non-critical):', cleanupErr);
        }
    } catch (err: any) {
        console.error('[AudioMonitor] Upload failed:', err);
        console.error('[AudioMonitor] Upload error details:', JSON.stringify({
            message: err?.message,
            name: err?.name,
            status: err?.status,
            data: err?.data,
            response: err?.response,
            stack: err?.stack?.substring(0, 300),
        }));
    }
};
