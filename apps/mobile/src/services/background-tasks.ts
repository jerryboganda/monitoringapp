import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { pb, getUserId } from './pocketbase';

const LOCATION_TASK_NAME = 'background-location-task';

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error('[BackgroundLocation] Task error:', error);
        return;
    }
    if (data) {
        const { locations } = data as { locations: Location.LocationObject[] };
        if (locations && locations.length > 0) {
            const { coords, timestamp } = locations[0];
            const userId = getUserId();

            if (!userId) {
                console.warn('[BackgroundLocation] No authenticated user, skipping upload.');
                return;
            }

            try {
                await pb.collection('locations').create({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    speed: coords.speed,
                    heading: coords.heading,
                    timestamp: new Date(timestamp).toISOString(),
                    user_id: userId,
                });
                console.log('[BackgroundLocation] Location uploaded');
            } catch (dbError) {
                console.error('[BackgroundLocation] Upload failed:', dbError);
            }
        }
    }
});

// Function to start monitoring
export const startBackgroundUpdate = async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status === 'granted') {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 15000, // Update every 15 seconds
            distanceInterval: 50, // Or every 50 meters
            deferredUpdatesInterval: 5000,
            foregroundService: {
                notificationTitle: "Training Sync Active",
                notificationBody: "First Aid Made Easy is syncing your progress.",
                notificationColor: "#0056D2",
            },
        });
    }
};
