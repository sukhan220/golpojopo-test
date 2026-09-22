
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { TapGestureHandler } from 'react-native-gesture-handler';
import Markdown from 'react-native-markdown-display';


// ============================
// 1 FONT SELECTOR COMPONENT
// ============================
const FontSelector = ({ selectedFont, onSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const fonts = ['serif', 'sans-serif', 'monospace'];

  return (
    <View>
      <TouchableOpacity
        style={styles.selectorCompact}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: '#3b2f1b', fontSize: 12 }}>{selectedFont} ⌄</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {fonts.map((font) => (
              <TouchableOpacity
                key={font}
                style={styles.option}
                onPress={() => {
                  onSelect(font);
                  setModalVisible(false);
                }}
              >
                <Text
                  style={{
                    fontFamily: font,
                    color: font === selectedFont ? '#6b4f2d' : '#3b2f1b',
                    fontWeight: font === selectedFont ? 'bold' : 'normal',
                  }}
                >
                  {font}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ============================
// 2 MAIN VIEWER COMPONENT
// ============================

export default function PaginatedMarkdownViewer() {
  // Navigation + route data
  const route = { params: useLocalSearchParams() };
  const { book } = route.params;
  const parsedBook = JSON.parse(book);
  const navigation = useNavigation();

  // Refs for scroll tracking
  const scrollRef = useRef(null);
  const pageOffsets = useRef({});
  const scrollPositionRef = useRef(0);
  const isUserScrollingRef = useRef(false);

  // States
  /*

  pages → split করা page গুলো।

  chapters → detect করা অধ্যায় লিস্ট (marker: ---chapter: Title---)।

  currentPage → বর্তমানে কোন পেজ।

  fontSize / fontFamily → পড়ার জন্য font control।

  autoScroll → true হলে প্রতি ৫০ms এ scroll হবে।

  fullscreen → ডাবল-ট্যাপ করলে header/menu/control লুকায়।

  goInputVisible → modal open for jump to page।

  chaptersVisible → sidebar modal visible।
  */


  const [pages, setPages] = useState([]);
  const [chapters, setChapters] = useState([]); // { title, pageIndex }
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('serif');
  const [autoScroll, setAutoScroll] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [goInputVisible, setGoInputVisible] = useState(false);
  const [inputPage, setInputPage] = useState('');
  const [chaptersVisible, setChaptersVisible] = useState(false);

  // ============================
  // 3  Load Markdown File
  // ============================
  useEffect(() => {
    async function loadMarkdown() {
      try {
        const res = await fetch(parsedBook.fileUrl);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const text = await res.text();

        // split pages first
        const rawPages = text.split('---page---').map(p => p.trim());

        // detect chapter markers inside pages: ---chapter: Title---
        const detectedChapters = [];
        const cleanedPages = rawPages.map((p, idx) => {
          const chapterRegex = /---chapter:\s*([^-]+?)---/i;
          const match = p.match(chapterRegex);
          if (match) {
            const title = match[1].trim();
            detectedChapters.push({ title: title || `Chapter ${detectedChapters.length + 1}`, pageIndex: idx });
            // remove the chapter marker from the page content
            const newPage = p.replace(chapterRegex, '').trim();
            return newPage.length ? newPage : '\n';
          }
          return p;
        });

        // If no chapters detected, create a default chapter
        if (detectedChapters.length === 0) {
          detectedChapters.push({ title: parsedBook.title || 'Start', pageIndex: 0 });
        }

        setPages(cleanedPages);
        setChapters(detectedChapters);
      } catch (err) {
        console.error("Markdown fetch error:", err);
        setPages(["**404 Not Found**"]);
        setChapters([{ title: 'Error', pageIndex: 0 }]);
      } finally {
        setLoading(false);
      }
    }
    loadMarkdown();
  }, [parsedBook.fileUrl, parsedBook.title]);


  // ============================
  // 4 Auto Scroll
  // ============================

  useEffect(() => {
    let interval;
    if (autoScroll && scrollRef.current) {
      interval = setInterval(() => {
        if (!isUserScrollingRef.current) {
          scrollPositionRef.current += 2;
          scrollRef.current.scrollTo({
            y: scrollPositionRef.current,
            animated: false,
          });
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [autoScroll]);

  // ============================
  // 5 Scroll to current page when it changes
  // ============================ 
  useEffect(() => {
    if (scrollRef.current && pageOffsets.current[currentPage] !== undefined) {
      scrollRef.current.scrollTo({
        y: pageOffsets.current[currentPage],
        animated: true,
      });
    }
  }, [currentPage]);


  // Always hide header (fullscreen managed by state)
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      tabBarStyle: fullscreen ? { display: 'none' } : undefined,
    });
  }, [fullscreen, navigation]);


  // ============================
  // 6 Helper functions
  // ============================

  const handleDoubleTap = () => setFullscreen((prev) => !prev);
  const handleGoBack = () => navigation.goBack();

  // Find closest page when scrolling
  const findClosestPage = (scrollY) => {
    let closest = 0;
    let minDist = Infinity;
    Object.entries(pageOffsets.current).forEach(([index, offset]) => {
      const dist = Math.abs(scrollY - offset);
      if (dist < minDist) {
        minDist = dist;
        closest = parseInt(index, 10);
      }
    });
    return closest;
  };

  // When user scrolls (throttle handled by scrollEventThrottle)
  const handleOnScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    scrollPositionRef.current = y;
    if (isUserScrollingRef.current) {
      setCurrentPage(findClosestPage(y));
    }
  };

  // ============================
  // 7 Loading Indicator
  // ============================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6b4f2d" />
        <Text style={{ color: '#6b4f2d', marginTop: 10 }}>লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      {!fullscreen && (
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3b2f1b" />
        </TouchableOpacity>
      )}

      {/* Chapters / Menu button */}
      <TouchableOpacity
        onPress={() => setChaptersVisible(true)}
        style={[styles.menuButton, fullscreen ? styles.menuButtonFullscreen : null]}
      >
        <Ionicons name="menu" size={22} color="#3b2f1b" />
      </TouchableOpacity>

      {/* Controls */}
      {!fullscreen && (
        <View style={styles.compactSettings}>
          <View style={styles.inlineControls}>
            <TouchableOpacity onPress={() => setFontSize(Math.max(12, fontSize - 2))}>
              <Text style={styles.controlBtn}>A-</Text>
            </TouchableOpacity>
            <Text style={styles.controlBtn}>{fontSize}</Text>
            <TouchableOpacity onPress={() => setFontSize(fontSize + 2)}>
              <Text style={styles.controlBtn}>A+</Text>
            </TouchableOpacity>
          </View>
          <FontSelector selectedFont={fontFamily} onSelect={setFontFamily} />
          <View style={styles.inlineControls}>
            <TouchableOpacity onPress={() => setGoInputVisible(true)}>
              <Text style={styles.controlBtn}>Go</Text>
            </TouchableOpacity>
            <Switch
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              value={autoScroll}
              onValueChange={setAutoScroll}
            />
          </View>
        </View>
      )}

      {/* Pages */}
      <TapGestureHandler numberOfTaps={2} onActivated={handleDoubleTap}>
        <ScrollView
          ref={scrollRef}
          style={[styles.pageContent, fullscreen && styles.fullscreen]}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          scrollEnabled={!autoScroll} // ✅ Auto scroll হলে manual scroll বন্ধ
          onScrollBeginDrag={() => { isUserScrollingRef.current = true; }}
          onScrollEndDrag={() => { isUserScrollingRef.current = false; }}
          onScroll={handleOnScroll}
        >
          {pages.map((page, index) => (
            <View
              key={index}
              onLayout={(event) => {
                const { y } = event.nativeEvent.layout;
                pageOffsets.current[index] = y;
              }}
              style={{ marginBottom: 30 }}
            >
              <Markdown
                style={{
                  body: {
                    fontSize,
                    lineHeight: fontSize + 8,
                    fontFamily,
                    color: '#3b2f1b',
                    textAlign: 'justify',
                  },
                }}
              >
                {page}
              </Markdown>

            </View>
          ))}
        </ScrollView>
      </TapGestureHandler>

      {/* Page indicator - always render but style changes in fullscreen */}
      <TouchableOpacity
        onPress={() => setGoInputVisible((prev) => !prev)}
        activeOpacity={0.7}
        style={[
          styles.pageIndicator,
          fullscreen ? styles.pageIndicatorFullscreen : null
        ]}
      >
        <Text style={[styles.pageIndicatorText, fullscreen ? styles.pageIndicatorTextFullscreen : null]}>
          {currentPage + 1} / {pages.length}
        </Text>
      </TouchableOpacity>

      

      {/* Navigation buttons */}
      {!fullscreen ? (
        <View style={styles.navigation}>
          <TouchableOpacity
            disabled={currentPage === 0}
            onPress={() => setCurrentPage((p) => Math.max(0, p - 1))}
            style={[styles.navBtn, currentPage === 0 && styles.disabledBtn]}
          >
            <Text style={styles.navBtnText}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={currentPage === pages.length - 1}
            onPress={() => setCurrentPage((p) => Math.min(p + 1, pages.length - 1))}
            style={[styles.navBtn, currentPage === pages.length - 1 && styles.disabledBtn]}
          >
            <Text style={styles.navBtnText}>→</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Fullscreen floating prev/next (no background box, placed left/right center)
        <>
          <TouchableOpacity
            disabled={currentPage === 0}
            onPress={() => setCurrentPage((p) => Math.max(0, p - 1))}
            style={[styles.fullscreenNavLeft, currentPage === 0 && styles.disabledBtn]}
          >
            <Text style={styles.navBtnText}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={currentPage === pages.length - 1}
            onPress={() => setCurrentPage((p) => Math.min(p + 1, pages.length - 1))}
            style={[styles.fullscreenNavRight, currentPage === pages.length - 1 && styles.disabledBtn]}
          >
            <Text style={styles.navBtnText}>→</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Go to page modal */}
      <Modal
        visible={goInputVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGoInputVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ marginBottom: 10, color: "black" }}>Go to page number:</Text>
            <TextInput
              placeholder="Page Number"
              keyboardType="numeric"
              style={styles.goInput}
              value={inputPage}
              onChangeText={setInputPage}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => {
                  const num = parseInt(inputPage, 10);
                  if (!isNaN(num) && num >= 1 && num <= pages.length) {
                    setCurrentPage(num - 1);
                    if (scrollRef.current && pageOffsets.current[num - 1] !== undefined) {
                      scrollRef.current.scrollTo({
                        y: pageOffsets.current[num - 1],
                        animated: true,
                      });
                    }
                    setGoInputVisible(false);
                    setInputPage('');
                  } else {
                    alert(`Please enter a page number between 1 and ${pages.length}.`);
                  }
                }}
              >
                <Text style={styles.controlBtn}>Go</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setGoInputVisible(false)}>
                <Text style={[styles.controlBtn, { color: 'gray' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Chapters Sidebar Modal */}
      <Modal
        visible={chaptersVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setChaptersVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setChaptersVisible(false)}>
          <View style={styles.chapterSidebar}>
            <Text style={styles.chapterHeader}>Chapters</Text>
            <ScrollView>
              {chapters.map((ch, idx) => (
                <TouchableOpacity
                  key={`${ch.title}-${idx}`}
                  style={styles.chapterItem}
                  onPress={() => {
                    setChaptersVisible(false);
                    const p = ch.pageIndex;
                    setCurrentPage(p);
                    // scroll after tiny timeout to ensure modal close animation not interfering
                    setTimeout(() => {
                      if (scrollRef.current && pageOffsets.current[p] !== undefined) {
                        scrollRef.current.scrollTo({ y: pageOffsets.current[p], animated: true });
                      }
                    }, 120);
                  }}
                >
                  <Text style={styles.chapterTitle}>{ch.title}</Text>
                  <Text style={styles.chapterPage}>Page {ch.pageIndex + 1}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

 ${scrollMode
      ? pages.map((p, i) => `
          <div class="page ${i === 0 ? 'cover-page' : ''}" data-page="${i}">
            ${p
          .split(/\n/) // নিউলাইন দিয়ে ভাগ করুন
          .filter(para => para.trim().length > 0) // খালি লাইন বাদ দিন
          .map(para => `<p>${para.trim()}</p>`)
          .join('')
        }
          </div>
        `).join('')
      : (pages[currentPage] || '')
        .split(/\n/)
        .filter(para => para.trim().length > 0)
        .map(para => `<p>${para.trim()}</p>`)
        .join('')
    }








       {/* PLAYLIST MODAL */}
            <Modal visible={playlistModal} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                  <Text style={styles.modalTitle}>New Playlist</Text>
      
                  <TextInput
                    placeholder="Playlist name"
                    value={newPlaylistTitle}
                    onChangeText={setNewPlaylistTitle}
                    style={styles.input}
                  />
      
                  <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={async () => {
                      await createPlaylist(newPlaylistTitle);
                      setNewPlaylistTitle('');
                      setPlaylistModal(false);
                    }}
                  >
                    <Text style={styles.modalBtnText}>Create</Text>
                  </TouchableOpacity>
      
                  <TouchableOpacity onPress={() => setPlaylistModal(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
      
            {/* NOTE MODAL */}
            {/* NOTE MODAL */}
            <Modal visible={noteModal} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                  <Text style={styles.modalTitle}>Add Note</Text>
      
                  <TextInput
                    placeholder="Write note..."
                    multiline
                    value={noteText}
                    onChangeText={setNoteText}
                    style={[styles.input, { height: 100 }]}
                  />
      
                  <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={async () => {
                      await addNote(parsedBook.id, noteText, position);
                      setNoteText('');
                      setNoteModal(false);
                    }}
                  >
                    <Text style={styles.modalBtnText}>Save</Text>
                  </TouchableOpacity>
      
                  <TouchableOpacity onPress={() => setNoteModal(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f5dc',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 10
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 5 : 5,
    left: 10,
    zIndex: 20,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  menuButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 8,
    right: 10,
    zIndex: 20,
    padding: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  menuButtonFullscreen: {
    backgroundColor: 'rgba(0,0,0,0.0)',
  },
  compactSettings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#ede6d1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d6c9a8',
    marginLeft: 40,
  },
  inlineControls: { flexDirection: 'row', alignItems: 'center' },
  controlBtn: { fontSize: 12, marginHorizontal: 6, color: '#4b4b3f', fontWeight: 'bold' },
  pageContent: { flex: 1 },
  fullscreen: { padding: 15, backgroundColor: '#f5f5dc' },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#d6c9a8',
    backgroundColor: '#ede6d1',
    borderRadius: 8,
  },
  navBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6b4f2d',
    backgroundColor: 'transparent',
  },
  navBtnText: { color: '#6b4f2d', fontWeight: 'bold', fontSize: 12 },
  disabledBtn: { backgroundColor: '#ccc', opacity: 0.4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  selectorCompact: {
    borderWidth: 1,
    borderColor: '#d6c9a8',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: '#fefcf6',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#f5f5dc', padding: 20, borderRadius: 10, width: 200 },
  option: { paddingVertical: 10, borderBottomWidth: 0.5, borderColor: '#d6c9a8' },
  goInput: {
    borderWidth: 1,
    borderColor: '#d6c9a8',
    padding: 6,
    borderRadius: 6,
    width: 100,
    textAlign: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
    color: 'black',
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d6c9a8',
    zIndex: 15,
  },
  pageIndicatorText: { fontSize: 13, color: '#6b4f2d', fontWeight: 'bold' },

  // Fullscreen variants
  pageIndicatorFullscreen: {
    bottom: 24,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pageIndicatorTextFullscreen: {
    color: '#fff',
    fontSize: 12,
  },

  // Fullscreen floating nav buttons (left/right vertically centered)
  fullscreenNavLeft: {
    position: 'absolute',
    left: 8,
    top: '50%',
    transform: [{ translateY: -20 }],
    padding: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#6b4f2d',
    backgroundColor: 'rgba(255,255,255,0.6)',
    zIndex: 25,
  },
  fullscreenNavRight: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -20 }],
    padding: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#6b4f2d',
    backgroundColor: 'rgba(255,255,255,0.6)',
    zIndex: 25,
  },

  // Chapter sidebar
  chapterSidebar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '70%',
    maxWidth: 320,
    backgroundColor: '#f5f5dc',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 40,
    paddingHorizontal: 12,
    zIndex: 30,
    borderLeftWidth: 1,
    borderColor: '#d6c9a8',
  },
  chapterHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b2f1b',
    marginBottom: 8,
  },
  chapterItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e6dec6',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chapterTitle: {
    color: '#3b2f1b',
    fontSize: 14,
  },
  chapterPage: {
    color: '#6b4f2d',
    fontSize: 12,
  },

});








// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   SafeAreaView,
//   StyleSheet,
//   Modal,
//   TextInput,
//   Switch,
//   ActivityIndicator,
//   Dimensions,
//   Platform,
//   StatusBar,
//   PanResponder,
//   Pressable,
// } from 'react-native';
// import { WebView } from 'react-native-webview';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useLibrary } from '@/context/libraryContext';
// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// /* ================= 1. FONT SELECTOR ================= */
// const FontSelector = ({ selectedFont, onSelect }) => {
//   const fonts = ['serif', 'sans-serif', 'monospace'];
//   const [visible, setVisible] = useState(false);

//   return (
//     <View>
//       <TouchableOpacity style={styles.selectorCompact} onPress={() => setVisible(true)}>
//         <Text style={styles.selectorText}>{selectedFont} ⌄</Text>
//       </TouchableOpacity>

//       <Modal transparent visible={visible} animationType="fade">
//         <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
//           <View style={styles.modalContent}>
//             {fonts.map(font => (
//               <TouchableOpacity
//                 key={font}
//                 style={styles.option}
//                 onPress={() => {
//                   onSelect(font);
//                   setVisible(false);
//                 }}
//               >
//                 <Text style={{ fontFamily: font, fontSize: 16, color: '#3b2f1b' }}>
//                   {font}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </Pressable>
//       </Modal>
//     </View>
//   );
// };

// /* ================= 2. MAIN VIEWER ================= */
// export default function PaginatedWebViewViewer() {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { book } = route.params;
//   console.log('Book Param:', book);
//   const parsedBook = JSON.parse(book);
//   console.log('Parsed Book:', parsedBook.id);

//   const webRef = useRef(null);
//   const lastTap = useRef(0);
//   const scrollTimer = useRef(null);

//   const [pages, setPages] = useState([]);
//   const [chapters, setChapters] = useState([]);
//   const [currentPage, setCurrentPage] = useState(0);

//   const [fontSize, setFontSize] = useState(14);
//   const [fontFamily, setFontFamily] = useState('serif');
//   const [autoScroll, setAutoScroll] = useState(false);
//   const [fullscreen, setFullscreen] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const [goVisible, setGoVisible] = useState(false);
//   const [goInput, setGoInput] = useState('');

//   const [chaptersVisible, setChaptersVisible] = useState(false);
//   const [bookmarksVisible, setBookmarksVisible] = useState(false);
//   const [bookmarks, setBookmarks] = useState([]);
//   const {
//     library,
//     createBooklist,
//     addToBooklist,
//     removeFromBooklist,
//     saveHistory,
//     addNote
//   } = useLibrary();

//   const [listVisible, setListVisible] = useState(false);
//   const [newListName, setNewListName] = useState('');
//   const [booklists, setBooklists] = useState({});

//   const [selectedText, setSelectedText] = useState('');
//   const [noteVisible, setNoteVisible] = useState(false);
//   const [actionVisible, setActionVisible] = useState(false); // save/cancel bar
//   const [notePopupVisible, setNotePopupVisible] = useState(false);
//   const [noteTitle, setNoteTitle] = useState('');
//   const [noteText, setNoteText] = useState('');


//   // এই ফাংশনটি useEffect বা onLoadEnd থেকে কল হবে
//   const applyHighlights = () => {
//     const allNotes = library?.notes?.[parsedBook.id]?.quotes || []; // আপনার কোডে clips ছিল, এখানে quotes হবে
//     const pageNotes = allNotes.filter(n => n.ref?.page === currentPage);

//     pageNotes.forEach(n => {
//       if (n.ref?.text) {
//         webRef.current?.injectJavaScript(
//           `highlight(${JSON.stringify(n.ref.text)}); true;`
//         );
//       }
//     });
//   };

//   useEffect(() => {
//     // পেজ লোড হওয়ার একটু সময় পর ইনজেক্ট করা নিরাপদ
//     const timer = setTimeout(() => {
//       applyHighlights();
//     }, 500); // ৫০০ms ডিলে দেয়া হয়েছে যাতে WebView তৈরি হতে পারে

//     return () => clearTimeout(timer);
//   }, [currentPage, library, pages]);







//   useEffect(() => {
//     if (library?.booklists) {
//       setBooklists(library.booklists);
//     }
//   }, [library]);



//   /* ================= LOAD BOOK & BOOKMARKS ================= */
//   useEffect(() => {


//     (async () => {
//       try {
//         const savedMarks = await AsyncStorage.getItem(`marks_${parsedBook.title}`);
//         if (savedMarks) setBookmarks(JSON.parse(savedMarks));

//         const res = await fetch(parsedBook.fileUrl);
//         const text = await res.text();

//         const rawPages = text.split('---page---');
//         const detectedChapters = [];

//         const cleanedPages = rawPages.map((p, idx) => {
//           const match = p.match(/---chapter:\s*(.*?)---/i);
//           if (match) {
//             detectedChapters.push({ title: match[1], pageIndex: idx });
//             return p.replace(match[0], '').trim();
//           }
//           return p.trim();
//         });

//         setPages(cleanedPages);
//         setChapters(
//           detectedChapters.length
//             ? detectedChapters
//             : [{ title: parsedBook.title || 'Start', pageIndex: 0 }]
//         );
//       } catch {
//         setPages(['Error loading content']);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   /* ================= AUTO SCROLL ================= */
//   useEffect(() => {
//     if (autoScroll) {
//       scrollTimer.current = setInterval(() => {
//         webRef.current?.injectJavaScript(`window.scrollBy(0,1); true;`);
//       }, 50);
//     } else {
//       clearInterval(scrollTimer.current);
//     }
//     return () => clearInterval(scrollTimer.current);
//   }, [autoScroll]);

//   useEffect(() => {
//     if (!pages.length) return;



//     saveHistory(parsedBook.id, {
//       type: 'reader',
//       page: currentPage,
//       total: pages.length,
//       lastReadAt: Date.now(),
//     });

//   }, [currentPage]);

//   useEffect(() => {
//     const notes =
//       library?.notes?.[parsedBook.id]?.clips || [];

//     const pageNotes = notes.filter(
//       n => n.ref?.page === currentPage
//     );

//     pageNotes.forEach(n => {
//       webRef.current?.injectJavaScript(
//         `highlight(${JSON.stringify(n.ref.text)});`
//       );
//     });
//   }, [currentPage, library]);



//   /* ================= SWIPE (NO ANIMATION) ================= */
//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: (_, g) =>
//         Math.abs(g.dx) > 30 && Math.abs(g.dy) < 30,
//       onPanResponderRelease: (_, g) => {
//         if (g.dx < -60 && currentPage < pages.length - 1) {
//           setCurrentPage(p => p + 1);
//         } else if (g.dx > 60 && currentPage > 0) {
//           setCurrentPage(p => p - 1);
//         }
//       },
//     })
//   ).current;

//   /* ================= HTML CONTENT ================= */
//   //   const htmlContent = `
//   //   <html>
//   //     <head>
//   //       <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
//   //       <style>
//   //         body {
//   //           font-size:${fontSize}px;
//   //           font-family:${fontFamily};
//   //           line-height:1.7;
//   //           text-align:justify;
//   //           padding:20px;
//   //           background:#f5f5dc;
//   //           color:#3b2f1b;

//   //         }
//   //       </style>
//   //     </head>
//   //     <body
//   //   oncontextmenu="return false"
//   //   onclick="window.ReactNativeWebView.postMessage('tap')"
//   // >
//   //   ${pages[currentPage]?.replace(/\n/g, '<br/>')}
//   // </body>

//   // <script>
//   //   function sendSelection() {
//   //     const sel = window.getSelection().toString();
//   //     if (sel.length > 0) {
//   //       window.ReactNativeWebView.postMessage(
//   //         JSON.stringify({ type: 'SELECT', text: sel })
//   //       );
//   //     }
//   //   }

//   //   function highlight(text) {
//   //   if (!text) return;

//   //   const escaped = text.replace(
//   //     new RegExp('[.*+?^{}()|[\\]\\\\]', 'g'),
//   //     '\\\\$&'
//   //   );

//   //   const regex = new RegExp(escaped, 'g');

//   //   document.body.innerHTML =
//   //     document.body.innerHTML.replace(
//   //       regex,
//   //       '<mark style="background:#ffe58a;">$&</mark>'
//   //     );
//   // }

//   //   document.addEventListener('mouseup', sendSelection);
//   // </script>


//   //   </html>
//   //   `;
//   const htmlContent = `
// <html>
//   <head>
//     <meta
//       name="viewport"
//       content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
//     />
//     <style>
//       body {
//         font-size: ${fontSize}px;
//         font-family: ${fontFamily};
//         line-height: 1.7;
//         text-align: justify;
//         padding: 20px;
//         background: #f5f5dc;
//         color: #3b2f1b;
//       }

//       mark {
//         background: #ffe58a;
//       }

//       * {
//         -webkit-user-select: text;
//         -webkit-touch-callout: none;
//       }
//     </style>
//   </head>

//   <body
//     oncontextmenu="return false"
//     onclick="window.ReactNativeWebView.postMessage('tap')"
//   >
//     ${pages[currentPage]?.replace(/\\n/g, '<br/>')}
//   </body>

//   <script>
//     /* ================= SELECTION HANDLER ================= */

//     let lastSelectedText = '';

//     document.addEventListener('selectionchange', () => {
//       const selection = window.getSelection();
//       const text = selection ? selection.toString().trim() : '';

//       if (text.length > 0 && text !== lastSelectedText) {
//         lastSelectedText = text;

//         window.ReactNativeWebView.postMessage(
//           JSON.stringify({
//             type: 'SELECT',
//             text: text
//           })
//         );
//       }
//     });

//     /* ================= HIGHLIGHT FUNCTION ================= */

//     function highlight(text) {
//       if (!text) return;

//       const escaped = text.replace(/[.*+?^{}()|[\\]\\\\]/g, '\\\\$&');
//       const regex = new RegExp(escaped, 'g');

//       document.body.innerHTML = document.body.innerHTML.replace(
//         regex,
//         '<mark>$&</mark>'
//       );
//     }

//     document.addEventListener('click', () => {
//   const selection = window.getSelection();
//   if (!selection || selection.toString().trim() === '') {
//     window.ReactNativeWebView.postMessage(
//       JSON.stringify({ type: 'CLEAR_SELECTION' })
//     );
//   }
// });

//   </script>
// </html>
// `;

//   const saveBookmarks = async (newList) => {
//     setBookmarks(newList);
//     await AsyncStorage.setItem(
//       `marks_${parsedBook.title}`,
//       JSON.stringify(newList)
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#6b4f2d" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar hidden={fullscreen} />

//       {!fullscreen && (
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
//             <Ionicons name="arrow-back" size={24} color="#3b2f1b" />
//           </TouchableOpacity>

//           <View style={styles.compactSettings}>
//             <TouchableOpacity onPress={() => setFontSize(s => Math.max(12, s - 2))}>
//               <Text style={styles.controlBtn}>A-</Text>
//             </TouchableOpacity>
//             <Text style={styles.controlBtn}>{fontSize}</Text>
//             <TouchableOpacity onPress={() => setFontSize(s => s + 2)}>
//               <Text style={styles.controlBtn}>A+</Text>
//             </TouchableOpacity>

//             <FontSelector selectedFont={fontFamily} onSelect={setFontFamily} />
//             <Switch
//               value={autoScroll}
//               onValueChange={setAutoScroll}
//               style={{ transform: [{ scale: 0.7 }] }}
//               trackColor={{ false: "#767577", true: "#6b4f2d" }}
//             />
//           </View>

//           <TouchableOpacity onPress={() => setChaptersVisible(true)} style={styles.iconBtn}>
//             <Ionicons name="menu" size={24} color="#3b2f1b" />
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* SWIPEABLE AREA */}
//       <View style={{ flex: 1 }} {...panResponder.panHandlers}>
//         <View style={{ flex: 1 }}>
//           <WebView
//             ref={webRef}
//             originWhitelist={['*']}
//             source={{ html: htmlContent }}
//             onLoadEnd={applyHighlights}
//             style={styles.webview}
//             onMessage={(e) => {
//               const now = Date.now();

//               try {
//                 const msg = JSON.parse(e.nativeEvent.data);

//                 if (msg.type === 'SELECT' && msg.text) {
//                   setSelectedText(msg.text);
//                   setActionVisible(true);
//                   return; // 🛑 এখানেই থামবে
//                 }

//                 // 👇 বাহিরে tap করলে
//                 if (msg.type === 'CLEAR_SELECTION') {
//                   setActionVisible(false);
//                   setSelectedText('');
//                   return; // fullscreen এ যাবে না
//                 }
//               } catch { }

//               // 👇 normal double tap
//               if (now - lastTap.current < 300) {
//                 setFullscreen(f => !f);
//               }
//               lastTap.current = now;
//             }}




//           />
//         </View>
//       </View>

//       {actionVisible && (
//         <View style={styles.selectionBar}>
//           <TouchableOpacity
//             onPress={() => {
//               setActionVisible(false);
//               setSelectedText('');
//             }}
//           >
//             <Text style={styles.cancelText}>Cancel</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.saveBtn}
//             onPress={() => {
//               setActionVisible(false);
//               setNotePopupVisible(true);
//             }}
//           >
//             <Text style={{ color: '#fff' }}>Save Note</Text>
//           </TouchableOpacity>
//         </View>
//       )}


//       {!fullscreen && (
//         <View style={[styles.footer, { paddingBottom: useSafeAreaInsets().bottom }]}>
//           <TouchableOpacity
//             onPress={() => currentPage > 0 && setCurrentPage(p => p - 1)}
//             disabled={currentPage === 0}
//           >
//             <Ionicons
//               name="chevron-back"
//               size={24}
//               color={currentPage === 0 ? "#ccc" : "#3b2f1b"}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => setGoVisible(true)}>
//             <Text style={styles.pageIndicator}>
//               {currentPage + 1} / {pages.length}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => setBookmarksVisible(true)}>
//             <Ionicons name="bookmarks-outline" size={22} color="#3b2f1b" />
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => {
//               const newList = bookmarks.includes(currentPage)
//                 ? bookmarks.filter(x => x !== currentPage)
//                 : [...bookmarks, currentPage];
//               saveBookmarks(newList);
//             }}
//           >
//             <Ionicons
//               name={bookmarks.includes(currentPage) ? 'bookmark' : 'bookmark-outline'}
//               size={22}
//               color="#6b4f2d"
//             />
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => setListVisible(true)}>
//             <Ionicons name="add-circle-outline" size={22} color="#3b2f1b" />
//           </TouchableOpacity>



//           <TouchableOpacity
//             onPress={() =>
//               currentPage < pages.length - 1 && setCurrentPage(p => p + 1)
//             }
//             disabled={currentPage === pages.length - 1}
//           >
//             <Ionicons
//               name="chevron-forward"
//               size={24}
//               color={currentPage === pages.length - 1 ? "#ccc" : "#3b2f1b"}
//             />
//           </TouchableOpacity>
//         </View>
//       )}

//       <Modal
//         visible={notePopupVisible}
//         transparent
//         animationType="fade"
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalBox}>

//             <TextInput
//               placeholder="Note title"
//               value={noteTitle}
//               onChangeText={setNoteTitle}
//               style={styles.titleInput}
//             />

//             <TextInput
//               placeholder="Short note..."
//               value={noteText}
//               onChangeText={setNoteText}
//               multiline
//               style={styles.noteInput}
//             />

//             {/* 🔹 Selected text as quote */}
//             <View style={styles.quoteBox}>
//               <Text style={styles.quoteText}>
//                 “{selectedText}”
//               </Text>
//             </View>

//             <TouchableOpacity
//               style={styles.goBtn}
//               onPress={async () => {


//                 await addNote(parsedBook.id, 'book', 'quotes', {

//                   title: parsedBook.title || 'Highlight',
//                   content: noteText,
//                   ref: {
//                     page: currentPage,
//                     text: selectedText,
//                     bookTitle: parsedBook.title,
//                   },

//                 });

//                 console.log('Note saved');




//                 webRef.current?.injectJavaScript(
//                   `highlight(${JSON.stringify(selectedText)});`
//                 );

//                 setNoteTitle('');
//                 setNoteText('');
//                 setSelectedText('');
//                 setNotePopupVisible(false);

//               }}
//             >
//               <Text style={{ color: '#fff' }}>Save</Text>
//             </TouchableOpacity>

//           </View>
//         </View>
//       </Modal>



//       {/* MODALS */}
//       <Modal transparent visible={goVisible} animationType="fade">
//         <Pressable style={styles.modalOverlay} onPress={() => setGoVisible(false)}>
//           <View style={styles.popupSmall}>
//             <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>পৃষ্ঠায় যান</Text>
//             <TextInput
//               style={styles.input}
//               keyboardType="number-pad"
//               placeholder="পৃষ্ঠা নম্বর লিখুন"
//               autoFocus
//               value={goInput}
//               onChangeText={setGoInput}
//             />
//             <TouchableOpacity
//               style={styles.goBtn}
//               onPress={() => {
//                 const p = Number(goInput) - 1;
//                 if (p >= 0 && p < pages.length) setCurrentPage(p);
//                 setGoVisible(false);
//                 setGoInput('');
//               }}
//             >
//               <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go</Text>
//             </TouchableOpacity>
//           </View>
//         </Pressable>
//       </Modal>

//       <Modal transparent visible={chaptersVisible || bookmarksVisible} animationType="slide">
//         <Pressable
//           style={styles.modalOverlay}
//           onPress={() => {
//             setChaptersVisible(false);
//             setBookmarksVisible(false);
//           }}
//         >
//           <View style={styles.chapterSidebar}>
//             <Text style={styles.chapterHeader}>
//               {chaptersVisible ? 'সূচিপত্র' : 'বুকমার্কস'}
//             </Text>

//             {chaptersVisible
//               ? chapters.map((c, i) => (
//                 <TouchableOpacity
//                   key={i}
//                   style={styles.chapterItem}
//                   onPress={() => {
//                     setCurrentPage(c.pageIndex);
//                     setChaptersVisible(false);
//                   }}
//                 >
//                   <Text style={styles.chapterTitle}>{c.title}</Text>
//                   <Text style={styles.chapterPage}>
//                     Page {c.pageIndex + 1}
//                   </Text>
//                 </TouchableOpacity>
//               ))
//               : bookmarks.map((p, i) => (
//                 <TouchableOpacity
//                   key={i}
//                   style={styles.chapterItem}
//                   onPress={() => {
//                     setCurrentPage(p);
//                     setBookmarksVisible(false);
//                   }}
//                 >
//                   <Text style={styles.chapterTitle}>Page {p + 1}</Text>
//                 </TouchableOpacity>
//               ))}
//           </View>
//         </Pressable>
//       </Modal>

//       <Modal transparent visible={listVisible} animationType="slide">
//         <Pressable style={styles.modalOverlay} onPress={() => setListVisible(false)}>
//           <View style={styles.chapterSidebar}>

//             {/* 🔝 CREATE */}
//             <Text style={styles.chapterHeader}>📚 Save to Booklist</Text>

//             <View style={{ flexDirection: 'row', marginBottom: 15 }}>
//               <TextInput
//                 placeholder="New booklist name"
//                 value={newListName}
//                 onChangeText={setNewListName}
//                 style={[styles.input, { flex: 1 }]}
//               />
//               <TouchableOpacity
//                 onPress={async () => {
//                   if (!newListName.trim()) return;
//                   await createBooklist(newListName);
//                   setNewListName('');
//                 }}
//                 style={{
//                   marginLeft: 10,
//                   backgroundColor: '#6b4f2d',
//                   paddingHorizontal: 15,
//                   justifyContent: 'center',
//                   borderRadius: 6,
//                 }}
//               >
//                 <Text style={{ color: '#fff' }}>Create</Text>
//               </TouchableOpacity>
//             </View>

//             {/* 📜 EXISTING LISTS */}
//             {Object.entries(library?.booklists || {}).map(([id, list]) => {
//               const added = list.items.includes(parsedBook.id);
//               console.log('Booklist:', list, 'Contains Book:', added);

//               return (
//                 <TouchableOpacity
//                   key={id}
//                   style={styles.chapterItem}
//                   onPress={() =>

//                     added
//                       ? removeFromBooklist(id, parsedBook.id)
//                       : addToBooklist(id, parsedBook.id)
//                   }
//                 >
//                   <Text style={styles.chapterTitle}>{list.title}</Text>

//                   <Ionicons
//                     name={added ? 'checkmark-circle' : 'add-circle-outline'}
//                     size={22}
//                     color={added ? '#6b4f2d' : 'gray'}
//                   />
//                 </TouchableOpacity>
//               );
//             })}

//           </View>
//         </Pressable>
//       </Modal>

//     </SafeAreaView>
//   );
// }

// /* ================= STYLES (এক লাইনও বাদ না) ================= */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f5f5dc' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     backgroundColor: '#ede6d1',
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
//   },
//   webview: { flex: 1, backgroundColor: '#f5f5dc' },
//   compactSettings: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     height: 40,
//   },
//   controlBtn: { paddingHorizontal: 8, fontWeight: 'bold', color: '#3b2f1b' },
//   iconBtn: { padding: 5 },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'start',
//     paddingVertical: 12,
//     backgroundColor: '#ede6d1',
//     // height: 50 + navHeight,
//   },
//   pageIndicator: { fontWeight: 'bold', color: '#3b2f1b', fontSize: 16 },
//   selectorCompact: {
//     paddingHorizontal: 8,
//     borderLeftWidth: 1,
//     borderColor: '#ccc',
//     marginLeft: 5,
//   },
//   selectorText: { fontSize: 12, color: '#3b2f1b' },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'center',
//     alignItems: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     width: '80%',
//     alignSelf: 'center',
//   },
//   popupSmall: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     width: '70%',
//     alignSelf: 'center',
//     alignItems: 'center',
//   },
//   option: {
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderColor: '#eee',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     width: '100%',
//     padding: 10,
//     marginBottom: 15,
//     borderRadius: 5,
//     textAlign: 'center',
//   },
//   goBtn: {
//     backgroundColor: '#6b4f2d',
//     paddingHorizontal: 30,
//     paddingVertical: 10,
//     borderRadius: 5,
//   },
//   chapterSidebar: {
//     width: '75%',
//     height: '100%',
//     backgroundColor: '#f5f5dc',
//     padding: 20,
//     paddingTop: 50,
//   },
//   chapterHeader: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#3b2f1b',
//   },
//   chapterItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderColor: '#ddd',
//   },
//   chapterTitle: { fontSize: 16, color: '#3b2f1b' },
//   chapterPage: { fontSize: 12, color: 'gray' },

//   selectionBar: {
//     position: 'absolute',
//     bottom: 80,
//     left: 20,
//     right: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 10,
//     elevation: 5,
//   },

//   saveBtn: {
//     backgroundColor: '#6b4f2d',
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 6,
//   },

//   cancelText: {
//     color: '#999',
//     fontSize: 16,
//   },

//   modalBox: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 12,
//     width: '85%',
//     alignSelf: 'center',
//     color: '#3b2f1b',
//   },

//   titleInput: {
//     borderBottomWidth: 1,
//     borderColor: '#ddd',
//     marginBottom: 10,
//     fontSize: 16,
//     color: '#3b2f1b',
//   },
//   noteInput: {

//     borderColor: '#ddd',
//     color: '#3b2f1b',

//   },

//   quoteBox: {
//     marginTop: 15,
//     padding: 10,
//     borderLeftWidth: 4,
//     borderColor: '#6b4f2d',
//     backgroundColor: '#f9f6ef',
//   },

//   quoteText: {
//     fontStyle: 'italic',
//     color: '#3b2f1b',
//   },

// });
