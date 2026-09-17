import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

export default function ClipModal({
  visible,
  onClose,

  // audio info
  duration = 0,          // ms
  currentPosition = 0,   // ms

  // controls (parent থেকে আসবে)
  play,
  pause,
  seekTo,                // (ms) => Promise

  // save handler
  onSave,                // ({ from, to })
}) {
  const totalSeconds = Math.max(1, Math.floor(duration / 1000));

  const [clipFrom, setClipFrom] = useState(0);
  const [clipTo, setClipTo] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timerRef = useRef(null);

  // 🟢 modal open হলে initial range সেট
  useEffect(() => {
    if (visible) {
      const sec = Math.floor(currentPosition / 1000);
      setClipFrom(sec);
      setClipTo(Math.min(sec + 10, totalSeconds));
    }

    return () => clearInterval(timerRef.current);
  }, [visible]);

  // ▶️ শুধু selected clip play
  const handlePlayClip = async () => {
    if (clipTo <= clipFrom) return;

    clearInterval(timerRef.current);
    setPlaying(true);

    await seekTo(clipFrom * 1000);
    await play();

    timerRef.current = setInterval(() => {
      if (currentPosition >= clipTo * 1000) {
        pause();
        setPlaying(false);
        clearInterval(timerRef.current);
      }
    }, 120);
  };

  const handleSave = () => {
    onSave?.({
      from: clipFrom,
      to: clipTo,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Clip Audio</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} />
            </TouchableOpacity>
          </View>

          {/* RANGE INFO */}
          <Text style={styles.rangeText}>
            From {clipFrom}s — To {clipTo}s
          </Text>

          {/* FROM SLIDER */}
          <Text style={styles.label}>From</Text>
          <Slider
            minimumValue={0}
            maximumValue={totalSeconds}
            value={clipFrom}
            onValueChange={(v) => {
              const val = Math.floor(v);
              if (val < clipTo) setClipFrom(val);
            }}
            minimumTrackTintColor="#4caf50"
            maximumTrackTintColor="#ccc"
          />

          {/* TO SLIDER */}
          <Text style={styles.label}>To</Text>
          <Slider
            minimumValue={0}
            maximumValue={totalSeconds}
            value={clipTo}
            onValueChange={(v) => {
              const val = Math.floor(v);
              if (val > clipFrom) setClipTo(val);
            }}
            minimumTrackTintColor="#2196f3"
            maximumTrackTintColor="#ccc"
          />

          {/* PLAY */}
          <TouchableOpacity
            style={styles.playBtn}
            onPress={handlePlayClip}
          >
            <Ionicons
              name={playing ? 'pause' : 'play'}
              size={20}
              color="#fff"
            />
            <Text style={styles.playText}>
              {playing ? 'Playing…' : 'Play Clip'}
            </Text>
          </TouchableOpacity>

          {/* ACTIONS */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.save}>Save</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rangeText: {
    marginTop: 8,
    fontSize: 13,
    color: '#555',
  },
  label: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  },
  playBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196f3',
    padding: 12,
    borderRadius: 8,
  },
  playText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  actions: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancel: {
    fontSize: 16,
    color: '#777',
  },
  save: {
    fontSize: 16,
    color: '#2196f3',
    fontWeight: 'bold',
  },
});
