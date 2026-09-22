

// import React, { useState, useEffect } from 'react';
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     FlatList,
//     StyleSheet,
//     ActivityIndicator,
//     Appearance
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Colors } from "@/constants/Colors";
// import Header from "@/components/buildApp/header";
// import { db } from '@/firebase';
// import { collection, onSnapshot } from 'firebase/firestore';

// export default function AudioTab() {
//     const navigation = useNavigation();
//     const [activeTab, setActiveTab] = useState('audio');
//     const [categories, setCategories] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const colorScheme = Appearance.getColorScheme();
//     const themes = colorScheme === "dark" ? Colors.dark : Colors.light;
//     const styles = createStyles(themes);



//     useEffect(() => {
//         const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
//             const data = [];
//             snapshot.forEach((doc) => {
//                 // doc.id ব্যবহার করে ডকুমেন্টের আইডি ডেটার সাথে যুক্ত করুন
//                 data.push({ id: doc.id, ...doc.data() });
//             });
//             setCategories(data);
//             setLoading(false);
//         });

//         return () => unsubscribe();
//     }, []);

//     const filteredData = categories.filter(item => item[activeTab]);

//     const renderCategoryItem = ({ item }) => (
//         <TouchableOpacity
//             style={styles.gridItem}
//             onPress={() => {
//                 if (activeTab === 'audio') {
//                     navigation.navigate('audio', {
//                         categoryName: item.bn,
//                         categoryId: item.id
//                     });
//                 } else if (activeTab === 'kindle') {
//                     navigation.navigate('book', {
//                         categoryType: 'kindleBooks',
//                         categoryName: item.bn,
//                         categoryId: item.id
//                     });
//                 }
//             }}
//         >
//             <Text style={styles.gridText}>{item.bn || item.en}</Text>
//         </TouchableOpacity>
//     );

//     return (
//         <View style={styles.container}>
//             <Header />

//             <View style={styles.tabHeader}>
//                 <TouchableOpacity
//                     style={[styles.tabButton, activeTab === 'audio' && styles.activeTab]}
//                     onPress={() => setActiveTab('audio')}
//                 >
//                     <Text style={styles.tabText}>Audio</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                     style={[styles.tabButton, activeTab === 'kindle' && styles.activeTab]}
//                     // শুধুমাত্র onPress ব্যবহার করুন
//                     onPress={() => setActiveTab('kindle')}
//                 >
//                     <Text style={styles.tabText}>Kindle</Text>
//                 </TouchableOpacity>
//             </View>

//             {loading ? (
//                 <ActivityIndicator size="large" color="#f0c400" style={{ marginTop: 40 }} />
//             ) : (
//                 <FlatList
//                     key={activeTab}
//                     data={filteredData}
//                     keyExtractor={(item, index) => index.toString()}
//                     renderItem={renderCategoryItem}
//                     numColumns={2}
//                     contentContainerStyle={styles.gridContainer}
//                 />
//             )}
//         </View>
//     );
// }

// function createStyles(themes) {
//     return StyleSheet.create({
//         container: {
//             flex: 1,
//             backgroundColor: themes.backgroundColor,
//             paddingHorizontal: 20,
//             paddingTop: 40,
//         },
//         tabHeader: {
//             flexDirection: 'row',
//             justifyContent: 'center',
//             backgroundColor: '#3a2c42',
//             borderRadius: 8,
//             overflow: 'hidden',
//             marginBottom: 16,
//         },
//         tabButton: {
//             flex: 1,
//             paddingVertical: 12,
//             alignItems: 'center',
//         },
//         activeTab: {
//             borderBottomWidth: 2,
//             borderBottomColor: '#f0c400',
//         },
//         tabText: {
//             fontSize: 16,
//             fontWeight: '600',
//             color: '#f9eccc',
//         },
//         gridContainer: {
//             paddingBottom: 20,
//         },
//         gridItem: {
//             flex: 1,
//             margin: 6,
//             height: 60,
//             backgroundColor: 'transparent',
//             borderRadius: 8,
//             justifyContent: 'center',
//             alignItems: 'center',
//             borderWidth: 1,
//             borderColor: 'papayawhip'
//         },
//         gridText: {
//             fontSize: 14,
//             fontWeight: '500',
//             color: '#FFFFFF',
//             textAlign: 'center',
//         },
//     });
// }

import Header from "@/components/buildApp/header";
import { Colors } from "@/constants/Colors";
import { db } from "@/firebase";
import { useRouter } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Appearance,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LibraryHomeScreen() {
  const router = useRouter();

  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [activeTab, setActiveTab] = useState("audio");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // Theme
  // --------------------------------------------------

  const colorScheme = Appearance.getColorScheme();

  const themes =
    colorScheme === "dark"
      ? Colors.dark
      : Colors.light;

  const styles = createStyles(themes);

  // --------------------------------------------------
  // Load categories from Firebase
  // --------------------------------------------------

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, "categories"),

      (snapshot) => {
        const data = [];

        snapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setCategories(data);
        setLoading(false);
      },

      (error) => {
        console.error(
          "Error loading categories:",
          error
        );

        setCategories([]);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // --------------------------------------------------
  // Filter categories
  //
  // Audio:
  //    item.audio
  //
  // Kindle:
  //    item.kindle
  // --------------------------------------------------

  const filteredData = categories.filter(
    (item) => item?.[activeTab]
  );

  // --------------------------------------------------
  // Open Audio category
  //
  // Actual route:
  // app/(tabs)/Library/audio.jsx
  //
  // Route:
  // /(tabs)/Library/audio
  // --------------------------------------------------

  const openAudioCategory = (item) => {
    router.push({
      pathname: "/(tabs)/Library/audio",
      params: {
        categoryName: item?.bn || item?.en || "",
        categoryId: String(item?.id || ""),
      },
    });
  };

  // --------------------------------------------------
  // Open Kindle category
  //
  // Actual route:
  // app/(tabs)/Library/book.jsx
  //
  // Route:
  // /(tabs)/Library/book
  // --------------------------------------------------

  const openKindleCategory = (item) => {
    router.push({
      pathname: "/(tabs)/Library/book",
      params: {
        categoryType: "kindleBooks",
        categoryName: item?.bn || item?.en || "",
        categoryId: String(item?.id || ""),
      },
    });
  };

  // --------------------------------------------------
  // Category press
  // --------------------------------------------------

  const handleCategoryPress = (item) => {
    if (!item) {
      return;
    }

    if (activeTab === "audio") {
      openAudioCategory(item);
      return;
    }

    if (activeTab === "kindle") {
      openKindleCategory(item);
      return;
    }
  };

  // --------------------------------------------------
  // Render category
  // --------------------------------------------------

  const renderCategoryItem = ({ item }) => {
    const title =
      item?.bn ||
      item?.en ||
      "Untitled";

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.gridItem}
        onPress={() =>
          handleCategoryPress(item)
        }
      >
        <Text style={styles.gridText}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  // --------------------------------------------------
  // Render tab button
  // --------------------------------------------------

  const renderTabButton = (
    tabName,
    label
  ) => {
    const isActive =
      activeTab === tabName;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.tabButton,
          isActive && styles.activeTab,
        ]}
        onPress={() =>
          setActiveTab(tabName)
        }
      >
        <Text
          style={[
            styles.tabText,
            isActive &&
              styles.activeTabText,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <View style={styles.container}>

      {/* ------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------ */}

      <Header />

      {/* ------------------------------------------ */}
      {/* Audio / Kindle tabs */}
      {/* ------------------------------------------ */}

      <View style={styles.tabHeader}>
        {renderTabButton(
          "audio",
          "Audio"
        )}

        {renderTabButton(
          "kindle",
          "Kindle"
        )}
      </View>

      {/* ------------------------------------------ */}
      {/* Loading */}
      {/* ------------------------------------------ */}

      {loading ? (
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
        <FlatList
          key={activeTab}
          data={filteredData}
          keyExtractor={(item) =>
            String(item.id)
          }
          renderItem={
            renderCategoryItem
          }
          numColumns={2}
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.gridContainer
          }
          columnWrapperStyle={
            styles.columnWrapper
          }
          ListEmptyComponent={
            <View
              style={
                styles.emptyContainer
              }
            >
              <Text
                style={
                  styles.emptyText
                }
              >
                No categories found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ==================================================
// Styles
// ==================================================

function createStyles(themes) {
  return StyleSheet.create({
    // ----------------------------------------------
    // Main container
    // ----------------------------------------------

    container: {
      flex: 1,

      backgroundColor:
        themes?.backgroundColor ||
        "#0F0F0F",

      paddingHorizontal: 20,
      paddingTop: 40,
    },

    // ----------------------------------------------
    // Audio / Kindle tab header
    // ----------------------------------------------

    tabHeader: {
      flexDirection: "row",

      justifyContent: "center",

      backgroundColor:
        "#3a2c42",

      borderRadius: 8,

      overflow: "hidden",

      marginBottom: 16,
    },

    // ----------------------------------------------
    // Tab button
    // ----------------------------------------------

    tabButton: {
      flex: 1,

      paddingVertical: 12,

      alignItems: "center",

      justifyContent: "center",
    },

    // ----------------------------------------------
    // Active tab
    // ----------------------------------------------

    activeTab: {
      borderBottomWidth: 2,

      borderBottomColor:
        "#f0c400",
    },

    // ----------------------------------------------
    // Tab text
    // ----------------------------------------------

    tabText: {
      fontSize: 16,

      fontWeight: "600",

      color: "#f9eccc",
    },

    activeTabText: {
      color: "#f0c400",
    },

    // ----------------------------------------------
    // Loading
    // ----------------------------------------------

    loadingContainer: {
      flex: 1,

      alignItems: "center",

      justifyContent:
        "flex-start",

      paddingTop: 40,
    },

    // ----------------------------------------------
    // Grid container
    // ----------------------------------------------

    gridContainer: {
      paddingBottom: 30,
    },

    // ----------------------------------------------
    // Grid column
    // ----------------------------------------------

    columnWrapper: {
      justifyContent:
        "space-between",
    },

    // ----------------------------------------------
    // Category item
    // ----------------------------------------------

    gridItem: {
      flex: 1,

      margin: 6,

      minHeight: 60,

      backgroundColor:
        "transparent",

      borderRadius: 8,

      justifyContent:
        "center",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        "papayawhip",

      paddingHorizontal: 10,

      paddingVertical: 10,
    },

    // ----------------------------------------------
    // Category text
    // ----------------------------------------------

    gridText: {
      fontSize: 14,

      fontWeight: "500",

      color: "#FFFFFF",

      textAlign: "center",
    },

    // ----------------------------------------------
    // Empty state
    // ----------------------------------------------

    emptyContainer: {
      width: "100%",

      paddingTop: 50,

      alignItems: "center",
    },

    emptyText: {
      color: "#999",

      fontSize: 14,
    },
  });
}