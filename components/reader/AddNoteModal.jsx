// import styles from "@/components/reader/Reader.style";
// import React from "react";
// import {
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from "react-native";

// export default function AddNoteModal({
//   visible,
//   noteTitle,
//   setNoteTitle,
//   noteText,
//   setNoteText,
//   selectedText,
//   selectionData,    // WebView থেকে আসা স্মার্ট সিলেকশন ডাটা
//   parsedBook,
//   webRef,
//   addNote,
//   setSelectedText,
//   setNotePopupVisible
// }) {



//   const handleSave = async () => {
//     if (!selectionData || !selectedText) {
//       console.warn("No selection data found to save.");
//       return;
//     }

//     // ১. একটি ইউনিক আইডি আগেই তৈরি করে নিন (যাতে WebView এবং Database একই আইডি পায়)
//     const noteId = Date.now().toString();

//     const highlightInfo = {
//       id: noteId, // ডাটাবেজের জন্য আইডি
//       title: noteTitle || "Note",
//       content: noteText || "",
//       ref: {
//         text: selectedText,
//         bookTitle: parsedBook?.title || "Unknown Book",
//         startPage: selectionData.startPage,
//         endPage: selectionData.endPage,
//         startOffset: selectionData.startOffset,
//         endOffset: selectionData.endOffset,
//         page: selectionData.startPage,
//         id: noteId,
//       }
//     };

//     try {
//       // ১. ডাটাবেজে সেভ করা
//       await addNote(parsedBook.id, "book", "quotes", highlightInfo);

//       // ২. মডাল আগে ক্লোজ করা (ইউজার ইন্টারফেস স্মুথ রাখার জন্য)
//       setNotePopupVisible(false);

    

      

//       setTimeout(() => {
//         const injectJS = `
//     (function() {
     
//       if (window.renderNewHighlight) {

//          window.renderNewHighlight(${JSON.stringify(highlightInfo.ref)});
        
          
        
//       } else {
         
//                 send("MARK", {
//   text: "কিছু নাই",
//   page: i
// }); 
//       }
//     })();
//     true;
//   `;
//         webRef.current?.injectJavaScript(injectJS);
//       }, 500);

//       // ৪. স্টেট ক্লিনআপ
//       setNoteTitle("");
//       setNoteText("");
//       setSelectedText("");

//     } catch (error) {
//       console.error("Failed to save note:", error);
//     }
//   };
//   const handleCancel = () => {
//     setNoteTitle("");
//     setNoteText("");
//     setNotePopupVisible(false);
//   };

//   return (
//     <Modal visible={visible} transparent animationType="slide">
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.modalOverlay}
//       >
//         <View style={styles.modalBox}>
//           <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#3b2f1b', marginBottom: 15 }}>
//             নোট যোগ করুন
//           </Text>

//           {/* শিরোনাম ইনপুট */}
//           <TextInput
//             placeholder="নোটের শিরোনাম (ঐচ্ছিক)..."
//             value={noteTitle}
//             onChangeText={setNoteTitle}
//             style={styles.titleInput}
//             placeholderTextColor="#998e7a"
//           />

//           {/* হাইলাইট করা টেক্সট প্রিভিউ */}
//           <View style={styles.quoteBox}>
//             <ScrollView style={{ maxHeight: 100 }}>
//               <Text style={styles.quoteText}>
//                 “{selectedText}”
//               </Text>
//             </ScrollView>
//           </View>

//           {/* বিস্তারিত মতামত ইনপুট */}
//           <TextInput
//             placeholder="আপনার মতামত বা নোট লিখুন..."
//             value={noteText}
//             onChangeText={setNoteText}
//             style={[styles.titleInput, { height: 100, textAlignVertical: 'top', marginTop: 10 }]}
//             multiline
//             placeholderTextColor="#998e7a"
//           />

//           {/* বাটন গ্রুপ */}
//           <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
//             <TouchableOpacity
//               style={[styles.goBtn, { backgroundColor: '#d6cfc1' }]}
//               onPress={handleCancel}
//             >
//               <Text style={{ color: "#5d4a26" }}>বাতিল</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.goBtn, { backgroundColor: '#6b4f2d' }]}
//               onPress={handleSave}
//             >
//               <Text style={{ color: "#fff", fontWeight: 'bold' }}>সেভ করুন</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// }

import styles from "@/components/reader/Reader.style";
import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function AddNoteModal({
  visible,
  noteTitle,
  setNoteTitle,
  noteText,
  setNoteText,
  selectedText,
  selectionData,    // Smart selection data from WebView
  parsedBook,
  webRef,
  addNote,
  setSelectedText,
  setNotePopupVisible
}) {

  const handleSave = async () => {
    if (!selectionData || !selectedText) {
      console.warn("No selection data found to save.");
      return;
    }

    // 1. Generate a unique ID (Ensures both Database and WebView use the same ID)
    const noteId = Date.now().toString();

    const highlightInfo = {
      id: noteId, 
      title: noteTitle || "Note",
      ref: {
        text: selectedText,
        bookTitle: parsedBook?.title || "Unknown Book",
        startPage: selectionData.startPage,
        endPage: selectionData.endPage,
        startOffset: selectionData.startOffset,
        endOffset: selectionData.endOffset,
        page: selectionData.startPage,
        id: noteId,
      }
    };

    try {
      // 2. Save to Database
      await addNote(parsedBook.id, "book", "quotes", highlightInfo);

      // 3. Close Modal first for a smooth UI transition
      setNotePopupVisible(false);

      // 4. Inject Highlight into WebView
      setTimeout(() => {
        const injectJS = `
          (function() {
            if (window.renderNewHighlight) {
              window.renderNewHighlight(${JSON.stringify(highlightInfo.ref)});
            } else {
              console.warn("renderNewHighlight function not found in WebView");
            }
          })();
          true;
        `;
        webRef.current?.injectJavaScript(injectJS);
      }, 500);

      // 5. State Cleanup
      setNoteTitle("");
      setNoteText("");
      setSelectedText("");

    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const handleCancel = () => {
    setNoteTitle("");
    setNoteText("");
    setNotePopupVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalBox}>
          {/* Header Title */}
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#3b2f1b', marginBottom: 15 }}>
            Add New Note
          </Text>

          {/* Title Input */}
          <TextInput
            placeholder="Note Title (Optional)..."
            value={noteTitle}
            onChangeText={setNoteTitle}
            style={styles.titleInput}
            placeholderTextColor="#998e7a"
          />

          {/* Highlighted Text Preview */}
          <View style={styles.quoteBox}>
            <ScrollView style={{ maxHeight: 100 }}>
              <Text style={styles.quoteText}>
                “{selectedText}”
              </Text>
            </ScrollView>
          </View>

          

          {/* Button Group */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <TouchableOpacity
              style={[styles.goBtn, { backgroundColor: '#d6cfc1' }]}
              onPress={handleCancel}
            >
              <Text style={{ color: "#5d4a26" }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.goBtn, { backgroundColor: '#6b4f2d' }]}
              onPress={handleSave}
            >
              <Text style={{ color: "#fff", fontWeight: 'bold' }}>Save Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}