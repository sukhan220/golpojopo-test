

// DiaryTab.jsx
import { useLibrary } from '@/context/libraryContext';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
import DiaryEditor from './DiaryEditor';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width / 2) - 22;

// এখানে onStateChange প্রপসটি গ্রহণ করতে হবে
export default function DiaryTab({ onStateChange }) {
  const { library, removeNote, updateNote } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [editingDiary, setEditingDiary] = useState(null);
  const [readingDiary, setReadingDiary] = useState(null);
  const [menuDiary, setMenuDiary] = useState(null);

  // এডিটর স্টেট চেঞ্জ হলে পেরেন্টকে (NotesScreen) জানানো
  useEffect(() => {
    if (onStateChange) {
      onStateChange(!!editingDiary); // editingDiary থাকলে true পাঠাবে, নাহলে false
    }
  }, [editingDiary]);

  const diaries = useMemo(() => {
    if (!library?.notes) return [];
    const list = [];
    Object.entries(library.notes).forEach(([bookId, bucket]) => {
      if (Array.isArray(bucket?.diaries)) {
        bucket.diaries.forEach(d => list.push({ ...d, bookId }));
      }
    });

    const sorted = list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
    });

    if (!searchQuery.trim()) return sorted;
    return sorted.filter(d =>
      d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [library, searchQuery]);



  const togglePin = (diary) => {
    const updated = { ...diary, isPinned: !diary.isPinned };
    updateNote(diary.bookId, 'diaries', diary.id, updated);
    setMenuDiary(null);
  };



  if (editingDiary) {
    return (
      <DiaryEditor
        key={editingDiary.id || 'new'}
        diary={editingDiary}
        bookId={editingDiary.bookId || "general"} // bookId পাস করা নিশ্চিত করুন
        onBack={() => setEditingDiary(null)}
      />
    );
  }

  const renderCard = ({ item: d }) => (
    <TouchableOpacity
      style={[styles.card, d.isPinned && styles.pinnedCard]}
      activeOpacity={0.8}
      onPress={() => setReadingDiary(d)}
    >
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {d.isPinned && <MaterialIcons name="push-pin" size={14} color="#F3C623" style={{ marginRight: 4 }} />}
          <Text style={styles.cardTitle} numberOfLines={1}>
            {d.title || 'Untitled Entry'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setMenuDiary(d)} hitSlop={15}>
          <MaterialIcons name="more-vert" size={18} color="#888" />
        </TouchableOpacity>
      </View>

      <Text style={styles.dateLabel}>
        {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Personal Note'}
      </Text>

      <View style={styles.webviewContainer} pointerEvents="none">
        <WebView
          originWhitelist={['*']}
          scrollEnabled={false}
          style={{ backgroundColor: 'transparent' }}

          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          mixedContentMode="always"
          source={{
            html: `<html><head><style>body { background: transparent; color: #ddd; font-size: 48px; line-height: 1.4; margin: 0; font-family: sans-serif; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; }</style></head><body>${d.content || ''}</body></html>`,
          }}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerContainer}>
          {!isSearching ? (
            <View style={styles.titleRow}>
              <Text style={styles.mainTitle}>Diaries</Text>
              <TouchableOpacity onPress={() => setIsSearching(true)} style={styles.searchIconBtn}>
                <Feather name="search" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.searchActiveRow}>
              <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <TextInput
                style={styles.fullSearchInput}
                placeholder="Search notes..."
                placeholderTextColor="#666"
                autoFocus
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <FlatList
          data={diaries}
          renderItem={renderCard}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnGap}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MaterialIcons name="auto-stories" size={50} color="#222" />
              <Text style={styles.emptyText}>
                {searchQuery ? "No matches found." : "Your journal is empty."}
              </Text>
            </View>
          }
        />
      </SafeAreaView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => setEditingDiary({ title: '', content: '', id: null })}>
        <Ionicons name="pencil" size={22} color="#000" />
      </TouchableOpacity>



      {/* মডালগুলো আগের মতোই থাকবে... */}
      <Modal visible={!!readingDiary} animationType="slide" transparent>
        <View style={styles.readOverlay}>
          <View style={styles.readContainer}>
            <View style={styles.readHeader}>
              <TouchableOpacity onPress={() => setReadingDiary(null)} hitSlop={20}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  const target = readingDiary; // ডাটা কপি করে রাখা
                  setReadingDiary(null);       // রিড মডাল বন্ধ করা
                  setEditingDiary(target);     // এডিটরে পাঠানো
                }}
              >
                <Feather name="edit-3" size={16} color="#000" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.readTitle}>{readingDiary?.title || 'Untitled'}</Text>
              <Text style={styles.readDate}>
                {readingDiary?.createdAt ? new Date(readingDiary.createdAt).toDateString() : ''}
              </Text>
              <WebView
                originWhitelist={['*']}
                style={styles.fullWebView}
                showsVerticalScrollIndicator={false} // <--- এটি স্ক্রল বার লুকাবে
                showsHorizontalScrollIndicator={false}
                allowFileAccess={true}
                allowUniversalAccessFromFileURLs={true}
                mixedContentMode="always"
                source={{
                  html: `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=4.0">
          <style>
            body { 
              color: #ddd; 
              font-size: 14px; 
              line-height: 1.6; 
              font-family: -apple-system, sans-serif; 
              background-color: #1e1e24; 
              padding: 10px;
              margin: 0;
            }
            /* প্যারাগ্রাফের গ্যাপ কমানোর স্টাইল */
            p { 
              margin-top: 0px; 
              margin-bottom: 2px; /* খুব সামান্য গ্যাপ রাখা হয়েছে যাতে পড়া যায় */
              text-align: justify; 
            }
            /* ইমেজের ব্লক স্টাইল */
            img { 
              display: block;
              max-width: 100%; 
              height: auto; 
              border-radius: 12px; 
              margin: 15px auto; /* ইমেজ মাঝখানে থাকবে এবং উপরে নিচে গ্যাপ থাকবে */
            }
            /* লিস্ট বা অন্যান্য এলিমেন্ট ঠিক করা */
            ul, ol {
              padding-left: 20px;
              margin-top: 5px;
            }
            blockquote {
              border-left: 4px solid #b7c7ff;
              padding-left: 15px;
              margin-left: 0;
              color: #bbb;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          ${readingDiary?.content || ''}
        </body>
      </html>
    `,
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={!!menuDiary} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setMenuDiary(null)}>
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => togglePin(menuDiary)}>
              <MaterialIcons name="push-pin" size={20} color="#fff" />
              <Text style={[styles.menuText, { color: '#fff' }]}>{menuDiary?.isPinned ? 'Unpin Note' : 'Pin Note'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { borderTopWidth: 1, borderColor: '#333' }]}
              onPress={() => {
                removeNote(menuDiary.bookId, 'diaries', menuDiary.id);
                setMenuDiary(null);
              }}
            >
              <MaterialIcons name="delete-sweep" size={20} color="#ff6b6b" />
              <Text style={styles.menuText}>Delete Entry</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f12' },
  safe: { flex: 1 },
  headerContainer: { paddingHorizontal: 16, height: 60, justifyContent: 'center', backgroundColor: '#0f0f12' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  searchIconBtn: { padding: 5 },
  searchActiveRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e24', borderRadius: 15, paddingHorizontal: 10, height: 45 },
  fullSearchInput: { flex: 1, color: '#fff', fontSize: 16, marginLeft: 10 },
  listPadding: { paddingHorizontal: 15, paddingBottom: 120, paddingTop: 10 },
  columnGap: { justifyContent: 'space-between', marginBottom: 15 },
  card: { width: CARD_WIDTH, height: 190, backgroundColor: '#16161a', borderRadius: 22, padding: 15, borderWidth: 1, borderColor: '#222' },
  pinnedCard: { borderColor: '#F3C62355', backgroundColor: '#1c1c21' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { color: '#fff', fontWeight: '700', fontSize: 16, flex: 1 },
  dateLabel: { color: '#555', fontSize: 10, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  webviewContainer: { flex: 1 },
  readOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  readContainer: { height: height * 0.88, backgroundColor: '#1e1e24', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  readHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  editButton: { flexDirection: 'row', backgroundColor: '#b7c7ff', paddingHorizontal: 15, paddingVertical: 7, borderRadius: 15, alignItems: 'center' },
  editButtonText: { color: '#000', fontWeight: 'bold', fontSize: 14, marginLeft: 5 },
  readTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  readDate: { color: '#666', fontSize: 13, marginBottom: 10 },
  fullWebView: { backgroundColor: 'transparent' },
  fab: { position: 'absolute', right: 20, bottom: 80, width: 56, height: 56, borderRadius: 18, backgroundColor: '#b7c7ff', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#444', marginTop: 10, fontSize: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  menu: { width: 200, backgroundColor: '#1e1e24', borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  menuText: { color: '#ff6b6b', marginLeft: 12, fontSize: 14, fontWeight: '600' },
}); 
