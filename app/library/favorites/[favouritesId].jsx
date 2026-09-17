// import { useLibrary } from '@/context/libraryContext';
// import { db } from '@/firebase';
// import { Ionicons } from '@expo/vector-icons';
// import { router, useLocalSearchParams } from 'expo-router';
// import { doc, getDoc } from 'firebase/firestore';
// import React, { useEffect, useMemo, useState } from 'react';
// import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// const GOLD = '#D4AF37';

// export default function FavoriteDetailsScreen() {
//   // আপনার ফাইলের নাম অনুযায়ী favouritesId রিসিভ করা হচ্ছে
//   const { favouritesId } = useLocalSearchParams(); 
//   const { library, removeFromBooklist } = useLibrary();
//   const [bookItems, setBookItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // লাইব্রেরি থেকে নির্দিষ্ট লিস্ট খুঁজে বের করা
//   const currentList = library?.booklists?.[favouritesId];
//   const items = useMemo(() => currentList?.items ? Object.values(currentList.items) : [], [currentList]);

//   useEffect(() => {
//     const loadBooks = async () => {
//       if (items.length === 0) {
//         setLoading(false);
//         return;
//       }
//       setLoading(true);
//       try {
//         const results = [];
//         for (const bookId of items) {
//           // আপনার কালেকশন নাম অনুযায়ী (shortStory)
//           const snap = await getDoc(doc(db, 'shortStory', bookId));
//           if (snap.exists()) {
//             results.push({ id: bookId, ...snap.data() });
//           }
//         }
//         setBookItems(results);
//       } catch (e) {
//         console.error("Error loading favorite stories:", e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadBooks();
//   }, [items, favouritesId]);

//   return (
//     <View style={styles.container}>
//       {/* Custom Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
//           <Ionicons name="chevron-back" size={28} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle} numberOfLines={1}>
//           {currentList?.title || 'Collection'}
//         </Text>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
//         {/* Top Visual Card */}
//         <View style={styles.topCard}>
//           <Image 
//             source={{ uri: bookItems[0]?.artwork || 'https://via.placeholder.com/300' }} 
//             style={styles.mainCover} 
//           />
//           <Text style={styles.mainTitle}>{currentList?.title}</Text>
//           <Text style={styles.countText}>{bookItems.length} items saved</Text>
//         </View>

//         {/* Stories List */}
//         <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
//           {bookItems.map((item) => (
//             <TouchableOpacity 
//               key={item.id} 
//               style={styles.bookRow}
//               onPress={() => router.push(`/reader/${item.id}`)} // আপনার রিডার পাথ অনুযায়ী
//             >
//               <Image source={{ uri: item.artwork }} style={styles.thumb} />
//               <View style={{ flex: 1, marginLeft: 15 }}>
//                 <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
//                 <Text style={styles.author}>{item.author || item.writer || 'Unknown Author'}</Text>
//               </View>
              
//               <TouchableOpacity 
//                 style={styles.removeIcon}
//                 onPress={() => removeFromBooklist(favouritesId, item.id)}
//               >
//                 <Ionicons name="trash-outline" size={20} color="#ff4444" />
//               </TouchableOpacity>
//             </TouchableOpacity>
//           ))}
          
//           {!loading && bookItems.length === 0 && (
//             <Text style={styles.emptyText}>এই লিস্টে কোনো গল্প নেই।</Text>
//           )}
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#0D0B0E', paddingTop: 40 },
//   header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 60 },
//   backBtn: { backgroundColor: '#1A171C', padding: 6, borderRadius: 10, marginRight: 12 },
//   headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', flex: 1 },
//   topCard: { alignItems: 'center', paddingVertical: 20 },
//   mainCover: { width: 160, height: 220, borderRadius: 15, elevation: 10, shadowColor: GOLD, shadowOpacity: 0.2 },
//   mainTitle: { color: GOLD, fontSize: 24, fontWeight: '900', marginTop: 15 },
//   countText: { color: '#716E75', fontSize: 14, marginTop: 4 },
//   bookRow: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     backgroundColor: '#161418', 
//     padding: 12, 
//     borderRadius: 15, 
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#222'
//   },
//   thumb: { width: 50, height: 70, borderRadius: 8 },
//   bookTitle: { color: '#E1E1E1', fontSize: 16, fontWeight: '700' },
//   author: { color: '#716E75', fontSize: 13, marginTop: 2 },
//   removeIcon: { padding: 8 },
//   emptyText: { color: '#444', textAlign: 'center', marginTop: 50, fontSize: 16 }
// });

import { useLibrary } from '@/context/libraryContext';
import { db } from '@/firebase';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GOLD = '#D4AF37';

export default function FavoriteDetailsScreen() {
  const { favouritesId } = useLocalSearchParams(); 
  const { library, removeFromBooklist } = useLibrary();
  const [bookItems, setBookItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // লাইব্রেরি থেকে নির্দিষ্ট লিস্ট খুঁজে বের করা
  const currentList = library?.booklists?.[favouritesId];
  
  // স্টোরেজ স্ট্রাকচার অনুযায়ী items আইডিগুলো বের করা
  const items = useMemo(() => {
    if (!currentList?.items) return [];
    // যদি items অবজেক্ট হয় তবে values নিন, আর অ্যারে হলে সরাসরি ব্যবহার করুন
    return Array.isArray(currentList.items) ? currentList.items : Object.values(currentList.items);
  }, [currentList]);

  useEffect(() => {
    const loadBooks = async () => {
      if (items.length === 0) {
        setBookItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const results = [];
        for (const bookId of items) {
          const snap = await getDoc(doc(db, 'shortStory', bookId));
          if (snap.exists()) {
            results.push({ id: bookId, ...snap.data() });
          }
        }
        setBookItems(results);
      } catch (e) {
        console.error("Error loading favorite stories:", e);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, [items]);

  // রিডারে যাওয়ার ফাংশন
  const goToReader = (item) => {
    if (!item) return;
    
    router.push({
      pathname: '/reader',
      params: { 
        // রিডার ফাইল যেহেতু JSON.parse(book) করে, তাই পুরো অবজেক্ট স্ট্রিং করে পাঠাতে হবে
        book: JSON.stringify(item) 
      }
    });
  };
  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {currentList?.title || 'সংগ্রহশালা'}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Top Visual Card */}
        <View style={styles.topCard}>
          {bookItems.length > 0 ? (
             <Image 
                source={{ uri: bookItems[0]?.artwork }} 
                style={styles.mainCover} 
              />
          ) : (
            <View style={[styles.mainCover, { backgroundColor: '#1A171C', justifyContent: 'center', alignItems: 'center' }]}>
               <Ionicons name="book-outline" size={50} color="#333" />
            </View>
          )}
          <Text style={styles.mainTitle}>{currentList?.title}</Text>
          <Text style={styles.countText}>{bookItems.length} টি গল্প সংরক্ষিত</Text>
        </View>

        {/* Stories List */}
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          {loading ? (
            <ActivityIndicator color={GOLD} size="large" />
          ) : (
           bookItems.map((item) => (
  <TouchableOpacity 
    key={item.id} 
    style={styles.bookRow}
    // এখানে item.id এর বদলে পুরো item পাঠান
    onPress={() => goToReader(item)} 
  >
    <Image source={{ uri: item.artwork }} style={styles.thumb} />
    <View style={{ flex: 1, marginLeft: 15 }}>
      <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.author}>{item.author || item.writer || 'অজানা লেখক'}</Text>
    </View>
    
    <TouchableOpacity 
      style={styles.removeIcon}
      onPress={() => removeFromBooklist(favouritesId, item.id)}
    >
      <Ionicons name="trash-outline" size={20} color="#ff4444" />
    </TouchableOpacity>
  </TouchableOpacity>
))
          )}
          
          {!loading && bookItems.length === 0 && (
            <Text style={styles.emptyText}>এই লিস্টে কোনো গল্প নেই।</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B0E', paddingTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 60 },
  backBtn: { backgroundColor: '#1A171C', padding: 6, borderRadius: 10, marginRight: 12 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', flex: 1 },
  topCard: { alignItems: 'center', paddingVertical: 20 },
  mainCover: { width: 160, height: 220, borderRadius: 15, elevation: 10, shadowColor: GOLD, shadowOpacity: 0.2 },
  mainTitle: { color: GOLD, fontSize: 24, fontWeight: '900', marginTop: 15 },
  countText: { color: '#716E75', fontSize: 14, marginTop: 4 },
  bookRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#161418', 
    padding: 12, 
    borderRadius: 15, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222'
  },
  thumb: { width: 50, height: 70, borderRadius: 8 },
  bookTitle: { color: '#E1E1E1', fontSize: 16, fontWeight: '700' },
  author: { color: '#716E75', fontSize: 13, marginTop: 2 },
  removeIcon: { padding: 8 },
  emptyText: { color: '#444', textAlign: 'center', marginTop: 50, fontSize: 16 }
});