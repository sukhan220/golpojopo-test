


import { useAudioContext } from '@/context/audioContext';
import { useLibrary } from '@/context/libraryContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AudioPro } from 'react-native-audio-pro';

const { width } = Dimensions.get('window');
const GOLD = '#D4AF37';
const BG = '#0F0F0F';

export default function BookDetailsScreen() {
  const route = { params: useLocalSearchParams() };
  const navigation = useNavigation();

  const { book: bookString } = route.params;
  const book = useMemo(() => JSON.parse(bookString), [bookString]);

  const [activeTab, setActiveTab] = useState('summary');
  const { library } = useLibrary();

  const {
    playPlaylist,
    togglePlayPause,
    currentTrack,
    isPlaying,
    isLoading,
    seekTo,
    position,
    duration,
    setMiniPlayerVisible
  } = useAudioContext();


  const displayParts = useMemo(() => {
    const hasParts = book.parts && Array.isArray(book.parts) && book.parts.length > 0;
    const partsArray = hasParts ? book.parts : [book];

    return partsArray.map((part, index) => {
      const audioUrl = part.url || part.audioUrl || part.fileUrl || book.url || book.audioUrl || book.fileUrl;

      return {
        ...part,
        // মেইন আইডি এবং পার্ট আইডির পার্থক্য স্পষ্ট করা
        bookId: book.id, // এটি 'track-002'
        id: part.id ? `${book.id}-${part.id}` : `${book.id}-p${index + 1}`, // ইউনিক আইডি ফর প্লেয়ার
        partNo: part.id || index + 1, // পার্ট নাম্বার (১, ২ ইত্যাদি)
        title: part.title || book.title,
        artwork: part.artwork || book.artwork,
        artist: part.artist || part.writer || book.writer || "Unknown Artist",
        voice: part.voice || book.voice || "Unknown Voice",
        url: audioUrl,
      };
    });
  }, [book]);

  const currentKey = currentTrack?.id || currentTrack?.url;

  // // চেক করা হচ্ছে এই বই বা এর কোনো পার্ট এখন প্লেয়ারে আছে কি না
  // const isThisBookActive = useMemo(() => {
  //   return displayParts.some(p => (p.id || p.url) === currentKey);
  // }, [currentKey, displayParts]);

  // এই বইয়ের কোনো পার্ট কি এখন প্লে হচ্ছে?
  const isThisBookActive = useMemo(() => {
    return displayParts.some(p => p.id === currentTrack?.id);
  }, [currentTrack?.id, displayParts]);

  // // ২. ক্লিপ ডাটা
  // const bookClips = useMemo(() => {
  //   if (!library?.notes?.[book.id]) return [];
  //   return [...(library.notes[book.id].clips || [])].sort((a, b) => (a.ref?.from || 0) - (b.ref?.from || 0));
  // }, [library, book.id]);

  // ২. ক্লিপ ডাটা (মেইন আইডি অনুযায়ী সব ক্লিপ)
const bookClips = useMemo(() => {
  // library.notes এর ভেতর মেইন বইয়ের আইডি (যেমন: track-002) দিয়ে খোঁজা হচ্ছে
  const bookNotes = library?.notes?.[book.id];
  if (!bookNotes || !bookNotes.clips) return [];

  // সব ক্লিপ নিয়ে আসা এবং সময়ের ক্রমানুসারে সাজানো
  return [...bookNotes.clips].sort((a, b) => (a.ref?.from || 0) - (b.ref?.from || 0));
}, [library, book.id]);

  // ক্লিপ এক্টিভ স্টেট ফিচার (যা আগে ছিল)
  const currentActiveClipId = useMemo(() => {
    if (!isThisBookActive) return null;
    const currentSeconds = position / 1000;

    const active = bookClips.find(clip => {
      const startTime = clip.ref?.from || 0;
      const endTime = clip.ref?.to;
      if (endTime) {
        return currentSeconds >= startTime && currentSeconds <= endTime;
      } else {
        const currentIndex = bookClips.indexOf(clip);
        const nextClip = bookClips[currentIndex + 1];
        const nextStartTime = nextClip ? nextClip.ref?.from : Infinity;
        return currentSeconds >= startTime && currentSeconds < nextStartTime;
      }
    });
    return active ? (active.id || active.ref?.from) : null;
  }, [position, isThisBookActive, bookClips]);

  const getClipProgress = (clip) => {
    if (!isThisBookActive) return 0;
    const currentSeconds = position / 1000;
    const start = clip.ref?.from || 0;
    let end = clip.ref?.to;
    if (!end) {
      const currentIndex = bookClips.indexOf(clip);
      const nextClip = bookClips[currentIndex + 1];
      end = nextClip ? nextClip.ref?.from : (duration / 1000);
    }
    const clipDuration = end - start;
    if (clipDuration <= 0) return 0;
    const elapsed = currentSeconds - start;
    return Math.min(Math.max(elapsed / clipDuration, 0), 1) * 100;
  };

  // ৩. প্লে লজিক
  const handleMainPlayPause = async () => {
    setMiniPlayerVisible(true);
    if (isThisBookActive) {
      await togglePlayPause();
    } else {
      // শুরুতে অল প্লে থাকা
      await playPlaylist(displayParts, 0);
    }
  };



  const handlePartPlay = async (index) => {
    const item = displayParts[index];

    if (!item.url) {
      console.error("Error: No URL found for this track", item);
      alert("অডিও লিঙ্ক পাওয়া যায়নি!");
      return;
    }

    setMiniPlayerVisible(true);

    if (currentKey === (item.id || item.url)) {
      await togglePlayPause();
    } else {
      try {
        await playPlaylist(displayParts, index);
      } catch (error) {
        console.log("Playback Error:", error);
      }
    }
  };



  const handleClipPlay = async (clip) => {
    // ১. মিনি প্লেয়ার এবং লোডিং স্টেট নিশ্চিত করা
    setMiniPlayerVisible(true);

    // ২. শুরুর সময় মিলিসেকেন্ডে নেওয়া (Firebase 'from' থেকে)
    const startTimeMs = (clip.ref?.from || 0) * 1000;

    // ৩. ক্লিপটি কোন পার্টের (ID বা URL মিলিয়ে) সেটি খুঁজে বের করা
    const partIndex = displayParts.findIndex(p =>
      p.id === clip.ref?.partId ||
      p.url === clip.ref?.url ||
      p.id === clip.partId
    );

    // যদি পার্ট খুঁজে না পায় তবে প্রথম পার্ট (Index 0) ধরবে
    const targetIndex = partIndex !== -1 ? partIndex : 0;
    const targetPart = displayParts[targetIndex];
    const targetKey = targetPart.id || targetPart.url;

    // ৪. প্লে লজিক (আপনার আগের কোডের স্টাইল বজায় রেখে)
    if (currentKey === targetKey) {
      // যদি এই পার্টটি বর্তমানে প্লেয়ারে থাকে, তবে সরাসরি ঐ সময়ে চলে যাবে
      await seekTo(startTimeMs);
      if (!isPlaying) await togglePlayPause();
    } else {
      // যদি নতুন পার্ট হয়, তবে প্লেলিস্ট ফাংশন ব্যবহার করে ঐ সময় থেকে শুরু করা
      // আপনার audioContext-এর playPlaylist আপডেট করা থাকলে এটি সবথেকে ভালো কাজ করবে
      // await playPlaylist(displayParts, targetIndex, startTimeMs);

      // ২. এবার startTimeMs এ সরাসরি প্যারামিটারটি বসিয়ে দিন
      await AudioPro.play(displayParts[targetIndex], {
        autoPlay: true,
        startTimeMs: startTimeMs, // এখন এটি ০ না হয়ে আপনার পাঠানো সময় অনুযায়ী হবে
      });
    }
  };

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <Ionicons name="chevron-back" size={22} color={GOLD} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About the Book</Text>
        <TouchableOpacity style={styles.iconCircle}>
          <Ionicons name="share-social-outline" size={20} color={GOLD} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: book.artwork }} style={styles.artwork} />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.title} numberOfLines={1}>{book.title}</Text>
          <Text style={styles.artist}>{book.writer}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Ionicons name="time-outline" size={14} color="#888" />
              <Text style={styles.metaText}>{book.time || '0:00'}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Ionicons name="mic-outline" size={14} color="#888" />
              <Text style={styles.metaText}>{book.voice || 'Voice'}</Text>
            </View>
          </View>

          {/* মেইন প্লে/পজ বাটন */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.playButton, isThisBookActive && isPlaying && styles.activePlayButton]}
              onPress={handleMainPlayPause}
            >
              <Ionicons name={isThisBookActive && isPlaying ? 'pause' : 'play'} size={20} color="black" />
              <Text style={styles.playButtonText}>
                {isLoading && isThisBookActive ? 'Loading...' : isThisBookActive && isPlaying ? 'Pause' : 'Play Now'}
              </Text>
            </TouchableOpacity>

            {book.fileUrl && (
              <TouchableOpacity
                style={styles.readButton}
                onPress={() => navigation.navigate('reader', { book: bookString })}
              >
                <Ionicons name="book-outline" size={18} color={GOLD} />
                <Text style={styles.readButtonText}>পড়ুন</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ট্যাব বার */}
          <View style={styles.tabContainer}>
            <TouchableOpacity onPress={() => setActiveTab('summary')} style={[styles.tabButton, activeTab === 'summary' && styles.activeTabBorder]}>
              <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>Description</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveTab('clips')} style={[styles.tabButton, activeTab === 'clips' && styles.activeTabBorder]}>
              <Text style={[styles.tabText, activeTab === 'clips' && styles.activeTabText]}>Clips ({bookClips.length})</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveTab('parts')} style={[styles.tabButton, activeTab === 'parts' && styles.activeTabBorder]}>
              <Text style={[styles.tabText, activeTab === 'parts' && styles.activeTabText]}>List</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contentBox}>
            {activeTab === 'summary' && (
              <Text style={styles.description}>{book.description || "এই চমৎকার বইটি আপনার চিন্তাভাবনার জগতকে বদলে দেবে..."}</Text>
            )}

            {/* ক্লিপ ফিচার - হাইলাইট এবং প্রগ্রেস সহ */}
            {activeTab === 'clips' && (
              <View>
                {bookClips.length > 0 ? (
                  bookClips.map((clip, index) => {
                    const clipId = clip.id || clip.ref?.from;
                    const isActive = currentActiveClipId === clipId;
                    const progress = isActive ? getClipProgress(clip) : 0;
                    return (
                      <TouchableOpacity
                        key={clipId || index}
                        style={[styles.clipItem, isActive && styles.activeClipItem]}
                        onPress={() => handleClipPlay(clip)}
                      >
                        <View style={[styles.clipIconCircle, isActive && { backgroundColor: '#FFF' }]}>
                          <Ionicons name={isActive && isPlaying ? "volume-medium" : "play"} size={16} color="black" />
                        </View>
                        <View style={styles.clipInfo}>
                          <Text style={[styles.clipTitle, isActive && { color: GOLD }]} numberOfLines={1}>
                            {clip.title || `Clip ${index + 1}`}
                          </Text>
                          {isActive ? (
                            <View style={styles.miniProgressContainer}>
                              <View style={[styles.miniProgressBar, { width: `${progress}%` }]} />
                            </View>
                          ) : (
                            <Text style={styles.clipNote} numberOfLines={1}>
                              {clip.content || formatTime(clip.ref?.from * 1000)}
                            </Text>
                          )}
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={isActive ? GOLD : "#444"} />
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={styles.emptyText}>কোন ক্লিপ পাওয়া যায়নি</Text>
                )}
              </View>
            )}

            {/* লিস্ট বা পার্টস রেন্ডারিং */}
            {activeTab === 'parts' && (
              <View>
                {displayParts.map((item, index) => {
                  const itemKey = item.id || item.url;
                  const isItemPlaying = currentKey === itemKey;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.partItem, isItemPlaying && { backgroundColor: 'rgba(212, 175, 55, 0.05)' }]}
                      onPress={() => handlePartPlay(index)}
                    >
                      <View style={[styles.partNumber, isItemPlaying && { borderColor: GOLD }]}>
                        {isItemPlaying && isPlaying ? (
                          <Ionicons name="volume-medium" size={14} color={GOLD} />
                        ) : (
                          <Text style={{ color: GOLD, fontWeight: 'bold' }}>{index + 1}</Text>
                        )}
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.partTitle, isItemPlaying && { color: GOLD }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.partDuration}>{item.time || 'Part Audio'}</Text>
                      </View>
                      <Ionicons
                        name={isItemPlaying && isPlaying ? "pause-circle" : "play-circle-outline"}
                        size={24}
                        color={GOLD}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, height: 50, marginTop: Platform.OS === 'android' ? 30 : 0 },
  headerTitle: { fontSize: 14, fontWeight: '700', color: GOLD, letterSpacing: 1.2, textTransform: 'uppercase' },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#222' },
  scrollContent: { paddingBottom: 30 },
  imageContainer: { alignItems: 'center', marginVertical: 20 },
  artwork: { width: width * 0.55, height: width * 0.78, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)' },
  detailsContainer: { paddingHorizontal: 20, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', width: '100%', paddingHorizontal: 10 },
  artist: { fontSize: 12, color: GOLD, marginTop: 5, fontWeight: '600' },
  metaRow: { flexDirection: 'row', marginTop: 12, gap: 10 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161616', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#222' },
  metaText: { marginLeft: 6, fontSize: 12, color: '#AAA', fontWeight: '500' },
  buttonGroup: { flexDirection: 'row', marginTop: 25, gap: 12, width: '100%' },
  playButton: { flex: 1.8, flexDirection: 'row', backgroundColor: GOLD, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  activePlayButton: { backgroundColor: '#C5A028' },
  playButtonText: { color: 'black', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  readButton: { flex: 1, flexDirection: 'row', backgroundColor: '#1A1A1A', height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
  readButtonText: { color: GOLD, fontSize: 16, fontWeight: '700', marginLeft: 6 },
  tabContainer: { flexDirection: 'row', width: '100%', marginTop: 30, borderBottomWidth: 1, borderBottomColor: '#222' },
  tabButton: { paddingVertical: 10, marginRight: 20, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTabBorder: { borderBottomColor: GOLD },
  tabText: { fontSize: 14, fontWeight: '700', color: '#666' },
  activeTabText: { color: '#FFF' },
  contentBox: { width: '100%', backgroundColor: '#161616', padding: 15, borderRadius: 15, marginTop: 15, borderWidth: 1, borderColor: '#222', minHeight: 180 },
  description: { fontSize: 14, color: '#BBB', lineHeight: 22 },
  clipItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#222' },
  activeClipItem: { borderColor: GOLD, backgroundColor: 'rgba(212, 175, 55, 0.08)', borderWidth: 1.2 },
  clipIconCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: GOLD, justifyContent: 'center', alignItems: 'center' },
  clipInfo: { flex: 1, marginLeft: 12 },
  clipTitle: { color: '#EEE', fontSize: 14, fontWeight: '600' },
  clipNote: { color: '#666', fontSize: 11, marginTop: 2 },
  miniProgressContainer: { height: 4, backgroundColor: '#333', borderRadius: 2, marginTop: 8, width: '80%', overflow: 'hidden' },
  miniProgressBar: { height: '100%', backgroundColor: GOLD },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 20 },
  partItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 10, marginBottom: 4 },
  partNumber: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  partTitle: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  partDuration: { color: '#666', fontSize: 11, marginTop: 2 },
});