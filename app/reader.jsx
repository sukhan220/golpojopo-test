

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



import BookLoader from "@/components/animations/BookLoader";
import AddNoteModal from "@/components/reader/AddNoteModal";
import BooklistModal from "@/components/reader/BooklistModal";
import ChapterSidebar from "@/components/reader/ChapterSidebar";
import FontSelector from '@/components/reader/FontSelector';
import JumpPageModal from '@/components/reader/JumpPageModal';
import LandscapeOverlay from '@/components/reader/LandscapeOverlay'; // আপনার সঠিক পাথ দিন
import styles from '@/components/reader/Reader.style';
import SpeedModal from "@/components/reader/SpeedModal";
import ZoomWrapper from "@/components/reader/ZoomWrapper";
import { generateSinglePageHTML, htmlContent } from '@/constants/web';
import { useLibrary } from '@/context/libraryContext';
import SPEED_MAP from '@/utils/speedMap';
import { Ionicons } from '@expo/vector-icons';
import PageFlipper from '@laffy1309/react-native-page-flipper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const GOLD = '#D4AF37';


// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [currentPage, setCurrentPage] = useState(1);
  const [Leaf, setLeaf] = useState(1);

  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState('serif');
  const [autoScroll, setAutoScroll] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);



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

  const [selectionData, setSelectionData] = useState(null);

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

  const [autoScrollSpeed, setAutoScrollSpeed] = useState(0.2);
  const [speedX, setSpeedX] = useState(1);
  const [speedModalVisible, setSpeedModalVisible] = useState(false);

  const [lastScrollY, setLastScrollY] = useState(0);
  const restoringRef = useRef(false);


  const [isLandscape, setIsLandscape] = useState(false);
  const [isSpreadMode, setIsSpreadMode] = useState(false);
  const [jumpVisible, setJumpVisible] = useState(false);

  // ১. স্টেট এবং টাইমার ডিক্লেয়ার করুন (কম্পোনেন্টের শুরুতে)
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayTimer = useRef(null);



  const baseFontSize = useRef(fontSize);
  const prevReaderState = useRef(null);
  const [contentReady, setContentReady] = useState(false);

  const HIGHLIGHT_COLORS = ['#ffe58a', '#ffadad', '#adffb4', '#adc4ff'];
  // কম্পোনেন্টের ভেতরে:
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0]);
  const [themeIndex, setThemeIndex] = useState(0);
  const [startTheme,setStartTheme]= useState(null);
 
 

  const themes = [
{
  name: 'book',
  bg: '#e0d8c3',
  pageBg: '#fdfaf1',
  text: '#2c1e0f',
  highlightBg: '#ffe58a',
  highlightDarkBg: '#665000',
  highlightDarkText: '#ffffff',
  shadowLight: '0 4px 15px rgba(0,0,0,0.1)',
  shadowDark: '0 4px 15px rgba(0,0,0,0.5)'
},
  { 
    name: 'paper', // আপনার বর্তমান লাইট থিম
    bg: '#d6d1c7', 
    pageBg: '#f4f1ea', // কাগজের মতো হালকা ঘিয়া বা অফ-হোয়াইট
    text: '#2c2c2c'    // একদম কালো নয়, ডার্ক গ্রে যা পড়ার জন্য আরামদায়ক
  },
  { 
    name: 'sepia', // ক্লাসিক ওল্ড বুক ভাইব
    bg: '#c5b08b', 
    pageBg: '#e9dcc9', // পুরনো বইয়ের পাতার কালার
    text: '#433422' 
  },
  { 
    name: 'night', // কিন্ডেল ডার্ক মোড
    bg: '#121212', 
    pageBg: '#1f1f1f', // পিওর ব্ল্যাক নয়, সফট ডার্ক
    text: '#b0b0b0'    // হালকা ছাই রঙের লেখা যা অন্ধকারে চোখের ক্ষতি করে না
  }

  ];

 

  const { width, height } = useWindowDimensions();
  const [zoomActive, setZoomActive] = useState(false);
  const [webSource, setWebSource] = useState({
    html: htmlContent(pages, currentPage, scrollMode, isSpreadMode, fontFamily, fontSize)
  });



  const initialPinchDistance = useRef(0);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;



  const flipperRef = useRef(null);

  const readingPos = useRef({
    pageIndex: 0,
    offsetRatio: 0
  });


// ১. অ্যাপ যখন প্রথম লোড হবে, তখন সেভ করা থিম খুঁজে বের করবে
useEffect(() => {
  const loadSavedTheme = async () => {
    try {
      const savedIndex = await AsyncStorage.getItem('user_theme_index');
      setStartTheme(themes[savedIndex ? Number(savedIndex) : 0]);
      if (savedIndex !== null) {
        setThemeIndex(parseInt(savedIndex));
      }
    } catch (e) {
      console.error("Failed to load theme", e);
    }
  };
  loadSavedTheme();
}, []);

// ২. থিম টগল করার সময় সেটি সেভ করে রাখা
const toggleTheme = async () => {
  const nextIndex = (themeIndex + 1) % themes.length;
  setThemeIndex(nextIndex);
  
  try {
    await AsyncStorage.setItem('user_theme_index', nextIndex.toString());
  } catch (e) {
    console.error("Failed to save theme", e);
  }
};


  // const toggleTheme = () => {
  //   const nextIndex = (themeIndex + 1) % themes.length;
  //   setThemeIndex(nextIndex);

  //   const selectedTheme = themes[nextIndex];
  //   // WebView-তে থিম ডাটা পাঠানো
  //   const js = `window.applyTheme(${JSON.stringify(selectedTheme)}); true;`;
  //   webRef.current?.injectJavaScript(js);
  // };


  const triggerOverlay = () => {
    if (showOverlay) {
      setShowOverlay(false);
      if (overlayTimer.current) {
        clearTimeout(overlayTimer.current);
        overlayTimer.current = null;
      }
    } else {
      setShowOverlay(true);
      if (overlayTimer.current) clearTimeout(overlayTimer.current);
      overlayTimer.current = setTimeout(() => {
        setShowOverlay(false);
        overlayTimer.current = null;
      }, 5000);
    }
  };


  const resetOverlayTimer = () => {
    if (showOverlay) {
      // আগের টাইমার ক্লিয়ার করে নতুন ৫ সেকেন্ড শুরু করবে
      if (overlayTimer.current) clearTimeout(overlayTimer.current);

      overlayTimer.current = setTimeout(() => {
        setShowOverlay(false);
        overlayTimer.current = null;
      }, 5000);
    }
  };

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
    const allNotes = library?.notes?.[parsedBook.id]?.quotes || [];
    if (allNotes.length === 0) return;

    const highlights = allNotes.map(n => ({
      text: n.ref.text,
      startPage: n.ref.startPage,
      endPage: n.ref.endPage,
      startOffset: n.ref.startOffset,
      endOffset: n.ref.endOffset,
      id: n.id
    }));

    // WebView-তে ইনজেক্ট করা
    const jsCode = `
    (function() {
      const list = ${JSON.stringify(highlights)};
      list.forEach(h => window.applySmartHighlight(h));
    })();
    true;
  `;

    // সামান্য ডিলে দিয়ে রান করুন
    setTimeout(() => {
      webRef.current?.injectJavaScript(jsCode);
    }, 800);
  };


  // ল্যান্ডস্কেপের জন্য ডেটা ফরম্যাট করার ফাংশন
  const getSpreadPages = () => {
    const pairs = [];
    for (let i = 0; i < pages.length; i++) {
      pairs.push([pages[i] || ""]);
    }


    return pairs;
  };


  const handleJumpPage = (pageIndex) => {
    // নিশ্চিত করুন ইনডেক্স সঠিক সীমার মধ্যে আছে
    const targetIndex = Math.max(0, Math.min(pageIndex, pages.length - 1));

    console.log(`Jumping to index: ${targetIndex}`);

    if (scrollMode) {
      // scrollIntoView এর জন্য সরাসরি targetIndex ব্যবহার করুন
      const jsCode = `
      (function() {
        const element = document.querySelector('[data-page="${targetIndex}"]');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      })();
      true;
    `;
      webRef.current?.injectJavaScript(jsCode);
    } else {
      // পেজ মোডে স্টেট আপডেট
      setCurrentPage(targetIndex);
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


  const handleNext = () => {
    if (scrollMode) {
      setCurrentPage(currentPage + 1)
      handleJumpPage(currentPage);
    } else {
      goNextPage();
    }
  };



  const handlePrev = () => {

    if (currentPage < 1) return;

    if (scrollMode) {

      const prev = currentPage - 2;
      console.log("ii" + " " + prev)
      setCurrentPage(prev);
      handleJumpPage(prev);
    } else {

      setCurrentPage(prev);
    }
  };


  // আপনার React Native কম্পোনেন্টের ভেতরে
useEffect(() => {
  if (themes[themeIndex]) {
    const selectedTheme = themes[themeIndex];
    // window.applyTheme আপনার htmlContent এর ভেতরে অলরেডি লেখা আছে
    const js = `window.applyTheme(${JSON.stringify(selectedTheme)}); true;`;
    webRef.current?.injectJavaScript(js);
  }
}, [themeIndex]); // শুধু themeIndex পরিবর্তন হলে এটি চলবে




  useEffect(() => {
    setContentReady(false);
    setWebSource({
      html: htmlContent(
        pages,
        currentPage,
        scrollMode,
        isSpreadMode,
        fontFamily,
        fontSize
      )
    });
  }, [pages, scrollMode, isSpreadMode, fontFamily, fontSize]);




  useEffect(() => {
    initialPinchDistance.current = 0;
  }, [width, height]);


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

    // স্মার্ট ডাটা ম্যাপ করা
    const highlightData = allNotes.map(n => ({
      text: n.ref.text,
      startPage: n.ref.startPage,
      endPage: n.ref.endPage,
      startOffset: n.ref.startOffset,
      endOffset: n.ref.endOffset,
      id: n.id
    }));

    // হাইলাইট ইনজেকশন লজিক
    setTimeout(() => {


      webRef.current?.injectJavaScript(`
      (function() {
        const hData = ${JSON.stringify(highlightData)};
         hData.forEach(h => applySmartHighlight(h));
      })();
      true;
    `);
    }, 800); // DOM সেটেল হওয়ার জন্য কিছুটা সময় দিন

  }, [library, webReady, currentPage, scrollMode]);




  useEffect(() => {
    const history = library?.history?.[parsedBook.id];
    if (history?.page !== undefined) {
      setCurrentPage(history.page);
    }
  }, [library]);





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

    setCurrentPage(history.page);

    setTimeout(() => {
      handleJumpPage(currentPage);
    }, 1000);


    if (!history) {
      setContentReady(true); // হিস্ট্রি না থাকলেও কন্টেন্ট দেখাও
      return;
    }

    restoringRef.current = true;

    if (scrollMode && history.scrollY !== undefined) {
      // এখানে ডিলে একটু বাড়িয়ে দিন যাতে DOM তৈরি হওয়ার সময় পায়
      setTimeout(() => {
        webRef.current?.injectJavaScript(`
        window.__RESTORING__ = true;
        window.scrollTo({ top: ${history.scrollY}, behavior: 'auto' });
        setTimeout(() => { window.__RESTORING__ = false; }, 500);
        true;
      `);
        setContentReady(true); // কন্টেন্ট দেখানোর পারমিশন
      }, 250);
    } else if (!scrollMode && history.page !== undefined) {
      setCurrentPage(history.page);
      setContentReady(true);
    } else {
      setContentReady(true);
    }
  }, [webReady, pages.length, scrollMode]);


  useEffect(() => {
    if (webReady && webRef.current) {
      webRef.current.injectJavaScript(`
      window.updateCurrentPage(${currentPage});
      true;
    `);
    }
  }, [currentPage]);



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





  // landscape ↔ portrait swap listener
  const handleOrientationChange = (newOrientation) => {
    if (!webRef.current) return;

    // পুরানো scroll/zoom save করা
    const { scrollY, zoom } = prevReaderState.current;

    // content update না করে, scroll & zoom restore
    webRef.current.injectJavaScript(`
    window.__RESTORING__ = true;
    window.scrollTo({ top: ${scrollY}, behavior: 'auto' });
    window.setZoom(${zoom});
    window.__RESTORING__ = false;
    true;
  `);
  };

  const handleZoom = (level) => {
    const js = `window.setZoom(${level}); true;`;
    webRef.current?.injectJavaScript(js);
  };

  useEffect(() => {
    const sub = ScreenOrientation.addOrientationChangeListener(async (event) => {
      const o = event.orientationInfo.orientation;
      const landscape =
        o === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

      // ১. পোর্টেট থেকে ল্যান্ডস্কেপে যাওয়ার সময় পজিশন সেভ
      if (!isLandscape && landscape) {
        setFloatingVisible(false)
        setSelectedText('')
        setActionMode(null)
        saveReadingPosition(); // এটি বর্তমান স্ক্রল পজিশন সেভ করবে
        StatusBar.setHidden(true, 'fade');
        setFullscreen(true);
      }

      // ২. ল্যান্ডস্কেপ থেকে পোর্টেটে ফেরার সময় স্ট্যাটাস বার শো করা
      if (!landscape && isLandscape) {
        setFloatingVisible(false)
        setSelectedText('')
        setActionMode(null)
        setWebSource({
          html: htmlContent(
            pages,
            currentPage,
            scrollMode,
            isSpreadMode,
            fontFamily,
            fontSize
          )
        });



        StatusBar.setHidden(false, 'fade');
        setFullscreen(false);
      }

      setIsLandscape(landscape);

      // ল্যান্ডস্কেপ মোড সেটআপ
      if (landscape && !isSpreadMode) {
        prevReaderState.current = {
          scrollMode,
          autoScroll,
          fontSize,
          currentPage,
          scrollY: lastScrollY, // পোর্টেট মোডের শেষ স্ক্রল পজিশন
        };
        setIsSpreadMode(true);
        setScrollMode(false); // ল্যান্ডস্কেপে আমরা ফ্লিপ মোড চাই
        setAutoScroll(false);
      }

      // ৩. ল্যান্ডস্কেপ থেকে পোর্টেটে ফিরে আসার রিস্টোরেশন লজিক
      if (!landscape && isSpreadMode) {
        // অ্যানিমেশন ও জুম রিসেট
        scale.setValue(1);
        translateX.setValue(0);
        translateY.setValue(0);
        scaleValue.current = 1;
        setZoomActive(false);

        const prev = prevReaderState.current;
        setIsSpreadMode(false);

        if (prev) {
          // স্টেট রিস্টোর
          setScrollMode(prev.scrollMode);
          setAutoScroll(prev.autoScroll);
          setFontSize(prev.fontSize);
          setCurrentPage(prev.currentPage);

          // WebView রি-রেন্ডার ট্রিগার
          setContentReady(false);
          setWebReady(false);

          setTimeout(() => {
            setContentReady(true);
            setWebReady(true);

            // কন্টেন্ট রেন্ডার হওয়ার জন্য সামান্য সময় দিন
            setTimeout(() => {
              if (prev.scrollMode && prev.scrollY !== undefined) {
                // পিক্সেল পজিশনে রিস্টোর
                webRef.current?.injectJavaScript(`
                (function() {
                  window.__RESTORING__ = true;
                  window.scrollTo({ top: ${prev.scrollY}, behavior: 'auto' });
                  setTimeout(() => { window.__RESTORING__ = false; }, 500);
                })();
                true;
              `);
              } else {
                // পেজ মোড হলে নির্দিষ্ট পেজে জাম্প
                handleJumpPage(prev.currentPage);
              }
            }, 400); // কন্টেন্ট মাউন্ট হওয়ার ওয়েট টাইম
          }, 100);
        }
      }
    });

    return () => ScreenOrientation.removeOrientationChangeListener(sub);
  }, [isSpreadMode, scrollMode, autoScroll, fontSize, currentPage, isLandscape, lastScrollY]);

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

  useEffect(() => {
    if (isLandscape) {
      // অ্যান্ড্রয়েডের জন্য ইমারসিভ মোড
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("sticky-swipe");
    } else {
      NavigationBar.setVisibilityAsync("visible");
    }
  }, [isLandscape]);

  const saveBookmarks = async (newList) => {
    setBookmarks(newList);
    await AsyncStorage.setItem(`marks_${parsedBook.title}`, JSON.stringify(newList));
  };

  const totalLeaves = Math.ceil(pages.length / 2);
  const currentLeafIndex = Math.floor(currentPage / 2) + 1;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <BookLoader visible={!isLandscape} />
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

          <ZoomWrapper
            onZoomChange={(isZoomed) => {
              setZoomActive(isZoomed); // এটি আপনার মেইন ফাইলের স্টেট আপডেট করবে
              if (isLandscape) {
                StatusBar.setHidden(true);
              }
            }}

          >

            <PageFlipper
              ref={flipperRef}
              data={getSpreadPages()}
              enabled={!zoomActive}
              pressable={!zoomActive}
              swipeDistance={zoomActive ? width * 10 : 20}
              pageSize={{ width: width - 200, height: height + 250 }}
              initialPage={Math.floor(currentPage / 2)}



              onFlippedEnd={(index) => {
                // index হলো স্প্রেড ইনডেক্স (যেমন: 0, 1, 2...)
                // প্রতি স্প্রেডে ২টা পেজ থাকে, তাই current page হবে index * 2
                const newPage = index * 2;



                if (newPage < pages.length) {
                  setCurrentPage(newPage);
                  scrollToPage(newPage);

                  prevReaderState.current.currentPage = newPage;

                }


              }}

              renderPage={(item) => (
                <View style={styles.spreadContainer}>
                  <View style={styles.singlePage}>
                    <WebView
                      source={{
                        html: generateSinglePageHTML(item[0], fontFamily, 10),
                      }}

                      onMessage={(event) => {
                        try {
                          const data = JSON.parse(event.nativeEvent.data);

                          if (data.type === 'SINGLE_TAP') {
                            if (!zoomActive) {
                              triggerOverlay();
                            }


                          }

                          if (data.type === 'DOUBLE_TAP') {
                            // ডাবল ট্যাপে কোনো অ্যাকশন নিতে চাইলে এখানে লিখুন
                            console.log('Double Tapped at:', data.x, data.y);
                          }

                          if (data.type === 'CHANGE_THEME') {
                            // আপনার থিম পরিবর্তনের ফাংশনটি এখানে কল করুন
                            // toggleTheme();

                            console.log("move");
                            toggleTheme();

                            // একটি ছোট ভাইব্রেশন দিতে পারেন ফিডব্যাক হিসেবে
                            // Vibration.vibrate(50); 
                            return;
                          }

                        } catch (e) {
                          // যদি মেসেজটি JSON না হয় (যেমন সাধারণ স্ট্রিং 'tap')
                          if (event.nativeEvent.data === 'tap') {
                            triggerOverlay();
                          }
                        }
                      }}
                      scrollEnabled={false}
                      style={styles.webviewPage}
                    />
                  </View>
                </View>
              )}
 
            />


            {/* ল্যান্ডস্কেপ ওভারলে UI */}
            {isLandscape && (
              <LandscapeOverlay
                showOverlay={showOverlay}
                zoomActive={zoomActive}
                insets={insets}
                currentLeafIndex={currentLeafIndex}
                totalLeaves={totalLeaves}
                currentPage={currentPage}
                pages={pages}
                GOLD={GOLD}
                flipperRef={flipperRef}
                setCurrentPage={setCurrentPage}
                resetOverlayTimer={resetOverlayTimer}
                overlayTimer={overlayTimer}
              />
            )}

          </ZoomWrapper>

        ) : (

          <View
            style={{ flex: 1 }}
            onLayout={(e) => {
              webLayout.current = e.nativeEvent.layout;
            }}
          >

            <BookLoader visible={!contentReady} />


            <WebView

              ref={webRef}
              // key={`${fontSize}`}

              originWhitelist={['*']}
              source={{
                html: htmlContent(pages, 0, scrollMode, isSpreadMode, fontFamily, fontSize,startTheme)
              }}

              // scrollEnabled={scrollMode}
              nestedScrollEnabled={scrollMode}

              // pointerEvents={isSpreadMode ? 'none' : 'auto'}
              scrollEnabled={scrollMode && !zoomActive}
              scalesPageToFit={true}

              showsVerticalScrollIndicator={false}

              // scalesPageToFit={Platform.OS === 'android'}
              setBuiltInZoomControls={false} // ব্রাউজারের কুৎসিত বাটন লুকানোর জন্য
              setDisplayZoomControls={false}

              androidLayerType="hardware"
              swipeDistance={60}

              textZoom={100}          // 🔥 Android font shrink fix
              javaScriptEnabled

              onLoadStart={() => {
                // scrollToPage(currentPage);
                setContentReady(false);





              }}


              onLoadEnd={() => {
                setWebReady(true);
                setContentReady(true);

                requestAnimationFrame(() => {


                  // applyHighlights();
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
                { opacity: contentReady ? 1 : 0, backgroundColor: '#e0d5c1' }
              ]}

              containerStyle={{ backgroundColor: '#e0d5c1' }}




              onMessage={(event) => {
                let msg;
                try {
                  msg = JSON.parse(event.nativeEvent.data);
                } catch {
                  return;
                }

                // স্ক্রিন লেআউট অনুসারে সঠিক পজিশন ক্যালকুলেশন
                const rawX = Number.isFinite(msg.x) ? msg.x : 0;
                const rawY = Number.isFinite(msg.y) ? msg.y : 0;
                const x = rawX - (webLayout.current?.x || 0);
                const y = rawY - (webLayout.current?.y || 0);

                // ১. WebView রেডি হলে হাইলাইট এবং পেজ জাম্প
                if (msg.type === 'WEB_READY') {
                  setWebReady(true);
                  setTimeout(() => {
                    handleJumpPage(currentPage);
                    // applyHighlights(); // আপনার বিদ্যমান ফাংশন
                  }, 500);
                  return;
                }

                // ২. টেক্সট সিলেক্ট করলে স্মার্ট ডেটাসহ সেভ মোড
                if (msg.type === 'SELECT') {
                  setSelectedText(msg.text || '');
                  setFloatingPos({ x, y }); // ক্যালকুলেটেড x, y ব্যবহার করা হয়েছে

                  // স্মার্ট হাইলাইটিংয়ের জন্য সব তথ্য সেভ করা হচ্ছে
                  setSelectionData({
                    text: msg.text,
                    startPage: msg.startPage,
                    endPage: msg.endPage,
                    startOffset: msg.startOffset,
                    endOffset: msg.endOffset
                  });



                  setActionMode('save');
                  setFloatingVisible(true);
                  return;
                }



                // ৪. বিদ্যমান হাইলাইটে ক্লিক করলে ডিলিট মোড
                if (msg.type === 'HIGHLIGHT_CLICK') {

                  const { id, text, x, y } = msg; // WebView থেকে পাঠানো আইডি রিসিভ করা

                  console.log("jj" + id);

                  setSelectedText(text || '');
                  setFloatingPos({ x, y });
                  setActionMode('delete');


                  // setSelectionData(id);
                  setSelectionData({ id: id });

                  setTimeout(() => {
                    setFloatingVisible(true);
                  }, 30);

                  return;
                }


                if (msg.type === 'CHANGE_THEME') {
                  // আপনার থিম পরিবর্তনের ফাংশনটি এখানে কল করুন
                  // toggleTheme();

                  console.log("move");
                  toggleTheme();

                  // একটি ছোট ভাইব্রেশন দিতে পারেন ফিডব্যাক হিসেবে
                  // Vibration.vibrate(50); 
                  return;
                }


                // // ৫. স্ক্রল পজিশন ট্র্যাক করা
                // if (msg.type === 'MARK') {
                //   console.log(msg.html + "hha");

                // }


                // ৫. স্ক্রল পজিশন ট্র্যাক করা
                if (msg.type === 'SCROLL_POS') {
                  setLastScrollY(msg.y);
                  return;
                }

                // ৬. পেজ পরিবর্তন ট্র্যাক করা
                if (msg.type === 'PAGE_TRACK') {
                  if (msg.current !== undefined && msg.current !== currentPage) {
                    setCurrentPage(msg.current);
                  }
                  return;
                }

                // ৭. পেজ পজিশন ডেটা (যদি লাগে)
                if (msg.type === "PAGE_POSITIONS") {
                  // const positions = msg.positions; // প্রয়োজনে ব্যবহার করতে পারেন
                }



                // ৮. রিডিং রেশিও সেভ করা (পজিশন রিস্টোর করার জন্য)
                if (msg.type === 'SAVE_RATIO') {
                  readingPos.current = {
                    pageIndex: currentPage,
                    offsetRatio: msg.ratio
                  };
                }

                // ৯. ডাবল ট্যাপে ফুলস্ক্রিন এবং ওরিয়েন্টেশন চেঞ্জ
                if (msg.type === 'DOUBLE_TAP') {
                  const nextFullscreen = !fullscreen;
                  setFullscreen(nextFullscreen);

                  if (nextFullscreen) {
                    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
                    NavigationBar.setVisibilityAsync("hidden");
                    NavigationBar.setBehaviorAsync("sticky-swipe");
                  } else {
                    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
                    NavigationBar.setVisibilityAsync("visible");
                    setTimeout(() => {
                      ScreenOrientation.unlockAsync();
                    }, 500);
                  }
                  return;
                }

                // ১০. সিঙ্গেল ট্যাপে মেনু বা ওভারলে ট্রিগার
                if (msg.type === 'SINGLE_TAP') {
                  if (floatingVisible) {
                    setFloatingVisible(false);
                  } else {
                    triggerOverlay();
                  }
                  return;
                }
              }}


            />
          </View>
        )}

      </View>





      {
        actionVisible && (
          <View style={styles.selectionBar}>
            <TouchableOpacity onPress={() => { setActionVisible(false); setSelectedText(''); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={() => { setActionVisible(false); setNotePopupVisible(true); }}>
              <Text style={{ color: '#fff' }}>Save Note</Text>
            </TouchableOpacity>
          </View>
        )
      }

      {
        !fullscreen && (
          <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={handlePrev}
                disabled={currentPage === 1}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={currentPage === 1 ? "#ccc" : "#3b2f1b"}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setJumpVisible(true)}>
                <Text>{currentPage} / {pages.length}</Text>
              </TouchableOpacity>

              <JumpPageModal
                visible={jumpVisible}
                onClose={() => setJumpVisible(false)}
                pagesLength={pages.length}
                onJump={handleJumpPage}
              />


            </View>

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
              disabled={currentPage === pages.length}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={currentPage === pages.length ? "#ccc" : "#3b2f1b"}
              />
            </TouchableOpacity>
          </View>
        )
      }


      <SpeedModal
        visible={speedModalVisible}
        speedX={speedX}
        setSpeedX={setSpeedX}
        setAutoScrollSpeed={setAutoScrollSpeed}
        onClose={() => setSpeedModalVisible(false)}
      />


      {floatingVisible && (
        <View style={[styles.contextMenu, {
          top: Math.max(10, floatingPos.y - 60),
          left: Math.max(10, floatingPos.x - 60)
        }]}>

          {actionMode === 'save' && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setFloatingVisible(false)
                setNotePopupVisible(true)
              }}
            >
              <Text style={{ color: '#fff' }}>Note</Text>
            </TouchableOpacity>
          )}

          {actionMode === 'delete' && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                // ১. আইডি দিয়ে সরাসরি খোঁজা (সবচেয়ে নির্ভুল পদ্ধতি)
                const notes = library?.notes?.[parsedBook.id]?.quotes || [];

                const targetId = selectionData?.id;
                console.log(targetId);

                const found = notes.find(n => n.id === targetId);



                if (found) {
                  // ২. ডাটাবেজ থেকে রিমুভ করা
                  removeNote(parsedBook.id, 'quotes', found.id);

                  // ৩. WebView থেকে হাইলাইটটি সাথে সাথে মুছে ফেলা (যাতে পেজ রিফ্রেশ না লাগে)
                  const injectJS = `
          if (window.removeHighlight) {
            window.removeHighlight("${found.id}");
          }
          true;
        `;
                  webRef.current?.injectJavaScript(injectJS);
                }

                setFloatingVisible(false);
              }}


            >
              <Text style={{ color: '#ff6b6b' }}>Delete</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setFloatingVisible(false)}
          >
            <Text style={{ color: '#aaa' }}>Cancel</Text>
          </TouchableOpacity>

        </View>
      )}

      {/* MODAL: ADD NOTE */}
      <AddNoteModal
        visible={notePopupVisible}
        noteTitle={noteTitle}
        setNoteTitle={setNoteTitle}
        noteText={noteText}
        setNoteText={setNoteText}
        selectedText={selectedText}

        // 🔥 নতুন এবং গুরুত্বপূর্ণ প্রপ
        selectionData={selectionData}

        currentPage={currentPage}
        parsedBook={parsedBook}
        webRef={webRef}
        addNote={addNote}
        setSelectedText={setSelectedText}
        setNotePopupVisible={setNotePopupVisible}
      />

      {/* MODAL: LIST OF NOTES / CHAPTERS / BOOKMARKS */}
      <ChapterSidebar
        chapters={chapters}
        chaptersVisible={chaptersVisible}
        bookmarksVisible={bookmarksVisible}
        notesListVisible={notesListVisible}
        setChaptersVisible={setChaptersVisible}
        setBookmarksVisible={setBookmarksVisible}
        setNotesListVisible={setNotesListVisible}
        bookmarks={bookmarks}
        library={library}
        parsedBook={parsedBook}
        jumpToPage={jumpToPage}
        removeNote={removeNote}
        webRef={webRef}
      />

      {/* REST OF THE MODALS (Jump to Page, Add to Booklist) */}
      <JumpPageModal
        visible={jumpVisible}
        onClose={() => setJumpVisible(false)}
        pagesLength={pages.length}
        onJump={handleJumpPage}
      />
      <BooklistModal
        visible={listVisible}
        setListVisible={setListVisible}
        newListName={newListName}
        setNewListName={setNewListName}
        library={library}
        parsedBook={parsedBook}
        createBooklist={createBooklist}
        addToBooklist={addToBooklist}
        removeFromBooklist={removeFromBooklist}
      />
    </SafeAreaView >
  );
}
