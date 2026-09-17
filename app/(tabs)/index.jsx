

// // // app/(tabs)/index.jsx

// // import HomeSkeleton from "@/components/animations/HomeSkeleton";
// // import Categories from "@/components/buildApp/categories";
// // import Header from "@/components/buildApp/header";
// // import SimplePuzzle from "@/components/game/puzzle";
// // import { Colors } from "@/constants/Colors";
// // import { useAudioContext } from '@/context/audioContext';
// // import { db } from '@/firebase';
// // import { Ionicons } from '@expo/vector-icons';
// // import { useNavigation, useRouter } from 'expo-router';
// // import { collection, onSnapshot } from 'firebase/firestore';
// // import React, { useEffect, useState } from 'react';
// // import {
// //   Appearance,
// //   FlatList,
// //   Image,
// //   RefreshControl,
// //   ScrollView,
// //   StyleSheet,
// //   Text,
// //   TouchableOpacity,
// //   View
// // } from "react-native";

// // export default function HomeScreen() {
// //   const navigation = useNavigation();
// //   const router = useRouter();
// //   const colrorScheme = Appearance.getColorScheme();
// //   const themes = colrorScheme === "dark" ? Colors.dark : Colors.light;
// //   const styles = createStyles(themes, colrorScheme);
// //   const { playTrack } = useAudioContext();

// //   const [booksList, setBooksList] = useState([]);
// //   const [shortStories, setShortStories] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [showGame, setShowGame] = useState(false); // গেম কন্ট্রোল স্টেট

// //   // ১. নেভিগেশন হ্যান্ডেলার
// //   const handleBookPress = (item) => {
// //     navigation.navigate('details', { book: JSON.stringify(item) });
// //   };

// //   const handleKindlePress = (item) => {
// //     navigation.navigate('reader', { book: JSON.stringify(item) });
// //   };

// //   // ২. রিফ্রেশ লজিক (অফলাইন হ্যান্ডলিং সহ)
// //   const handleRefresh = () => {
// //     setRefreshing(true);
// //     setShowGame(false); // রিফ্রেশ করলে গেম মোড বন্ধ হবে

// //     // ৫ সেকেন্ডের সেফটি টাইমআউট
// //     const timeoutId = setTimeout(() => {
// //       setRefreshing(false);
// //       if (booksList.length === 0) {
// //         setLoading(false); // ডাটা না পেলে গেম অপশন দেখাবে
// //       }
// //     }, 5000);

// //     const unsubBooks = onSnapshot(collection(db, 'books'), snapshot => {
// //       const arr = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// //       if (arr.length > 0) {
// //         setBooksList(arr);
// //         setLoading(false);
// //         clearTimeout(timeoutId);
// //       }
// //       setRefreshing(false);
// //     }, err => {
// //       setRefreshing(false);
// //       setLoading(false);
// //       clearTimeout(timeoutId);
// //     });

// //     const unsubStories = onSnapshot(collection(db, 'shortStory'), snapshot => {
// //       const arr = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// //       setShortStories(arr);
// //     });

// //     // লিসেনার ক্লিনআপ
// //     setTimeout(() => {
// //       unsubBooks();
// //       unsubStories();
// //     }, 6000);
// //   };

// //   // ৩. ইনিশিয়াল ডেটা ফেচিং
// //   useEffect(() => {
// //     const safetyTimer = setTimeout(() => {
// //       setLoading(false);
// //     }, 8000);

// //     const unsubscribeBooks = onSnapshot(collection(db, 'books'),
// //       snapshot => {
// //         const arr = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// //         setBooksList(arr);
// //         setLoading(false);
// //         clearTimeout(safetyTimer);
// //       },
// //       err => setLoading(false)
// //     );

// //     const unsubscribeStories = onSnapshot(collection(db, 'shortStory'),
// //       snapshot => {
// //         const arr = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// //         setShortStories(arr);
// //       }
// //     );

// //     return () => {
// //       unsubscribeBooks();
// //       unsubscribeStories();
// //       clearTimeout(safetyTimer);
// //     };
// //   }, []);

// //   return (
// //     <View style={{ flex: 1, backgroundColor: '#1c131e' }}>

// //       <HomeSkeleton loading={loading} />


// //       {/* ১. ফিক্সড এরিয়া: কালেকশন সেকশন */}
// //       <View style={styles.fixedHeaderContainer}>
// //         <Header />
// //         <Categories />

        

// //         <Text style={styles.sectionTitle}>Collection</Text>
// //         <View style={styles.libraryGrid}>
// //           {[
// //             { title: 'PlayLists', icon: 'headset', route: '/library/playlists' },// অডিও/মিউজিক আইকন
// //             { title: 'Favorites', icon: 'book', route: '/library/favorites' },        // বুক আইকন
// //             { title: 'History', icon: 'time-outline', route: '/library/history' },
// //             { title: 'Notes', icon: 'document-text-outline', route: '/library/notes' },
// //           ].map((item, i) => (
// //             <TouchableOpacity
// //               key={i}
// //               onPress={() => router.push(item.route)}
// //               style={styles.libraryItem}
// //             >
// //               <View style={styles.iconCircle}>
// //                 <Ionicons name={item.icon} size={22} color="#EAB308" />
// //               </View>
// //               <Text style={styles.libraryText} numberOfLines={1}>{item.title}</Text>
// //             </TouchableOpacity>
// //           ))}
// //         </View>
// //       </View>

// //       <ScrollView
// //         style={{ flex: 1 }}
// //         contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 5, paddingBottom: 60 }}
// //         refreshControl={
// //           <RefreshControl
// //             refreshing={refreshing}
// //             onRefresh={handleRefresh}
// //             colors={['#EAB308']}
// //             tintColor="#EAB308"
// //           />
// //         }
// //       >
// //         {/* <Header />
// //         <Categories /> */}

// //         {/* My Library Section */}


// //         {/* ৪. অফলাইন/খালি অবস্থার জন্য পাজল গেম এরিয়া */}
// //         {!loading && booksList.length === 0 && (
// //           <View style={styles.offlineContainer}>
// //             <Ionicons name="wifi-outline" size={20} color="#ff4444" style={{ marginBottom: 10 }} />
// //             <Text style={styles.errorTitle}>Connection Failed</Text>
// //             <Text style={styles.offlineText}>Check your internet or play a quick game!</Text>

// //             {!showGame ? (
// //               <TouchableOpacity
// //                 style={styles.playGameBtn}
// //                 onPress={() => setShowGame(true)}
// //               >
// //                 <Ionicons name="game-controller" size={22} color="#1c131e" />
// //                 <Text style={styles.playGameText}>PLAY PUZZLE</Text>
// //               </TouchableOpacity>
// //             ) : (
// //               <View style={styles.gameWrapper}>
// //                 <SimplePuzzle />
// //                 <TouchableOpacity onPress={() => setShowGame(false)} style={styles.closeGameBtn}>
// //                   <Text style={{ color: '#aaa', fontSize: 13 }}>Close Game</Text>
// //                 </TouchableOpacity>
// //               </View>
// //             )}

// //             <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
// //               <Text style={styles.retryText}>Try Again</Text>
// //             </TouchableOpacity>
// //           </View>
// //         )}

// //         {/* AudioBooks Section */}
// //         {booksList.length > 0 && (
// //           <>
// //             <Text style={styles.sectionTitle}>AudioBooks</Text>
// //             <FlatList
// //               horizontal
// //               showsHorizontalScrollIndicator={false}
// //               data={booksList}
// //               keyExtractor={item => item.id}
// //               renderItem={({ item }) => (
// //                 <TouchableOpacity onPress={() => handleBookPress(item)}>
// //                   <View style={styles.bookCard}>
// //                     <Image source={{ uri: item.artwork }} style={styles.bookImage} resizeMode="cover" />
// //                     <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
// //                     <View style={styles.bookFooter}>
// //                       <Text style={styles.writerText} numberOfLines={1}>{item.writer}</Text>
// //                       <Ionicons name="play-circle" size={18} color="#EAB308" />
// //                     </View>
// //                   </View>
// //                 </TouchableOpacity>
// //               )}
// //             />
// //           </>
// //         )}

// //         {/* Books Section */}
// //         {shortStories.length > 0 && (
// //           <>
// //             <Text style={styles.sectionTitle}>Books</Text>
// //             <FlatList
// //               horizontal
// //               showsHorizontalScrollIndicator={false}
// //               data={shortStories}
// //               keyExtractor={item => item.id}
// //               renderItem={({ item }) => (
// //                 <TouchableOpacity onPress={() => handleKindlePress(item)}>
// //                   <View style={styles.bookCard}>
// //                     <Image source={{ uri: item.artwork }} style={styles.bookImage} resizeMode="cover" />
// //                     <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
// //                     <View style={styles.bookFooter}>
// //                       <Text style={styles.writerText} numberOfLines={1}>{item.writer}</Text>
// //                       <Ionicons name="book" size={18} color="#EAB308" />
// //                     </View>
// //                   </View>
// //                 </TouchableOpacity>
// //               )}
// //             />
// //           </>
// //         )}
// //       </ScrollView>
// //     </View>
// //   );
// // }

// // function createStyles(themes, colorScheme) {
// //   return StyleSheet.create({

// //     fixedHeaderContainer: {
// //       paddingHorizontal: 20,
// //       paddingTop: 50, // স্ট্যাটাস বারের জন্য প্যাডিং
// //       paddingBottom: 10,
// //       backgroundColor: '#1c131e', // ব্যাকগ্রাউন্ড কালার ফিক্সড রাখা জরুরি
// //       zIndex: 10, // যাতে অন্য কন্টেন্টের উপরে থাকে
// //     },

// //     libraryGrid: {
// //       flexDirection: 'row',
// //       justifyContent: 'space-between',
// //       gap: 8,
// //       marginTop: 5
// //     },
// //     libraryItem: {
// //       backgroundColor: '#2d1f30',
// //       borderRadius: 15,
// //       flex: 1,
// //       alignItems: 'center',
// //       paddingVertical: 12,
// //       elevation: 2, // অ্যান্ড্রয়েডের জন্য হালকা শ্যাডো
// //       shadowColor: '#000', // আইওএস এর জন্য শ্যাডো
// //       shadowOffset: { width: 0, height: 2 },
// //       shadowOpacity: 0.2,
// //     },
// //     iconCircle: {
// //       width: 42,
// //       height: 42,
// //       borderRadius: 21,
// //       backgroundColor: 'rgba(234, 179, 8, 0.1)', // আইকনের থিমের সাথে মিল রেখে হালকা ব্যাকগ্রাউন্ড
// //       justifyContent: 'center',
// //       alignItems: 'center',
// //       marginBottom: 6,
// //     },
// //     libraryText: {
// //       color: '#f9eccc',
// //       fontSize: 10,
// //       fontWeight: '600',
// //       textAlign: 'center'
// //     },
// //     sectionTitle: { color: '#f9f0e6', fontSize: 20, marginTop: 25, marginBottom: 10, fontWeight: '600' },
// //     // libraryGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
// //     // libraryItem: { backgroundColor: '#3a2c42', borderRadius: 12, flex: 1, alignItems: 'center', paddingVertical: 12 },
// //     // libraryText: { color: '#f9eccc', fontSize: 12, marginTop: 5 },
// //     bookCard: { backgroundColor: '#2d1f30', borderRadius: 10, padding: 10, marginRight: 15, width: 130 },
// //     bookImage: { width: 110, height: 110, borderRadius: 8 },
// //     bookTitle: { color: '#fff', marginTop: 8, fontSize: 14, fontWeight: '500' },
// //     bookFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
// //     writerText: { color: '#ccc', fontSize: 12, flex: 1 },
// //     offlineContainer: { alignItems: 'center', paddingVertical: 30 },
// //     errorTitle: { color: '#ff4444', fontWeight: 'bold', fontSize: 15, marginBottom: 5 },
// //     offlineText: { color: '#aaa', marginBottom: 20, textAlign: 'center', fontSize: 12 },
// //     playGameBtn: {
// //       backgroundColor: '#EAB308',
// //       flexDirection: 'row',
// //       alignItems: 'center',
// //       paddingHorizontal: 25,
// //       paddingVertical: 12,
// //       borderRadius: 12,
// //       gap: 8,
// //       elevation: 4
// //     },
// //     playGameText: { color: '#1c131e', fontWeight: '800', fontSize: 14 },
// //     gameWrapper: { width: '100%', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: 15, borderRadius: 20 },
// //     closeGameBtn: { marginTop: 15, padding: 5 },
// //     retryButton: { marginTop: 25, borderBottomWidth: 1, borderBottomColor: '#EAB308' },
// //     retryText: { fontWeight: 'bold', color: '#EAB308', paddingBottom: 2 }
// //   });
// // }

// // app/(tabs)/index.jsx

// import HomeSkeleton from "@/components/animations/HomeSkeleton";
// import Categories from "@/components/buildApp/categories";
// import Header from "@/components/buildApp/header";
// import SimplePuzzle from "@/components/game/puzzle";
// import { Colors } from "@/constants/Colors";
// import { db } from '@/firebase';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation, useRouter } from 'expo-router';
// import { collection, onSnapshot } from 'firebase/firestore';
// import React, { useEffect, useState } from 'react';
// import {
//   Appearance,
//   FlatList,
//   Image,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from "react-native";

// export default function HomeScreen() {
//   const navigation = useNavigation();
//   const router = useRouter();
//   const colrorScheme = Appearance.getColorScheme();
//   const themes = colrorScheme === "dark" ? Colors.dark : Colors.light;
//   const styles = createStyles(themes, colrorScheme);

//   const [booksList, setBooksList] = useState([]);
//   const [shortStories, setShortStories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [showGame, setShowGame] = useState(false);

//   const handleBookPress = (item) => {
//     navigation.navigate('details', { book: JSON.stringify(item) });
//   };

//   const handleKindlePress = (item) => {
//     navigation.navigate('reader', { book: JSON.stringify(item) });
//   };

//   const handleRefresh = () => {
//     setRefreshing(true);
//     setShowGame(false);
//     const timeoutId = setTimeout(() => {
//       setRefreshing(false);
//       if (booksList.length === 0) setLoading(false);
//     }, 5000);

//     const unsubBooks = onSnapshot(collection(db, 'books'), snapshot => {
//       const arr = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setBooksList(arr);
//       setLoading(false);
//       setRefreshing(false);
//       clearTimeout(timeoutId);
//     }, err => {
//       setRefreshing(false);
//       setLoading(false);
//     });

//     const unsubStories = onSnapshot(collection(db, 'shortStory'), snapshot => {
//       const arr = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setShortStories(arr);
//     });
//   };

//   useEffect(() => {
//     const safetyTimer = setTimeout(() => setLoading(false), 8000);
//     const unsubscribeBooks = onSnapshot(collection(db, 'books'), snap => {
//       setBooksList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//       setLoading(false);
//       clearTimeout(safetyTimer);
//     });
//     const unsubscribeStories = onSnapshot(collection(db, 'shortStory'), snap => {
//       setShortStories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//     });

//     return () => {
//       unsubscribeBooks();
//       unsubscribeStories();
//       clearTimeout(safetyTimer);
//     };
//   }, []);

//   return (
//     <View style={{ flex: 1, backgroundColor: '#1c131e' }}>
//       <HomeSkeleton loading={loading} />

//       {/* ফিক্সড এরিয়া */}
//       <View style={styles.fixedHeaderContainer}>
//         <Header />
//         <Categories />
//         <Text style={styles.sectionTitle}>Collection</Text>
//         <View style={styles.libraryGrid}>
//           {[
//             { title: 'PlayLists', icon: 'library', route: '/library/playlists' },
//             { title: 'Favorites', icon: 'book', route: '/library/favorites' },
//             { title: 'History', icon: 'time-outline', route: '/library/history' },
//             { title: 'Notes', icon: 'document-text-outline', route: '/library/notes' },
//           ].map((item, i) => (
//             <TouchableOpacity key={i} onPress={() => router.push(item.route)} style={styles.libraryItem}>
//               <View style={styles.iconCircle}>
//                 <Ionicons name={item.icon} size={22} color="#EAB308" />
//               </View>
//               <Text style={styles.libraryText} numberOfLines={1}>{item.title}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 5, paddingBottom: 60 }}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#EAB308" />}
//       >
//         {/* ৪. অফলাইন/গেম এরিয়া - শুধু ডাটা না থাকলে দেখাবে */}
//         {!loading && booksList.length === 0 && (
//           <View style={styles.errorWrapper}>
//             {!showGame ? (
//               <View style={styles.initialErrorBox}>
//                 <Ionicons name="wifi-outline" size={30} color="#ff4444" />
//                 <Text style={styles.errorTitle}>Connection Failed</Text>
//                 <Text style={styles.errorSub}>Check internet or play puzzle</Text>
//                 <View style={styles.errorActionRow}>
//                   <TouchableOpacity onPress={handleRefresh} style={styles.retryBtn}>
//                     <Text style={styles.retryBtnText}>Try Again</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity onPress={() => setShowGame(true)} style={styles.gameTriggerBtn}>
//                     <Ionicons name="game-controller" size={24} color="#1c131e" />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             ) : (
//               // গেম মোড: এখানে এরর মেসেজ থাকবে না
//               <View style={styles.activeGameView}>
//                 <View style={styles.gameTopBar}>
//                   <View style={styles.statusBadge}>
//                     <Ionicons name="flash" size={14} color="#EAB308" />
//                     <Text style={styles.statusText}>Offline Mode</Text>
//                   </View>
//                   <View style={styles.gameActions}>
//                     <TouchableOpacity onPress={handleRefresh} style={styles.miniIconBtn}>
//                       <Ionicons name="refresh" size={18} color="#aaa" />
//                     </TouchableOpacity>
//                     <TouchableOpacity onPress={() => setShowGame(false)} style={styles.miniIconBtn}>
//                       <Ionicons name="close" size={20} color="#ff4444" />
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//                 <SimplePuzzle />
//               </View>
//             )}
//           </View>
//         )}

//         {/* ৫. অনলাইন কন্টেন্ট - AudioBooks */}
//         {booksList.length > 0 && (
//           <>
//             <Text style={styles.contentTitle}>AudioBooks</Text>
//             <FlatList
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               data={booksList}
//               keyExtractor={item => item.id}
//               renderItem={({ item }) => (
//                 <TouchableOpacity onPress={() => handleBookPress(item)}>
//                   <View style={styles.bookCard}>
//                     <Image source={{ uri: item.artwork }} style={styles.bookImage} resizeMode="cover" />
//                     <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
//                     <View style={styles.bookFooter}>
//                       <Text style={styles.writerText} numberOfLines={1}>{item.writer}</Text>
//                       <Ionicons name="play-circle" size={18} color="#EAB308" />
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               )}
//             />
//           </>
//         )}

//         {/* ৬. অনলাইন কন্টেন্ট - Books */}
//         {shortStories.length > 0 && (
//           <>
//             <Text style={[styles.contentTitle, {marginTop: 20}]}>Books</Text>
//             <FlatList
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               data={shortStories}
//               keyExtractor={item => item.id}
//               renderItem={({ item }) => (
//                 <TouchableOpacity onPress={() => handleKindlePress(item)}>
//                   <View style={styles.bookCard}>
//                     <Image source={{ uri: item.artwork }} style={styles.bookImage} resizeMode="cover" />
//                     <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
//                     <View style={styles.bookFooter}>
//                       <Text style={styles.writerText} numberOfLines={1}>{item.writer}</Text>
//                       <Ionicons name="book" size={18} color="#EAB308" />
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               )}
//             />
//           </>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// function createStyles(themes, colorScheme) {
//   return StyleSheet.create({
//     fixedHeaderContainer: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#1c131e', zIndex: 10 },
//     libraryGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 5 },
//     libraryItem: { backgroundColor: '#2d1f30', borderRadius: 15, flex: 1, alignItems: 'center', paddingVertical: 12 },
//     iconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(234, 179, 8, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
//     libraryText: { color: '#f9eccc', fontSize: 10, fontWeight: '600' },
//     sectionTitle: { color: '#f9f0e6', fontSize: 18, marginBottom: 10, fontWeight: '600' },
//     contentTitle: { color: '#f9f0e6', fontSize: 18, marginBottom: 10, fontWeight: '600', marginTop: 10 },

//     // অফলাইন ও গেম ডিজাইন
//     errorWrapper: { backgroundColor: '#2d1f30', borderRadius: 20, marginTop: 10, overflow: 'hidden' },
//     initialErrorBox: { padding: 30, alignItems: 'center' },
//     errorTitle: { color: '#ff4444', fontWeight: 'bold', fontSize: 16, marginTop: 10 },
//     errorSub: { color: '#aaa', fontSize: 12, marginBottom: 20 },
//     errorActionRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
//     retryBtn: { borderWidth: 1, borderColor: '#EAB308', paddingHorizontal: 25, paddingVertical: 10, borderRadius: 12 },
//     retryBtnText: { color: '#EAB308', fontWeight: 'bold' },
//     gameTriggerBtn: { backgroundColor: '#EAB308', width: 45, height: 45, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    
//     activeGameBox: { padding: 15 },
//     gameHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
//     gameHeaderText: { color: '#EAB308', fontWeight: 'bold', fontSize: 14 },

//     bookCard: { backgroundColor: '#2d1f30', borderRadius: 10, padding: 10, marginRight: 15, width: 130 },
//     bookImage: { width: 110, height: 110, borderRadius: 8 },
//     bookTitle: { color: '#fff', marginTop: 8, fontSize: 14, fontWeight: '500' },
//     bookFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
//     writerText: { color: '#ccc', fontSize: 12, flex: 1 },
//   });
// }

// app/(tabs)/index.jsx

import HomeSkeleton from "@/components/animations/HomeSkeleton";
import Categories from "@/components/buildApp/categories";
import Header from "@/components/buildApp/header";
import SimplePuzzle from "@/components/game/puzzle";
import { db } from '@/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [booksList, setBooksList] = useState([]);
  const [shortStories, setShortStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showGame, setShowGame] = useState(false);

  const handleBookPress = (item) => {
    navigation.navigate('details', { book: JSON.stringify(item) });
  };

  const handleKindlePress = (item) => {
    navigation.navigate('reader', { book: JSON.stringify(item) });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setShowGame(false);
    const timeoutId = setTimeout(() => {
      setRefreshing(false);
      if (booksList.length === 0) setLoading(false);
    }, 5000);

    const unsubBooks = onSnapshot(collection(db, 'books'), snapshot => {
      setBooksList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
      setRefreshing(false);
      clearTimeout(timeoutId);
    }, () => {
      setRefreshing(false);
      setLoading(false);
    });

    onSnapshot(collection(db, 'shortStory'), snapshot => {
      setShortStories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  };

  useEffect(() => {
    const safetyTimer = setTimeout(() => setLoading(false), 8000);
    const unsubBooks = onSnapshot(collection(db, 'books'), snap => {
      setBooksList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
      clearTimeout(safetyTimer);
    });
    const unsubStories = onSnapshot(collection(db, 'shortStory'), snap => {
      setShortStories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubBooks(); unsubStories(); clearTimeout(safetyTimer); };
  }, []);

  return (
    <View style={styles.container}>
      <HomeSkeleton loading={loading} />

      {/* Fixed Header Section */}
      <View style={styles.fixedHeader}>
        <Header />
        <Categories />
        <Text style={styles.sectionTitle}>Collection</Text>
        <View style={styles.libraryGrid}>
          {[
            { title: 'PlayLists', icon: 'headset', route: '/library/playlists' },
            { title: 'Favorites', icon: 'book', route: '/library/favorites' },
            { title: 'History', icon: 'time', route: '/library/history' },
            { title: 'Notes', icon: 'document-text', route: '/library/notes' },
          ].map((item, i) => (
            <TouchableOpacity key={i} onPress={() => router.push(item.route)} style={styles.libraryItem}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={20} color="#8a8a66" />
              </View>
              <Text style={styles.libraryText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#EAB308" />}
      >
        {/* Offline/Game Section */}
        {!loading && booksList.length === 0 && (
          <View style={styles.errorCard}>
            {!showGame ? (
              <View style={styles.errorState}>
                <View style={styles.errorIconCircle}>
                  <Ionicons name="cloud-offline" size={32} color="#ff4444" />
                </View>
                <Text style={styles.errorTitle}>Connection Failed</Text>
                <Text style={styles.errorSub}>Please check your network or relax with a puzzle.</Text>
                <View style={styles.btnRow}>
                  <TouchableOpacity onPress={handleRefresh} style={styles.retryBtn}>
                    <Ionicons name="refresh" size={18} color="#EAB308" />
                    <Text style={styles.retryBtnText}>Try Again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowGame(true)} style={styles.playIconBtn}>
                    <Ionicons name="game-controller" size={24} color="#1c131e" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.gameBox}>
                <View style={styles.gameHeader}>
                  <View style={styles.gameIndicator}>
                    
                    <Ionicons name="flash" size={14} color="#8a8a66" />
                    <Text style={styles.gameHeaderText}>Offline Mode</Text>
                  </View>
                  <View style={styles.gameActions}>
                    {/* <TouchableOpacity onPress={handleRefresh} style={styles.iconBtn}>
                      <Ionicons name="refresh-outline" size={20} color="#aaa" />
                    </TouchableOpacity> */}
                    <TouchableOpacity onPress={() => setShowGame(false)} style={styles.iconBtn}>
                      <Ionicons name="close-outline" size={22} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </View>
                <SimplePuzzle />
              </View>
            )}
          </View>
        )}

        {/* AudioBooks Section */}
        {booksList.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.contentTitle}>AudioBooks</Text>
              
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={booksList}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleBookPress(item)} style={styles.bookCard}>
                  <Image source={{ uri: item.artwork }} style={styles.bookImage} />
                  <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.bookFooter}>
                    <Text style={styles.writerText} numberOfLines={1}>{item.writer}</Text>
                    <Ionicons name="play-circle" size={20} color="#EAB308" />
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Book Section */}
        {shortStories.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.contentTitle}>Books</Text>
              
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={shortStories}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleKindlePress(item)} style={styles.bookCard}>
                  <Image source={{ uri: item.artwork }} style={styles.bookImage} />
                  <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.bookFooter}>
                    <Text style={styles.writerText} numberOfLines={1}>{item.writer}</Text>
                    <Ionicons name="book" size={18} color="#EAB308" />
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c131e' },
  fixedHeader: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#1c131e', zIndex: 10 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 80 },
  
  sectionTitle: { color: '#f9f0e6', fontSize: 18, marginVertical: 12, fontWeight: '700', letterSpacing: 0.5 },
  libraryGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  libraryItem: { backgroundColor: '#2d1f30', borderRadius: 16, flex: 1, alignItems: 'center', paddingVertical: 14, borderWidth: 1, borderColor: '#3d2b41' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(234, 179, 8, 0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  libraryText: { color: '#f9eccc', fontSize: 10, fontWeight: '600' },

  // Error Card Styling
  errorCard: { backgroundColor: '#2d1f30', borderRadius: 24, marginTop: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#3d2b41' },
  errorState: { padding: 30, alignItems: 'center' },
  errorIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  errorTitle: { color: '#fff', fontWeight: '700', fontSize: 18 },
  errorSub: { color: '#94a3b8', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 25 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: '#EAB308', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  retryBtnText: { color: '#EAB308', fontWeight: '700', fontSize: 14 },
  playIconBtn: { backgroundColor: '#EAB308', width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 4 },

  // Game Styling
  gameBox: { padding: 15 },
  gameHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  gameIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EAB308' },
  gameHeaderText: { color: '#8a8a66', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  gameActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#1c131e', justifyContent: 'center', alignItems: 'center' },

  // Content Styling
  sectionContainer: { marginTop: 25 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  contentTitle: { color: '#f9f0e6', fontSize: 18, fontWeight: '700' },
  bookCard: { backgroundColor: '#2d1f30', borderRadius: 18, padding: 10, marginRight: 16, width: 140, borderWidth: 1, borderColor: '#3d2b41' },
  bookImage: { width: 120, height: 120, borderRadius: 14, marginBottom: 10 },
  bookTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  bookFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 6, justifyContent: 'space-between' },
  writerText: { color: '#94a3b8', fontSize: 11, flex: 1 },
});