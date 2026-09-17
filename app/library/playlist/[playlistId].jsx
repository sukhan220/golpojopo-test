// [playlistId].jsx

import {
  PlaylistHeaderSkeleton,
  PlaylistSkeletonItem
} from '@/components/animations/shadow';
import { useAudioContext } from '@/context/audioContext';
import { useLibrary } from '@/context/libraryContext';
import { db } from '@/firebase';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';




const { width } = Dimensions.get('window');
const GOLD = '#D4AF37';

export default function PlaylistDetailsScreen() {
  const params = useLocalSearchParams();
  const playlistId = Array.isArray(params.playlistId) ? params.playlistId[0] : params.playlistId;

  const { library, removeFromPlaylist } = useLibrary();
  const {
    playPlaylist,
    playNext,
    playPrev,
    isPlaying,
    currentTrack,
    togglePlayPause,
    position,
    duration,
    seekTo,
    setMiniPlayerVisible,
  } = useAudioContext();

  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [bookItems, setBookItems] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);



  const playlist = library?.playlists?.[playlistId];
  // const items = useMemo(() => playlist?.items ? Object.values(playlist.items) : [], [playlist?.items]);
  const items = useMemo(() => {
    const currentPlaylist = library?.playlists?.[playlistId];
    return currentPlaylist?.items ? Object.values(currentPlaylist.items) : [];
  }, [library, playlistId]);







  useEffect(() => {
    const loadBooksForPlaylist = async () => {
      if (!items || items.length === 0) {
        setBookItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const results = [];
        for (const item of items) {
          const mainBookId = typeof item === 'object' ? item.bookId : item;
          const snap = await getDoc(doc(db, 'books', mainBookId));

          if (snap.exists()) {
            const bookData = snap.data();

            if (typeof item === 'object' && item.isPart) {
              const index = item.partNo - 1;
              const partData = bookData.parts && bookData.parts[index];

              if (partData) {
                results.push({
                  ...bookData,          // মেইন বইয়ের ডাটা আগে নিন
                  ...partData,          // তারপর পার্টের ডাটা (এটা টাইটেল/url ওভাররাইট করবে)
                  id: item.id,          // UI তে ইউনিক আইডির জন্য
                  originalItem: item,   // ✅ এটি ডিলিট করার জন্য প্রয়োজন
                  bookId: mainBookId,   // প্লেয়ারের জন্য আসল আইডি
                  title: partData.title || partData["title "], // স্পেস হ্যান্ডেল করা হলো
                  isPart: true,
                  partNo: item.partNo
                });
              }
            } else {
              results.push({
                ...bookData,
                id: mainBookId,
                originalItem: item,     // ✅ ডিলিট করার জন্য
                bookId: mainBookId,
                isPart: false
              });
            }
          }
        }
        setBookItems(results);
      } catch (e) {
        console.error("Error loading playlist books:", e);
      } finally {
        setLoading(false);
      }
    };

    loadBooksForPlaylist();
  }, [items, playlistId]);

  useEffect(() => {
    // স্ক্রিনটি যখন মাউন্ট হবে তখন মিনি প্লেয়ার হাইড হবে
    setMiniPlayerVisible(false);

    return () => {
      // স্ক্রিন থেকে যখন ইউজার ব্যাক করবে তখন আবার শো করবে
      setMiniPlayerVisible(true);
    };
  }, [setMiniPlayerVisible]);



  const currentIndex = bookItems.findIndex(b => b.id === currentTrack?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < bookItems.length - 1;





  const formatTime = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "0:00";
    const totalSeconds = Math.floor(value / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayAll = () => {
    if (bookItems.length === 0) return;
    const isThisPlaylistPlaying = bookItems.some(i => i.id === currentTrack?.id);
    (isPlaying && isThisPlaylistPlaying) ? togglePlayPause() : playPlaylist(bookItems, 0);
  };

  const navigateToPlayer = (item) => {
    router.push({ pathname: '/player', params: { book: JSON.stringify(item), resumePlayback: "true" } });
  };

  const displayItems = searchResults !== null ? searchResults : bookItems;

  return (
    <View style={styles.container}>
      {/* 1. FIXED HEADER */}
      <View style={styles.header}>
        {!isSearching ? (
          <>
            <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{playlist?.title}</Text>
            <TouchableOpacity onPress={() => setIsSearching(true)}><Ionicons name="search" size={22} color="#fff" /></TouchableOpacity>
          </>
        ) : (
          <View style={styles.searchBarContainer}>
            <TouchableOpacity onPress={() => { setIsSearching(false); setSearchText(''); }}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
            <TextInput style={styles.searchInput} placeholder="Search..." placeholderTextColor="#888" value={searchText} onChangeText={setSearchText} autoFocus />
          </View>
        )}
      </View>

      {loading ? (


        <View>
          <PlaylistHeaderSkeleton loading={loading} />
          {[1, 2, 3,4,5,6].map(i => <PlaylistSkeletonItem key={i} loading={loading} />)}
        </View>

      ) : (
        <>


          {/* 2. FIXED TOP CARD SECTION (ইমেজ ও বাটন ফিক্সড থাকবে) */}

          {!isSearching && (
            <View style={styles.playlistCard}>
              <Image source={{ uri: bookItems[0]?.artwork || 'https://dummyimage.com/400x400/333/fff' }} style={styles.cover} />
              <Text style={styles.title}>{playlist?.title}</Text>
              <View style={styles.mainControlsRow}>
                <TouchableOpacity onPress={playPrev} disabled={!hasPrev} style={[styles.sideBtn, !hasPrev && { opacity: 0.3 }]}><Ionicons name="play-skip-back" size={24} color="#fff" /></TouchableOpacity>
                <TouchableOpacity onPress={handlePlayAll} style={styles.playAllBtn}>
                  <Ionicons name={isPlaying && bookItems.some(i => i.id === currentTrack?.id) ? "pause" : "play"} size={28} color="black" />
                  <Text style={styles.playAllText}>{isPlaying && bookItems.some(i => i.id === currentTrack?.id) ? "Pause" : "Play All"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={playNext} disabled={!hasNext} style={[styles.sideBtn, !hasNext && { opacity: 0.3 }]}><Ionicons name="play-skip-forward" size={24} color="#fff" /></TouchableOpacity>
              </View>
            </View>
          )}

          {/* 3. SCROLLABLE LIST SECTION (শুধুমাত্র আইটেমগুলো স্ক্রল হবে) */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={{ padding: 16 }}>
              {displayItems.map((item, index) => {
                const isCurrent = currentTrack?.id === item.id;
                return (
                  <View key={item.id ?? index} style={[styles.itemWrapper, isCurrent && styles.activeItemWrapper]}>
                    <View style={styles.videoRow}>
                      <TouchableOpacity style={styles.itemContent} onPress={() => navigateToPlayer(item)}>
                        <Image source={{ uri: item.artwork }} style={styles.thumb} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.videoTitle, isCurrent && { color: GOLD }]} numberOfLines={1}>{item.title}</Text>
                          <Text style={styles.videoMeta}>{item.writer || item.artist}</Text>
                        </View>
                      </TouchableOpacity>



                      <TouchableOpacity
                        onPress={() => {
                          if (isCurrent) {
                            togglePlayPause();
                          } else {
                            // শুধু এই আইটেম নয়, পুরো লিস্ট (bookItems) এবং এই আইটেমের ইনডেক্স পাঠান
                            playPlaylist(bookItems, index);
                          }
                        }}
                      >
                        <Ionicons
                          name={isCurrent && isPlaying ? "pause-circle" : "play-circle"}
                          size={36}
                          color={isCurrent ? GOLD : "#fff"}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => { setSelectedItem(item); setShowOptions(true); }}>
                        <MaterialIcons name="more-vert" size={24} color="#aaa" />
                      </TouchableOpacity>
                    </View>

                    {isCurrent && (
                      <View style={styles.sliderContainer}>
                        <Slider
                          style={{ width: '100%', height: 30 }}
                          minimumValue={0}
                          maximumValue={duration || 1}
                          value={position}
                          minimumTrackTintColor={GOLD}
                          maximumTrackTintColor="#444"
                          thumbTintColor={GOLD}
                          onSlidingComplete={async (value) => {
                            await seekTo(value);
                          }}
                        />
                        <View style={styles.timeRow}>
                          <Text style={styles.timeText}>{formatTime(position)}</Text>
                          <Text style={styles.timeText}>{formatTime(duration)}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
              {displayItems.length === 0 && (
                <Text style={{ color: '#888', textAlign: 'center', marginTop: 50 }}>No items in this playlist</Text>
              )}
            </View>
          </ScrollView>
        </>)}

      {/* OPTIONS MODAL */}
      <Modal visible={showOptions} transparent animationType="slide" onRequestClose={() => setShowOptions(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowOptions(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalIndicator} />
            <Text style={styles.modalTitle} numberOfLines={1}>{selectedItem?.title}</Text>


            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                // originalItem পাঠান যা Context এর লজিকের সাথে মিলবে
                removeFromPlaylist(playlistId, selectedItem.originalItem || selectedItem.id);
                setShowOptions(false);
              }}
            >


              <View style={[styles.iconCircle, { backgroundColor: '#ff444422' }]}>
                <Ionicons name="trash-outline" size={22} color="#ff4444" />
              </View>
              <Text style={styles.removeText}>Remove from Playlist</Text>
            </TouchableOpacity>

            <View style={styles.modalSeparator} />

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setShowOptions(false)}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="close-outline" size={22} color="#fff" />
              </View>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', marginTop: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, alignItems: 'center', height: 60 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1, marginHorizontal: 15 },
  searchBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchInput: { flex: 1, color: '#fff', backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },

  // Skeleton Styles
  skeletonItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12
  },
  skeletonThumb: {
    width: 70,
    height: 45,
    borderRadius: 6,
    backgroundColor: '#222'
  },
  skeletonLine: {
    borderRadius: 4,
    backgroundColor: '#222'
  },
  skeletonCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#222'
  },
  skeletonCover: {
    width: 160,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#222'
  },
  skeletonButton: {
    width: 140,
    height: 45,
    borderRadius: 30,
    backgroundColor: '#222',
    marginTop: 20
  },

  // Fixed Top Card Styles
  playlistCard: { alignItems: 'center', padding: 16, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#222' },
  cover: { width: 160, height: 160, borderRadius: 12, marginBottom: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  mainControlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15, gap: 25 },
  playAllBtn: { backgroundColor: GOLD, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 10, borderRadius: 30 },
  playAllText: { color: 'black', fontWeight: 'bold', marginLeft: 8, fontSize: 15 },
  sideBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scrollable Items Styles
  itemWrapper: { marginBottom: 10, padding: 10, borderRadius: 12 },
  activeItemWrapper: { backgroundColor: 'rgba(212,175,55,0.1)' },
  videoRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  itemContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 70, height: 45, borderRadius: 6, backgroundColor: '#333' },
  videoTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  videoMeta: { color: '#aaa', fontSize: 12, marginTop: 4 },

  sliderContainer: { marginTop: 10, paddingHorizontal: 5 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -5, paddingHorizontal: 10 },
  timeText: { color: '#aaa', fontSize: 11, fontWeight: '500' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1a1a1a', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, paddingBottom: 40 },
  modalIndicator: { width: 40, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 25, textAlign: 'center', paddingHorizontal: 20 },
  modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, gap: 15 },
  iconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  modalSeparator: { height: 1, backgroundColor: '#222', marginVertical: 5 },
  removeText: { fontSize: 16, color: '#ff4444', fontWeight: '600' },
  cancelText: { fontSize: 16, color: '#fff', fontWeight: '500' }
});