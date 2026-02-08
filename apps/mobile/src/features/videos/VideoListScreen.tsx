import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Activity } from 'lucide-react-native';

// Dummy Data for First Aid Videos (using public domain or sample URLs for demo)
const SAMPLE_VIDEOS = [
    {
        id: '1',
        title: 'CPR Basics - Adult',
        duration: '5:20',
        thumbnail: 'https://img.youtube.com/vi/-NodDRTsV88/hqdefault.jpg',
        // Using a sample MP4 for demo purposes as YouTube embedding in Expo Video requires valid direct links
        // In a real app, these would be hosted on PocketBase
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
        id: '2',
        title: 'Heimlich Maneuver Guide',
        duration: '3:15',
        thumbnail: 'https://img.youtube.com/vi/7CgtIgSyAiU/hqdefault.jpg',
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    {
        id: '3',
        title: 'Treating Burns & Scalds',
        duration: '4:45',
        thumbnail: 'https://img.youtube.com/vi/E5nN8_2Z_2o/hqdefault.jpg',
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    },
    {
        id: '4',
        title: 'Bandaging Techniques',
        duration: '6:10',
        thumbnail: 'https://img.youtube.com/vi/1_1_1_1/hqdefault.jpg',
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    }
];

export const VideoListScreen = () => {
    const [currentVideo, setCurrentVideo] = useState<string | null>(null);
    const video = React.useRef(null);
    const [status, setStatus] = React.useState({});

    const renderItem = ({ item }: { item: typeof SAMPLE_VIDEOS[0] }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => setCurrentVideo(item.url)}
        >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.duration}>{item.duration}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {currentVideo ? (
                <View style={styles.playerContainer}>
                    <Video
                        ref={video}
                        style={styles.video}
                        source={{
                            uri: currentVideo,
                        }}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping
                        onPlaybackStatusUpdate={status => setStatus(() => status)}
                        shouldPlay
                    />
                    <TouchableOpacity style={styles.closeButton} onPress={() => setCurrentVideo(null)}>
                        <Text style={styles.closeText}>Close Player</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Training Modules</Text>
                        <Text style={styles.headerSubtitle}>Select a topic to start learning</Text>
                    </View>
                    <FlatList
                        data={SAMPLE_VIDEOS}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.list}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        width: '100%',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    list: {
        padding: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    thumbnail: {
        width: '100%',
        height: 180,
        backgroundColor: '#000',
    },
    info: {
        padding: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    duration: {
        fontSize: 14,
        color: '#888',
    },
    playerContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    video: {
        width: Dimensions.get('window').width,
        height: 300,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        padding: 10,
        borderRadius: 5
    },
    closeText: {
        color: '#fff',
        fontWeight: 'bold'
    }
});
