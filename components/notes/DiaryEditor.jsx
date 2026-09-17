

//DiaryEditor.jsx

import { useLibrary } from '@/context/libraryContext';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';

import { EnrichedTextInput } from 'react-native-enriched';
import DrawingCanvas from './DrawingCanvas';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

export default function DiaryEditor({ diary = {}, bookId = "general", onBack }) {
  const { addNote, renameNote, updateNoteContent } = useLibrary();
  const editorRef = useRef(null);

  const [stylesState, setStylesState] = useState(null);
  const [title, setTitle] = useState(diary.title || '');
  const [showDrawing, setShowDrawing] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);

  const [htmlContent, setHtmlContent] = useState(diary.content || '');

  console.log(htmlContent);

  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      setKeyboardVisible(false);
      setIsToolbarExpanded(false);
    });
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);


  useEffect(() => {
    if (diary?.id) {
      setHtmlContent(diary.content || '');
      setTitle(diary.title || '');
    } else {
      setHtmlContent('');
      setTitle('');
    }
  }, [diary.id]);

  // ১. useEffect গুলোকে একটিতে নিয়ে আসুন এবং ID চেক করুন
useEffect(() => {
  if (diary && Object.keys(diary).length > 0) {
    setHtmlContent(diary.content || '');
    setTitle(diary.title || '');
  } else {
    // নতুন নোটের জন্য পরিষ্কার করুন
    setHtmlContent('');
    setTitle('');
  }
}, [diary]); // diary অবজেক্ট চেঞ্জ হলেই এটি চলবে



  const toggleToolbar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsToolbarExpanded(!isToolbarExpanded);
  };

 




const onInsertDrawing = useCallback(async (imageUri, imgWidth, imgHeight) => {
  try {
    // ✅ 1. image compress + resize (800px max width)
    const manipulated = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }],
      {
        compress: 0.6,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // ✅ 2. editor type check
    let finalUri = manipulated.uri;

    // Android fix: ensure file:// prefix
    if (Platform.OS === 'android' && !finalUri.startsWith('file://')) {
      finalUri = `file://${finalUri}`;
    }

    // ✅ 3. optional base64 for WebView editor
    const isWebViewEditor = typeof editorRef.current?.setHTML === 'function';
    if (isWebViewEditor) {
      const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      finalUri = `data:image/jpeg;base64,${base64}`;
    }

    // ✅ 4. calculate responsive size
    const finalWidth = width - 40;
    const ratio = imgHeight / imgWidth;
    const finalHeight = finalWidth * ratio;

    // ✅ 5. insert into editor
    if (editorRef.current?.setImage) {
      editorRef.current.setImage(finalUri, finalWidth, finalHeight);
    } else if (editorRef.current?.insertImage) {
      editorRef.current.insertImage(finalUri); // TentapEditor / other editors
    }

    // ✅ 6. close drawing modal
    setShowDrawing(false);

    // ✅ 7. focus editor after short delay
    setTimeout(() => {
      editorRef.current?.focus?.();
    }, 300);

  } catch (e) {
    console.log('Image process error:', e);
  }
}, []);

  const handleSave = async () => {
  try {
    // ১. ডাটা রিফ থেকে নিন
    const htmlFromRef = await editorRef.current?.getHTML();
    const finalHtml = htmlFromRef || htmlContent || "";
    
    // ২. টাইটেল সুরক্ষিতভাবে নিন
    const currentTitle = (title || "").trim();
    
    // ৩. কোনো ডাটা না থাকলে ফিরে যান
    if (!finalHtml.trim() && !currentTitle) {
      onBack();
      return;
    }

    // ৪. আপডেট লজিক (যদি আইডি থাকে)
    if (diary?.id) {
      // ডায়েরি রিনেম চেক (অত্যন্ত গুরুত্বপূর্ণ: diary?.title ব্যবহার করা হয়েছে যাতে ক্র্যাশ না করে)
      const existingTitle = diary?.title || ""; 
      
      if (currentTitle !== existingTitle) {
        await renameNote(bookId, 'diaries', diary.id, currentTitle || "Untitled");
      }
      await updateNoteContent(bookId, 'diaries', diary.id, finalHtml);
    } 
    // ৫. নতুন নোট তৈরির লজিক (আপনার পুরানো ৪-প্যারামিটার সিস্টেম অনুযায়ী)
    else {
      await addNote(bookId, 'general', 'diaries', {
        title: currentTitle || 'Untitled',
        content: finalHtml,
        createdAt: Date.now(),
      });
    }
    
    onBack();
  } catch (e) {
    console.error("Save error details:", e);
    onBack();
  }
};
 

  const ToolbarButton = ({ icon, styleKey, onPress, isFeather = false }) => {
    const state = stylesState?.[styleKey];
    const isActive = state?.isActive;
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.toolbarBtn, isActive && styles.activeBtn]}
      >
        {isFeather ? (
          <Feather name={icon} size={20} color={isActive ? "#b7c7ff" : "#fff"} />
        ) : (
          <MaterialIcons name={icon} size={22} color={isActive ? "#b7c7ff" : "#fff"} />
        )}
      </TouchableOpacity>
    );
  };

  // ড্রয়িং বাটন সহ সব আইটেম এখন এখানে
  const renderToolbarItems = () => (
    <>
      <ToolbarButton icon="edit-3" onPress={() => setShowDrawing(true)} isFeather={true} />
      <View style={styles.separator} />
      <ToolbarButton icon="format-bold" styleKey="bold" onPress={() => editorRef.current?.toggleBold()} />
      <ToolbarButton icon="format-italic" styleKey="italic" onPress={() => editorRef.current?.toggleItalic()} />
      <ToolbarButton icon="format-underlined" styleKey="underline" onPress={() => editorRef.current?.toggleUnderline()} />
      <ToolbarButton icon="format-strikethrough" styleKey="strikethrough" onPress={() => editorRef.current?.toggleStrikethrough()} />
      <ToolbarButton icon="format-list-bulleted" styleKey="unorderedList" onPress={() => editorRef.current?.toggleUnorderedList()} />
      <ToolbarButton icon="format-list-numbered" styleKey="orderedList" onPress={() => editorRef.current?.toggleOrderedList()} />
      <ToolbarButton icon="format-quote" styleKey="blockquote" onPress={() => editorRef.current?.toggleBlockquote()} />
      <ToolbarButton icon="undo" onPress={() => editorRef.current?.undo()} />
      <ToolbarButton icon="redo" onPress={() => editorRef.current?.redo()} />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ক্লিন হেডার: শুধু টাইটেল এবং সেভ */}
      <View style={styles.topSection}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.titleTrigger} onPress={() => setShowTitleModal(true)}>
              <Text style={styles.titleText} numberOfLines={1}>{title || "Title"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.saveTopBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
              <Ionicons name="checkmark-circle" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={[styles.editorWrapper, isKeyboardVisible ? { height: '80%', flex: 0, paddingBottom: 10 } : { flex: 1 }]}>
          <EnrichedTextInput
            key={diary.id || 'new-editor'}
            ref={editorRef}
           defaultValue={htmlContent}
            placeholder="Start writing..."
            onChangeHtml={(e) => {
              const html = e.nativeEvent?.value; // ডকুমেন্টেশন বলছে প্রপার্টি 'value'
              setHtmlContent(html);
            }}


            onChangeState={(e) => setStylesState(e.nativeEvent)}
            style={styles.editorContainer}
            textStyle={styles.editorText}
            placeholderTextColor="#555"
            cursorColor="#b7c7ff"
            scrollEnabled={true}
          />
        </View>

        {/* এনিমেটেড কিবোর্ড টুলবার */}
        {isKeyboardVisible && (
          <View style={[styles.keyboardToolbar, isToolbarExpanded && { width: '100%', borderRadius: 0 }]}>
            {isToolbarExpanded ? (
              <View style={styles.expandedRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 10 }}>
                  {renderToolbarItems()}
                </ScrollView>
                <TouchableOpacity onPress={toggleToolbar} style={styles.closeToggle}>
                  <Ionicons name="chevron-forward" size={20} color="#b7c7ff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={toggleToolbar} style={styles.collapsedToggle}>
                <MaterialIcons name="format-color-text" size={22} color="#000" />
                <Text style={styles.toolsText}>Tools</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>

      <Modal visible={showTitleModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.titleModalContent}>
            <TextInput value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor="#555" style={styles.modalTitleInput} autoFocus />
            <TouchableOpacity style={styles.doneBtn} onPress={() => setShowTitleModal(false)}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DrawingCanvas visible={showDrawing} onClose={() => setShowDrawing(false)} onInsert={onInsertDrawing} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1014' },
  topSection: { backgroundColor: '#16171d', borderBottomWidth: 1, borderColor: '#25262b', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingBottom: 15 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 8 },
  titleTrigger: { backgroundColor: '#1f212a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, maxWidth: width * 0.5 },
  titleText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  saveTopBtn: { flexDirection: 'row', backgroundColor: '#b7c7ff', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 15, alignItems: 'center' },
  saveBtnText: { color: '#000', fontWeight: 'bold', marginRight: 4, fontSize: 14 },

  toolbarBtn: { padding: 10, borderRadius: 8, marginHorizontal: 2 },
  activeBtn: { backgroundColor: '#25262b' },
  separator: { width: 1, height: 20, backgroundColor: '#333', marginHorizontal: 10, alignSelf: 'center' },

  keyboardToolbar: {
    backgroundColor: '#b7c7ff',
    height: 45,
    width: 90,
    alignSelf: 'flex-end',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    justifyContent: 'center',
    marginBottom: 5
  },
  collapsedToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  toolsText: { fontWeight: 'bold', marginLeft: 5, fontSize: 12 },
  expandedRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16171d', height: '100%', width: '100%' },
  closeToggle: { padding: 10, borderLeftWidth: 1, borderColor: '#25262b' },

  editorWrapper: { width: width, backgroundColor: '#0f1014' },
  editorContainer: { flex: 1, paddingHorizontal: 40, paddingVertical: 40, backgroundColor: '#0f1014', margin: 10 },
  editorText: { color: '#ddd', fontSize: 9, lineHeight: 28 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  titleModalContent: { backgroundColor: '#16171d', borderRadius: 15, padding: 20 },
  modalTitleInput: { color: '#fff', fontSize: 20, borderBottomWidth: 1, borderBottomColor: '#b7c7ff', marginBottom: 20, padding: 5 },
  doneBtn: { backgroundColor: '#b7c7ff', padding: 12, borderRadius: 10, alignItems: 'center' },
  doneBtnText: { color: '#000', fontWeight: 'bold' }
});