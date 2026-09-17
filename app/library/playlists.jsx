//PlayList.jsx

import { useLibrary } from '@/context/libraryContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - (GAP * (COLUMN_COUNT + 1))) / COLUMN_COUNT;

export default function PlaylistsScreen() {
  const { library, removePlaylist } = useLibrary();

  // ডাটা ফরম্যাটিং এর জন্য useMemo ব্যবহার করা হয়েছে পারফরম্যান্সের জন্য
  const playlistData = useMemo(() => {
    if (!library?.playlists) return [];

    return Object.entries(library.playlists).map(([id, p]) => {
      const itemsArray = p.items ? Object.values(p.items) : [];
      let coverUrl = p.cover;

      if (!coverUrl && itemsArray.length > 0) {
        const firstItem = itemsArray[0];
        coverUrl = typeof firstItem === 'object' ? firstItem.artwork : null;
      }

      return {
        id,
        title: p.title,
        count: itemsArray.length,
        cover: coverUrl || 'https://via.placeholder.com/150',
      };
    });
  }, [library]);

  const totalAudios = useMemo(() =>
    playlistData.reduce((acc, curr) => acc + curr.count, 0),
    [playlistData]);

  const handleDelete = (id, title) => {
    Alert.alert(
      "Delete Playlist",
      `Are you sure you want to delete "${title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (removePlaylist) await removePlaylist(id);
            } catch (error) {
              Alert.alert("Error", "Could not delete the playlist.");
            }
          }
        }
      ]
    );
  };

  // Empty State Component
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="playlist-music-outline" size={80} color="#333" />
      <Text style={styles.emptyText}>No Playlists Found</Text>
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => router.push('/library/create')} // আপনার ক্রিয়েট পাথ অনুযায়ী পরিবর্তন করুন
      >
        <Text style={styles.createBtnText}>Create New</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* --- Header --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Play List</Text>
          <View style={styles.goldUnderline} />
          <Text style={styles.headerSubTitle}>
            {playlistData.length} Playlists • {totalAudios} Tracks
          </Text>
        </View>
      </View>

      {/* --- Playlist Grid --- */}
      <FlatList
        data={playlistData}
        numColumns={COLUMN_COUNT}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable
              style={({ pressed }) => [styles.coverWrap, pressed && { opacity: 0.8 }]}
              onPress={() => router.push(`/library/playlist/${item.id}`)}
            >
              <Image source={{ uri: item.cover }} style={styles.cover} />

              <View style={styles.glassBadge}>
                <Text style={styles.badgeText}>{item.count}</Text>
              </View>

              <TouchableOpacity
                style={styles.deleteCircle}
                onPress={() => handleDelete(item.id, item.title)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </Pressable>

            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0B0E', // Deeper Dark
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  backBtn: {
    marginRight: 15,
    backgroundColor: '#1A171C',
    padding: 8,
    borderRadius: 12,
  },
  // headerTitle: {
  //   color: '#fff',
  //   fontSize: 26,
  //   fontWeight: '800',
  //   letterSpacing: 0.5,
  // },
  headerTitle: {
    color: '#D4AF37',
    fontSize: 28,
    fontWeight: '900',
    // textTransform: 'uppercase', <--- এই লাইনটি ডিলিট করে দিন বা কমেন্ট করুন
    letterSpacing: 2, // মিক্সড কেসের জন্য স্পেসিং ২ বা ৩ রাখা ভালো, ৪ দিলে বেশি ফাঁকা লাগে
    textShadowColor: 'rgba(212, 175, 55, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  goldUnderline: {
  height: 2,
  width: "100%",
  backgroundColor: '#D4AF37',
  marginTop: 4,
  marginBottom: 2,
  borderRadius: 1,
},
  headerSubTitle: {
    color: '#716E75',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: GAP,
    paddingBottom: 120,
    flexGrow: 1,
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: GAP / 2,
    marginBottom: 20,
  },
  coverWrap: {
    borderRadius: 18,
    overflow: 'hidden', // যাতে ইমেজ রেডিয়াস পায়
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cover: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    backgroundColor: '#1A171C',
  },
  deleteCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 60, 60, 0.9)',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  title: {
    color: '#E1E1E1',
    fontSize: 13,
    marginTop: 10,
    paddingHorizontal: 4,
    textAlign: 'left',
    fontWeight: '600',
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#444',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  createBtn: {
    marginTop: 20,
    backgroundColor: '#D4AF37', // আপনার GOLD কালার
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createBtnText: {
    color: '#000',
    fontWeight: 'bold',
  }
});