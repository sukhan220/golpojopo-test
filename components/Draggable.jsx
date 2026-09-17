

import { useAudioContext } from '@/context/audioContext';
import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import {
    Animated,
    Image,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const MiniPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    position,
    duration,
  } = useAudioContext();
  const pathname = usePathname();
  const router = useRouter();

  const [showFloatingButton, setShowFloatingButton] = React.useState(false);
  const isFullPlayer = pathname.includes('/player');
  const translateY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isFullPlayer) {
      Animated.timing(translateY, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isFullPlayer]);

  // যদি কোন ট্র্যাক নাই, তাহলে কিছু দেখিও না
  if (!currentTrack) return null;

  // যদি showFloatingButton true হয়, তাহলে শুধু ভাসমান বাটন দেখাও
  if (showFloatingButton) {
    return (
      <DraggableFloatingButton
        isPlaying={isPlaying}
        onPress={() => setShowFloatingButton(false)}
        onTogglePlayPause={togglePlayPause}
      />
    );
  }

  const handleMiniPlayerPress = () => {
    if (!isFullPlayer && currentTrack) {
      router.push({
        pathname: '/player',
        params: { book: JSON.stringify(currentTrack) },
      });
    }
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      {/* প্রোগ্রেস বার */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.contentRow}>
        {/* Touchable Area */}
        <TouchableOpacity
          style={styles.touchableContainer}
          onPress={handleMiniPlayerPress}
          activeOpacity={0.8}
        >
          <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.artist} numberOfLines={1}>{currentTrack.writer}</Text>
          </View>
        </TouchableOpacity>

        {/* Play/Pause Button */}
        <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
          <Feather name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
        </TouchableOpacity>

        {/* X Button */}
        <TouchableOpacity onPress={() => setShowFloatingButton(true)} style={{ paddingHorizontal: 8 }}>
          <Feather name="x" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default MiniPlayer;

// 🔸 Draggable Floating Button Component 🔸
const DraggableFloatingButton = ({ isPlaying, onPress, onTogglePlayPause }) => {
  const pan = React.useRef(new Animated.ValueXY({ x: 10, y: 50 })).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;


  

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        {
          position: 'absolute',
          top: 50,
          left: 10,
          zIndex: 1000,
          backgroundColor: '#1c1c1c',
          padding: 10,
          borderRadius: 30,
          flexDirection: 'row',
          alignItems: 'center',
        },
        pan.getLayout(),
      ]}
    >
      <TouchableOpacity onPress={onTogglePlayPause} style={{ marginRight: 10 }}>
        <Feather name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onPress}>
        <Feather name="chevron-up" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};

// 🔸 Styles 🔸
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: '#1c1c1c',
    paddingTop: 5,
    paddingBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#444',
    zIndex: 999,
  },
  progressBarBackground: {
    width: '100%',
    height: 1,
    backgroundColor: '#444',
    borderRadius: 1.5,
    marginBottom: 5,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 1.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  touchableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  artist: {
    color: '#ccc',
    fontSize: 12,
  },
  playPauseButton: {
    paddingLeft: 10,
  },
});
