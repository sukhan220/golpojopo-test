// // //Audio Detqils Screen - প্লে বাটন, ডেসক্রিপশন, ক্লিপস সহ



// import { useAudioContext } from '@/context/audioContext';
// import { useLibrary } from '@/context/libraryContext';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import React, { useMemo, useState } from 'react';
// import {
//   Dimensions,
//   Image,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import { AudioPro } from 'react-native-audio-pro';

// const { width } = Dimensions.get('window');
// const GOLD = '#D4AF37';
// const BG = '#0F0F0F';

// export default function BookDetailsScreen() {
//   const route = useRoute();
//   const navigation = useNavigation();

//   const { book: bookString } = route.params;
//   const book = JSON.parse(bookString);

//   const [activeTab, setActiveTab] = useState('summary');
//   const { library } = useLibrary();

//   const {
//     playTrack,
//     togglePlayPause,
//     currentTrack,
//     isPlaying,
//     isLoading,
//     seekTo,
//     position,
//     duration,
//     setMiniPlayerVisible
//   } = useAudioContext();

//   const trackKey = book.id || book.audioUrl || book.fileUrl;
//   const currentKey = currentTrack?.id || currentTrack?.audioUrl || currentTrack?.fileUrl;

//   const isThisPlaying = useMemo(() => currentKey === trackKey, [currentKey, trackKey]);

//   const bookClips = useMemo(() => {
//     if (!library?.notes?.[book.id]) return [];
//     return [...(library.notes[book.id].clips || [])].sort((a, b) => (a.ref?.from || 0) - (b.ref?.from || 0));
//   }, [library, book.id]);

//   const currentActiveClipId = useMemo(() => {
//     if (!isThisPlaying) return null;
//     const currentSeconds = position / 1000;

//     const active = bookClips.find(clip => {
//       const startTime = clip.ref?.from || 0;
//       const endTime = clip.ref?.to;
//       if (endTime) {
//         return currentSeconds >= startTime && currentSeconds <= endTime;
//       } else {
//         const currentIndex = bookClips.indexOf(clip);
//         const nextClip = bookClips[currentIndex + 1];
//         const nextStartTime = nextClip ? nextClip.ref?.from : Infinity;
//         return currentSeconds >= startTime && currentSeconds < nextStartTime;
//       }
//     });
//     return active ? (active.id || active.ref?.from) : null;
//   }, [position, isThisPlaying, bookClips]);

//   // ক্লিপ প্রগ্রেস ক্যালকুলেশন লজিক
//   const getClipProgress = (clip) => {
//     if (!isThisPlaying) return 0;
//     const currentSeconds = position / 1000;
//     const start = clip.ref?.from || 0;
    
//     // এন্ড টাইম বের করা (নিজের 'to' অথবা পরের ক্লিপের শুরু অথবা টোটাল ডিউরেশন)
//     let end = clip.ref?.to;
//     if (!end) {
//       const currentIndex = bookClips.indexOf(clip);
//       const nextClip = bookClips[currentIndex + 1];
//       end = nextClip ? nextClip.ref?.from : (duration / 1000);
//     }

//     const clipDuration = end - start;
//     if (clipDuration <= 0) return 0;
    
//     const elapsed = currentSeconds - start;
//     const progress = Math.min(Math.max(elapsed / clipDuration, 0), 1); // 0 to 1 এর মধ্যে রাখা
//     return progress * 100; // শতাংশে রিটার্ন
//   };

//   const handlePlay = async () => {
//     setMiniPlayerVisible(true)
//     if (isThisPlaying) {
//       await togglePlayPause();
//     } else {
//       await playTrack(book);
//     }
//   };

//   const handleClipPlay = async (startTimeSeconds) => {
//     const startTimeMs = startTimeSeconds * 1000;
//     setMiniPlayerVisible(true)
//     if (isThisPlaying) {
//       await seekTo(startTimeMs);
//       if (!isPlaying) await togglePlayPause();
//     } else {
//       await AudioPro.play(book, { startTimeMs, autoPlay: true });
//     }
//   };

//   const formatTime = (ms) => {
//     const s = Math.floor(ms / 1000);
//     return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
//           <Ionicons name="chevron-back" size={22} color={GOLD} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>About the Book</Text>
//         <TouchableOpacity style={styles.iconCircle}>
//           <Ionicons name="share-social-outline" size={20} color={GOLD} />
//         </TouchableOpacity>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
//         <View style={styles.imageContainer}>
//           <Image source={{ uri: book.artwork }} style={styles.artwork} />
//         </View>

//         <View style={styles.detailsContainer}>
//           <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{book.title}</Text>
//           <Text style={styles.artist}>{book.writer}</Text>

//           <View style={styles.metaRow}>
//             <View style={styles.metaBadge}>
//               <Ionicons name="time-outline" size={14} color="#888" />
//               <Text style={styles.metaText}>{book.time || '0:00'}</Text>
//             </View>
//             <View style={styles.metaBadge}>
//               <Ionicons name="mic-outline" size={14} color="#888" />
//               <Text style={styles.metaText}>{book.voice || 'Voice'}</Text>
//             </View>
//           </View>

//           <View style={styles.buttonGroup}>
//             <TouchableOpacity
//               style={[styles.playButton, isThisPlaying && styles.activePlayButton]}
//               onPress={handlePlay}
//             >
//               <Ionicons name={isThisPlaying && isPlaying ? 'pause' : 'play'} size={20} color="black" />
//               <Text style={styles.playButtonText}>
//                 {isLoading && isThisPlaying ? 'Lodding...' : isThisPlaying && isPlaying ? 'Pause' : 'Play Now'}
//               </Text>
//             </TouchableOpacity>

//             {book.fileUrl && (
//               <TouchableOpacity
//                 style={styles.readButton}
//                 onPress={() => navigation.navigate('reader', { book: bookString })}
//               >
//                 <Ionicons name="book-outline" size={18} color={GOLD} />
//                 <Text style={styles.readButtonText}>পড়ুন</Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           <View style={styles.tabContainer}>
//             <TouchableOpacity onPress={() => setActiveTab('summary')} style={[styles.tabButton, activeTab === 'summary' && styles.activeTabBorder]}>
//               <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>Description</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => setActiveTab('clips')} style={[styles.tabButton, activeTab === 'clips' && styles.activeTabBorder]}>
//               <Text style={[styles.tabText, activeTab === 'clips' && styles.activeTabText]}>Clips ({bookClips.length})</Text>
//             </TouchableOpacity>
//           </View>

//           <View style={styles.contentBox}>
//             {activeTab === 'summary' ? (
//               <Text style={styles.description}>{book.description || "এই চমৎকার বইটি আপনার চিন্তাভাবনার জগতকে বদলে দেবে..."}</Text>
//             ) : (
//               <View>
//                 {bookClips.map((clip, index) => {
//                   const clipId = clip.id || clip.ref?.from;
//                   const isActive = currentActiveClipId === clipId;
//                   const progress = isActive ? getClipProgress(clip) : 0;

//                   return (
//                     <TouchableOpacity
//                       key={clipId || index}
//                       style={[styles.clipItem, isActive && styles.activeClipItem]}
//                       onPress={() => handleClipPlay(clip.ref?.from || 0)}
//                     >
//                       <View style={[styles.clipIconCircle, isActive && {backgroundColor: '#FFF'}]}>
//                         <Ionicons name={isActive && isPlaying ? "volume-medium" : "play"} size={16} color="black" />
//                       </View>
                      
//                       <View style={styles.clipInfo}>
//                         <Text style={[styles.clipTitle, isActive && {color: GOLD}]} numberOfLines={1}>
//                           {clip.title || `Clip ${index + 1}`}
//                         </Text>
                        
//                         {/* প্রগ্রেস বার কন্টেইনার */}
//                         {isActive ? (
//                           <View style={styles.miniProgressContainer}>
//                             <View style={[styles.miniProgressBar, { width: `${progress}%` }]} />
//                           </View>
//                         ) : (
//                           <Text style={styles.clipNote} numberOfLines={1}>
//                             {clip.content || formatTime(clip.ref?.from * 1000)}
//                           </Text>
//                         )}
//                       </View>

//                       <Ionicons name="chevron-forward" size={16} color={isActive ? GOLD : "#444"} />
//                     </TouchableOpacity>
//                   );
//                 })}
//               </View>
//             )}
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: BG },
//   header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, height: 50, marginTop: Platform.OS === 'android' ? 30 : 0 },
//   headerTitle: { fontSize: 14, fontWeight: '700', color: GOLD, letterSpacing: 1.2, textTransform: 'uppercase' },
//   iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#222' },
//   scrollContent: { paddingBottom: 30 },
//   imageContainer: { alignItems: 'center', marginVertical: 20 },
//   artwork: { width: width * 0.55, height: width * 0.78, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)' },
//   detailsContainer: { paddingHorizontal: 20, alignItems: 'center' },
//   title: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', width: '100%', lineHeight: 28 },
//   artist: { fontSize: 12, color: GOLD, marginTop: 5, fontWeight: '600' },
//   metaRow: { flexDirection: 'row', marginTop: 12, gap: 10 },
//   metaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161616', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#222' },
//   metaText: { marginLeft: 6, fontSize: 12, color: '#AAA', fontWeight: '500' },
//   buttonGroup: { flexDirection: 'row', marginTop: 25, gap: 12, width: '100%' },
//   playButton: { flex: 1.8, flexDirection: 'row', backgroundColor: GOLD, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
//   activePlayButton: { backgroundColor: '#C5A028' },
//   playButtonText: { color: 'black', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
//   readButton: { flex: 1, flexDirection: 'row', backgroundColor: '#1A1A1A', height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
//   readButtonText: { color: GOLD, fontSize: 16, fontWeight: '700', marginLeft: 6 },
//   tabContainer: { flexDirection: 'row', width: '100%', marginTop: 30, borderBottomWidth: 1, borderBottomColor: '#222' },
//   tabButton: { paddingVertical: 10, marginRight: 25, borderBottomWidth: 2, borderBottomColor: 'transparent' },
//   activeTabBorder: { borderBottomColor: GOLD },
//   tabText: { fontSize: 16, fontWeight: '700', color: '#666' },
//   activeTabText: { color: '#FFF' },
//   contentBox: { width: '100%', backgroundColor: '#161616', padding: 15, borderRadius: 15, marginTop: 15, borderWidth: 1, borderColor: '#222', minHeight: 180 },
//   description: { fontSize: 14, color: '#BBB', lineHeight: 22 },
//   clipItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#222' },
//   activeClipItem: { borderColor: GOLD, backgroundColor: 'rgba(212, 175, 55, 0.08)', borderWidth: 1.2 },
//   clipIconCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: GOLD, justifyContent: 'center', alignItems: 'center' },
//   clipInfo: { flex: 1, marginLeft: 12 },
//   clipTitle: { color: '#EEE', fontSize: 14, fontWeight: '600' },
//   clipNote: { color: '#666', fontSize: 11, marginTop: 2 },
//   miniProgressContainer: { height: 4, backgroundColor: '#333', borderRadius: 2, marginTop: 8, width: '80%', overflow: 'hidden' },
//   miniProgressBar: { height: '100%', backgroundColor: GOLD },
// });