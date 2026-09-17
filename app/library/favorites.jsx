


// import { useLibrary } from '@/context/libraryContext';
// import { db } from '@/firebase';
// import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';
// import { doc, getDoc } from 'firebase/firestore';
// import React, { useEffect, useState } from 'react';
// import {
//   Alert,
//   Dimensions,
//   FlatList,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');
// const CARD_WIDTH = (SCREEN_WIDTH - 48) / 3; // 3 cards per row

// export default function BooklistScreen() {
//   const { library, removeBooklist } = useLibrary(); // removePlaylist = toggleFavorite can be reused
//   const [books, setBooks] = useState([]);
  
//   useEffect(() => {
//     const fetchBooklistCovers = async () => {
//       if (!library?.booklists) return;

//       const formatted = await Promise.all(
//         Object.entries(library.booklists).map(async ([id, list]) => {

//           const itemsArray = list.items ? Object.keys(list.items) : [];
//           let coverUrl = list.cover; // যদি future এ নিজস্ব cover রাখো
          

//           // 🔥 cover না থাকলে প্রথম shortStory থেকে নিবে
//           if (!coverUrl && itemsArray.length > 0) {
//             try {
//               const firstStoryId = list.items[0];
//               const snap = await getDoc(
//                 doc(db, 'shortStory', firstStoryId) // 👈 collection name
//               );

//               if (snap.exists()) {
//                 coverUrl = snap.data().artwork;
//               }
//             } catch (e) {
//               console.log('Cover fetch error:', e);
//             }
//           }

//           return {
//             id,
//             title: list.title || 'Untitled',
//             count: list.items ? list.items.length : 0,
//             cover: coverUrl || 'https://via.placeholder.com/150',
//           };
//         })
//       );

//       setBooks(formatted);
//     };

//     fetchBooklistCovers();
//   }, [library]);


//   const handleDelete = (id, title) => {
//     Alert.alert(
//       'Remove from Favorites',
//       `Are you sure you want to remove "${title}"?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Remove',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               if (removeBooklist) await removeBooklist(id); // context remove
//               setBooks(prev => prev.filter(b => b.id !== id));
//             } catch (err) {
//               console.error(err);
//               Alert.alert('Error', 'Could not remove the book.');
//             }
//           },
//         },
//       ]
//     );
//   };

//   if (!library) {
//     return (
//       <View style={styles.center}>
//         <Text style={{ color: '#aaa' }}>Loading favorites...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <View style={{ marginLeft: 12 }}>
//           <Text style={styles.headerTitle}>My Favorites</Text>
//           <Text style={styles.headerSubTitle}>
//             {books.length} books
//           </Text>
//         </View>
//       </View>

//       <FlatList
//         data={books}
//         numColumns={3}
//         keyExtractor={item => item.id}
//         contentContainerStyle={styles.listContent}
//         renderItem={({ item }) => (
//           <View style={styles.card}>
//             <View style={styles.coverWrap}>
//               <TouchableOpacity
//                 onPress={() => router.push(`/library/book/${item.id}`)}
//               >
//                 <Image
//                   source={{ uri: item.cover }}
//                   style={styles.cover}
//                 />
//               </TouchableOpacity>

//               {/* Delete / remove button */}
//               <TouchableOpacity
//                 style={styles.deleteBtn}
//                 onPress={() => handleDelete(item.id, item.title)}
//               >
//                 <Ionicons name="close-circle" size={20} color="#ff4d4d" />
//               </TouchableOpacity>
//             </View>

//             <Text style={styles.title} numberOfLines={1}>
//               {item.title}
//             </Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1c131e',
//     paddingTop: 40,
//   },
//   center: {
//     flex: 1,
//     backgroundColor: '#1c131e',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//     paddingHorizontal: 16,
//   },
//   headerTitle: {
//     color: '#fff',
//     fontSize: 22,
//     fontWeight: 'bold',
//   },
//   headerSubTitle: {
//     color: '#aaa',
//     fontSize: 13,
//   },
//   listContent: {
//     paddingHorizontal: 8,
//     paddingBottom: 100,
//   },
//   card: {
//     width: CARD_WIDTH,
//     margin: 8,
//   },
//   coverWrap: {
//     position: 'relative',
//   },
//   cover: {
//     width: '100%',
//     height: CARD_WIDTH,
//     borderRadius: 12,
//     backgroundColor: '#333',
//   },
//   deleteBtn: {
//     position: 'absolute',
//     top: -6,
//     right: -6,
//     zIndex: 10,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//   },
//   title: {
//     color: '#fff',
//     fontSize: 12,
//     marginTop: 6,
//     textAlign: 'center',
//     fontWeight: '500',
//   },
// });

import { useLibrary } from '@/context/libraryContext';
import { db } from '@/firebase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - (GAP * (COLUMN_COUNT + 1))) / COLUMN_COUNT;
const GOLD = '#D4AF37';

export default function BooklistScreen() {
  const { library, removeBooklist } = useLibrary();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCovers = async () => {
      if (!library?.booklists) {
        setLoading(false);
        return;
      }

      const formatted = await Promise.all(
        Object.entries(library.booklists).map(async ([id, list]) => {
          const itemsArray = list.items ? Object.values(list.items) : [];
          let coverUrl = list.cover;

          if (!coverUrl && itemsArray.length > 0) {
            try {
              const firstId = itemsArray[0];
              const snap = await getDoc(doc(db, 'shortStory', firstId));
              if (snap.exists()) coverUrl = snap.data().artwork;
            } catch (e) { console.log(e); }
          }

          return {
            id,
            title: list.title || 'Untitled',
            count: itemsArray.length,
            cover: coverUrl || 'https://via.placeholder.com/150',
          };
        })
      );
      setBooks(formatted);
      setLoading(false);
    };

    fetchCovers();
  }, [library]);

  const handleDelete = (id, title) => {
    Alert.alert("Remove List", `Delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: () => removeBooklist && removeBooklist(id) 
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>My Favorites</Text>
          <View style={styles.goldUnderline} />
          <Text style={styles.headerSubTitle}>{books.length} Collections</Text>
        </View>
      </View>

      <FlatList
        data={books}
        numColumns={COLUMN_COUNT}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable 
  style={({pressed}) => [styles.coverWrap, pressed && {opacity: 0.8}]}
  // আপনার ফোল্ডার স্ট্রাকচার অনুযায়ী পাথ: library/favorites/[id]
  onPress={() => router.push(`/library/favorites/${item.id}`)} 
>
              <Image source={{ uri: item.cover }} style={styles.cover} />
              <View style={styles.glassBadge}>
                <Text style={styles.badgeText}>{item.count}</Text>
              </View>
              <TouchableOpacity style={styles.deleteCircle} onPress={() => handleDelete(item.id, item.title)}>
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
  container: { flex: 1, backgroundColor: '#0D0B0E', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, paddingHorizontal: 20 },
  backBtn: { marginRight: 15, backgroundColor: '#1A171C', padding: 8, borderRadius: 12 },
  headerTitle: { color: GOLD, fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  goldUnderline: { height: 2, width: "40%", backgroundColor: GOLD, marginTop: 4, borderRadius: 1 },
  headerSubTitle: { color: '#716E75', fontSize: 14, marginTop: 4 },
  listContent: { paddingHorizontal: GAP, paddingBottom: 100 },
  card: { width: CARD_WIDTH, marginHorizontal: GAP / 2, marginBottom: 20 },
  coverWrap: { borderRadius: 18, overflow: 'hidden', elevation: 5, backgroundColor: '#1A171C' },
  cover: { width: CARD_WIDTH, height: CARD_WIDTH * 1.3 },
  deleteCircle: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(255, 60, 60, 0.9)', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  glassBadge: { position: 'absolute', left: 8, bottom: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, borderRadius: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  title: { color: '#E1E1E1', fontSize: 13, marginTop: 10, fontWeight: '600', textAlign: 'center' },
});
