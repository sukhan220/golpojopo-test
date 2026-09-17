

// import { Ionicons } from "@expo/vector-icons";
// import React from "react";
// import {
//   Alert,
//   Modal,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// export default function ChapterSidebar({
//   chapters,
//   chaptersVisible,
//   bookmarksVisible,
//   notesListVisible,
//   setChaptersVisible,
//   setBookmarksVisible,
//   setNotesListVisible,
//   bookmarks,
//   library,
//   parsedBook,
//   jumpToPage,
//   removeNote,
//   webRef, // WebView-তে কমান্ড পাঠানোর জন্য এটি প্রয়োজন
// }) {

// //   // নোট ডিলিট হ্যান্ডলার
// //   const handleDeleteNote = (note) => {
// //     Alert.alert(
// //       "নোট ডিলিট",
// //       "আপনি কি নিশ্চিতভাবে এই নোটটি ডিলিট করতে চান?",
// //       [
// //         { text: "বাতিল", style: "cancel" },
// //         {
// //           text: "ডিলিট",
// //           style: "destructive",
// //           onPress: async () => {
// //             try {
// //               // ১. ডাটাবেজ থেকে রিমুভ করা
// //               await removeNote(parsedBook.id, "quotes", note.id);

              
// //       // ৩. WebView-তে সিঙ্ক কমান্ড পাঠানো
// // //       if (webRef?.current) {
// // //         const injectJS = `
// // // (function(){

// // //  if(window.clearHighlightById){
// // //    window.clearHighlightById("${note.id}");
// // //  }

// // // })();
// // // true;
// // // `;

// // // webRef.current.injectJavaScript(injectJS);
// // //       }

// // // if (webRef?.current) {

// // //   const injectJS = `
// // //             (function() {
// // //               if (window.syncHighlights) {
// // //                 window.syncHighlights(${JSON.stringify(updatedNotes)});
// // //               }
// // //             })();
// // //             true;
// // //           `;
// // //           webRef.current.injectJavaScript(injectJS);
// // // }
// //             } catch (error) {
// //               console.error("Failed to delete note:", error);
// //             }
// //           },
// //         },
// //       ]
// //     );
// //   };

// // নোট ডিলিট হ্যান্ডলার
// const handleDeleteNote = (note) => {
//   Alert.alert(
//     "নোট ডিলিট",
//     "আপনি কি নিশ্চিতভাবে এই নোটটি ডিলিট করতে চান?",
//     [
//       { text: "বাতিল", style: "cancel" },
//       {
//         text: "ডিলিট",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             // ১. ডাটাবেজ থেকে রিমুভ করা
//             await removeNote(parsedBook.id, "quotes", note.id);

//             if (webRef?.current) {
//                 console.log("Note deleted and UI updated for ID:", note.id);
//                 const injectJS = `
//                   (function() {
//                     if (window.removeHighlight) {
//                       // আপনার ডিফাইন করা removeHighlight ফাংশনটি কল করা হচ্ছে
//                       window.removeHighlight("${note.id}");
//                     } else {
//                       console.warn("WebView: removeHighlight function not found");
//                     }
//                   })();
//                   true;
//                 `;
//                 webRef.current.injectJavaScript(injectJS);
//               }

//             // // ২. ডিলিট সাকসেসফুল হলে একটু সময় দিয়ে WebView থেকে হাইলাইট সরানো
//             // // ২০০ms সময় দেওয়া হয়েছে যাতে ডাটাবেজ প্রসেসটি ক্লিনলি শেষ হয়
//             // setTimeout(() => {
//             //   if (webRef?.current) {
//             //     console.log("Note deleted and UI updated for ID:", note.id);
//             //     const injectJS = `
//             //       (function() {
//             //         if (window.removeHighlight) {
//             //           // আপনার ডিফাইন করা removeHighlight ফাংশনটি কল করা হচ্ছে
//             //           window.removeHighlight("${note.id}");
//             //         } else {
//             //           console.warn("WebView: removeHighlight function not found");
//             //         }
//             //       })();
//             //       true;
//             //     `;
//             //     webRef.current.injectJavaScript(injectJS);
//             //   }
//             // }, 200);

            

//           } catch (error) {
//             console.error("Failed to delete note:", error);
//           }
//         },
//       },
//     ]
//   );
// };

//   const handleDelete = async (noteId) => {
//     try {
//       // ১. ডাটাবেজ থেকে রিমুভ
//       await removeNote(parsedBook.id, 'quotes', noteId);

//       // ২. বর্তমান (আপডেটেড) নোটের লিস্ট ফিল্টার করে বের করা
//       // লাইব্রেরি স্টেট থেকে সরাসরি ডাটা নেওয়া সবচেয়ে নিরাপদ
//       const currentNotes = library?.notes?.[parsedBook.id]?.quotes || [];
//       const updatedNotes = currentNotes.filter(n => n.id !== noteId);

//       // ৩. WebView-তে সিঙ্ক কমান্ড পাঠানো
//       if (webRef?.current) {
//         const injectJS = `
//         (function() {
//           if (window.syncHighlights) {
//             window.syncHighlights(${JSON.stringify(updatedNotes)});
//           }
//         })();
//         true;
//       `;
//         webRef.current.injectJavaScript(injectJS);
//       }

//       setFloatingVisible(false);
//     } catch (error) {
//       console.error("Pro-Level Delete Error:", error);
//     }
//   };

//   return (
//     <Modal
//       transparent
//       visible={chaptersVisible || bookmarksVisible || notesListVisible}
//       animationType="slide"
//     >
//       <Pressable
//         style={styles.modalOverlay}
//         onPress={() => {
//           setChaptersVisible(false);
//           setBookmarksVisible(false);
//           setNotesListVisible(false);
//         }}
//       >
//         <View style={styles.chapterSidebar}>
//           <Text style={styles.chapterHeader}>
//             {chaptersVisible
//               ? "সূচিপত্র"
//               : bookmarksVisible
//                 ? "বুকমার্কস"
//                 : "নোটসমূহ"}
//           </Text>

//           {/* flex: 1 নিশ্চিত করে যে লিস্ট বড় হলে স্ক্রল কাজ করবে */}
//           <ScrollView
//             style={{ flex: 1 }}
//             contentContainerStyle={styles.scrollContent}
//             showsVerticalScrollIndicator={false}
//           >
//             {/* ১. সূচিপত্র */}
//             {chaptersVisible &&
//               chapters.map((c, i) => (
//                 <TouchableOpacity
//                   key={`chap-${i}`}
//                   style={styles.chapterItem}
//                   onPress={() => {
//                     jumpToPage(c.pageIndex);
//                     setChaptersVisible(false);
//                   }}
//                 >
//                   <View style={{ flex: 1 }}>
//                     <Text style={styles.chapterTitle}>{c.title}</Text>
//                     <Text style={styles.chapterPage}>পৃষ্ঠা {c.pageIndex + 1}</Text>
//                   </View>
//                 </TouchableOpacity>
//               ))}

//             {/* ২. বুকমার্কস */}
//             {bookmarksVisible &&
//               bookmarks.map((p, i) => (
//                 <TouchableOpacity
//                   key={`book-${i}`}
//                   style={styles.chapterItem}
//                   onPress={() => {
//                     jumpToPage(p);
//                     setBookmarksVisible(false);
//                   }}
//                 >
//                   <Text style={styles.chapterTitle}>পৃষ্ঠা {p + 1}</Text>
//                   <Ionicons name="bookmark" size={18} color="#6b4f2d" />
//                 </TouchableOpacity>
//               ))}

//             {/* ৩. নোটসমূহ */}
//             {notesListVisible &&
//               (library?.notes?.[parsedBook.id]?.quotes || []).map((n, i) => (
//                 <View key={n.id || `note-${i}`} style={styles.chapterItem}>
//                   <TouchableOpacity
//                     style={{ flex: 1 }}
//                     onPress={() => {
//                       jumpToPage(n.ref.page);
//                       setNotesListVisible(false);
//                     }}
//                   >
//                     <View>
//                       <Text style={styles.chapterTitle} numberOfLines={1}>
//                         {n.title || "Untitled Note"}
//                       </Text>
//                       <Text style={[styles.chapterPage, { fontStyle: "italic" }]} numberOfLines={2}>
//                         "{n.ref?.text}"
//                       </Text>
//                     </View>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     onPress={() => handleDeleteNote(n)}
//                     style={styles.deleteBtn}
//                   >
//                     <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
//                   </TouchableOpacity>
//                 </View>
//               ))}
//           </ScrollView>
//         </View>
//       </Pressable>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "flex-end",
//   },
//   chapterSidebar: {
//     width: "80%",
//     height: "100%",
//     backgroundColor: "#fdfaf1",
//     paddingHorizontal: 20,
//     paddingTop: 60,
//   },
//   chapterHeader: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#2c1e0f",
//   },
//   scrollContent: {
//     paddingBottom: 40,
//   },
//   chapterItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderColor: "#e0d5c1",
//     alignItems: "center",
//   },
//   chapterTitle: {
//     fontSize: 16,
//     color: "#3b2f1b",
//     fontWeight: "500",
//   },
//   chapterPage: {
//     fontSize: 12,
//     color: "gray",
//     marginTop: 2,
//   },
//   deleteBtn: {
//     padding: 10,
//   },
// });


import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChapterSidebar({
  chapters,
  chaptersVisible,
  bookmarksVisible,
  notesListVisible,
  setChaptersVisible,
  setBookmarksVisible,
  setNotesListVisible,
  bookmarks,
  library,
  parsedBook,
  jumpToPage,
  removeNote,
  webRef,
}) {

  // ==============================
  // NOTE DELETE HANDLER
  // ==============================
  const handleDeleteNote = (note) => {
   
    Alert.alert(
      "নোট ডিলিট",
      "আপনি কি নিশ্চিতভাবে এই নোটটি ডিলিট করতে চান?",
      [
        { text: "বাতিল", style: "cancel" },
        {
          text: "ডিলিট",
          style: "destructive",
          onPress: async () => {
            try {
              // ১️⃣ ডাটাবেজ থেকে রিমুভ
              await removeNote(parsedBook.id, "quotes", note.id);
              

              // ২️⃣ WebView থেকে হাইলাইট রিমুভ
              if (webRef?.current) {
                // console.log("Note deleted:", note.id);

                const injectJS = `
                  (function() {
                    if (window.removeHighlight) {
                      window.removeHighlight("${note.id}");
                    } else {
                      console.warn("removeHighlight not found");
                    }
                  })();
                  true;
                `;

                webRef.current.injectJavaScript(injectJS);
              }

            } catch (error) {
              console.error("Failed to delete note:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      transparent
      visible={chaptersVisible || bookmarksVisible || notesListVisible}
      animationType="slide"
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => {
          setChaptersVisible(false);
          setBookmarksVisible(false);
          setNotesListVisible(false);
        }}
      >
        <View style={styles.chapterSidebar}>
          <Text style={styles.chapterHeader}>
            {chaptersVisible
              ? "সূচিপত্র"
              : bookmarksVisible
              ? "বুকমার্কস"
              : "নোটসমূহ"}
          </Text>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

            {/* ===================== */}
            {/* CHAPTERS */}
            {/* ===================== */}
            {chaptersVisible &&
              chapters.map((c, i) => (
                <TouchableOpacity
                  key={`chap-${i}`}
                  style={styles.chapterItem}
                  onPress={() => {
                    jumpToPage(c.pageIndex);
                    setChaptersVisible(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chapterTitle}>{c.title}</Text>
                    <Text style={styles.chapterPage}>
                      পৃষ্ঠা {c.pageIndex + 1}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

            {/* ===================== */}
            {/* BOOKMARKS */}
            {/* ===================== */}
            {bookmarksVisible &&
              bookmarks.map((p, i) => (
                <TouchableOpacity
                  key={`book-${i}`}
                  style={styles.chapterItem}
                  onPress={() => {
                    jumpToPage(p);
                    setBookmarksVisible(false);
                  }}
                >
                  <Text style={styles.chapterTitle}>
                    পৃষ্ঠা {p + 1}
                  </Text>
                  <Ionicons
                    name="bookmark"
                    size={18}
                    color="#6b4f2d"
                  />
                </TouchableOpacity>
              ))}

            {/* ===================== */}
            {/* NOTES */}
            {/* ===================== */}
            {notesListVisible &&
              (library?.notes?.[parsedBook.id]?.quotes || []).map(
                (n, i) => (
                  <View
                    key={n.id || `note-${i}`}
                    style={styles.chapterItem}
                  >
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => {
                        jumpToPage(n.ref.page);
                        setNotesListVisible(false);
                      }}
                    >
                      <View>
                        <Text
                          style={styles.chapterTitle}
                          numberOfLines={1}
                        >
                          {n.title || "Untitled Note"}
                        </Text>

                        <Text
                          style={[
                            styles.chapterPage,
                            { fontStyle: "italic" },
                          ]}
                          numberOfLines={2}
                        >
                          "{n.ref?.text}"
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDeleteNote(n)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#ff6b6b"
                      />
                    </TouchableOpacity>
                  </View>
                )
              )}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  chapterSidebar: {
    width: "80%",
    height: "100%",
    backgroundColor: "#fdfaf1",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  chapterHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c1e0f",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  chapterItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#e0d5c1",
    alignItems: "center",
  },
  chapterTitle: {
    fontSize: 16,
    color: "#3b2f1b",
    fontWeight: "500",
  },
  chapterPage: {
    fontSize: 12,
    color: "gray",
    marginTop: 2,
  },
  deleteBtn: {
    padding: 10,
  },
});