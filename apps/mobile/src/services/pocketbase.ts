import 'react-native-url-polyfill/auto';
import PocketBase from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For production: https://mm.polytronx.com
// For local development on Android emulator, use http://10.0.2.2:8090
export const pb = new PocketBase('https://mm.polytronx.com');
pb.autoCancellation(false); // Disable auto-cancellation — critical for file uploads

/**
 * Helper to get the current authenticated user's ID.
 * PocketBase JS SDK 0.21+ uses authStore.record (not .model).
 */
export const getUserId = (): string => {
    const record = (pb.authStore as any).record ?? (pb.authStore as any).model;
    return record?.id || '';
};

/**
 * Helper to get the current authenticated user's email.
 */
export const getUserEmail = (): string => {
    const record = (pb.authStore as any).record ?? (pb.authStore as any).model;
    return record?.email || '';
};

// Configure PocketBase to use AsyncStorage for persistence
pb.authStore.onChange((token, record) => {
    if (token) {
        AsyncStorage.setItem('pb_auth', JSON.stringify({ token, model: record }));
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
            console.log("Auth restored for:", model?.email);
            return true;
        }
    } catch (e) {
        console.error("Failed to restore auth", e);
    }
    return false;
};
