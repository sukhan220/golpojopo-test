

// /***
//  * 1. pages → split করা page গুলো।

//  * 2. chapters → detect করা অধ্যায় লিস্ট (marker: ---chapter: Title---)।

//  * 3. currentPage → বর্তমানে কোন পেজ।

//  * 4. fontSize / fontFamily → পড়ার জন্য font control।

//  * 5. autoScroll → true হলে প্রতি ৫০ms এ scroll হবে।

//  * 6. fullscreen → ডাবল-ট্যাপ করলে header/menu/control লুকায়।

//  * 7. goInputVisible → modal open for jump to page।

//  * 8. chaptersVisible → sidebar modal visible।

//   * 9. Page swapping → ডানে/বামে swipe করে পেজ পরিবর্তন। দেখতে একদম বইয়ের মত পেইজ উলটানো যায়।

//   * 10. Bookmarking → পেজ বুকমার্ক করা যায়।

//  * 11. Booklist Add

//  * 12. Note Add -> যেকোন লাইন মার্ক করা যাবে। 

//  */



import { useLibrary } from '@/context/libraryContext';
import { Ionicons } from '@expo/vector-icons';
import PageFlipper from '@laffy1309/react-native-page-flipper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Modal,
    PanResponder,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import Slider from '@react-native-community/slider';

import { generateSinglePageHTML, htmlContent } from '@/constants/web';
import * as ScreenOrientation from 'expo-screen-orientation';


async function lockLandscape() {
  await ScreenOrientation.lockAsync(
    ScreenOrientation.OrientationLock.LANDSCAPE
  );
}

async function lockPortrait() {
  await ScreenOrientation.lockAsync(
    ScreenOrientation.OrientationLock.PORTRAIT
  );
}

async function unlockOrientation() {
  await ScreenOrientation.unlockAsync();
}


// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/* ================= 1. FONT SELECTOR ================= */
const FontSelector = ({ selectedFont, onSelect }) => {
  const fonts = ['serif', 'sans-serif', 'monospace'];
  const [visible, setVisible] = useState(false);


  return (
    <View>
      <TouchableOpacity style={styles.selectorCompact} onPress={() => setVisible(true)}>
        <Text style={styles.selectorText}>{selectedFont} ⌄</Text>
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={styles.modalContent}>
            {fonts.map(font => (
              <TouchableOpacity
                key={font}
                style={styles.option}
                onPress={() => {
                  onSelect(font);
                  setVisible(false);
                }}
              >
                <Text style={{ fontFamily: font, fontSize: 16, color: '#3b2f1b' }}>
                  {font}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

/* ================= 2. MAIN VIEWER ================= */
export default function PaginatedWebViewViewer() {
  const navigation = useNavigation();
  const route = useRoute();
  const { book } = route.params;
  const parsedBook = JSON.parse(book);
  const insets = useSafeAreaInsets();

  const webRef = useRef(null);
  const lastTap = useRef(0);
  const scrollTimer = useRef(null);

  const [pages, setPages] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('serif');
  const [autoScroll, setAutoScroll] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [goVisible, setGoVisible] = useState(false);
  const [goInput, setGoInput] = useState('');

  const [chaptersVisible, setChaptersVisible] = useState(false);
  const [bookmarksVisible, setBookmarksVisible] = useState(false);
  const [notesListVisible, setNotesListVisible] = useState(false); // New State for Notes List

  const [bookmarks, setBookmarks] = useState([]);

  const [listVisible, setListVisible] = useState(false);
  const [newListName, setNewListName] = useState('');


  const [actionVisible, setActionVisible] = useState(false);
  const [notePopupVisible, setNotePopupVisible] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [webReady, setWebReady] = useState(false);

  const [scrollMode, setScrollMode] = useState(true); // NEW

  const [floatingVisible, setFloatingVisible] = useState(false);
  const [actionMode, setActionMode] = useState(null);
  // 'save' | 'delete'

  const [selectedText, setSelectedText] = useState('');
  const [floatingPos, setFloatingPos] = useState({ x: 0, y: 0 });

  const saveTimer = useRef(null);

  const webLayout = useRef({ x: 0, y: 0 });

  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  const scaleValue = useRef(1);





  const SPEED_MAP = {
    1: 0.4,
    1.05: 0.45,
    1.1: 0.5,
    1.15: 0.55,
    1.2: 0.6,
    1.25: 0.65,
    1.3: 0.7,
    1.35: 0.75,
    1.4: 0.8,
    1.45: 0.85,
    1.5: 0.9,
    1.55: 0.95,
    1.6: 1.0,
    1.65: 1.05,
    1.7: 1.1,
    1.75: 1.15,
    1.8: 1.2,
    1.85: 1.25,
    1.9: 1.3,
    1.95: 1.4,
    2: 1.5,
  };

  const [autoScrollSpeed, setAutoScrollSpeed] = useState(0.2);
  const [speedX, setSpeedX] = useState(1);
  const [speedModalVisible, setSpeedModalVisible] = useState(false);

  const [lastScrollY, setLastScrollY] = useState(0);
  const restoringRef = useRef(false);


  const [isLandscape, setIsLandscape] = useState(false);
  const [isSpreadMode, setIsSpreadMode] = useState(false);

  const baseFontSize = useRef(fontSize);
  const prevReaderState = useRef(null);
  const [contentReady, setContentReady] = useState(false);

  const HIGHLIGHT_COLORS = ['#ffe58a', '#ffadad', '#adffb4', '#adc4ff'];
  // কম্পোনেন্টের ভেতরে:
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0]);

  const { width, height } = useWindowDimensions();
  const [zoomActive, setZoomActive] = useState(false);




  const [zooming, setZooming] = useState(false);
  const initialPinchDistance = useRef(0);
  const baseScale = useRef(1);

  const isZooming = useRef(false);

  // const isZoomed = scaleValue.current > 1.01;

  const pageTurnEnabled = !isZoomed;

  // const pageTurnEnabled = !zooming;
  const webZoomEnabled = true;

  const wasPinching = useRef(false);


  const lastTranslate = useRef({ x: 0, y: 0 });


  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const isZoomed = () => scaleValue.current > 1.01;



  const setScaleSafe = (v) => {
    scaleValue.current = v;
    scale.setValue(v);
  };




  const clampTranslate = () => {
    const s = scaleValue.current;

    if (s <= 1.01) {
      lastTranslate.current = { x: 0, y: 0 };
      translateX.setValue(0);
      translateY.setValue(0);
      return;
    }

    // 🔥 ডায়নামিক বাউন্ডারি ক্যালকুলেশন
    // জুম হওয়ার পর ছবির বাড়তি অংশ কতটুকু (Overflow) সেটা বের করা হচ্ছে
    const maxAllowedX = (width * s - width) / 2;
    const maxAllowedY = (height * s - height) / 2;

    // বর্তমান পজিশন যদি সীমার বাইরে যায় তবে তাকে সীমার ভেতরে আনা (Clamp)
    const clampedX = Math.min(maxAllowedX, Math.max(-maxAllowedX, lastTranslate.current.x));
    const clampedY = Math.min(maxAllowedY, Math.max(-maxAllowedY, lastTranslate.current.y));

    lastTranslate.current = { x: clampedX, y: clampedY };

    // মসৃণভাবে পজিশনে সেট করা
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: clampedX,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.spring(translateY, {
        toValue: clampedY,
        useNativeDriver: true,
        friction: 8,
      }),
    ]).start();
  };


  const flipperRef = useRef(null);

  const readingPos = useRef({
    pageIndex: 0,
    offsetRatio: 0
  });


  const saveReadingPosition = () => {
    if (scrollMode) {
      webRef.current?.injectJavaScript(`
      (function(){
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const ratio = totalHeight > 0 ? window.scrollY / totalHeight : 0;

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SAVE_RATIO',
          ratio
        }));
      })();
      true;
    `);
    }
  };


  const {
    library,
    createBooklist,
    addToBooklist,
    removeFromBooklist,
    saveHistory,
    addNote,
    removeNote
  } = useLibrary();


  const applyHighlights = () => {
    if (!webRef.current) return;

    const allNotes = library?.notes?.[parsedBook.id]?.quotes || [];
    const pageNotes = allNotes
      .filter(n => n.ref?.page === currentPage)
      .map(n => n.ref.text);

    if (pageNotes.length > 0) {
      const jsCode = `
      window.__HIGHLIGHTS__ = ${JSON.stringify(pageNotes)};
      if (typeof applyAllHighlights === 'function') {
        applyAllHighlights();
      }
      true;
    `;
      webRef.current.injectJavaScript(jsCode);
    }
  };



  const selectionScript = `
  // টেক্সট সিলেক্ট করলে মেনু দেখানো
  document.onselectionchange = function() {
    let selection = window.getSelection();
    let text = selection.toString().trim();
    if (text.length > 0) {
      let range = selection.getRangeAt(0);
      let rect = range.getBoundingClientRect();
      
      // React Native-এ ডেটা পাঠানো (পজিশনসহ)
      window.ReactNativeWebView.postMessage(JSON.stringify({
  type: 'SELECT',
  text: text,
  x: rect.left + rect.width / 2,
  y: rect.top + window.scrollY
}));

    } else {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CLEAR_SELECTION' }));
    }
  };

  // হাইলাইট করা টেক্সটে ক্লিক করলে ডিলিট অপশন
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('highlight')) {
      let text = e.target.innerText;
      let rect = e.target.getBoundingClientRect();
      
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'HIGHLIGHT_CLICK',
        text: text,
        x: rect.left + (rect.width / 2),
        y: rect.top + window.scrollY - 40
      }));
    }
  });
`;



  const applyScaleWithTranslateFix = (nextScale) => {
    const prevScale = scaleValue.current;

    if (prevScale === 0) return;

    const ratio = nextScale / prevScale;

    lastTranslate.current = {
      x: lastTranslate.current.x * ratio,
      y: lastTranslate.current.y * ratio,
    };

    translateX.setValue(lastTranslate.current.x);
    translateY.setValue(lastTranslate.current.y);

    scaleValue.current = nextScale;
    scale.setValue(nextScale);
  };





  const zoomAndPanResponder = useRef( 

    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => zoomActive,
      // onMoveShouldSetPanResponderCapture: () => zoomActive,



      onMoveShouldSetPanResponder: (_, g) => {
        if (g.numberActiveTouches === 2) return true;
        if (g.numberActiveTouches === 1 && zoomActive) return true;
        return false;
      },

      onMoveShouldSetPanResponder: (_, g) => {
        // ✌️ pinch
        if (g.numberActiveTouches === 2) return true;

        // 👆 zoom থাকলে pan
        if (g.numberActiveTouches === 1 && isZoomed()) return true;

        // 👆 zoom না থাকলে flip handle হবে release এ
        return false;
      },

      onPanResponderMove: (e, g) => {
        // 🔥 PINCH
        if (g.numberActiveTouches === 2) {
          const [a, b] = e.nativeEvent.touches;
          const dx = a.pageX - b.pageX;
          const dy = a.pageY - b.pageY;

          if (!initialPinchDistance.current) {
            initialPinchDistance.current = Math.sqrt(dx * dx + dy * dy);
            baseScale.current = scaleValue.current;
            return;
          }

          const dist = Math.sqrt(dx * dx + dy * dy);
          const ratio = dist / initialPinchDistance.current;

          // setScaleSafe(
          //   Math.min(2.5, Math.max(1, baseScale.current * ratio))
          // );

          applyScaleWithTranslateFix(
            Math.min(2.5, Math.max(1, baseScale.current * ratio))
          );
        }

        // 🔥 PAN
        if (g.numberActiveTouches === 1 && isZoomed()) {
          translateX.setValue(lastTranslate.current.x + g.dx);
          translateY.setValue(lastTranslate.current.y + g.dy);
        }
      },

      onPanResponderRelease: () => {
        initialPinchDistance.current = 0;

        Animated.spring(scale, {
          toValue: Math.max(1, scaleValue.current),
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }).start(() => {
          if (scaleValue.current <= 1.01) {
            // 🔥 FULL RESET — NO DRIFT
            lastTranslate.current = { x: 0, y: 0 };
            translateX.setValue(0);
            translateY.setValue(0);
            scaleValue.current = 1;
          } else {
            clampTranslate();
          }
        });
      },
    })
  ).current;






  // ল্যান্ডস্কেপের জন্য ডেটা ফরম্যাট করার ফাংশন
  const getSpreadPages = () => {
    const pairs = [];
    for (let i = 0; i < pages.length; i++) {
      pairs.push([pages[i] || ""]);
    }


    return pairs;
  };



  const jumpToPage = (index) => {
    if (index < 0 || index >= pages.length) return;

    if (scrollMode) {
      scrollToPage(index);
    } else {
      setCurrentPage(index);
    }
  };





  const goNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(p => p + 1);


    }
  };

  const goPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(p => p - 1);
    }
  };

  const scrollToPage = (page) => {
    if (page < 0 || page >= pages.length) return;

    webRef.current?.injectJavaScript(`
    (function(){
      const el = document.querySelector('[data-page="${page}"]');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    })();
    true;
  `);
  };


  const handleNext = () => {
    if (scrollMode) {
      scrollToPage(currentPage + 1);
    } else {
      goNextPage();
    }
  };

  const handlePrev = () => {
    if (scrollMode) {
      scrollToPage(currentPage - 1);
    } else {
      goPrevPage();
    }
  };


  useEffect(() => {
    // 🔒 reader খুললে auto-rotate allow
    ScreenOrientation.unlockAsync();

    return () => {
      // 🔒 reader থেকে বের হলে portrait এ ফেরত
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT
      );
    };
  }, []);

  useEffect(() => {
    const id = scale.addListener(({ value }) => {
      scaleValue.current = value;
      setZoomActive(value > 1.01);
    });

    return () => scale.removeListener(id);
  }, []);



  
  useEffect(() => {
    if (!webReady || !pages.length) return;

    const allNotes = library?.notes?.[parsedBook.id]?.quotes || [];

    const highlights = scrollMode
      ? allNotes.map(n => n.ref.text)
      : allNotes
        .filter(n => n.ref?.page === currentPage)
        .map(n => n.ref.text);

    // 🔥 NEXT FRAME এ inject
    setTimeout(() => {
      webRef.current?.injectJavaScript(`
      window.__HIGHLIGHTS__ = ${JSON.stringify(highlights)};
      if (typeof applyAllHighlights === 'function') {
        applyAllHighlights();
      }
      true;
    `);
    }, 0);

  }, [library, webReady, currentPage, scrollMode]);





  useEffect(() => {
    const params = route.params;



    // চেক করুন pages লোড হয়েছে কি না এবং জাম্প প্যারামিটার আছে কি না
    if (pages.length > 0 && params?.jumpToHighlight) {
      const page = params.location.page;

      // ১. পেইজে নিয়ে যাওয়া (অবশ্যই pages.length এর ভেতরে হতে হবে)
      if (page !== undefined && page < pages.length) {
        setCurrentPage(page);
        params.jumpToHighlight = false; // একবার জাম্প হয়ে গেলে ফ্ল্যাগ অফ করুন
      }




    }
  }, [pages, route.params, webReady]);





  useEffect(() => {
    if (!webReady || !pages.length) return;

    const history = library?.history?.[parsedBook.id];
    if (!history) return;

    restoringRef.current = true;

    if (scrollMode && history.scrollY !== undefined) {
      setTimeout(() => {
        webRef.current?.injectJavaScript(`
    window.__RESTORING__ = true;
    window.scrollTo({ top: ${history.scrollY}, behavior: 'auto' });
    setTimeout(() => {
      window.__RESTORING__ = false;
      true;
    }, 300);
    true;
  `);

        // 🔥 ADD THIS
        setContentReady(true);

      }, 150);

    }

    if (!scrollMode && history.page !== undefined) {
      setCurrentPage(history.page);
    }

  }, [webReady, pages.length, scrollMode, fontSize]);




  useEffect(() => {
    (async () => {
      try {
        const savedMarks = await AsyncStorage.getItem(`marks_${parsedBook.title}`);
        if (savedMarks) setBookmarks(JSON.parse(savedMarks));

        const res = await fetch(parsedBook.fileUrl);
        const text = await res.text();

        const rawPages = text.split('---page---');
        const detectedChapters = [];

        const cleanedPages = rawPages.map((p, idx) => {
          const match = p.match(/---chapter:\s*(.*?)---/i);
          if (match) {
            detectedChapters.push({ title: match[1], pageIndex: idx });
            return p.replace(match[0], '').trim();
          }
          return p.trim();
        });

        setPages(cleanedPages);
        setChapters(
          detectedChapters.length
            ? detectedChapters
            : [{ title: parsedBook.title || 'Start', pageIndex: 0 }]
        );
      } catch {
        setPages(['Error loading content']);
      } finally {
        setLoading(false);
      }
    })();
  }, []);





  useEffect(() => {
    const sub = ScreenOrientation.addOrientationChangeListener(event => {
      if (!isLandscape) {
        saveReadingPosition();
      }

      const o = event.orientationInfo.orientation;

      const landscape =
        o === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

      setIsLandscape(landscape);

      if (landscape && !isSpreadMode) {

        setFullscreen(true);
        prevReaderState.current = {
          scrollMode,
          autoScroll,
          fontSize,
          currentPage,
          scrollY: lastScrollY, // ✅ ADD THIS
        };
        saveReadingPosition();

        setIsSpreadMode(true);
        setScrollMode(false);
        setAutoScroll(false);
      }

     
      if (!landscape && isSpreadMode) {

        // 🔥 ZOOM RESET
        setScaleSafe(1);
        setZoomActive(false);
        lastTranslate.current = { x: 0, y: 0 };
        translateX.setValue(0);
        translateY.setValue(0);

        setWebReady(false);

        const prev = prevReaderState.current;

        setFullscreen(false);
        setIsSpreadMode(false);

        if (prev) {
          setScrollMode(prev.scrollMode);
          setAutoScroll(prev.autoScroll);
          setFontSize(prev.fontSize);
          setCurrentPage(prev.currentPage);
        }

        setTimeout(() => {
          if (scrollMode && readingPos.current.offsetRatio !== undefined) {
            webRef.current?.injectJavaScript(`
        (function(){
          const totalHeight =
            document.body.scrollHeight - window.innerHeight;

          window.scrollTo({
            top: totalHeight * ${readingPos.current.offsetRatio},
            behavior: 'auto'
          });
        })();
        true;
      `);
          } else {
            setCurrentPage(readingPos.current.pageIndex);
          }
        }, 300);
      }



    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(sub);
    };
  }, [isSpreadMode, scrollMode, autoScroll, fontSize, currentPage]);



  useEffect(() => {
    if (isSpreadMode) {

      setScrollMode(false);
      setAutoScroll(false);
      baseFontSize.current = fontSize;
      setFontSize(Math.max(12, fontSize - 3));
    } else {

      setFontSize(baseFontSize.current || 14);
    }
  }, [isSpreadMode]);



  useEffect(() => {
    // speedX পরিবর্তন হলেই actual scroll speed হিসাব
    const calculatedSpeed =
      SPEED_MAP[speedX] ?? (0.2 * speedX); // fallback

    setAutoScrollSpeed(calculatedSpeed);
  }, [speedX]);




  useEffect(() => {
    // ১. যদি অটো-স্ক্রল বন্ধ থাকে, টাইমার ক্লিয়ার করে দাও
    if (!autoScroll) {
      webRef.current?.injectJavaScript(`
      if (window.__autoScrollTimer) {
        clearInterval(window.__autoScrollTimer);
        window.__autoScrollTimer = null;
      }
      true;
    `);
      return;
    }

    // ২. অটো-স্ক্রল চালু থাকলে বা স্পিড পরিবর্তন হলে:
    // প্রথমে আগের টাইমার ক্লিয়ার করা (যাতে ডুপ্লিকেট না হয়) এবং নতুন স্পিডে শুরু করা
    const scrollScript = `
    (function () {
      if (window.__autoScrollTimer) {
        clearInterval(window.__autoScrollTimer);
      }

      window.__autoScrollTimer = setInterval(() => {
        window.scrollBy({
          top: ${autoScrollSpeed},
          behavior: 'auto' // 'smooth' দিলে ইন্টারভ্যালের সাথে সংঘর্ষ হয়, 'auto' ই ভালো
        });
      }, 50);
    })();
    true;
  `;

    webRef.current?.injectJavaScript(scrollScript);

    return () => {
      webRef.current?.injectJavaScript(`
      if (window.__autoScrollTimer) {
        clearInterval(window.__autoScrollTimer);
        window.__autoScrollTimer = null;
      }
      true;
    `);
    };
  }, [autoScroll, autoScrollSpeed]);

  useEffect(() => {
    if (scrollMode && autoScroll) {
      setAutoScroll(false);
    }
  }, [scrollMode]);










  useEffect(() => {
    if (!pages.length || currentPage === undefined) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(() => {
      saveHistory(parsedBook.id, {
        type: 'reader',
        page: currentPage,
        scrollY: scrollMode ? lastScrollY : 0,
        total: pages.length,
        lastReadAt: Date.now(),
      });
    }, 500); // ⏱️ debounce

    return () => clearTimeout(saveTimer.current);
  }, [currentPage, lastScrollY]);







  useEffect(() => {
    if (!isLandscape || !flipperRef.current) return;

    const spreadIndex = Math.floor(currentPage / 2);

    setTimeout(() => {
      flipperRef.current.goToPage(spreadIndex);
      console.log('goToPage → spreadIndex:', spreadIndex);
    }, 200);
  }, [isLandscape, currentPage]);




  const saveBookmarks = async (newList) => {
    setBookmarks(newList);
    await AsyncStorage.setItem(`marks_${parsedBook.title}`, JSON.stringify(newList));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6b4f2d" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={fullscreen} />

      {!fullscreen && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              // 1️⃣ WebView stop all heavy work
              webRef.current?.injectJavaScript(`
      window.__SCROLL_MODE__ = false;
      window.__RESTORING__ = true;

      if (window.__autoScrollTimer) {
        clearInterval(window.__autoScrollTimer);
        window.__autoScrollTimer = null;
      }

      true;
    `);

              // 2️⃣ Next frame এ exit
              requestAnimationFrame(() => {
                navigation.goBack();
              });
            }}
            style={styles.iconBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#3b2f1b" />
          </TouchableOpacity>


          <View style={styles.compactSettings}>

            <TouchableOpacity
              onPress={() => setSpeedModalVisible(true)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,

              }}
            >
              <Text style={{ color: '#6b4f2d', fontWeight: 'bold' }}>
                {speedX}x
              </Text>
            </TouchableOpacity>



            <FontSelector selectedFont={fontFamily} onSelect={setFontFamily} />
            <Switch
              value={autoScroll}
              onValueChange={setAutoScroll}
              style={{ transform: [{ scale: 0.7 }] }}
              trackColor={{ false: "#767577", true: "#6b4f2d" }}
            />
          </View>

          <TouchableOpacity onPress={() => setChaptersVisible(true)} style={styles.iconBtn}>
            <Ionicons name="menu" size={24} color="#3b2f1b" />
          </TouchableOpacity>
        </View>
      )}


      <View style={{ flex: 1, overflow: 'hidden', backgroundColor: 'white' }}>


        {isLandscape ? (


          <Animated.View
            {...zoomAndPanResponder.panHandlers}


            style={{
              flex: 1,
              transform: [
                { translateX },
                { translateY },
                { scale },

              ],
            }}
          >
            <PageFlipper
              ref={flipperRef}
              data={getSpreadPages()}
              // enabled={pageTurnEnabled}
              // pressable={pageTurnEnabled}
              // swipeDistance={pageTurnEnabled ? 20 : 9999}
              // enabled={!isZoomed}
              // pressable={!isZoomed}
              // swipeDistance={isZoomed ? 9999 : 20}
              // enabled={!isZoomed()}
              // pressable={!isZoomed()}
              // swipeDistance={isZoomed() ? 9999 : 20}

              enabled={!zoomActive}
              pressable={!zoomActive}
              swipeDistance={zoomActive ? width * 10 : 20}
              pointerEvents={zoomActive ? 'none' : 'auto'}
              pageSize={{ width: width - 200, height: height + 250 }}
              initialPage={Math.floor(currentPage / 2)}


              renderPage={(item) => (
                <View style={styles.spreadContainer}>
                  <View style={styles.singlePage}>
                    <WebView
                      source={{
                        html: generateSinglePageHTML(item[0], fontFamily, 10),
                      }}
                      scrollEnabled={false}
                      setBuiltInZoomControls={false}
                      scalesPageToFit={false}
                      style={styles.webviewPage}
                      pointerEvents="auto"
                    />
                  </View>
                </View>
              )}
            />
          </Animated.View>
        ) : (



          <View
            style={{ flex: 1 }}
            onLayout={(e) => {
              webLayout.current = e.nativeEvent.layout;
            }}
          >

            <WebView
              key={isLandscape ? 'land' : 'port'}
              ref={webRef}
              originWhitelist={['*']}
              source={{ html: htmlContent(pages, currentPage, scrollMode, isSpreadMode, fontFamily, fontSize) }}

              scrollEnabled={scrollMode}
              nestedScrollEnabled={scrollMode}

              pointerEvents={isSpreadMode ? 'none' : 'auto'}

              showsVerticalScrollIndicator={false}

              scalesPageToFit={Platform.OS === 'android'}
              setBuiltInZoomControls={false} // ব্রাউজারের কুৎসিত বাটন লুকানোর জন্য
              setDisplayZoomControls={false}

              androidLayerType="hardware"
              swipeDistance={60}

              textZoom={100}          // 🔥 Android font shrink fix
              javaScriptEnabled

              // onLoadEnd={() => {
              //   applyHighlights();
              // }}

              onLoadEnd={() => {
                setWebReady(true);

                requestAnimationFrame(() => {
                  applyHighlights();

                  if (scrollMode && readingPos.current.offsetRatio != null) {
                    webRef.current?.injectJavaScript(`
        (function(){
          const total =
            document.body.scrollHeight - window.innerHeight;
          window.scrollTo({
            top: total * ${readingPos.current.offsetRatio},
            behavior: 'auto'
          });
        })();
        true;
      `);
                  }
                });
              }}


              style={[
                styles.webview,
                { opacity: contentReady ? 1 : 0 }
              ]}


              onMessage={(event) => {
                let msg;
                try {
                  msg = JSON.parse(event.nativeEvent.data);
                } catch {
                  return;
                }

                const rawX = Number.isFinite(msg.x) ? msg.x : 0;
                const rawY = Number.isFinite(msg.y) ? msg.y : 0;

                const x = rawX - webLayout.current.x;
                const y = rawY - webLayout.current.y;


                if (msg.type === 'WEB_READY') {
                  setWebReady(true);
                  return;
                }

                if (msg.type === 'SELECT') {
                  setSelectedText(msg.text || '');
                  setFloatingPos({ x, y });
                  setActionMode('save');
                  setFloatingVisible(true);
                  return;
                }

                if (msg.type === 'HIGHLIGHT_CLICK') {
                  setSelectedText(msg.text || '');
                  setFloatingPos({ x, y });
                  setActionMode('delete');
                  setFloatingVisible(true);
                  return;
                }

                if (msg.type === 'CLEAR_SELECTION') {
                  setFloatingVisible(false);
                  setSelectedText('');
                  setActionMode(null);
                  return;
                }

                if (msg.type === 'PAGE_CHANGE' && scrollMode) {
                  setCurrentPage(msg.page);
                  return;
                }

                if (msg.type === 'SCROLL_POS') {
                  setLastScrollY(msg.y);
                  return;
                }

                if (msg.type === 'SAVE_RATIO') {
                  readingPos.current = {
                    pageIndex: currentPage,
                    offsetRatio: msg.ratio
                  };
                }
              }}


            />
          </View>
        )}

      </View>





      {actionVisible && (
        <View style={styles.selectionBar}>
          <TouchableOpacity onPress={() => { setActionVisible(false); setSelectedText(''); }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={() => { setActionVisible(false); setNotePopupVisible(true); }}>
            <Text style={{ color: '#fff' }}>Save Note</Text>
          </TouchableOpacity>
        </View>
      )}

      {!fullscreen && (
        <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
          {/* Footer এর Previous বাটন */}
          <TouchableOpacity
            onPress={() => {
              const targetPage = currentPage - 1;
              if (targetPage >= 0) {
                // ১. আগে স্টেট আপডেট করুন (খুবই গুরুত্বপূর্ণ)
                setCurrentPage(targetPage);

                // ২. এবার মোড অনুযায়ী অ্যাকশন নিন
                if (scrollMode) {
                  webRef.current?.injectJavaScript(`
          (function() {
            var target = document.querySelector('[data-page="${targetPage}"]');
            if(target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          })();
          true;
        `);
                }
              }
            }}
            disabled={currentPage === 0}
          >
            <Ionicons name="chevron-back" size={24} color={currentPage === 0 ? "#ccc" : "#3b2f1b"} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setGoVisible(true)}>
            <Text style={styles.pageIndicator}>{currentPage + 1} / {pages.length}</Text>
          </TouchableOpacity>

          {/* 🔹 View Saved Notes List Button */}
          <TouchableOpacity onPress={() => setNotesListVisible(true)}>
            <Ionicons name="document-text-outline" size={22} color="#3b2f1b" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setBookmarksVisible(true)}>
            <Ionicons name="bookmarks-outline" size={22} color="#3b2f1b" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              const newList = bookmarks.includes(currentPage)
                ? bookmarks.filter(x => x !== currentPage)
                : [...bookmarks, currentPage];
              saveBookmarks(newList);
            }}
          >
            <Ionicons
              name={bookmarks.includes(currentPage) ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color="#6b4f2d"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setListVisible(true)}>
            <Ionicons name="add-circle-outline" size={22} color="#3b2f1b" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNext}
            disabled={currentPage === pages.length - 1}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={currentPage === pages.length - 1 ? "#ccc" : "#3b2f1b"}
            />
          </TouchableOpacity>
        </View>
      )}



      {/* MODAL: AUTO SCROLL SPEED */}
      <Modal
        visible={speedModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSpeedModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: 260 }]}>

            <Text style={{ fontWeight: 'bold', marginBottom: 10, color: '#6b4f2d' }}>
              Auto Scroll Speed
            </Text>


            <Slider
              minimumValue={1}
              maximumValue={2}
              step={0.05}
              value={speedX}
              onValueChange={(val) => {
                const rounded = Number(val.toFixed(2));
                setSpeedX(rounded);
                setAutoScrollSpeed(0.2 * rounded); // 🔑 mapping
              }}
              minimumTrackTintColor="#6b4f2d"
              maximumTrackTintColor="#ccc"
            />

            <TouchableOpacity
              onPress={() => setSpeedModalVisible(false)}
              style={{ alignSelf: 'flex-end', marginTop: 10 }}
            >
              <Text style={{ color: '#6b4f2d' }}>Done</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>


      {floatingVisible && (
        <View
          style={[
            styles.floatingBar,
            {
              top: Math.max(10, floatingPos.y - 50),
              left: Math.max(10, floatingPos.x - 80),

            },
          ]}
        >
          <TouchableOpacity onPress={() => {
            setFloatingVisible(false);
            setSelectedText('');
          }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          {actionMode === 'save' && (
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => {
                setFloatingVisible(false);
                setNotePopupVisible(true);
              }}
            >
              <Text style={{ color: '#fff' }}>Save</Text>
            </TouchableOpacity>
          )}

          {actionMode === 'delete' && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => {
                removeNote(parsedBook.id, 'quotesByText', selectedText);
                setFloatingVisible(false);
              }}
            >
              <Text style={{ color: '#fff' }}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}



      {/* MODAL: ADD NOTE */}
      <Modal visible={notePopupVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TextInput placeholder="Note title" value={noteTitle} onChangeText={setNoteTitle} style={styles.titleInput} />
            <TextInput placeholder="Short note..." value={noteText} onChangeText={setNoteText} multiline style={styles.noteInput} />
            <View style={styles.quoteBox}><Text style={styles.quoteText}>“{selectedText}”</Text></View>
            <TouchableOpacity
              style={styles.goBtn}


              onPress={async () => {
                // ১. নোটটি সেভ করুন
                await addNote(parsedBook.id, 'book', 'quotes', {
                  title: noteTitle || 'Note',
                  content: noteText,
                  ref: { page: currentPage, text: selectedText, bookTitle: parsedBook.title },
                });

                // ২. সরাসরি হাইলাইট ফাংশনটি কল করুন (যাতে সাথে সাথে দেখা যায়)
                // এটিই প্রথম নোটের সমস্যা সমাধান করবে
                const injectCode = `
                  if (typeof highlight === 'function') {
                    highlight(${JSON.stringify(selectedText)});
                  }
                  true;
                  `;
                webRef.current?.injectJavaScript(injectCode);

                // ৩. স্টেট ক্লিয়ার করুন
                setNoteTitle('');
                setNoteText('');
                setSelectedText('');
                setNotePopupVisible(false);
              }}
            >
              <Text style={{ color: '#fff' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: LIST OF NOTES / CHAPTERS / BOOKMARKS */}
      <Modal transparent visible={chaptersVisible || bookmarksVisible || notesListVisible} animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => { setChaptersVisible(false); setBookmarksVisible(false); setNotesListVisible(false); }}>
          <View style={styles.chapterSidebar}>
            <Text style={styles.chapterHeader}>
              {chaptersVisible ? 'সূচিপত্র' : bookmarksVisible ? 'বুকমার্কস' : 'নোটসমূহ'}
            </Text>

            <ScrollView>
              {chaptersVisible && chapters.map((c, i) => (
                <TouchableOpacity key={i} style={styles.chapterItem} onPress={() => { jumpToPage(c.pageIndex); setChaptersVisible(false); }}>
                  <Text style={styles.chapterTitle}>{c.title}</Text>
                  <Text style={styles.chapterPage}>Page {c.pageIndex + 1}</Text>
                </TouchableOpacity>
              ))}

              {bookmarksVisible && bookmarks.map((p, i) => (
                <TouchableOpacity key={i} style={styles.chapterItem} onPress={() => { jumpToPage(p);; setBookmarksVisible(false); }}>
                  <Text style={styles.chapterTitle}>Page {p + 1}</Text>
                </TouchableOpacity>
              ))}

              {/* 🔹 Render Notes List with Delete Button */}
              {notesListVisible && (library?.notes?.[parsedBook.id]?.quotes || []).map((n, i) => (
                <View key={i} style={styles.chapterItem}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
                      jumpToPage(n.ref.page);
                      setNotesListVisible(false);
                    }}

                  >
                    <View>
                      <Text style={styles.chapterTitle} numberOfLines={1}>{n.title}</Text>
                      <Text style={[styles.chapterPage, { fontStyle: 'italic', color: n.ref.color || 'gray' }]} numberOfLines={1}>
                        "{n.ref.text}"
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* ডিলিট বাটন */}
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        "নোট ডিলিট",
                        "আপনি কি নিশ্চিতভাবে এই নোটটি ডিলিট করতে চান?",
                        [
                          { text: "বাতিল", style: "cancel" },
                          {
                            text: "ডিলিট",
                            onPress: () => removeNote(parsedBook.id, 'quotes', n.id),
                            style: "destructive"
                          }
                        ]
                      );
                    }}
                    style={{ padding: 10 }}
                  >
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* REST OF THE MODALS (Jump to Page, Add to Booklist) */}
      <Modal transparent visible={goVisible} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setGoVisible(false)}>
          <View style={styles.popupSmall}>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>পৃষ্ঠায় যান</Text>
            <TextInput style={styles.input} keyboardType="number-pad" placeholder="পৃষ্ঠা নম্বর লিখুন" autoFocus value={goInput} onChangeText={setGoInput} />
            <TouchableOpacity
              style={styles.goBtn}
              onPress={() => {
                const p = Number(goInput) - 1;
                if (p >= 0 && p < pages.length) {
                  if (scrollMode) {
                    webRef.current?.injectJavaScript(`
          document.querySelector('[data-page="${p}"]')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          true;
        `);
                  } else {
                    setCurrentPage(p);
                  }
                }
                setGoVisible(false);
                setGoInput('');
              }}
            >

              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Modal transparent visible={listVisible} animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setListVisible(false)}>
          <View style={styles.chapterSidebar}>
            <Text style={styles.chapterHeader}>📚 Save to Booklist</Text>
            <View style={{ flexDirection: 'row', marginBottom: 15 }}>
              <TextInput placeholder="New booklist name" value={newListName} onChangeText={setNewListName} style={[styles.input, { flex: 1 }]} />
              <TouchableOpacity onPress={async () => { if (!newListName.trim()) return; await createBooklist(newListName); setNewListName(''); }} style={{ marginLeft: 10, backgroundColor: '#6b4f2d', paddingHorizontal: 15, justifyContent: 'center', borderRadius: 6 }}>
                <Text style={{ color: '#fff' }}>Create</Text>
              </TouchableOpacity>
            </View>
            {Object.entries(library?.booklists || {}).map(([id, list]) => {
              const added = list.items.includes(parsedBook.id);
              return (
                <TouchableOpacity key={id} style={styles.chapterItem} onPress={() => added ? removeFromBooklist(id, parsedBook.id) : addToBooklist(id, parsedBook.id)}>
                  <Text style={styles.chapterTitle}>{list.title}</Text>
                  <Ionicons name={added ? 'checkmark-circle' : 'add-circle-outline'} size={22} color={added ? '#6b4f2d' : 'gray'} />
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5dc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ede6d1',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
  },
  webview: { flex: 1, backgroundColor: '#f5f5dc', },
  compactSettings: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
  },
  controlBtn: { paddingHorizontal: 8, fontWeight: 'bold', color: '#3b2f1b' },
  iconBtn: { padding: 5 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#ede6d1',
  },
  pageIndicator: { fontWeight: 'bold', color: '#3b2f1b', fontSize: 16 },
  selectorCompact: {
    paddingHorizontal: 8,
    borderLeftWidth: 1,
    borderColor: '#ccc',
    marginLeft: 5,
  },
  selectorText: { fontSize: 12, color: '#3b2f1b' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignSelf: 'center',
  },
  popupSmall: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '70%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    textAlign: 'center',
  },
  goBtn: {
    backgroundColor: '#6b4f2d',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 10
  },
  chapterSidebar: {
    width: '75%',
    height: '100%',
    backgroundColor: '#f5f5dc',
    padding: 20,
    paddingTop: 50,
  },
  chapterHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#3b2f1b',
  },
  chapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center'
  },
  chapterTitle: { fontSize: 16, color: '#3b2f1b', fontWeight: '500' },
  chapterPage: { fontSize: 12, color: 'gray' },
  selectionBar: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    elevation: 5,
  },
  saveBtn: {
    backgroundColor: '#6b4f2d',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelText: { color: '#999', fontSize: 16 },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '85%',
    alignSelf: 'center',
  },
  titleInput: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    fontSize: 16,
    color: '#3b2f1b',
    padding: 5
  },
  noteInput: {
    borderColor: '#ddd',
    color: '#3b2f1b',
    minHeight: 60,
    textAlignVertical: 'top'
  },
  quoteBox: {
    marginTop: 15,
    padding: 10,
    borderLeftWidth: 4,
    borderColor: '#6b4f2d',
    backgroundColor: '#f9f6ef',
  },
  quoteText: { fontStyle: 'italic', color: '#3b2f1b' },
  spreadContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#e0d5c1',
  },
  singlePage: {
    flex: 1,
    height: '100%',
    backgroundColor: '#fdfaf1',
    marginHorizontal: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '50%',
  },
  webviewPage: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  floatingBar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  deleteBtn: {
    backgroundColor: '#c0392b',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    marginLeft: 10,
  },

});