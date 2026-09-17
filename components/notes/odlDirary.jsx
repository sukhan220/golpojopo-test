


// DiaryEditor.jsx
import { useLibrary } from '@/context/libraryContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';

const editorActions = [
  actions.setBold,
  actions.setItalic,
  actions.setUnderline,
  actions.alignLeft,
  actions.alignCenter,
  actions.alignRight,
  actions.alignFull,
  actions.insertBulletsList,
  actions.insertOrderedList,
  actions.insertLine,
  actions.undo,
  actions.redo,
  actions.checkboxList,
];

export default function DiaryEditor({ diary = {}, bookId = "general", onBack }) {
  const { addNote, renameNote, updateNoteContent } = useLibrary();
  const richText = useRef();

  const [title, setTitle] = useState(diary.title || '');
  const [content, setContent] = useState(diary.content || '');
  const hasGuardianSpace = useRef(false);

  const handleChange = (html) => {
    const text = html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, '')
      .trim();

    if (hasGuardianSpace.current && text.length === 0) {
      richText.current?.setContentHTML('&nbsp;');
      return;
    }

    if (text.length > 0) {
      hasGuardianSpace.current = false;
    }

    setContent(html);
  };

  const handleSave = async () => {
    try {
      console.log("Saving Diary:", { title, content });
      const html = await richText.current?.getContentHtml();

      const isContentEmpty =
        !html || html.replace(/<[^>]*>/g, '').trim().length === 0;

      if (isContentEmpty && !title.trim()) {
        onBack();
        return;
      }

      const sourceType = 'general';
      const type = 'diaries';

      if (diary && diary.id) {
        if (title.trim() !== diary.title) {
          await renameNote(bookId, type, diary.id, title.trim());
        }
        await updateNoteContent(bookId, type, diary.id, html);
        console.log("Updated Successfully");
      } else {
        await addNote(
          bookId,
          sourceType,
          type,
          {
            title: title.trim() || 'Untitled',
            content: html,
          }
        );
        console.log("Added Successfully");
      }
      onBack();
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  const renderIcon = (name, tintColor) => (
    <MaterialIcons name={name} size={20} color={tintColor} />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* --- Header Section --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
           <TouchableOpacity style={styles.saveTopBtn} onPress={handleSave}>
             <Text style={styles.saveBtnText}>Save</Text>
             <Ionicons name="checkmark-circle" size={20} color="#000" />
           </TouchableOpacity>
        </View>
      </View>

      {/* --- Rich Text Toolbar --- */}
      <RichToolbar
        editor={richText}
        style={styles.toolbar}
        flatContainerStyle={styles.toolbarContent}
        iconTint="#aaa"
        selectedIconTint="#b7c7ff"
        actions={editorActions}
        iconMap={{
          [actions.setBold]: ({ tintColor }) => renderIcon('format-bold', tintColor),
          [actions.setItalic]: ({ tintColor }) => renderIcon('format-italic', tintColor),
          [actions.setUnderline]: ({ tintColor }) => renderIcon('format-underlined', tintColor),
          [actions.insertBulletsList]: ({ tintColor }) => renderIcon('format-list-bulleted', tintColor),
          [actions.insertOrderedList]: ({ tintColor }) => renderIcon('format-list-numbered', tintColor),
          [actions.undo]: ({ tintColor }) => renderIcon('undo', tintColor),
          [actions.redo]: ({ tintColor }) => renderIcon('redo', tintColor),
          [actions.checkboxList]: ({ tintColor }) => renderIcon('check-box', tintColor),
          [actions.insertLine]: ({ tintColor }) => renderIcon('horizontal-rule', tintColor),
          [actions.heading1]: ({ tintColor }) => renderIcon('format-size', tintColor),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.editorContainer}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Diary Title"
            placeholderTextColor="#444"
            style={styles.titleInput}
            multiline={false}
          />

          <RichEditor
            ref={richText}
            editorInitializedCallback={() => {
              if (!diary?.content) {
                hasGuardianSpace.current = true;
                richText.current?.setContentHTML('&nbsp;');
              } else {
                richText.current?.setContentHTML(diary.content);
              }
            }}
            onChange={handleChange}
            placeholder="Start writing your thoughts..."
            editorStyle={{
              backgroundColor: '#0f1014',
              color: '#ddd',
              caretColor: '#b7c7ff',
              contentCSSText: 'font-size: 18px; line-height: 1.6; min-height: 300px;',
            }}
            style={styles.richEditor}
            useContainer={true}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1014' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingHorizontal: 10,
    backgroundColor: '#0f1014',
    paddingBottom: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 8,
  },
  saveTopBtn: {
    flexDirection: 'row',
    backgroundColor: '#b7c7ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 2,
  },
  saveBtnText: {
    color: '#000',
    fontWeight: 'bold',
    marginRight: 6,
    fontSize: 14,
  },
  toolbar: {
    backgroundColor: '#16171d',
    borderBottomWidth: 1,
    borderColor: '#222',
    height: 50,
  },
  toolbarContent: {
    backgroundColor: 'transparent',
  },
  editorContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  titleInput: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    paddingVertical: 5,
  },
  richEditor: {
    flex: 1,
    backgroundColor: '#0f1014',
  },
});