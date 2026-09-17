

// // NotesScreen.jsx



import React, { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { useLibrary } from '@/context/libraryContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import DiaryTab from '@/components/notes/DiaryTab';
import ListTab from '@/components/notes/ListTab';
import NoteTab from '@/components/notes/NoteTab';

const MENUS = [
  { key: 'notes', label: 'Note' },
  { key: 'diary', label: 'Diary' },
  { key: 'todo', label: 'List' },
];

export default function NotesScreen() {
  const { library, addNote } = useLibrary();
  const navigation = useNavigation();
  const [active, setActive] = useState('notes');
  
  // নতুন স্টেট: এডিটর ওপেন আছে কি না তা ট্র্যাক করতে
  const [isEditing, setIsEditing] = useState(false);

  if (!library) return null;

  const saveItem = async (text, type) => {
    await addNote('global', {
      id: Date.now().toString(),
      type,
      title: text.slice(0, 30),
      text,
      createdAt: Date.now(),
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, isEditing && { paddingTop: 0 }]}>
      
      {/* এডিটর মোডে থাকলে ওপরের ব্যাক বাটন এবং মেনু বার হাইড হয়ে যাবে */}
      {!isEditing && (
        <>
          {/* BACK BUTTON */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color="#f9eccc" />
          </TouchableOpacity>

          {/* TOP MENU */}
          <View style={styles.topMenu}>
            {MENUS.map(m => (
              <TouchableOpacity 
                key={m.key} 
                onPress={() => setActive(m.key)}
                style={[styles.menuItem, active === m.key && styles.activeMenuItem]}
              >
                <Text
                  style={{
                    color: active === m.key ? '#f9eccc' : '#777',
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* CONTENT AREA */}
      <View style={{ flex: 1 }}>
        {active === 'diary' ? (
          /* DiaryTab-এ setIsEditing পাঠিয়ে দেওয়া হলো */
          <DiaryTab 
            library={library} 
            onSave={saveItem} 
            onStateChange={(editing) => setIsEditing(editing)} 
          />
        ) : (
          <ScrollView style={{ flex: 1, padding: 16 }}>
            {active === 'notes' && <NoteTab library={library} />}
            {active === 'todo' && <ListTab library={library} onSave={saveItem} />}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1c131e',
    paddingTop: Platform.OS === 'android' ? 28 : 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8, // একটু প্যাডিং বাড়ানো হয়েছে
  },
  topMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#2e2233',
    backgroundColor: '#1c131e',
  },
  menuItem: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  activeMenuItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#f9eccc',
  }
});