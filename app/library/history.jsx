
// app/(tabs)/history.jsx

import { useLibrary } from '@/context/libraryContext';
import { db } from '@/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image // ইমেজ দেখানোর জন্য
    ,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { useAudioContext } from '@/context/audioContext';

export default function HistoryScreen() {
  const navigation = useNavigation();
  const { library } = useLibrary();
  const [loading, setLoading] = useState(false);
  const [bookDetails, setBookDetails] = useState({}); // বইয়ের টাইটেল ও ছবি রাখার জন্য
  const { playTrack } = useAudioContext();

  const history = library?.history ?? {};
  const list = Object.entries(history).sort(
    (a, b) => (b[1].lastReadAt || 0) - (a[1].lastReadAt || 0)
  );

  // 🖼️ সব বইয়ের ডিটেইলস একসাথে লোড করার অপ্টিমাইজড লজিক
  useEffect(() => {
    const fetchAllDetails = async () => {
      try {
        const detailsMap = {};
        
        // শুধু সেই বইগুলোর আইডি নিচ্ছি যেগুলো আগে লোড করা হয়নি
        const missingIds = list.filter(([bookId]) => !bookDetails[bookId]);
        
        if (missingIds.length === 0) return;

        // সব রিকোয়েস্ট একসাথে পাঠানো হচ্ছে (Parallel processing)
        await Promise.all(
          missingIds.map(async ([bookId, h]) => {
            let targetCol = h.sourceType || (h.type === 'reader' ? 'shortStory' : 'books');
            const d = await getDoc(doc(db, targetCol, bookId));
            if (d.exists()) {
              detailsMap[bookId] = d.data();
            }
          })
        );

        setBookDetails(prev => ({ ...prev, ...detailsMap }));
      } catch (e) {
        console.log("Error fetching book details:", e);
      }
    };

    if (list.length > 0) fetchAllDetails();
  }, [library?.history]);

  const formatTime = (millis) => {
    if (!millis || isNaN(millis)) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);


  const handleHistoryNavigation = async (bookId, h) => {
    setLoading(true);
    try {
      let targetCollection = h.sourceType || (h.type === 'reader' ? 'shortStory' : 'books');
      const docSnap = await getDoc(doc(db, targetCollection, bookId));

      if (docSnap.exists()) {
        const sourceData = { id: docSnap.id, ...docSnap.data() };

        if (h.type === 'audio') {
          // এইখানে পরিবর্তন: ফুল প্লেয়ারে না গিয়ে সরাসরি প্লেয়ার কল করা
          // h.position (মিলি-সেকেন্ড) সরাসরি পাঠিয়ে দিচ্ছি
          await playTrack(sourceData, h.position || 0); 
          
          // মিনি প্লেয়ার যেহেতু context এর currentTrack চেক করে, 
          // তাই সে নিজে থেকেই স্ক্রিনে ভেসে উঠবে।
        } else {
          // বই পড়ার জন্য আগের মতোই নেভিগেশন থাকবে
          navigation.navigate('reader', {
            book: JSON.stringify(sourceData),
            location: { page: h.page },
            jumpToHighlight: true,
            type: 'reader'
          });
        }
      } else {
        Alert.alert("দুঃখিত", "ডাটাবেজে কোনো তথ্য পাওয়া যায়নি।");
      }
    } catch (error) {
      Alert.alert("ত্রুটি", "সার্ভারের সাথে সংযোগ করা যাচ্ছে না।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#d4a373" />
          <Text style={styles.loaderText}>wait...</Text>
        </View>
      )}

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {list.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#333" />
            <Text style={styles.noHistory}>এখনো কোনো হিস্ট্রি নেই</Text>
          </View>
        )}

        {list.map(([bookId, h]) => {
          const details = bookDetails[bookId];
          let progress = 0;
          if (h.type === 'reader' && h.page != null && h.total != null) {
            progress = clamp((h.page + 1) / h.total, 0, 1);
          } else if (h.type === 'audio' && h.position != null && h.duration != null) {
            progress = clamp(h.position / h.duration, 0, 1);
          }

          const percentage = Math.round(progress * 100);

          return (
            <TouchableOpacity
              key={bookId}
              activeOpacity={0.8}
              style={styles.card}
              onPress={() => handleHistoryNavigation(bookId, h)}
            >
              <View style={styles.cardContent}>
                {/* 🖼️ বইয়ের ছবি */}
                <Image 
                  source={{ uri: details?.artwork || 'https://via.placeholder.com/150' }} 
                  style={styles.artwork}
                />

                <View style={styles.infoSection}>
                  {/* 📝 বইয়ের টাইটেল (ডাটাবেজ থেকে) */}
                  <Text style={styles.title} numberOfLines={1}>
                    {details?.title || "Loading..."}
                  </Text>

                  <View style={styles.metaRow}>
                    <Ionicons
                      name={h.type === 'reader' ? "book-outline" : "musical-notes-outline"}
                      size={14}
                      color="#aaa"
                    />
                    <Text style={styles.subText}>
                      {h.type === 'reader'
                        ? ` Page: ${h.page + 1} / ${h.total}`
                        : ` Time: ${formatTime(h.position)}m / ${formatTime(h.duration)}m`}
                    </Text>
                  </View>
                  
                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBg}>
                      <View style={[styles.progressFg, { width: `${percentage}%` }]} />
                    </View>
                    <Text style={styles.percentTextSmall}>{percentage}% সম্পন্ন</Text>
                  </View>
                </View>

                <View style={styles.percentBadge}>
                  <Text style={styles.percentText}>{percentage}%</Text>
                </View>
              </View>

              <Text style={styles.lastRead}>
                {new Date(h.lastReadAt).toLocaleDateString('bn-BD')} | {new Date(h.lastReadAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#120d13',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderText: { color: '#d4a373', marginTop: 10, fontWeight: '600' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a1f2d',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    backgroundColor: '#1c131e',
    borderRadius: 12,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  card: {
    backgroundColor: '#1c131e',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a1f2d',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artwork: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#2a1f2d',
    marginRight: 12,
  },
  infoSection: { flex: 1, justifyContent: 'center' },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  subText: { color: '#aaa', fontSize: 12, marginLeft: 5 },
  percentBadge: {
    backgroundColor: 'rgba(107, 79, 45, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  percentText: { color: '#d4a373', fontSize: 12, fontWeight: 'bold' },
  progressContainer: { marginTop: 4 },
  progressBg: {
    height: 4,
    backgroundColor: '#332635',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFg: { height: '100%', backgroundColor: '#6b4f2d' },
  percentTextSmall: { color: '#666', fontSize: 10, marginTop: 2 },
  lastRead: {
    color: '#444',
    marginTop: 10,
    fontSize: 10,
    textAlign: 'right',
  },
  emptyState: { alignItems: 'center', marginTop: 100 },
  noHistory: { color: '#555', marginTop: 12, fontSize: 16 },
});