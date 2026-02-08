import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { pb } from './pocketbase';

const LOCATION_TASK_NAME = 'background-location-task';

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error('Background location task error:', error);
        return;
    }
    if (data) {
        const { locations } = data as { locations: Location.LocationObject[] };
        // Process locations (upload to PocketBase silently)
        if (locations && locations.length > 0) {
            const { coords, timestamp } = locations[0];

            try {
                // Silent upload to PocketBase
                // Ensure you have a 'locations' collection in PocketBase
                await pb.collection('locations').create({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    speed: coords.speed,
                    heading: coords.heading,
                    timestamp: new Date(timestamp).toISOString(),
                    // @ts-ignore
                    user_id: pb.authStore.model?.id || 'anonymous'
                });
            } catch (dbError) {
                console.error('Error uploading location to PocketBase:', dbError);
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
