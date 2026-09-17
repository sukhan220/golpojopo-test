

// // // player.jsx - Final Progress Bar Alignment Fix & Perfect Alignment

// // import { useAudioContext } from '@/context/audioContext';
// // import { useLibrary } from '@/context/libraryContext';
// // import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// // import MultiSlider from "@ptomasroos/react-native-multi-slider";
// // import Slider from '@react-native-community/slider';
// // import { useNavigation, useRoute } from '@react-navigation/native';
// // import React, { useEffect, useMemo, useState } from 'react';
// // import { ActivityIndicator, Dimensions, Image, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// // import { AudioPro, useAudioPro } from 'react-native-audio-pro';

// // const { width } = Dimensions.get('window');
// // const GOLD = '#D4AF37';
// // const BG = '#0F0F0F';

// // const PlayerScreen = () => {
// //   const { params } = useRoute();
// //   const navigation = useNavigation();
// //   const parsedBook = useMemo(() => params?.book ? JSON.parse(params.book) : null, [params]);

// //   const { playTrack, togglePlayPause, seekTo, setVolume, setPlaybackSpeed, isPlaying, currentTrack } = useAudioContext();
// //   const { position, duration, playbackSpeed, volume } = useAudioPro();
// //   const { library, addNote, createPlaylist, addToPlaylist, saveHistory } = useLibrary();

// //   const [playlistModal, setPlaylistModal] = useState(false);
// //   const [noteModal, setNoteModal] = useState(false);
// //   const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
// //   const [noteText, setNoteText] = useState('');
// //   const [clip, setClip] = useState({ from: 0, to: 100 });

// //   const bookClips = useMemo(() => {
// //     if (!library?.notes?.[parsedBook?.id]) return [];
// //     return library.notes[parsedBook.id].clips || [];
// //   }, [library, parsedBook?.id]);

// //   useEffect(() => {
// //     const initPlayer = async () => {
// //       if (parsedBook) {
// //         if (!currentTrack || currentTrack.id !== parsedBook.id) {
// //           await playTrack(parsedBook);
// //         }
// //         if (params?.startTime) {
// //           await AudioPro.play(parsedBook, { autoPlay: true, startTimeMs: params.startTime });
// //         }
// //       }
// //     };
// //     initPlayer();
// //     navigation.setOptions({ headerShown: false });
// //   }, [parsedBook]);

// //   useEffect(() => {
// //     if (parsedBook && duration) {
// //       const progress = position / duration;
// //       if (progress > 0) saveHistory(parsedBook.id, { type: 'audio', progress, position, duration });
// //     }
// //   }, [position]);

// //   const formatTime = (ms) => {
// //     const s = Math.floor(ms / 1000);
// //     return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
// //   };

// //   const getDynamicClip = () => {
// //     if (!duration) return { from: 0, to: 100 };
// //     const posSec = Math.floor(position / 1000);
// //     const durSec = Math.floor(duration / 1000);
// //     return { from: posSec, to: Math.min(posSec + 100, durSec) };
// //   };

// //   const jumpToClip = (startTimeSeconds) => {
// //     seekTo(startTimeSeconds * 1000);
// //   };

// //   const renderClipMarkers = () => {
// //     if (!duration || bookClips.length === 0) return null;
// //     return (
// //       <View style={styles.clipMarkerWrapper}>
// //         {bookClips.map((item, index) => {
// //           const from = item.ref?.from || 0;
// //           const to = item.ref?.to || from + 2; 
// //           const startPos = (from * 1000 / duration) * 100;
// //           const endPos = (to * 1000 / duration) * 100;
// //           const clipWidth = Math.max(endPos - startPos, 1); 

// //           return (
// //             <View
// //               key={`marker-${index}`}
// //               style={[
// //                 styles.clipHighlight,
// //                 { left: `${startPos}%`, width: `${clipWidth}%` }
// //               ]}
// //             />
// //           );
// //         })}
// //       </View>
// //     );
// //   };

// //   const renderClipCards = () => {
// //     if (bookClips.length === 0) return null;
// //     return (
// //       <View style={styles.topClipSection}>
// //         <Text style={styles.miniLabel}>CLIPS & CHAPTERS</Text>
// //         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}>
// //           {bookClips.map((item, index) => (
// //             <TouchableOpacity key={`card-${index}`} style={styles.clipCard} onPress={() => jumpToClip(item.ref?.from || 0)}>
// //               <View style={styles.cardHeader}>
// //                 <Ionicons name="play-circle" size={14} color={GOLD} />
// //                 <Text style={styles.cardTime}>{formatTime((item.ref?.from || 0) * 1000)}</Text>
// //               </View>
// //               <Text style={styles.cardTitle} numberOfLines={1}>{item.title || `Clip ${index + 1}`}</Text>
// //             </TouchableOpacity>
// //           ))}
// //         </ScrollView>
// //       </View>
// //     );
// //   };

// //   if (!parsedBook) return <View style={styles.container}><ActivityIndicator color={GOLD} /></View>;

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <StatusBar barStyle="light-content" />

// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-down" size={28} color={GOLD} /></TouchableOpacity>
// //         <Text style={styles.headerTitle}>NOW PLAYING</Text>
// //         <View style={{ flexDirection: 'row', gap: 12 }}>
// //           <TouchableOpacity onPress={() => setPlaylistModal(true)}><MaterialIcons name="playlist-add" size={26} color={GOLD} /></TouchableOpacity>
// //           <TouchableOpacity onPress={() => { setClip(getDynamicClip()); setNoteModal(true); }}><MaterialIcons name="note-add" size={24} color={GOLD} /></TouchableOpacity>
// //         </View>
// //       </View>

// //       <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
// //         <Image source={{ uri: parsedBook.artwork }} style={styles.artwork} />

// //         <View style={styles.metaContainer}>
// //           <Text style={styles.title} numberOfLines={1}>{parsedBook.title}</Text>
// //           <Text style={styles.artist}>{parsedBook.writer}</Text>
// //           <View style={styles.voiceBadge}>
// //             <Text style={{ color: '#888', fontSize: 11 }}>কন্ঠ: {parsedBook.voice}</Text>
// //           </View>
// //         </View>

// //         {renderClipCards()}

// //         {/* স্লাইডার সেকশন - এলাইনমেন্ট সম্পূর্ণ ফিক্সড */}
// //         <View style={[styles.sliderContainer, bookClips.length === 0 && { marginTop: 40 }]}>
// //           <View style={styles.sliderWrapper}>
// //             {/* ব্যাকগ্রাউন্ড লেয়ার */}
// //             <View style={styles.sliderTrackBg} />
// //             {/* ক্লিপ মার্কার লেয়ার */}
// //             {renderClipMarkers()}
            
// //             <Slider 
// //               style={styles.mainSlider} 
// //               minimumValue={0} 
// //               maximumValue={duration || 1} 
// //               value={position} 
// //               onSlidingComplete={seekTo} 
// //               minimumTrackTintColor={GOLD} 
// //               maximumTrackTintColor="transparent" 
// //               thumbTintColor={GOLD} 
// //               tapToSeek={true}
// //             />
// //           </View>
// //           <View style={styles.timeRow}>
// //             <Text style={styles.time}>{formatTime(position)}</Text>
// //             <Text style={styles.time}>{formatTime(duration)}</Text>
// //           </View>
// //         </View>

// //         <View style={styles.controls}>
// //           <TouchableOpacity onPress={() => AudioPro.seekBack()}><Ionicons name="play-back" size={32} color={GOLD} /></TouchableOpacity>
// //           <TouchableOpacity onPress={togglePlayPause} style={styles.playBtn}>
// //             <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color="black" style={!isPlaying && { marginLeft: 4 }} />
// //           </TouchableOpacity>
// //           <TouchableOpacity onPress={() => AudioPro.seekForward()}><Ionicons name="play-forward" size={32} color={GOLD} /></TouchableOpacity>
// //         </View>

// //         <View style={styles.footerSection}>
// //           <Text style={styles.label}>Playback Speed</Text>
// //           <View style={styles.speedRow}>
// //             {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
// //               <TouchableOpacity key={s} onPress={() => setPlaybackSpeed(s)} style={[styles.speedBtn, playbackSpeed === s && styles.activeSpeedBtn]}>
// //                 <Text style={{ color: playbackSpeed === s ? 'black' : '#999', fontSize: 11, fontWeight: 'bold' }}>{s}x</Text>
// //               </TouchableOpacity>
// //             ))}
// //           </View>

// //           <Text style={[styles.label, { marginTop: 15 }]}>Volume</Text>
// //           <Slider style={{ width: '100%', height: 30 }} minimumValue={0} maximumValue={1} value={volume} onValueChange={setVolume} minimumTrackTintColor={GOLD} thumbTintColor={GOLD} />
// //         </View>
// //       </ScrollView>

// //       {/* Modals unchanged to preserve all features */}
// //       <Modal visible={noteModal} transparent animationType="fade">
// //         <View style={styles.modalOverlay}><View style={styles.modalCard}>
// //           <Text style={styles.modalTitle}>Clip & Note</Text>
// //           <TextInput placeholder="Note content..." placeholderTextColor="#666" value={noteText} onChangeText={setNoteText} style={styles.input} multiline />
// //           <MultiSlider
// //             values={[clip.from, clip.to]} min={0} max={Math.floor(duration / 1000) || 1} step={1}
// //             sliderLength={width * 0.7} onValuesChange={(vals) => setClip({ from: vals[0], to: vals[1] })}
// //             selectedStyle={{ backgroundColor: GOLD }} unselectedStyle={{ backgroundColor: '#333' }}
// //             trackStyle={{ height: 4, borderRadius: 3 }} markerStyle={styles.multiMarker} pressedMarkerStyle={styles.multiMarkerPressed}
// //           />
// //           <TouchableOpacity style={[styles.primeBtn, { backgroundColor: GOLD, marginTop: 10 }]} onPress={() => {
// //             addNote(parsedBook.id, 'audio', 'clips', { title: noteText ? noteText.substring(0, 15) : `${formatTime(clip.from * 1000)}`, content: noteText, ref: clip }); setNoteModal(false); setNoteText('');
// //           }}><Text style={{ fontWeight: 'bold', color: 'black' }}>Save Note</Text></TouchableOpacity>
// //           <TouchableOpacity onPress={() => setNoteModal(false)}><Text style={{ textAlign: 'center', marginTop: 15, color: '#f44336' }}>Cancel</Text></TouchableOpacity>
// //         </View></View>
// //       </Modal>

// //       <Modal visible={playlistModal} transparent animationType="fade">
// //         <View style={styles.modalOverlay}><View style={styles.modalCard}>
// //           <Text style={styles.modalTitle}>Add to Playlist</Text>
// //           <TextInput placeholder="Playlist Name" placeholderTextColor="#666" value={newPlaylistTitle} onChangeText={setNewPlaylistTitle} style={styles.input} />
// //           <TouchableOpacity style={[styles.primeBtn, { backgroundColor: GOLD }]} onPress={async () => { if (newPlaylistTitle) { const id = await createPlaylist(newPlaylistTitle); addToPlaylist(id, parsedBook.id); setPlaylistModal(false); } }}>
// //             <Text style={{ fontWeight: 'bold', color: 'black' }}>Create & Add</Text>
// //           </TouchableOpacity>
// //           <ScrollView style={{ maxHeight: 150, marginTop: 15 }}>
// //             {library?.playlists && Object.entries(library.playlists).map(([id, pl]) => (
// //               <TouchableOpacity key={id} onPress={() => { addToPlaylist(id, parsedBook.id); setPlaylistModal(false); }} style={styles.listItem}>
// //                 <Text style={{ color: '#EEE' }}>{pl.title}</Text><Ionicons name="add-circle" size={20} color={GOLD} />
// //               </TouchableOpacity>
// //             ))}
// //           </ScrollView>
// //           <TouchableOpacity onPress={() => setPlaylistModal(false)}><Text style={{ textAlign: 'center', marginTop: 10, color: '#f44336' }}>Close</Text></TouchableOpacity>
// //         </View></View>
// //       </Modal>
// //     </SafeAreaView>
// //   );
// // };

// // export default PlayerScreen;

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: BG },
// //   header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, height: 50, marginTop: Platform.OS === 'android' ? 30 : 0 },
// //   headerTitle: { color: GOLD, fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
// //   artwork: { width: width * 0.65, height: width * 0.65, borderRadius: 12, marginTop: 15, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' },
// //   metaContainer: { alignItems: 'center', marginTop: 15, paddingHorizontal: 20 },
// //   title: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
// //   artist: { color: GOLD, fontSize: 15, marginTop: 4 },
// //   voiceBadge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 8, marginTop: 8 },

// //   topClipSection: { width: '100%', marginTop: 20 },
// //   miniLabel: { color: '#444', fontSize: 9, fontWeight: 'bold', marginLeft: '8%', letterSpacing: 1 },
// //   clipCard: { backgroundColor: '#161616', width: 120, height: 55, borderRadius: 10, marginRight: 12, padding: 10, justifyContent: 'center', borderWidth: 1, borderColor: '#222' },
// //   cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
// //   cardTime: { color: GOLD, fontSize: 10, fontWeight: 'bold', marginLeft: 5 },
// //   cardTitle: { color: '#AAA', fontSize: 11, fontWeight: '500' },

// //   // স্লাইডার কন্টেইনার - নিখুঁত এলাইনমেন্টের জন্য প্যাডিং কমানো হয়েছে
// //   sliderContainer: { width: '90%', marginTop: 5 }, 
// //   sliderWrapper: { 
// //     width: '100%', 
// //     height: 40, 
// //     justifyContent: 'center', 
// //     position: 'relative'
// //   },
// //   // ব্যাকগ্রাউন্ড ট্র্যাককে স্লাইডারের হ্যান্ডেলের সমান করা হয়েছে
// //   sliderTrackBg: { 
// //     position: 'absolute', 
// //     width: '94%', // স্লাইডারের থাম্ব সাইজ বাদ দিয়ে ট্র্যাকের চওড়া ৯৪% করা হয়েছে
// //     height: 2, 
// //     backgroundColor: 'rgba(255,255,255,0.1)', 
// //     borderRadius: 1,
// //     alignSelf: 'center' // একদম মাঝখানে থাকবে
// //   },
// //   mainSlider: { 
// //     width: '100%', 
// //     height: 40, 
// //     zIndex: 10,
// //   },
// //   clipMarkerWrapper: { 
// //     position: 'absolute', 
// //     width: '94%', // ব্যাকগ্রাউন্ড ট্র্যাকের সাথে হুবহু মিলানো
// //     height: 2, 
// //     zIndex: 5, 
// //     alignSelf: 'center'
// //   },
// //   clipHighlight: { 
// //     position: 'absolute', 
// //     height: 2, 
// //     backgroundColor: 'rgba(255,255,255,0.7)', 
// //     borderRadius: 1,
// //   },
// //   timeRow: { 
// //     flexDirection: 'row', 
// //     justifyContent: 'space-between', 
// //     paddingHorizontal: '3%', 
// //     marginTop: -5 
// //   },
// //   time: { color: '#666', fontSize: 10 },

// //   controls: { flexDirection: 'row', alignItems: 'center', gap: 35, marginTop: 15 },
// //   playBtn: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: GOLD, justifyContent: 'center', alignItems: 'center', shadowColor: GOLD, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
// //   footerSection: { width: '85%', marginTop: 20, backgroundColor: '#161616', padding: 12, borderRadius: 15 },
// //   label: { color: '#555', fontWeight: 'bold', fontSize: 11, marginBottom: 8, textTransform: 'uppercase' },
// //   speedRow: { flexDirection: 'row', justifyContent: 'space-between' },
// //   speedBtn: { paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: '#333' },
// //   activeSpeedBtn: { backgroundColor: GOLD, borderColor: GOLD },
// //   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
// //   modalCard: { backgroundColor: '#1A1A1A', width: '85%', borderRadius: 15, padding: 20, borderWidth: 1, borderColor: '#333' },
// //   modalTitle: { color: GOLD, fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
// //   input: { backgroundColor: '#222', color: 'white', padding: 10, borderRadius: 8, marginBottom: 10 },
// //   primeBtn: { padding: 12, borderRadius: 8, alignItems: 'center' },
// //   listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#333' },
// //   multiMarker: { backgroundColor: GOLD, width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#111' },
// //   multiMarkerPressed: { width: 22, height: 22, borderRadius: 11 }
// // });

// / player.jsx - Compact Layout Fix for Scroll Clipping

// import { useAudioContext } from '@/context/audioContext';
// import { useLibrary } from '@/context/libraryContext';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import MultiSlider from "@ptomasroos/react-native-multi-slider";
// import Slider from '@react-native-community/slider';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import React, { useEffect, useMemo, useState } from 'react';
// import { ActivityIndicator, Dimensions, Image, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { AudioPro, useAudioPro } from 'react-native-audio-pro';

// const { width, height } = Dimensions.get('window');
// const GOLD = '#D4AF37';
// const BG = '#0F0F0F';

// export default PlayerScreen = () => {
//   const { params } = useRoute();
//   const navigation = useNavigation();
//   const parsedBook = useMemo(() => params?.book ? JSON.parse(params.book) : null, [params]);

//   const { playTrack, togglePlayPause, seekTo, setVolume, setPlaybackSpeed, isPlaying, currentTrack } = useAudioContext();
//   const { position, duration, playbackSpeed, volume } = useAudioPro();
//   const { library, addNote, createPlaylist, addToPlaylist, saveHistory } = useLibrary();

//   const [playlistModal, setPlaylistModal] = useState(false);
//   const [noteModal, setNoteModal] = useState(false);
//   const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
//   const [noteText, setNoteText] = useState('');
//   const [clip, setClip] = useState({ from: 0, to: 100 });

//   const bookClips = useMemo(() => {
//     if (!library?.notes?.[parsedBook?.id]) return [];
//     const clips = library.notes[parsedBook.id].clips || [];
//     return [...clips].sort((a, b) => (a.ref?.from || 0) - (b.ref?.from || 0));
//   }, [library, parsedBook?.id]);

//   useEffect(() => {
//     const initPlayer = async () => {
//       if (parsedBook) {
//         if (!currentTrack || currentTrack.id !== parsedBook.id) {
//           await playTrack(parsedBook);
//         }
//         if (params?.startTime) {
//           await AudioPro.play(parsedBook, { autoPlay: true, startTimeMs: params.startTime });
//         }
//       }
//     };
//     initPlayer();
//     navigation.setOptions({ headerShown: false });
//   }, [parsedBook]);

//   useEffect(() => {
//     if (parsedBook && duration) {
//       const progress = position / duration;
//       if (progress > 0) saveHistory(parsedBook.id, { type: 'audio', progress, position, duration });
//     }
//   }, [position]);

//   const formatTime = (ms) => {
//     const s = Math.floor(ms / 1000);
//     return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
//   };

//   const getDynamicClip = () => {
//     if (!duration) return { from: 0, to: 100 };
//     const posSec = Math.floor(position / 1000);
//     const durSec = Math.floor(duration / 1000);
//     return { from: posSec, to: Math.min(posSec + 100, durSec) };
//   };

//   const jumpToClip = (startTimeSeconds) => {
//     seekTo(startTimeSeconds * 1000);
//   };

//   const renderClipMarkers = () => {
//     if (!duration || bookClips.length === 0) return null;
//     return (
//       <View style={styles.clipMarkerWrapper}>
//         {bookClips.map((item, index) => {
//           const from = item.ref?.from || 0;
//           const to = item.ref?.to || from + 2; 
//           const startPos = (from * 1000 / duration) * 100;
//           const endPos = (to * 1000 / duration) * 100;
//           const clipWidth = Math.max(endPos - startPos, 1); 

//           return (
//             <View
//               key={`marker-${index}`}
//               style={[
//                 styles.clipHighlight,
//                 { left: `${startPos}%`, width: `${clipWidth}%` }
//               ]}
//             />
//           );
//         })}
//       </View>
//     );
//   };

//   const renderClipCards = () => {
//     if (bookClips.length === 0) return null;
//     return (
//       <View style={styles.topClipSection}>
//         <Text style={styles.miniLabel}>CLIPS & CHAPTERS</Text>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8 }}>
//           {bookClips.map((item, index) => (
//             <TouchableOpacity key={`card-${index}`} style={styles.clipCard} onPress={() => jumpToClip(item.ref?.from || 0)}>
//               <View style={styles.cardHeader}>
//                 <Ionicons name="play" size={12} color={GOLD} />
//                 <Text style={styles.cardTime}>{formatTime((item.ref?.from || 0) * 1000)}</Text>
//               </View>
//               <Text style={styles.cardTitle} numberOfLines={1}>{item.title || `Clip ${index + 1}`}</Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>
//     );
//   };

//   if (!parsedBook) return <View style={styles.container}><ActivityIndicator color={GOLD} /></View>;

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" />

//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-down" size={28} color={GOLD} /></TouchableOpacity>
//         <Text style={styles.headerTitle}>NOW PLAYING</Text>
//         <View style={{ flexDirection: 'row', gap: 12 }}>
//           <TouchableOpacity onPress={() => setPlaylistModal(true)}><MaterialIcons name="playlist-add" size={26} color={GOLD} /></TouchableOpacity>
//           <TouchableOpacity onPress={() => { setClip(getDynamicClip()); setNoteModal(true); }}><MaterialIcons name="note-add" size={24} color={GOLD} /></TouchableOpacity>
//         </View>
//       </View>

//       <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
//         {/* Artwork সাইজ কিছুটা কমানো হয়েছে স্ক্রিন স্পেস বাঁচাতে */}
//         <Image source={{ uri: parsedBook.artwork }} style={styles.artwork} />

//         <View style={styles.metaContainer}>
//           <Text style={styles.title} numberOfLines={1}>{parsedBook.title}</Text>
//           <Text style={styles.artist}>{parsedBook.writer}</Text>
//           <View style={styles.voiceBadge}>
//             <Text style={{ color: '#888', fontSize: 11 }}>কন্ঠ: {parsedBook.voice}</Text>
//           </View>
//         </View>

//         {renderClipCards()}

//         <View style={[styles.sliderContainer, bookClips.length === 0 && { marginTop: 20 }]}>
//           <View style={styles.sliderWrapper}>
//             <View style={styles.sliderTrackBg} />
//             {renderClipMarkers()}
//             <Slider 
//               style={styles.mainSlider} 
//               minimumValue={0} 
//               maximumValue={duration || 1} 
//               value={position} 
//               onSlidingComplete={seekTo} 
//               minimumTrackTintColor={GOLD} 
//               maximumTrackTintColor="transparent" 
//               thumbTintColor={GOLD} 
//               tapToSeek={true}
//             />
//           </View>
//           <View style={styles.timeRow}>
//             <Text style={styles.time}>{formatTime(position)}</Text>
//             <Text style={styles.time}>{formatTime(duration)}</Text>
//           </View>
//         </View>

//         <View style={styles.controls}>
//           <TouchableOpacity onPress={() => AudioPro.seekBack()}><Ionicons name="play-back" size={30} color={GOLD} /></TouchableOpacity>
//           <TouchableOpacity onPress={togglePlayPause} style={styles.playBtn}>
//             <Ionicons name={isPlaying ? 'pause' : 'play'} size={34} color="black" style={!isPlaying && { marginLeft: 4 }} />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => AudioPro.seekForward()}><Ionicons name="play-forward" size={30} color={GOLD} /></TouchableOpacity>
//         </View>

//         <View style={styles.footerSection}>
//           <Text style={styles.label}>Playback Speed</Text>
//           <View style={styles.speedRow}>
//             {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
//               <TouchableOpacity key={s} onPress={() => setPlaybackSpeed(s)} style={[styles.speedBtn, playbackSpeed === s && styles.activeSpeedBtn]}>
//                 <Text style={{ color: playbackSpeed === s ? 'black' : '#999', fontSize: 10, fontWeight: 'bold' }}>{s}x</Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <Text style={[styles.label, { marginTop: 12 }]}>Volume</Text>
//           <Slider style={{ width: '100%', height: 30 }} minimumValue={0} maximumValue={1} value={volume} onValueChange={setVolume} minimumTrackTintColor={GOLD} thumbTintColor={GOLD} />
//         </View>
//       </ScrollView>

//       {/* Note Modal */}
//       <Modal visible={noteModal} transparent animationType="fade">
//         <View style={styles.modalOverlay}><View style={styles.modalCard}>
//           <Text style={styles.modalTitle}>Clip & Note</Text>
//           <TextInput placeholder="Note content..." placeholderTextColor="#666" value={noteText} onChangeText={setNoteText} style={styles.input} multiline />
//           <MultiSlider
//             values={[clip.from, clip.to]} min={0} max={Math.floor(duration / 1000) || 1} step={1}
//             sliderLength={width * 0.7} onValuesChange={(vals) => setClip({ from: vals[0], to: vals[1] })}
//             selectedStyle={{ backgroundColor: GOLD }} unselectedStyle={{ backgroundColor: '#333' }}
//             trackStyle={{ height: 4, borderRadius: 3 }} markerStyle={styles.multiMarker} pressedMarkerStyle={styles.multiMarkerPressed}
//           />
//           <TouchableOpacity style={[styles.primeBtn, { backgroundColor: GOLD, marginTop: 10 }]} onPress={() => {
//             addNote(parsedBook.id, 'audio', 'clips', { title: noteText ? noteText.substring(0, 15) : `${formatTime(clip.from * 1000)}`, content: noteText, ref: clip }); setNoteModal(false); setNoteText('');
//           }}><Text style={{ fontWeight: 'bold', color: 'black' }}>Save Note</Text></TouchableOpacity>
//           <TouchableOpacity onPress={() => setNoteModal(false)}><Text style={{ textAlign: 'center', marginTop: 15, color: '#f44336' }}>Cancel</Text></TouchableOpacity>
//         </View></View>
//       </Modal>

//       {/* Playlist Modal */}
//       <Modal visible={playlistModal} transparent animationType="fade">
//         <View style={styles.modalOverlay}><View style={styles.modalCard}>
//           <Text style={styles.modalTitle}>Add to Playlist</Text>
//           <TextInput placeholder="Playlist Name" placeholderTextColor="#666" value={newPlaylistTitle} onChangeText={setNewPlaylistTitle} style={styles.input} />
//           <TouchableOpacity style={[styles.primeBtn, { backgroundColor: GOLD }]} onPress={async () => { if (newPlaylistTitle) { const id = await createPlaylist(newPlaylistTitle); addToPlaylist(id, parsedBook.id); setPlaylistModal(false); } }}>
//             <Text style={{ fontWeight: 'bold', color: 'black' }}>Create & Add</Text>
//           </TouchableOpacity>
//           <ScrollView style={{ maxHeight: 150, marginTop: 15 }}>
//             {library?.playlists && Object.entries(library.playlists).map(([id, pl]) => (
//               <TouchableOpacity key={id} onPress={() => { addToPlaylist(id, parsedBook.id); setPlaylistModal(false); }} style={styles.listItem}>
//                 <Text style={{ color: '#EEE' }}>{pl.title}</Text><Ionicons name="add-circle" size={20} color={GOLD} />
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//           <TouchableOpacity onPress={() => setPlaylistModal(false)}><Text style={{ textAlign: 'center', marginTop: 10, color: '#f44336' }}>Close</Text></TouchableOpacity>
//         </View></View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: BG },
//   header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, height: 50, marginTop: Platform.OS === 'android' ? 30 : 0 },
//   headerTitle: { color: GOLD, fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
//   // Artwork size reduced from 0.65 to 0.58 to save vertical space
//   artwork: { width: width * 0.58, height: width * 0.58, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' },
//   metaContainer: { alignItems: 'center', marginTop: 12, paddingHorizontal: 20 },
//   title: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
//   artist: { color: GOLD, fontSize: 14, marginTop: 2 },
//   voiceBadge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6, marginTop: 6 },

//   topClipSection: { width: '100%', marginTop: 15 },
//   miniLabel: { color: '#444', fontSize: 9, fontWeight: 'bold', marginLeft: '8%', letterSpacing: 1 },
//   clipCard: { backgroundColor: '#161616', width: 95, height: 44, borderRadius: 8, marginRight: 10, padding: 6, justifyContent: 'center', borderWidth: 1, borderColor: '#222' },
//   cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 1 },
//   cardTime: { color: GOLD, fontSize: 9, fontWeight: 'bold', marginLeft: 4 },
//   cardTitle: { color: '#AAA', fontSize: 9, fontWeight: '500' },

//   sliderContainer: { width: '90%', marginTop: 5 }, 
//   sliderWrapper: { width: '100%', height: 36, justifyContent: 'center', position: 'relative' },
//   sliderTrackBg: { position: 'absolute', width: '94%', height: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1, alignSelf: 'center' },
//   mainSlider: { width: '100%', height: 36, zIndex: 10 },
//   clipMarkerWrapper: { position: 'absolute', width: '94%', height: 2, zIndex: 5, alignSelf: 'center' },
//   clipHighlight: { position: 'absolute', height: 2, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 1 },
//   timeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: '3%', marginTop: -4 },
//   time: { color: '#666', fontSize: 10 },

//   controls: { flexDirection: 'row', alignItems: 'center', gap: 30, marginTop: 12 },
//   playBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: GOLD, justifyContent: 'center', alignItems: 'center', shadowColor: GOLD, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
//   footerSection: { width: '85%', marginTop: 15, backgroundColor: '#161616', padding: 10, borderRadius: 15 },
//   label: { color: '#555', fontWeight: 'bold', fontSize: 10, marginBottom: 6, textTransform: 'uppercase' },
//   speedRow: { flexDirection: 'row', justifyContent: 'space-between' },
//   speedBtn: { paddingVertical: 4, paddingHorizontal: 6, borderRadius: 6, borderWidth: 1, borderColor: '#333' },
//   activeSpeedBtn: { backgroundColor: GOLD, borderColor: GOLD },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
//   modalCard: { backgroundColor: '#1A1A1A', width: '85%', borderRadius: 15, padding: 20, borderWidth: 1, borderColor: '#333' },
//   modalTitle: { color: GOLD, fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
//   input: { backgroundColor: '#222', color: 'white', padding: 10, borderRadius: 8, marginBottom: 10 },
//   primeBtn: { padding: 12, borderRadius: 8, alignItems: 'center' },
//   listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#333' },
//   multiMarker: { backgroundColor: GOLD, width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#111' },
//   multiMarkerPressed: { width: 22, height: 22, borderRadius: 11 }
// });