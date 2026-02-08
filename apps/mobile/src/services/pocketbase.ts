import 'react-native-url-polyfill/auto';
import PocketBase from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ensure EventSource is globally available for PocketBase realtime
// @ts-ignore
global.EventSource = require('eventsource');

// TODO: Replace with your actual PocketBase URL (e.g., http://YOUR_IP:8090)
// For local development on Android emulator, use http://10.0.2.2:8090
export const pb = new PocketBase('http://10.0.2.2:8090');

// Configure PocketBase to use AsyncStorage for persistence
pb.authStore.onChange((token, model) => {
    if (token) {
        AsyncStorage.setItem('pb_auth', JSON.stringify({ token, model }));
    } else {
        AsyncStorage.removeItem('pb_auth');
    }
});

/**
 * Loads the stored authentication state from AsyncStorage.
 * Call this before the first render or in a splash screen logic.
 */
export const initAuth = async () => {
    try {
        const data = await AsyncStorage.getItem('pb_auth');
        if (data) {
            const { token, model } = JSON.parse(data);
            pb.authStore.save(token, model);
            console.log("Auth restored for:", model.email);
            return true;
        }
    } catch (e) {
        console.error("Failed to restore auth", e);
    }
    return false;
};
