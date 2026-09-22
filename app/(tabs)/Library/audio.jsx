

// // audio.jsx
// import React, { useEffect, useState } from 'react';
// import {
//     View,
//     Text,
//     FlatList,
//     TouchableOpacity,
//     Image,
//     StyleSheet,
//     ActivityIndicator,
//     Appearance,
//     SafeAreaView,
//     StatusBar,
//     Platform
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { Colors } from '@/constants/Colors';
// import { db } from '@/firebase';
// import { collection, query, where, onSnapshot } from 'firebase/firestore';
// import { Ionicons } from '@expo/vector-icons';

// const colorScheme = Appearance.getColorScheme();
// const themes = colorScheme === 'dark' ? Colors.dark : Colors.light;


// export default function audio() {
//     const route = useRoute();
//     const navigation = useNavigation();
//     const { categoryId, categoryName } = route.params || {};

//     const [writers, setWriters] = useState([]);
//     const [books, setBooks] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedWriter, setSelectedWriter] = useState(null);

//     // ধাপ ১: ক্যাটাগরি আইডি অনুযায়ী লেখক লোড করা
//     useEffect(() => {
//         if (!categoryId) {
//             setLoading(false);
//             return;
//         }

//         const q = query(
//             collection(db, 'writer'),
//             where('cateId', 'array-contains', categoryId)
//         );

//         const unsubscribe = onSnapshot(q, (snapshot) => {
//             const writersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//             setWriters(writersData);
//             setLoading(false);
//             if (writersData.length > 0) {
//                 setSelectedWriter(writersData[0]);
//             } else {
//                 setSelectedWriter(null);
//             }
//         });

//         return () => unsubscribe();
//     }, [categoryId]);

   

//     useEffect(() => {
//         if (!selectedWriter?.id || !categoryId) {
//             setBooks([]);
//             return;
//         }

//         const q = query(
//             collection(db, 'books'),
//             where('writerId', '==', selectedWriter.id),
//             where('cateId', '==', categoryId)
//         );

//         const unsubscribe = onSnapshot(q, (snapshot) => {
//             const booksData = snapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data(),
//                 type: 'audio'
//             }));
//             setBooks(booksData);
//         });

//         return () => unsubscribe();
//     }, [selectedWriter, categoryId]);


//     const handleBookPress = (item) => {
//         navigation.navigate('audioDetails', { book: JSON.stringify(item) });
//     };

//     // লেখককে রেন্ডার করার জন্য FlatList আইটেম
//     const renderWriterItem = ({ item }) => (
//         <TouchableOpacity
//             style={[
//                 styles.writerItemContainer,
//                 selectedWriter?.id === item.id && styles.activeWriterItem
//             ]}
//             onPress={() => setSelectedWriter(item)}
//         >
//             <Image source={{ uri: item.img }} style={styles.writerImgSmall} />
//             <Text style={styles.writerNameSmall}>{item.bn}</Text>
//         </TouchableOpacity>
//     );

//     // বইকে রেন্ডার করার জন্য FlatList আইটেম
//     const renderBookItem = ({ item }) => (
//         <TouchableOpacity
//             style={styles.bookItem}
//             onPress={() => handleBookPress(item)}
//         >
//             <Image source={{ uri: item.artwork }} style={styles.bookImg} />
//             <Text numberOfLines={2} style={styles.bookTitle}>{item.title}</Text>
//             <View style={styles.iconContainer}>
//                 <Ionicons name="play-circle" size={30} color="#f0c400" />
//             </View>
//         </TouchableOpacity>
//     );

//     return (
//         <SafeAreaView style={styles.safeArea}>
//             <View style={styles.headerContainer}>
//                 <TouchableOpacity
//                     style={styles.backButton}
//                     onPress={() => navigation.goBack()}
//                 >
//                     <Ionicons name="arrow-back-outline" size={28} color={themes.text} />
//                 </TouchableOpacity>
//             </View>

//             <View style={styles.container}>
//                 {loading ? (
//                     <ActivityIndicator size="large" color={themes.text} style={styles.loadingIndicator} />
//                 ) : (
//                     <>
//                         <Text style={styles.categoryTitle}>{categoryName} লেখক</Text>
//                         <FlatList
//                             data={writers}
//                             renderItem={renderWriterItem}
//                             keyExtractor={(item) => item.id}
//                             horizontal
//                             showsHorizontalScrollIndicator={false}
//                             contentContainerStyle={styles.writerListContainer}
//                         />
//                         {books.length > 0 ? (
//                             <FlatList
//                                 data={books}
//                                 renderItem={renderBookItem}
//                                 keyExtractor={(item) => item.id}
//                                 numColumns={3}
//                                 columnWrapperStyle={styles.columnWrapper}
//                                 contentContainerStyle={styles.bookList}
//                             />
//                         ) : (
//                             <View style={styles.comingSoonContainer}>
//                                 <Text style={styles.comingSoon}>Coming Soon</Text>
//                             </View>
//                         )}


//                     </>
//                 )}
//             </View>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     safeArea: {
//         flex: 1,
//         backgroundColor: themes.background,
//         paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//     },
//     headerContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'flex-start',
//         paddingHorizontal: 10,
//         paddingVertical: 10,
//     },
//     backButton: {
//         paddingRight: 10,
//     },
//     container: {
//         flex: 1,
//         backgroundColor: themes.background,
//         paddingHorizontal: 20,
//     },
//     writerListContainer: {
//         paddingVertical: 10,
//         gap: 15, // লেখকদের মাঝে gap
//         alignItems: 'center'
//     },
//     writerItemContainer: {
//         flexDirection: 'row',   // ছবি + নাম পাশাপাশি
//         alignItems: 'center',
//         gap: 8,                 // ছবি আর নামের মাঝে ছোট gap
//         backgroundColor: themes.background,
//         padding: 6,
//         borderRadius: 8
//     },
//     writerImgSmall: {
//         width: 50,
//         height: 50,
//         borderRadius: 25,
//         borderWidth: 2,
//         borderColor: '#5a4c62'
//     },
//     writerNameSmall: {
//         fontSize: 15,
//         color: themes.text,
//         fontWeight: '500'
//     },
//     container: {
//         flex: 1,
//         backgroundColor: themes.background,
//         paddingHorizontal: 20,
//         paddingBottom: 10
//     },

//     categoryTitle: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         color: themes.text,
//         textAlign: 'center',
//         marginBottom: 10,
//         paddingTop: 10
//     },
//     bookList: {
//         paddingBottom: 20
//     },
//     columnWrapper: {
//         justifyContent: 'space-between',
//         marginBottom: 15
//     },
//     bookItem: {
//         width: '30%',
//         marginHorizontal: '1.66%',
//         alignItems: 'center',
//         position: 'relative'
//     },
//     bookImg: {
//         width: '100%',
//         aspectRatio: 3 / 4,
//         borderRadius: 8,
//         backgroundColor: '#333'
//     },
//     bookTitle: {
//         fontSize: 14,
//         textAlign: 'center',
//         marginTop: 6,
//         color: themes.text
//     },
//     iconContainer: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: 'rgba(0,0,0,0.4)',
//         borderRadius: 8,
//     },


//     // comingSoonContainer: {
//     //     flex: 1,                // লেখকের নিচে বাকি জায়গা দখল করবে
//     //     justifyContent: 'center',
//     //     alignItems: 'center',
//     // },

//     comingSoonContainer: {
//         flexGrow: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingTop: 20, // লেখকের জন্য জায়গা রেখে
//     },

//     comingSoon: {
//         textAlign: 'center',
//         color: '#999',
//         fontStyle: 'italic',
//         fontSize: 16
//     },


//     loadingIndicator: {
//         flex: 1,
//         justifyContent: 'center'
//     }
// });
import { Colors } from "@/constants/Colors";
import { db } from "@/firebase";

import { Ionicons } from "@expo/vector-icons";

import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";

import {
    collection,
    onSnapshot,
    query,
    where,
} from "firebase/firestore";

import { useEffect, useState } from "react";

import {
    ActivityIndicator,
    Appearance,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    SafeAreaView,
} from "react-native-safe-area-context";


// ======================================================
// Audio Screen
// ======================================================

export default function AudioScreen() {
  const router = useRouter();

  // ====================================================
  // Theme
  // ====================================================

  const colorScheme = Appearance.getColorScheme();

  const themes =
    colorScheme === "dark"
      ? Colors.dark
      : Colors.light;

  // ====================================================
  // Styles
  //
  // IMPORTANT:
  // themes component-এর ভিতরে আছে,
  // তাই styles-ও component-এর ভিতরে তৈরি হবে।
  // ====================================================

  const styles = createStyles(themes);

  // ====================================================
  // Route params
  // ====================================================

  const params = useLocalSearchParams();

  const categoryId = Array.isArray(
    params.categoryId
  )
    ? params.categoryId[0]
    : params.categoryId;

  const categoryName = Array.isArray(
    params.categoryName
  )
    ? params.categoryName[0]
    : params.categoryName;

  // ====================================================
  // State
  // ====================================================

  const [writers, setWriters] = useState([]);

  const [books, setBooks] = useState([]);

  const [loadingWriters, setLoadingWriters] =
    useState(true);

  const [loadingBooks, setLoadingBooks] =
    useState(false);

  const [selectedWriter, setSelectedWriter] =
    useState(null);

  // ====================================================
  // Load writers
  // ====================================================

  useEffect(() => {
    if (!categoryId) {
      setWriters([]);
      setSelectedWriter(null);
      setLoadingWriters(false);

      return;
    }

    setLoadingWriters(true);

    const q = query(
      collection(db, "writer"),
      where(
        "cateId",
        "array-contains",
        categoryId
      )
    );

    const unsubscribe = onSnapshot(
      q,

      (snapshot) => {
        const writersData =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        setWriters(writersData);

        // --------------------------------------------
        // প্রথম লেখক automatically select হবে
        // --------------------------------------------

        setSelectedWriter(
          (currentWriter) => {
            if (writersData.length === 0) {
              return null;
            }

            // আগে যাকে select করা হয়েছিল
            // সে এখনও থাকলে তাকেই রাখবো
            if (currentWriter) {
              const existingWriter =
                writersData.find(
                  (writer) =>
                    writer.id ===
                    currentWriter.id
                );

              if (existingWriter) {
                return existingWriter;
              }
            }

            // না থাকলে প্রথম লেখক
            return writersData[0];
          }
        );

        setLoadingWriters(false);
      },

      (error) => {
        console.error(
          "Error loading writers:",
          error
        );

        setWriters([]);
        setSelectedWriter(null);
        setLoadingWriters(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [categoryId]);

  // ====================================================
  // Load books
  // ====================================================

  useEffect(() => {
    if (
      !selectedWriter?.id ||
      !categoryId
    ) {
      setBooks([]);
      setLoadingBooks(false);

      return;
    }

    setLoadingBooks(true);

    const q = query(
      collection(db, "books"),

      where(
        "writerId",
        "==",
        selectedWriter.id
      ),

      where(
        "cateId",
        "==",
        categoryId
      )
    );

    const unsubscribe = onSnapshot(
      q,

      (snapshot) => {
        const booksData =
          snapshot.docs.map((doc) => ({
            id: doc.id,

            ...doc.data(),

            type: "audio",
          }));

        setBooks(booksData);

        setLoadingBooks(false);
      },

      (error) => {
        console.error(
          "Error loading books:",
          error
        );

        setBooks([]);

        setLoadingBooks(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [
    selectedWriter?.id,
    categoryId,
  ]);

  // ====================================================
  // Open Audio Details
  // ====================================================

  const handleBookPress = (item) => {
    if (!item?.id) {
      return;
    }

    router.push({
      pathname:
        "/(tabs)/Library/audioDetails",

      params: {
        book: JSON.stringify(item),
      },
    });
  };

  // ====================================================
  // Back
  // ====================================================

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(
        "/(tabs)/Library"
      );
    }
  };

  // ====================================================
  // Writer Item
  // ====================================================

  const renderWriterItem = ({
    item,
  }) => {
    const isSelected =
      selectedWriter?.id === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={[
          styles.writerItemContainer,

          isSelected &&
            styles.activeWriterItem,
        ]}
        onPress={() =>
          setSelectedWriter(item)
        }
      >
        <Image
          source={{
            uri:
              item?.img ||
              "https://via.placeholder.com/100",
          }}
          style={[
            styles.writerImgSmall,

            isSelected &&
              styles.activeWriterImage,
          ]}
        />

        <Text
          numberOfLines={1}
          style={[
            styles.writerNameSmall,

            isSelected &&
              styles.activeWriterName,
          ]}
        >
          {item?.bn ||
            item?.en ||
            "Unknown"}
        </Text>
      </TouchableOpacity>
    );
  };

  // ====================================================
  // Book Item
  // ====================================================

  const renderBookItem = ({
    item,
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.bookItem}
        onPress={() =>
          handleBookPress(item)
        }
      >
        <View
          style={
            styles.bookImageWrapper
          }
        >
          <Image
            source={{
              uri:
                item?.artwork ||
                "https://via.placeholder.com/300x400",
            }}
            style={styles.bookImg}
          />

          <View
            style={
              styles.iconContainer
            }
          >
            <Ionicons
              name="play-circle"
              size={42}
              color="#f0c400"
            />
          </View>
        </View>

        <Text
          numberOfLines={2}
          style={styles.bookTitle}
        >
          {item?.title ||
            item?.name ||
            "Untitled"}
        </Text>
      </TouchableOpacity>
    );
  };

  // ====================================================
  // Main
  // ====================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      {/* ============================================== */}
      {/* Header */}
      {/* ============================================== */}

      <View
        style={
          styles.headerContainer
        }
      >
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons
            name="arrow-back-outline"
            size={28}
            color={
              themes.text ||
              "#FFFFFF"
            }
          />
        </TouchableOpacity>

        <Text
          numberOfLines={1}
          style={[
            styles.headerTitle,
            {
              color:
                themes.text ||
                "#FFFFFF",
            },
          ]}
        >
          {categoryName || "Audio"}
        </Text>
      </View>

      {/* ============================================== */}
      {/* Main Content */}
      {/* ============================================== */}

      <View
        style={styles.container}
      >
        {/* ============================================ */}
        {/* Writers loading */}
        {/* ============================================ */}

        {loadingWriters ? (
          <View
            style={
              styles.loadingContainer
            }
          >
            <ActivityIndicator
              size="large"
              color="#f0c400"
            />
          </View>
        ) : (
          <>
            {/* ======================================== */}
            {/* Category title */}
            {/* ======================================== */}

            <Text
              style={[
                styles.categoryTitle,
                {
                  color:
                    themes.text ||
                    "#FFFFFF",
                },
              ]}
            >
              {categoryName ||
                "Audio"}{" "}
              লেখক
            </Text>

            {/* ======================================== */}
            {/* Writers */}
            {/* ======================================== */}

            {writers.length > 0 ? (
              <FlatList
                data={writers}
                renderItem={
                  renderWriterItem
                }
                keyExtractor={(item) =>
                  String(item.id)
                }
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.writerListContainer
                }
              />
            ) : (
              <View
                style={
                  styles.noWriterContainer
                }
              >
                <Text
                  style={
                    styles.noWriterText
                  }
                >
                  কোনো লেখক পাওয়া যায়নি
                </Text>
              </View>
            )}

            {/* ======================================== */}
            {/* Books */}
            {/* ======================================== */}

            {loadingBooks ? (
              <View
                style={
                  styles.booksLoadingContainer
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#f0c400"
                />
              </View>
            ) : books.length > 0 ? (
              <FlatList
                data={books}
                renderItem={
                  renderBookItem
                }
                keyExtractor={(item) =>
                  String(item.id)
                }
                numColumns={3}
                showsVerticalScrollIndicator={
                  false
                }
                columnWrapperStyle={
                  styles.columnWrapper
                }
                contentContainerStyle={
                  styles.bookList
                }
              />
            ) : (
              <View
                style={
                  styles.comingSoonContainer
                }
              >
                <Ionicons
                  name="musical-notes-outline"
                  size={42}
                  color="#777"
                />

                <Text
                  style={
                    styles.comingSoon
                  }
                >
                  Coming Soon
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}


// ======================================================
// Styles
// ======================================================
//
// IMPORTANT:
// themes এখানে argument হিসেবে আসছে।
// তাই "themes doesn't exist" error আর হবে না.
// ======================================================

function createStyles(themes) {
  const background =
    themes?.background ||
    themes?.backgroundColor ||
    "#0F0F0F";

  const textColor =
    themes?.text ||
    "#FFFFFF";

  return StyleSheet.create({
    // --------------------------------------------------
    // Safe Area
    // --------------------------------------------------

    safeArea: {
      flex: 1,

      backgroundColor:
        background,
    },

    // --------------------------------------------------
    // Header
    // --------------------------------------------------

    headerContainer: {
      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 10,

      paddingVertical: 10,

      minHeight: 54,

      backgroundColor:
        background,
    },

    backButton: {
      width: 44,

      height: 44,

      alignItems: "center",

      justifyContent: "center",
    },

    headerTitle: {
      flex: 1,

      fontSize: 18,

      fontWeight: "600",

      marginLeft: 4,
    },

    // --------------------------------------------------
    // Main container
    // --------------------------------------------------

    container: {
      flex: 1,

      paddingHorizontal: 20,

      paddingBottom: 10,

      backgroundColor:
        background,
    },

    // --------------------------------------------------
    // Loading
    // --------------------------------------------------

    loadingContainer: {
      flex: 1,

      alignItems: "center",

      justifyContent: "center",
    },

    booksLoadingContainer: {
      paddingVertical: 25,

      alignItems: "center",

      justifyContent: "center",
    },

    // --------------------------------------------------
    // Category title
    // --------------------------------------------------

    categoryTitle: {
      fontSize: 22,

      fontWeight: "bold",

      textAlign: "center",

      marginBottom: 10,

      paddingTop: 10,
    },

    // --------------------------------------------------
    // Writer list
    // --------------------------------------------------

    writerListContainer: {
      paddingVertical: 10,

      paddingRight: 10,

      alignItems: "center",

      gap: 15,
    },

    writerItemContainer: {
      flexDirection: "row",

      alignItems: "center",

      gap: 8,

      padding: 6,

      borderRadius: 8,

      backgroundColor:
        "transparent",

      borderWidth: 1,

      borderColor:
        "transparent",
    },

    activeWriterItem: {
      backgroundColor:
        "rgba(240,196,0,0.10)",

      borderColor:
        "rgba(240,196,0,0.40)",
    },

    writerImgSmall: {
      width: 50,

      height: 50,

      borderRadius: 25,

      borderWidth: 2,

      borderColor:
        "#5a4c62",

      backgroundColor:
        "#333",
    },

    activeWriterImage: {
      borderColor:
        "#f0c400",
    },

    writerNameSmall: {
      maxWidth: 120,

      fontSize: 15,

      color: textColor,

      fontWeight: "500",
    },

    activeWriterName: {
      color: "#f0c400",
    },

    // --------------------------------------------------
    // Books
    // --------------------------------------------------

    bookList: {
      paddingTop: 10,

      paddingBottom: 30,
    },

    columnWrapper: {
      justifyContent:
        "space-between",

      marginBottom: 15,
    },

    bookItem: {
      width: "30%",

      alignItems: "center",

      position: "relative",
    },

    bookImageWrapper: {
      width: "100%",

      aspectRatio: 3 / 4,

      position: "relative",

      overflow: "hidden",

      borderRadius: 8,

      backgroundColor:
        "#333",
    },

    bookImg: {
      width: "100%",

      height: "100%",

      resizeMode: "cover",
    },

    // --------------------------------------------------
    // Play overlay
    // --------------------------------------------------

    iconContainer: {
      position: "absolute",

      top: 0,

      left: 0,

      right: 0,

      bottom: 0,

      justifyContent:
        "center",

      alignItems: "center",

      backgroundColor:
        "rgba(0,0,0,0.35)",
    },

    bookTitle: {
      fontSize: 14,

      textAlign: "center",

      marginTop: 6,

      color: textColor,

      lineHeight: 19,
    },

    // --------------------------------------------------
    // No writer
    // --------------------------------------------------

    noWriterContainer: {
      paddingVertical: 20,

      alignItems: "center",
    },

    noWriterText: {
      color: "#888",

      fontSize: 14,
    },

    // --------------------------------------------------
    // Coming soon
    // --------------------------------------------------

    comingSoonContainer: {
      flex: 1,

      justifyContent:
        "center",

      alignItems: "center",

      paddingBottom: 50,
    },

    comingSoon: {
      marginTop: 10,

      textAlign: "center",

      color: "#999",

      fontStyle: "italic",

      fontSize: 16,
    },
  });
}