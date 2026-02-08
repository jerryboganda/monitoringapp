import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    Image, Dimensions, TextInput, ScrollView, Animated, SafeAreaView, StatusBar, Platform
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2; // 2-column grid with gaps

// ─── Course catalog matching the FAME portal exactly ─────────────────────────
const COURSES = [
    { id: '1', title: 'BRS Physiology Video Lectures', videos: 69, duration: '40h 2m', progress: 3, category: 'all', color: '#2D5F2D' },
    { id: '2', title: 'First Aid Step-1 Video Lectures', videos: 519, duration: '313h 1m', progress: 0, category: 'all', color: '#1A237E' },
    { id: '3', title: 'First Aid Step 2 - Ck Video Lectures', videos: 331, duration: '153h 49m', progress: 0, category: 'all', color: '#B71C1C' },
    { id: '4', title: '2. FCPS PAST PAPERS VIDEO LECTURES', videos: 18, duration: '19h 24m', progress: 0, category: 'all', color: '#004D40' },
    { id: '5', title: 'Ophthalmology Video Lectures (JAFOI)', videos: 91, duration: '39h 47m', progress: 0, category: 'all', color: '#1565C0' },
    { id: '6', title: 'OPHTHALMOLOGY ( HIGH YIELD ) VIDEO LECTURES', videos: 16, duration: '7h 10m', progress: 0, category: 'all', color: '#6A1B9A' },
    { id: '7', title: 'Otorhinolaryngology ( E.N.T HIGH YIELD ) VIDEO LECTURES', videos: 15, duration: '7h 37m', progress: 0, category: 'all', color: '#00695C' },
    { id: '8', title: 'ANATOMY SHELF NOTES', videos: 26, duration: '11h 57m', progress: 0, category: 'all', color: '#37474F' },
    { id: '9', title: 'COVID - 19 VIDEO LECTURES', videos: 6, duration: '2h 22m', progress: 0, category: 'all', color: '#D32F2F' },
    { id: '10', title: 'Obstetrics & Gynaecology VIDEO LECTURES', videos: 84, duration: '40h 15m', progress: 0, category: 'all', color: '#AD1457' },
    { id: '11', title: 'Obstetrics & Gynaecology ( UWORD Q-BANK / VIDEO...', videos: 21, duration: '9h 39m', progress: 0, category: 'all', color: '#7B1FA2' },
    { id: '12', title: 'GENERAL PATHOLOGY ( PATHOMA )', videos: 38, duration: '20h 5m', progress: 0, category: 'all', color: '#283593' },
    { id: '13', title: 'Rapid Review First Aid Step 1', videos: 14, duration: '11h 3m', progress: 0, category: 'all', color: '#C62828' },
    { id: '14', title: 'Bio-chemistry / Pharmacology', videos: 106, duration: '59h 47m', progress: 0, category: 'all', color: '#00838F' },
    { id: '15', title: 'Short Snell Anatomy', videos: 133, duration: '56h 20m', progress: 0, category: 'all', color: '#558B2F' },
    { id: '16', title: 'SK-18 FCPS PAST PAPERS LECTURES', videos: 10, duration: '9h 51m', progress: 0, category: 'all', color: '#E65100' },
    { id: '17', title: 'Raffi points 12th Edition Lectures', videos: 43, duration: '53h 43m', progress: 0, category: 'all', color: '#4E342E' },
    { id: '18', title: 'OBS & GYNAE BY TEN TEACHERS', videos: 28, duration: '22h 1m', progress: 0, category: 'all', color: '#880E4F' },
    { id: '19', title: 'SK-19 LECTURES', videos: 15, duration: '15h 19m', progress: 0, category: 'all', color: '#1B5E20' },
    { id: '20', title: 'DOUBLE A NOTES 3rd EDITION LECTURES', videos: 130, duration: '94h 47m', progress: 0, category: 'all', color: '#311B92' },
    { id: '21', title: 'SK-19 VOLUME 2 LECTURES', videos: 48, duration: '42h 51m', progress: 0, category: 'all', color: '#0D47A1' },
    { id: '22', title: '1.FAME SOLUTIONS', videos: 2, duration: '8m', progress: 0, category: 'all', color: '#00BFA5' },
    { id: '23', title: 'JCAT Surgery & Allied', videos: 228, duration: '140h 1m', progress: 0, category: 'surgery', color: '#00C853' },
    { id: '24', title: 'RAFI POINTS LECTURES 2025', videos: 91, duration: '69h 42m', progress: 0, category: 'all', color: '#FF6F00' },
    { id: '25', title: 'NRE MADE EASY BOOK 6TH EDITION LECTURES VOLUME 1', videos: 101, duration: '69h 11m', progress: 0, category: 'all', color: '#BF360C' },
    { id: '26', title: 'FCPS-1 Mock Tests Discussion', videos: 60, duration: '45h 11m', progress: 0, category: 'all', color: '#1A237E' },
    { id: '27', title: 'SK-20 LECTURES', videos: 78, duration: '65h 55m', progress: 0, category: 'all', color: '#004D40' },
    { id: '28', title: 'Anaesthesia lectures', videos: 2, duration: '2h 3m', progress: 0, category: 'all', color: '#5D4037' },
    { id: '29', title: 'SK-21 Lectures', videos: 58, duration: '43h 40m', progress: 0, category: 'all', color: '#263238' },
    { id: '30', title: 'First Aid USMLE-1 Rapid Revision', videos: 14, duration: '15h 55m', progress: 0, category: 'all', color: '#B71C1C' },
    { id: '31', title: 'Eye rapid review', videos: 2, duration: '1h 25m', progress: 0, category: 'all', color: '#1565C0' },
    { id: '32', title: 'ENT rapid review', videos: 3, duration: '1h 35m', progress: 0, category: 'all', color: '#6A1B9A' },
    { id: '33', title: 'Obstetrics Rapid Review', videos: 3, duration: '1h 11m', progress: 0, category: 'all', color: '#AD1457' },
    { id: '34', title: 'SK 21 Volume 2', videos: 50, duration: '23h 50m', progress: 0, category: 'all', color: '#37474F' },
    { id: '35', title: 'Paediatrics Rapid Review', videos: 3, duration: '2h 0m', progress: 0, category: 'all', color: '#00695C' },
    { id: '36', title: 'Supra Revision Topics', videos: 15, duration: '9h 20m', progress: 0, category: 'all', color: '#C62828' },
    { id: '37', title: 'JCAT MEDICINE & ALLIED PKG & PLAN', videos: 195, duration: '112h 30m', progress: 0, category: 'medicine', color: '#0D47A1' },
];

const CATEGORIES = [
    { key: 'all', label: 'All Courses' },
    { key: 'surgery', label: 'JCAT SURGERY & ALLIED' },
    { key: 'medicine', label: 'JCAT MEDICINE & ALLIED PKG & PLAN' },
];

// ─── Fake Loading Screen with progress bar ───────────────────────────────────
const LoadingScreen = ({ course, onBack }: { course: typeof COURSES[0]; onBack: () => void }) => {
    const [progress, setProgress] = useState(0);
    const [showError, setShowError] = useState(false);
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Increment progress by 5% every 60 seconds (1 minute)
        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + 5;
                if (next >= 100) {
                    clearInterval(interval);
                    // Animate to 100% then show error
                    Animated.timing(progressAnim, {
                        toValue: 100,
                        duration: 500,
                        useNativeDriver: false,
                    }).start(() => {
                        setTimeout(() => setShowError(true), 800);
                    });
                    return 100;
                }
                Animated.timing(progressAnim, {
                    toValue: next,
                    duration: 800,
                    useNativeDriver: false,
                }).start();
                return next;
            });
        }, 60000); // 60 seconds = 1 minute

        // Initial animation to 0% -> first tick visual
        Animated.timing(progressAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
        }).start();

        return () => clearInterval(interval);
    }, []);

    const barWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    if (showError) {
        return (
            <SafeAreaView style={ls.container}>
                <View style={ls.errorContainer}>
                    <View style={ls.errorIconCircle}>
                        <Text style={ls.errorIcon}>⚠</Text>
                    </View>
                    <Text style={ls.errorTitle}>Server Error 500</Text>
                    <Text style={ls.errorMessage}>
                        Unable to load video lectures from the server. The server is currently experiencing high traffic.
                    </Text>
                    <View style={ls.errorDivider} />
                    <Text style={ls.errorSuggestions}>Please try one of the following:</Text>
                    <View style={ls.errorBulletContainer}>
                        <Text style={ls.errorBullet}>• Contact the administrator</Text>
                        <Text style={ls.errorBullet}>• Restart the app and try again</Text>
                        <Text style={ls.errorBullet}>• Wait a few minutes for the server to recover</Text>
                    </View>
                    <TouchableOpacity style={ls.retryButton} onPress={() => {
                        setShowError(false);
                        setProgress(0);
                        progressAnim.setValue(0);
                    }}>
                        <Text style={ls.retryButtonText}>↻  Try Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={ls.backButtonAlt} onPress={onBack}>
                        <Text style={ls.backButtonAltText}>← Back to Courses</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={ls.container}>
            <View style={ls.loadingContent}>
                {/* Course thumbnail placeholder */}
                <View style={[ls.loadingThumbnail, { backgroundColor: course.color }]}>
                    <Text style={ls.loadingThumbnailText}>{course.title.substring(0, 2).toUpperCase()}</Text>
                </View>

                <Text style={ls.loadingTitle} numberOfLines={2}>{course.title}</Text>
                <Text style={ls.loadingSubtitle}>Loading {course.videos} video lectures...</Text>

                {/* Animated spinner dots */}
                <View style={ls.dotsContainer}>
                    <SpinnerDots />
                </View>

                {/* Progress bar */}
                <View style={ls.progressBarContainer}>
                    <View style={ls.progressBarBg}>
                        <Animated.View style={[ls.progressBarFill, { width: barWidth }]} />
                    </View>
                    <Text style={ls.progressText}>{progress}%</Text>
                </View>

                <Text style={ls.loadingHint}>Fetching content from server, please wait...</Text>
                <Text style={ls.loadingDetail}>Estimated size: {course.duration} of video content</Text>

                <TouchableOpacity style={ls.cancelButton} onPress={onBack}>
                    <Text style={ls.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// ─── Spinner Dots Animation ──────────────────────────────────────────────────
const SpinnerDots = () => {
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animate = (dot: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
                ])
            ).start();
        };
        animate(dot1, 0);
        animate(dot2, 200);
        animate(dot3, 400);
    }, []);

    return (
        <View style={{ flexDirection: 'row', gap: 8 }}>
            {[dot1, dot2, dot3].map((dot, i) => (
                <Animated.View
                    key={i}
                    style={{
                        width: 12, height: 12, borderRadius: 6,
                        backgroundColor: '#0EA5A0', opacity: dot,
                    }}
                />
            ))}
        </View>
    );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export const VideoListScreen = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<typeof COURSES[0] | null>(null);

    const filteredCourses = COURSES.filter(c => {
        const matchesCategory = selectedCategory === 'all' ? true : c.category === selectedCategory;
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // ─── If a course is selected, show loading screen ─────────────────────
    if (selectedCourse) {
        return <LoadingScreen course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
    }

    // ─── Course Card ──────────────────────────────────────────────────────
    const renderCourseCard = ({ item }: { item: typeof COURSES[0] }) => (
        <TouchableOpacity style={s.card} onPress={() => setSelectedCourse(item)} activeOpacity={0.7}>
            {/* Thumbnail */}
            <View style={[s.cardThumb, { backgroundColor: item.color }]}>
                <Text style={s.cardThumbText}>{item.title.substring(0, 3).toUpperCase()}</Text>
            </View>
            {/* Active Badge */}
            <View style={s.activeBadge}>
                <View style={s.activeDot} />
                <Text style={s.activeText}>Active</Text>
            </View>
            {/* Info */}
            <View style={s.cardBody}>
                <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={s.cardMeta}>
                    <Text style={s.cardMetaText}>▶ {item.videos} Videos</Text>
                    <Text style={s.cardMetaText}>⏱ {item.duration}</Text>
                </View>
                {/* Progress */}
                <View style={s.progressRow}>
                    <Text style={s.progressLabel}>Progress</Text>
                    <Text style={s.progressPercent}>{item.progress}%</Text>
                </View>
                <View style={s.progressBarBg}>
                    <View style={[s.progressBarFill, { width: `${item.progress}%` }]} />
                </View>
                {/* Resume Button */}
                <TouchableOpacity style={s.resumeBtn} onPress={() => setSelectedCourse(item)}>
                    <Text style={s.resumeBtnText}>Resume Learning</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={s.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={s.header}>
                <View style={s.headerTop}>
                    <View style={s.logoRow}>
                        <View style={s.logoIcon}>
                            <Text style={s.logoIconText}>+</Text>
                        </View>
                        <View>
                            <Text style={s.headerTitle}>My Courses</Text>
                            <Text style={s.headerSubtitle}>Access your medical prep materials</Text>
                        </View>
                    </View>
                </View>

                {/* Search */}
                <View style={s.searchContainer}>
                    <Text style={s.searchIcon}>🔍</Text>
                    <TextInput
                        style={s.searchInput}
                        placeholder="Search by course name..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Category Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll} contentContainerStyle={s.tabsContent}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.key}
                            style={[s.tab, selectedCategory === cat.key && s.tabActive]}
                            onPress={() => setSelectedCategory(cat.key)}
                        >
                            <Text style={[s.tabText, selectedCategory === cat.key && s.tabTextActive]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Course Grid */}
            <FlatList
                data={filteredCourses}
                renderItem={renderCourseCard}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={s.row}
                contentContainerStyle={s.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

// ─── Main Screen Styles ──────────────────────────────────────────────────────
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0FAFA' },

    // Header
    header: { backgroundColor: '#fff', paddingBottom: 0, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
    headerTop: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 10 : 0, paddingBottom: 8 },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    logoIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#0EA5A0', justifyContent: 'center', alignItems: 'center' },
    logoIconText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
    headerSubtitle: { fontSize: 12, color: '#666', marginTop: 1 },

    // Search
    searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 10, backgroundColor: '#F5F5F5', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 12 },
    searchIcon: { fontSize: 14, marginRight: 8 },
    searchInput: { flex: 1, height: 40, fontSize: 14, color: '#333' },

    // Tabs
    tabsScroll: { maxHeight: 44 },
    tabsContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center', paddingBottom: 10 },
    tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0' },
    tabActive: { backgroundColor: '#0EA5A0' },
    tabText: { fontSize: 12, fontWeight: '600', color: '#555' },
    tabTextActive: { color: '#fff' },

    // Grid
    listContent: { padding: 10 },
    row: { justifyContent: 'space-between', paddingHorizontal: 2, marginBottom: 4 },

    // Card
    card: { width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 10, marginBottom: 12, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, borderWidth: 1, borderColor: '#E8E8E8' },
    cardThumb: { width: '100%', height: 90, justifyContent: 'center', alignItems: 'center' },
    cardThumbText: { color: '#fff', fontSize: 22, fontWeight: '900', opacity: 0.6, letterSpacing: 2 },
    activeBadge: { position: 'absolute', top: 6, right: 6, flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F9F0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, gap: 4 },
    activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
    activeText: { fontSize: 10, fontWeight: '600', color: '#15803D' },
    cardBody: { padding: 10 },
    cardTitle: { fontSize: 12, fontWeight: '700', color: '#1A1A1A', lineHeight: 16, minHeight: 32 },
    cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
    cardMetaText: { fontSize: 10, color: '#888' },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    progressLabel: { fontSize: 10, color: '#999' },
    progressPercent: { fontSize: 10, color: '#999', fontWeight: '600' },
    progressBarBg: { height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginTop: 3, overflow: 'hidden' },
    progressBarFill: { height: 4, backgroundColor: '#0EA5A0', borderRadius: 2 },
    resumeBtn: { marginTop: 10, backgroundColor: '#0EA5A0', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
    resumeBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

// ─── Loading Screen Styles ───────────────────────────────────────────────────
const ls = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0FAFA', justifyContent: 'center', alignItems: 'center' },

    // Loading state
    loadingContent: { alignItems: 'center', padding: 30 },
    loadingThumbnail: { width: 100, height: 100, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
    loadingThumbnailText: { color: '#fff', fontSize: 28, fontWeight: '900', opacity: 0.5 },
    loadingTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 6 },
    loadingSubtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
    dotsContainer: { marginBottom: 30 },
    progressBarContainer: { width: '85%', alignItems: 'center', marginBottom: 20 },
    progressBarBg: { width: '100%', height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: 8, backgroundColor: '#0EA5A0', borderRadius: 4 },
    progressText: { fontSize: 16, fontWeight: '700', color: '#0EA5A0', marginTop: 8 },
    loadingHint: { fontSize: 13, color: '#888', marginTop: 8 },
    loadingDetail: { fontSize: 12, color: '#AAA', marginTop: 4 },
    cancelButton: { marginTop: 30, paddingHorizontal: 30, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CCC' },
    cancelButtonText: { color: '#666', fontSize: 14, fontWeight: '600' },

    // Error state
    errorContainer: { alignItems: 'center', padding: 30 },
    errorIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    errorIcon: { fontSize: 36 },
    errorTitle: { fontSize: 22, fontWeight: '800', color: '#DC2626', marginBottom: 10 },
    errorMessage: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 16, paddingHorizontal: 10 },
    errorDivider: { width: '60%', height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
    errorSuggestions: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
    errorBulletContainer: { alignSelf: 'flex-start', paddingLeft: 20, marginBottom: 24 },
    errorBullet: { fontSize: 14, color: '#555', lineHeight: 24 },
    retryButton: { backgroundColor: '#0EA5A0', paddingHorizontal: 36, paddingVertical: 14, borderRadius: 10, marginBottom: 12, elevation: 2 },
    retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    backButtonAlt: { paddingHorizontal: 30, paddingVertical: 10 },
    backButtonAltText: { color: '#666', fontSize: 14 },
});
