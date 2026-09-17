

// NoteTab.jsx
import { useLibrary } from '@/context/libraryContext';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

import { useAudioContext } from "@/context/audioContext";
import { db } from '@/firebase';
import { AudioPro } from "react-native-audio-pro";

export default function NoteTab({ library }) {
  const navigation = useNavigation();
  const [bookDetails, setBookDetails] = useState({});
  const [localLoadingId, setLocalLoadingId] = useState(null);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // 🔍 সার্চ স্টেট



  const { preloadClip, isPlaying, position, duration, clipLoadedTrackId, state, activeClipId, setActiveClipId } = useAudioContext();
  const [playingClipId, setPlayingClipId] = useState(activeClipId);
  const isFocused = useIsFocused();
  const timerRef = useRef(null);
  const slowNetTimeoutRef = useRef(null);
  const scrollRef = useRef(null); // ScrollView এর জন্য রিফ
  // const [layoutMap, setLayoutMap] = useState({}); // প্রতিটি কার্ডের Y পজিশন রাখার জন্য
  const layoutMap = useRef({});

  const { removeNote } = useLibrary(); // এটি যোগ করুন

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };



  const handleNavigateToSource = async (item) => {
    try {
      // ১. টাইপ অনুযায়ী কালেকশন এবং টার্গেট স্ক্রিন নির্ধারণ
      const isAudio = item.type === 'clip' || item.type === 'audio';
      const targetCollection = isAudio ? 'books' : (item.type === 'quote' ? 'shortStory' : 'books');
      const targetScreen = isAudio ? 'player' : 'reader';

      const docSnap = await getDoc(doc(db, targetCollection, item.bookId));

      if (docSnap.exists()) {
        const bookData = { id: docSnap.id, ...docSnap.data() };

        // ২. নেভিগেশন প্যারামস তৈরি
        const navParams = {
          book: JSON.stringify(bookData),
          type: item.type
        };

        // যদি অডিও হয়, তবে ক্লিপের স্টার্ট টাইম (ref.from) পাঠিয়ে দিন
        if (isAudio) {
          navParams.startTime = position;
          navParams.autoPlay = true;
          navParams.clipId = item.id;
        } else {
          // রিডারের জন্য লোকেশন এবং হাইলাইট প্যারামস
          navParams.location = item.ref;
          navParams.jumpToHighlight = true;
        }

        // ৩. নির্দিষ্ট স্ক্রিনে নেভিগেট করা
        navigation.navigate(targetScreen, navParams);
      }
    } catch (e) {
      console.error("Navigation error:", e);
    }
  };

  // অটো-স্ক্রল ফাংশন
  const scrollToActive = () => {
    if (activeClipId && layoutMap.current[activeClipId]) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: layoutMap.current[activeClipId] - 20,
          animated: true,
        });
      }, 500); // একটু বেশি সময় দেওয়া হলো যাতে লিস্ট রেন্ডার শেষ হয়
    }
  };



  const allNotes = useMemo(() => {
    if (!library?.notes) return [];
    const list = [];

    Object.entries(library.notes).forEach(([noteKey, bucket]) => {

      

      if (bucket.sourceType === 'audio' && Array.isArray(bucket.clips)) {
        bucket.clips.forEach(n => {
          // ১. মেইন আইডি এবং পার্ট আইডি আলাদা করা
          const noteBookId = n.meta?.id || noteKey;

          // আপনার স্ক্রিনশট অনুযায়ী track-002-1 টাইপ আইডি এখানে আসবে
          const actualPartId = n.ref?.partId || noteBookId;

          // ২. স্মার্ট ইউআরএল সিলেকশন (এটি খুব গুরুত্বপূর্ণ)
          let finalUrl = n.ref?.url || null;

          list.push({
            ...n,
            type: 'clip',
            bookId: noteBookId,      // যেমন: track-002
            actualPartId: actualPartId, // যেমন: track-002-1
            url: finalUrl            // ক্লিপ সেভ করার সময়কার সরাসরি URL
          });
        });
      }

      // ২. যদি এটি টেক্সট কোট হয়
      if (bucket.sourceType === 'book' && Array.isArray(bucket.quotes)) {
        bucket.quotes.forEach(n => {
          list.push({
            ...n,
            type: 'quote',
            bookId: noteKey
          });
        });
      }
    });

    // লেটেস্ট নোটগুলো উপরে দেখানোর জন্য সর্টিং (যদি timestamp থাকে)
    return list.sort((a, b) => {
      const dateA = new Date(a.meta?.savedAt || 0);
      const dateB = new Date(b.meta?.savedAt || 0);
      return dateB - dateA;
    });
  }, [library]);




  const filteredNotes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return allNotes;


    return allNotes.filter(n => {
      const info = bookDetails[n.bookId] || {};

      // ✅ সব সম্ভাব্য টেক্সট ফিল্ড একসাথে চেক করুন
      const displayTitle = (n.meta?.bookTitle || info.title || '').toLowerCase();
      const content = (n.quoteText || n.content || n.ref?.text || '').toLowerCase();
      const writer = (info.writer || '').toLowerCase();

      return displayTitle.includes(query) ||
        content.includes(query) ||
        writer.includes(query);
    });
  }, [searchQuery, allNotes, bookDetails]);

  const stopAudioSafely = async () => {
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      await AudioPro.stop(); // অডিও stop করবে
      setPlayingClipId(null);
      setLocalLoadingId(null);
      setActiveClipId(null);
    } catch (e) {
      console.log("Stop audio error:", e);
    }
  };

  const handleRemovePress = (n) => {
    // n.type 'clip' হলে Firestore/Storage এ সেটা 'clips' হিসেবে থাকে, 
    // আর 'quote' হলে 'quotes' হিসেবে। আপনার logic অনুযায়ী type সেট করুন।
    const noteTypeKey = n.type === 'clip' ? 'clips' : 'quotes';

    Alert.alert(
      "Remove Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeNote(n.bookId, noteTypeKey, n.id);
            } catch (error) {
              console.error("Delete error:", error);
            }
          }
        }
      ]
    );
  };



  // ১. স্ক্রিন থেকে চলে গেলে (Back বা Tab Change) অডিও বন্ধ করার লজিক
  useEffect(() => {
    // যখন ইউজার এই স্ক্রিন থেকে অন্য কোথাও যাবে (blur হবে)
    const unsubscribe = navigation.addListener('blur', () => {
      stopAudioSafely();
    });

    

    // কম্পোনেন্ট আনমাউন্ট হলে (Cleanup)
    return () => {
      unsubscribe();
      stopAudioSafely();
    };
  }, [navigation]);

  useEffect(() => {
    if (isFocused && activeClipId) {
      scrollToActive();
    }
  }, [isFocused, activeClipId]);

  useEffect(() => {

    // এই অংশটি আপনার কোডের useEffect এর ভেতর খুঁজে পেয়ে যাবেন
    const fetchAllBookDetails = async () => {
      // শুধু ইউনিক বুক আইডিগুলো নেব (যা মূল বইয়ের তথ্য ধারণ করে)


      const uniqueBookIds = [...new Set(allNotes.map(n => ({ id: n.bookId, type: n.type })))];
      const details = { ...bookDetails };
      let updated = false;



      for (const item of uniqueBookIds) {

        if (!details[item.id]) {
          const collection = item.type === 'quote' ? 'shortStory' : 'books';
          try {
            const dSnap = await getDoc(doc(db, collection, item.id));
            if (dSnap.exists()) {
              const data = dSnap.data();
              // এখানে টাইটেল, লেখক এবং আর্টওয়ার্ক সেভ হচ্ছে
              details[item.id] = { title: data.title, writer: data.writer, artwork: data.artwork };
              updated = true;
            }
          } catch (e) { console.log("Fetch error:", e); }
        }
      }
      if (updated) setBookDetails(details);
    };
    if (allNotes.length > 0) fetchAllBookDetails();
  }, [allNotes]);

  useEffect(() => {
    if (state === 'PLAYING') {
      setLocalLoadingId(null);
      setIsSlowNetwork(false);
      if (slowNetTimeoutRef.current) clearTimeout(slowNetTimeoutRef.current);


    }

    if (state === 'ERROR') {
      setLocalLoadingId(null);
      setIsSlowNetwork(false);
      alert("Error loading audio. Please check your internet connection.");
    }
  }, [state]);

  useEffect(() => {
    if (activeClipId) setPlayingClipId(activeClipId);
  }, [activeClipId]);


 

  const handlePlayClip = async (clip) => {
    if (state === 'LOADING' || state === 'BUFFERING') return;

    try {
      const startTime = clip.ref.from * 1000;
      const endTime = clip.ref.to * 1000;
      const trackIdentifier = clip.actualPartId;

      // // ১. একই ক্লিপ হলে প্লে/পজ
      // if (playingClipId === clip.id && clipLoadedTrackId === trackIdentifier) {
      //   isPlaying ? await AudioPro.pause() : await AudioPro.resume();
      //   return;
      // }

      // ১. একই ক্লিপ হলে প্লে/পজ
    if (playingClipId === clip.id && clipLoadedTrackId === trackIdentifier) {
      if (isPlaying) {
        await AudioPro.pause();
        if (timerRef.current) clearInterval(timerRef.current); // পজ করলে টাইমার বন্ধ
      } else {
        await AudioPro.resume();
        startClipTimer(startTime, endTime); // রেজ্যুম করলে টাইমার আবার চালু করতে হবে
      }
      return;
    }

      setLocalLoadingId(clip.id);

      // ২. Firestore থেকে ডাটা আনা (URL এর জন্য)
      const docSnap = await getDoc(doc(db, 'books', clip.bookId));
      if (!docSnap.exists()) return;

      const dbData = docSnap.data();
      let finalUrl = "";

      // ৩. আপনার লজিক: যদি MultiPart না হয় তবে ডিরেক্ট URL, নাহলে ইনডেক্স ধরে URL
      if (!clip.ref?.isMultiPart) {
        finalUrl = dbData.url;
      } else {
        // আইডি (যেমন: track-002-1) থেকে লাস্টের নাম্বার বের করা
        const partNum = parseInt(clip.actualPartId.split('-').pop());

        // alert(`Looking for part number: ${partNum} in bookId: ${clip.bookId}`);
        // index - 1 করে URL নেওয়া
        finalUrl = dbData.parts[partNum - 1]?.url;


      }

      if (!finalUrl) {
        alert("Audio not found!");
        setLocalLoadingId(null);
        return;
      }

      // ৪. প্লেয়ারে ডাটা সেট করা
      const audioObject = {
        id: clip.bookId,
        title: clip.meta?.bookTitle || "Audio Clip",
        artwork: clip.meta?.artwork || bookDetails[clip.bookId]?.artwork,
        url: finalUrl
      };

      



      await preloadClip(audioObject, startTime, clip.id, trackIdentifier);

      setPlayingClipId(clip.id);
      // startClipTimer(endTime);
      startClipTimer(startTime, endTime);
    } catch (error) {
      console.error("Error:", error);
      setLocalLoadingId(null);
    }
  };


 

  const startClipTimer = (startTime, endTime) => {
  if (timerRef.current) clearInterval(timerRef.current);
  
  timerRef.current = setInterval(async () => {
    const status = await AudioPro.getTimings();
    
    // যদি বর্তমান পজিশন ক্লিপের শেষ সময় পার করে যায়
    if (status.position >= endTime) {
      clearInterval(timerRef.current); // টাইমার বন্ধ করুন
      
      await AudioPro.pause(); // অডিও পজ করুন
      
      // ক্লিপের শুরুতে (startTime) ফিরে যান
      // ১০০০ বা ৫০০ মিলি-সেকেন্ড দেরি করলে পাউস হওয়ার পর সিক টু হওয়াটা স্মুথ হয়
      setTimeout(async () => {
        await AudioPro.seekTo(startTime); 
      }, 200);
    }
  }, 500);
};

  // return (
  //   <TouchableWithoutFeedback onPress={() => setPlayingClipId(null)}>
  //     <View style={{ flex: 1, backgroundColor: '#0f0f12' }}>

  //       {/* 🔍 Fixed Search Bar */}
  //       <View style={styles.searchWrapper}>
  //         <View style={styles.searchContainer}>
  //           <Feather name="search" size={18} color="#888" style={{ marginRight: 10 }} />
  //           <TextInput
  //             placeholder="Search notes, clips or books..."
  //             placeholderTextColor="#666"
  //             style={styles.searchInput}
  //             value={searchQuery}
  //             onChangeText={setSearchQuery}
  //           />
  //           {searchQuery.length > 0 && (
  //             <TouchableOpacity onPress={() => setSearchQuery('')}>
  //               <Ionicons name="close-circle" size={18} color="#888" />
  //             </TouchableOpacity>
  //           )}
  //         </View>
  //       </View>

  //       <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}>
  //         {filteredNotes.length === 0 ? (
  //           <Text style={styles.noResultText}>No notes found</Text>
  //         ) : (
  //           filteredNotes.map((n) => {
  //             const info = bookDetails[n.bookId] || {};
  //             const isQuote = n.type === 'quote';



  //             const displayTitle = n.meta?.bookTitle || info.title || '...';
  //             const partSuffix = n.meta?.partNumber ? ` - Part ${n.meta.partNumber}` : '';
  //             // -------------------------
  //             const isThisClipLoading = localLoadingId === n.id;
  //             // const isExpandedVisible = playingClipId === n.id && clipLoadedTrackId === n.bookId;
  //             // filteredNotes.map এর ভেতরে এই লাইনটি পরিবর্তন করুন:
  //             // const isExpandedVisible = playingClipId === n.id && clipLoadedTrackId === (n.actualPartId || n.bookId);
  //             // এই অংশটি পরিবর্তন করুন
  //             // Render এর ভেতরে map ফাংশনের ভেতর এটি নিশ্চিত করুন:
  //             // filteredNotes.map এর ঠিক নিচেই এটি আপডেট করুন
  //             const isExpandedVisible = playingClipId === n.id && clipLoadedTrackId === n.actualPartId;

  //             const totalAudioMs = duration || 1;
  //             const clipFromMs = (n.ref?.from || 0) * 1000;
  //             const clipToMs = (n.ref?.to || 0) * 1000;
  //             const highlightLeft = (clipFromMs / totalAudioMs) * 100;
  //             const highlightWidth = ((clipToMs - clipFromMs) / totalAudioMs) * 100;
  //             const currentPosPercent = (position / totalAudioMs) * 100;

  //             return (
  //               <View key={n.id}
  //                 onLayout={(e) => { layoutMap.current[n.id] = e.nativeEvent.layout.y; }}
  //                 style={[styles.card, isQuote ? styles.quoteCard : styles.clipCard]}>
  //                 <View style={styles.cardHeaderArea}>
  //                   <View style={styles.headerRow}>
  //                     <Image source={info.artwork ? { uri: info.artwork } : null} style={styles.artworkSmall} />
  //                     <View style={{ flex: 1 }}>
  //                       <Text numberOfLines={1} style={isQuote ? styles.sourceTitle : styles.clipTitle}>
  //                         {displayTitle}{partSuffix}
  //                       </Text>
  //                       <Text style={styles.writerText}>{info.writer || '...'}</Text>
  //                       {/* 👇 থ্রি-ডট বাটন */}
  //                       <TouchableOpacity
  //                         style={styles.moreButton}
  //                         onPress={() => handleRemovePress(n)}
  //                       >
  //                         <Feather name="more-vertical" size={20} color="#888" />
  //                       </TouchableOpacity>
  //                       {!isQuote && <Text style={styles.timeText}>{formatTime(n.ref.from)} - {formatTime(n.ref.to)}</Text>}
  //                     </View>
  //                   </View>
  //                 </View>

  //                 <Text style={isQuote ? styles.quoteText : styles.mainContent}>
  //                   {isQuote ? `“${n.quoteText || n.content || n.ref?.text}”` : (n.quoteText || n.content || n.ref?.text)}
  //                 </Text>

  //                 {!isQuote && (
  //                   <View style={styles.playerWrapper}>
  //                     {isExpandedVisible ? (
  //                       <View style={styles.expandedPlayer}>
  //                         {/* {(isThisClipLoading || state === 'LOADING') && (
  //                           <View style={styles.loadingStatus}>
  //                             <ActivityIndicator size="small" color="#d6b36a" />
  //                             <Text style={styles.statusText}>{isSlowNetwork ? "Loading..." : "Syncing clip..."}</Text>
  //                           </View>
  //                         )} */}

  //                         <View style={styles.statusArea}>
  //                           {/* যদি এই স্পেসিফিক ক্লিপটি লোড হচ্ছে থাকে বা বাফার করে */}
  //                           {(isThisClipLoading || (playingClipId === n.id && (state === 'LOADING' || state === 'BUFFERING'))) ? (
  //                             <View style={styles.rowCenter}>
  //                               <ActivityIndicator size="small" color="#d6b36a" />
  //                               {isSlowNetwork ? (
  //                                 // ১০ সেকেন্ড পার হলে এটি দেখাবে
  //                                 <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => handlePlayClip(n)}>
  //                                   <Text style={[styles.statusText, { color: '#ff6b6b' }]}>Slow Network...  </Text>
  //                                   <Text style={{ color: '#fff', fontSize: 12, textDecorationLine: 'underline', marginLeft: 5 }}>Retry</Text>
  //                                 </TouchableOpacity>
  //                               ) : (
  //                                 // প্রথম ১০ সেকেন্ড শুধু এটি দেখাবে
  //                                 <Text style={styles.statusText}>Syncing clip...</Text>
  //                               )}
  //                             </View>
  //                           ) : (
  //                             // লোডিং শেষ হলে টাইম দেখাবে
  //                             <Text style={styles.playbackTimeText}>
  //                               {formatTime(position / 1000)} / {formatTime(duration / 1000)}
  //                             </Text>
  //                           )}
  //                         </View>
  //                         <View style={styles.progressBarWrapper}>
  //                           <View style={styles.baseLine} />
  //                           <View style={[styles.highlightActive, { left: `${highlightLeft}%`, width: `${highlightWidth}%` }]} />
  //                           <View style={[styles.playbackMarker, { left: `${currentPosPercent}%` }]} />
  //                         </View>
  //                         <View style={styles.controlsRow}>
  //                           <TouchableOpacity onPress={() => AudioPro.seekTo(position - 5000)}><Ionicons name="play-back" size={28} color="#fff" /></TouchableOpacity>
  //                           <TouchableOpacity onPress={() => handlePlayClip(n)} style={styles.mainPlayCircle}>
  //                             {(state === 'BUFFERING' || isThisClipLoading) ? <ActivityIndicator size="small" color="#000" /> : <Ionicons name={isPlaying ? "pause" : "play"} size={26} color="#000" />}
  //                           </TouchableOpacity>
  //                           <TouchableOpacity onPress={() => AudioPro.seekTo(position + 5000)}><Ionicons name="play-forward" size={28} color="#fff" /></TouchableOpacity>
  //                         </View>
  //                       </View>
  //                     ) : (
  //                       <TouchableOpacity style={styles.simplePlayBtn} onPress={() => handlePlayClip(n)} disabled={localLoadingId !== null && !isThisClipLoading}>
  //                         {isThisClipLoading ? (
  //                           <ActivityIndicator size="small" color="#d6b36a" />
  //                         ) : (
  //                           <Ionicons name="play-circle" size={48} color="#d6b36a" />
  //                         )}
  //                       </TouchableOpacity>
  //                     )}
  //                   </View>
  //                 )}

  //                 <TouchableOpacity onPress={() => handleNavigateToSource(n)} style={styles.jumpIndicator}>
  //                   <Feather name="arrow-up-right" size={14} color={isQuote ? "#d6b36a" : "#b7c7ff"} />
  //                   <Text style={[styles.jumpText, { color: isQuote ? "#d6b36a" : "#b7c7ff" }]}>Jump back to source</Text>
  //                 </TouchableOpacity>
  //               </View>
  //             );
  //           })
  //         )}
  //       </ScrollView>
  //     </View>
  //   </TouchableWithoutFeedback>
  // );
return (
  <TouchableWithoutFeedback onPress={() => setPlayingClipId(null)}>
    <View style={{ flex: 1, backgroundColor: '#0b0b0e' }}>

      {/* 🔍 Search Bar - Floating Style */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#666" />
          <TextInput
            placeholder="Search notes, clips or books..."
            placeholderTextColor="#444"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        ref={scrollRef} 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 150, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="book-open" size={40} color="#222" />
            <Text style={styles.noResultText}>No notes found</Text>
          </View>
        ) : (
          filteredNotes.map((n) => {
            const info = bookDetails[n.bookId] || {};
            const isQuote = n.type === 'quote';
            const displayTitle = n.meta?.bookTitle || info.title || 'Untitled';
            const isThisClipLoading = localLoadingId === n.id;
            const isExpandedVisible = playingClipId === n.id && clipLoadedTrackId === n.actualPartId;

            // Progress Logic
            const totalAudioMs = duration || 1;
            const clipFromMs = (n.ref?.from || 0) * 1000;
            const clipToMs = (n.ref?.to || 0) * 1000;
            const highlightLeft = (clipFromMs / totalAudioMs) * 100;
            const highlightWidth = ((clipToMs - clipFromMs) / totalAudioMs) * 100;
            const currentPosPercent = (position / totalAudioMs) * 100;

            return (
              <View 
                key={n.id}
                onLayout={(e) => { layoutMap.current[n.id] = e.nativeEvent.layout.y; }}
                style={[styles.card, isQuote ? styles.quoteCard : styles.clipCard]}
              >
                {/* --- কার্ড হেডার --- */}
                <View style={styles.cardHeaderArea}>
                  <Image 
                    source={info.artwork ? { uri: info.artwork } : null} 
                    style={styles.artworkSmall} 
                  />
                  <View style={styles.headerTextContainer}>
                    <Text numberOfLines={1} style={isQuote ? styles.sourceTitle : styles.clipTitle}>
                      {displayTitle}
                    </Text>
                    <Text numberOfLines={1} style={styles.writerText}>{info.writer || 'Unknown Author'}</Text>
                    {!isQuote && (
                       <View style={styles.badgeRow}>
                          <View style={styles.timeBadge}>
                            <Text style={styles.timeBadgeText}>{formatTime(n.ref.from)} - {formatTime(n.ref.to)}</Text>
                          </View>
                       </View>
                    )}
                  </View>
                  
                  {/* --- ৩-ডট বাটন --- */}
                  <TouchableOpacity 
                    style={styles.moreButton} 
                    onPress={() => handleRemovePress(n)}
                    activeOpacity={0.6}
                  >
                    <Feather name="more-vertical" size={22} color="#888" />
                  </TouchableOpacity>
                </View>

                {/* --- মূল টেক্সট কন্টেন্ট --- */}
                <View style={styles.textContainer}>
                  <Text style={isQuote ? styles.quoteText : styles.mainContent}>
                    {isQuote ? `“${n.quoteText || n.content || n.ref?.text}”` : (n.quoteText || n.content || n.ref?.text)}
                  </Text>
                </View>

                {/* --- অডিও প্লেয়ার (শুধু ক্লিপের জন্য) --- */}
                {!isQuote && (
                  <View style={styles.audioActionArea}>
                    {isExpandedVisible ? (
                      <View style={styles.playerBox}>
                        <View style={styles.progressBarWrapper}>
                          <View style={styles.baseLine} />
                          <View style={[styles.highlightActive, { left: `${highlightLeft}%`, width: `${highlightWidth}%` }]} />
                          <View style={[styles.playbackMarker, { left: `${currentPosPercent}%` }]} />
                        </View>
                        
                        <View style={styles.playerFooter}>
                          <Text style={styles.timestamp}>{formatTime(position / 1000)}</Text>
                          <View style={styles.playerControls}>
                            <TouchableOpacity onPress={() => AudioPro.seekTo(position - 5000)}>
                              <Ionicons name="play-back" size={22} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handlePlayClip(n)} style={styles.playFab}>
                              { (isThisClipLoading || state === 'BUFFERING') ? 
                                <ActivityIndicator size="small" color="#000" /> : 
                                <Ionicons name={isPlaying ? "pause" : "play"} size={22} color="#000" />
                              }
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => AudioPro.seekTo(position + 5000)}>
                              <Ionicons name="play-forward" size={22} color="#fff" />
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.timestamp}>{formatTime(n.ref.to)}</Text>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={styles.minimalPlayBtn} 
                        onPress={() => handlePlayClip(n)}
                        disabled={localLoadingId !== null && !isThisClipLoading}
                      >
                        {isThisClipLoading ? (
                          <ActivityIndicator size="small" color="#d6b36a" />
                        ) : (
                          <>
                            <Ionicons name="play-circle" size={32} color="#d6b36a" />
                            <Text style={styles.playBtnLabel}>Play Audio Clip</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* --- জাম্প ব্যাক বাটন --- */}
                <TouchableOpacity 
                  onPress={() => handleNavigateToSource(n)} 
                  style={[styles.jumpBtn, { backgroundColor: isQuote ? 'rgba(214, 179, 106, 0.08)' : 'rgba(183, 199, 255, 0.08)' }]}
                >
                  <Text style={[styles.jumpBtnText, { color: isQuote ? "#d6b36a" : "#b7c7ff" }]}>
                    Jump back to source
                  </Text>
                  <Feather name="arrow-right" size={14} color={isQuote ? "#d6b36a" : "#b7c7ff"} />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  </TouchableWithoutFeedback>
);

}


const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#0b0b0e',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161a',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 1,
    borderColor: '#222',
  },
  searchInput: {
    flex: 1,
    color: '#eee',
    fontSize: 14,
    marginLeft: 10,
  },

  // --- কার্ড ডিজাইন ---
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#16161e',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)'
  },
  quoteCard: { borderLeftWidth: 4, borderLeftColor: '#d6b36a' },
  clipCard: { borderLeftWidth: 4, borderLeftColor: '#4a69bd' },

  cardHeaderArea: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  artworkSmall: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  sourceTitle: { color: '#d6b36a', fontSize: 14, fontWeight: '700' },
  clipTitle: { color: '#b7c7ff', fontSize: 14, fontWeight: '700' },
  writerText: { color: '#777', fontSize: 11, marginTop: 1 },
  
  badgeRow: { flexDirection: 'row', marginTop: 4 },
  timeBadge: {
    backgroundColor: 'rgba(214, 179, 106, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeBadgeText: { color: '#d6b36a', fontSize: 9, fontWeight: 'bold' },

  moreButton: {
    padding: 5,
    marginLeft: 5,
  },

  // --- কন্টেন্ট এরিয়া ---
  textContainer: { marginVertical: 8 },
  quoteText: {
    color: '#e0e0e0',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  mainContent: {
    color: '#bbb',
    fontSize: 14,
    lineHeight: 20,
  },

  // --- অডিও প্লেয়ার ---
  audioActionArea: { marginTop: 10 },
  minimalPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignSelf: 'flex-start',
    padding: 5,
    paddingRight: 15,
    borderRadius: 25,
  },
  playBtnLabel: { color: '#d6b36a', fontSize: 12, fontWeight: '600', marginLeft: 8 },

  playerBox: {
    backgroundColor: '#1f1f27',
    borderRadius: 12,
    padding: 12,
    marginTop: 5,
  },
  progressBarWrapper: { 
    height: 15, 
    justifyContent: 'center', 
    marginVertical: 5 
  },
  baseLine: { width: '100%', height: 2, backgroundColor: '#333', borderRadius: 1 },
  highlightActive: {
    height: 2,
    backgroundColor: '#d6b36a',
    position: 'absolute',
  },
  playbackMarker: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: '#fff',
  },
  playerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  playFab: {
    backgroundColor: '#d6b36a',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timestamp: { color: '#555', fontSize: 10, fontFamily: 'monospace' },

  // --- জাম্প বাটন ---
  jumpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  jumpBtnText: { fontSize: 11, fontWeight: '700' },

  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100 },
  noResultText: { color: '#333', marginTop: 10, fontSize: 14 },
});

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16 },
//   searchWrapper: {
//     paddingHorizontal: 16,
//     paddingTop: 10,
//     paddingBottom: 5,
//     backgroundColor: '#0f0f12',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#1a1a1e',
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     height: 45,
//     borderWidth: 1,
//     borderColor: '#d6b36a33',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   searchInput: {
//     flex: 1,
//     color: '#f9eccc',
//     fontSize: 14,
//   },

//   // --- প্রিমিয়াম কার্ড স্ট্রাকচার ---
//   card: {
//     borderRadius: 16,
//     padding: 18,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#d6b36a22',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   quoteCard: {
//     backgroundColor: '#1a1a1e',
//     borderLeftWidth: 3,
//     borderLeftColor: '#d6b36a',
//   },
//   clipCard: {
//     backgroundColor: '#1c1c24',
//   },

//   cardHeaderArea: { flexDirection: 'row', marginBottom: 12 },
//   headerRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
//   artworkSmall: {
//     width: 44,
//     height: 44,
//     borderRadius: 6,
//     marginRight: 12,
//     backgroundColor: '#333',
//     borderWidth: 0.5,
//     borderColor: '#ffffff11'
//   },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start', // আইকন যেন টাইটেলের সাথে এলাইন থাকে
//     flex: 1
//   },
//   moreButton: {
//     padding: 8,
//     marginLeft: 5,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   // --- আগের পজিশন ও সাইজ অনুযায়ী টেক্সট ---
//   sourceTitle: { color: '#d6b36a', fontSize: 14, fontWeight: 'bold' },
//   clipTitle: { color: '#b7c7ff', fontSize: 14, fontWeight: 'bold' },
//   writerText: { color: '#888', fontSize: 11, marginTop: 2 },
//   timeText: {
//     color: '#d6b36a99',
//     fontSize: 10,
//     marginTop: 2,
//     fontWeight: '600'
//   },

//   // --- কন্টেন্ট এরিয়া ---
//   quoteText: {
//     color: '#f9eccc',
//     fontSize: 15,
//     fontStyle: 'italic',
//     lineHeight: 22,
//     marginTop: 4
//   },
//   mainContent: {
//     color: '#ddd',
//     fontSize: 14,
//     lineHeight: 22,
//     marginTop: 8
//   },

//   // --- প্লেয়ার এরিয়া (Golden Glow) ---
//   playerWrapper: { marginTop: 15, minHeight: 50 },
//   expandedPlayer: {
//     backgroundColor: '#2a2a35',
//     borderRadius: 12,
//     padding: 15,
//     borderWidth: 1,
//     borderColor: '#d6b36a11'
//   },
//   statusArea: {
//     height: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8
//   },
//   statusText: { color: '#d6b36a', fontSize: 12, marginLeft: 8, fontWeight: '600' },
//   playbackTimeText: {
//     color: '#888',
//     fontSize: 12,
//     fontWeight: '600',
//     fontFamily: 'monospace'
//   },

//   progressBarWrapper: { width: '100%', height: 20, justifyContent: 'center', marginBottom: 15 },
//   baseLine: { width: '100%', height: 1, backgroundColor: '#555', position: 'absolute' },
//   highlightActive: {
//     height: 3,
//     backgroundColor: '#d6b36a',
//     position: 'absolute',
//     borderRadius: 2,
//     shadowColor: '#d6b36a',
//     shadowOpacity: 0.5,
//     shadowRadius: 3,
//   },
//   playbackMarker: {
//     position: 'absolute',
//     width: 2,
//     height: 12,
//     backgroundColor: '#fff',
//     zIndex: 10
//   },

//   controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
//   mainPlayCircle: {
//     backgroundColor: '#d6b36a',
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 4,
//   },

//   simplePlayBtn: {
//     alignSelf: 'flex-start'
//   },

//   jumpIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 15
//   },
//   jumpText: { fontSize: 12, fontWeight: '600', marginLeft: 6 },
//   noResultText: { color: '#666', textAlign: 'center', marginTop: 50, fontSize: 14 },
// });