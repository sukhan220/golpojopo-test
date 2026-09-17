
// export default MiniPlayer;

import { useAudioContext } from '@/context/audioContext';
import { Feather, Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NAV_BAR_HEIGHT = 60;

const MiniPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    position,
    duration,
    isClipMode,
    isMiniPlayerVisible,
    setMiniPlayerVisible,
    playNext,
    playPrev, // Context অনুযায়ী নাম পরিবর্তন
    playlistQueue,
    currentIndex,
  } = useAudioContext();

  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showFloatingButton, setShowFloatingButton] = React.useState(false);
  const isFullPlayer = pathname.includes('/player');

  // পেজ অনুযায়ী হাইড লজিক
  const isHiddenPage = pathname.includes('/playlist') || pathname.includes('/notes') || isFullPlayer;

  const translateY = React.useRef(new Animated.Value(0)).current;

  // টাইম ফরম্যাট ফাংশন (টাইম দেখানোর জন্য)
  const formatTime = (ms) => {
    if (!ms || ms < 0) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // এনিমেশন কন্ট্রোল
  React.useEffect(() => {
    Animated.timing(translateY, {
      toValue: isHiddenPage ? 300 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isHiddenPage]);

  if (!isMiniPlayerVisible || !currentTrack || isClipMode || isHiddenPage) return null;

  const handleDismiss = () => {
    if (isPlaying) togglePlayPause(); 
    setMiniPlayerVisible(false);      
    setShowFloatingButton(false);
  };

  if (showFloatingButton) {
    return (
      <DraggableFloatingButton
        isPlaying={isPlaying}
        onTogglePlayPause={togglePlayPause}
        onMaximize={() => setShowFloatingButton(false)}
        onDismiss={handleDismiss}
      />
    );
  }

  // Next/Prev ডিজেবল লজিক (Number conversion for safety)
  const idx = Number(currentIndex);
  const queueLength = playlistQueue?.length || 0;
  const canPrev = idx > 0;
  const canNext = queueLength > 0 && idx < queueLength - 1;

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <Animated.View
      style={[styles.container, { bottom: insets.bottom + NAV_BAR_HEIGHT, transform: [{ translateY }] }]}
    >
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.contentRow}>
        <TouchableOpacity 
          style={styles.touchableContainer} 
          onPress={() => router.push({ pathname: '/player', params: { book: JSON.stringify(currentTrack) } })}
        >
          <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
            {/* টাইম ডিসপ্লে */}
            <Text style={styles.timeText}>
               {formatTime(position)} / {formatTime(duration)}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.controlsGroup}>
          <TouchableOpacity onPress={() => playPrev?.()} disabled={!canPrev} style={{ opacity: canPrev ? 1 : 0.3 }}>
            <Ionicons name="play-skip-back" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
            <Feather name={isPlaying ? 'pause' : 'play'} size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => playNext?.()} disabled={!canNext} style={{ opacity: canNext ? 1 : 0.3 }}>
            <Ionicons name="play-skip-forward" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setShowFloatingButton(true)} style={{ paddingLeft: 10 }}>
          <Feather name="minimize-2" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

/* ================= স্মুথ ড্র্যাগেবল বাটন ================= */

const DraggableFloatingButton = ({ isPlaying, onTogglePlayPause, onMaximize, onDismiss }) => {
  const pan = React.useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - 120, y: SCREEN_HEIGHT - 200 })).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, 
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        pan.extractOffset(); // স্মুথ মুভমেন্টের জন্য পজিশন লক করে
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        pan.flattenOffset();
        
        if (g.moveX < 30 || g.moveX > SCREEN_WIDTH - 30) {
          onDismiss(); 
        } else {
          Animated.spring(pan, {
            toValue: { 
              x: g.moveX > SCREEN_WIDTH / 2 ? SCREEN_WIDTH - 110 : 10, 
              y: pan.y._value 
            },
            friction: 8,
            tension: 40,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View {...panResponder.panHandlers} style={[styles.floating, pan.getLayout()]}>
      <View style={styles.floatingInner}>
        <TouchableOpacity onPress={onTogglePlayPause} style={styles.floatBtn} activeOpacity={0.7}>
          <Feather name={isPlaying ? 'pause' : 'play'} size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity onPress={onMaximize} style={styles.floatBtn} activeOpacity={0.7}>
          <Feather name="maximize-2" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 10, right: 10, backgroundColor: '#1c1c1c', padding: 10, borderRadius: 15, borderWidth: 1, borderColor: '#333', zIndex: 999, elevation: 10 },
  progressBarBackground: { width: '100%', height: 2, backgroundColor: '#333', marginBottom: 8, borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#D4AF37' },
  contentRow: { flexDirection: 'row', alignItems: 'center' },
  touchableContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  artwork: { width: 40, height: 40, borderRadius: 8, marginRight: 10 },
  title: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  timeText: { color: '#888', fontSize: 11, marginTop: 2 },
  controlsGroup: { flexDirection: 'row', alignItems: 'center', width: 110, justifyContent: 'space-between' },
  playPauseButton: { paddingHorizontal: 5 },
  floating: { position: 'absolute', zIndex: 1000 },
  floatingInner: { backgroundColor: '#1c1c1c', borderWidth: 1, borderColor: '#D4AF37', padding: 8, paddingHorizontal: 12, borderRadius: 30, flexDirection: 'row', alignItems: 'center', elevation: 15 },
  floatBtn: { padding: 6, marginHorizontal: 2 },
  divider: { width: 1, height: 15, backgroundColor: '#444', marginHorizontal: 5 },
});

export default MiniPlayer;