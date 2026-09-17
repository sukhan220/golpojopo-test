// //ListTab.jsx

// import React, { useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   SafeAreaView,
//   StatusBar,
//   StyleSheet,
// } from 'react-native';
// import { useLibrary } from '@/context/libraryContext';

// export default function ListTab({ bookId = 'global' }) {
//   const {
//     library,
//     addTodo,
//     toggleTodo,
//     removeTodo,
//     updateTodo,
//   } = useLibrary();

//   const [text, setText] = useState('');
//   const [search, setSearch] = useState('');

//   // =========================
//   // COLLECT TODOS
//   // =========================
//   const todos = useMemo(() => {
//     if (!library?.notes) return [];

//     const all = [];
//     Object.entries(library.notes).forEach(([bid, bucket]) => {
//       if (Array.isArray(bucket.todos)) {
//         bucket.todos.forEach(t =>
//           all.push({ ...t, bookId: bid })
//         );
//       }
//     });

//     return all;
//   }, [library]);

//   const filtered = todos.filter(t =>
//     t.text.toLowerCase().includes(search.toLowerCase())
//   );

//   const pending = filtered.filter(t => !t.completed);
//   const completed = filtered.filter(t => t.completed);

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#1c131e" />

//       {/* --- FIXED HEADER (Search & Add Input) --- */}
//       <View style={styles.fixedHeader}>
//         {/* 🔍 SEARCH */}
//         <TextInput
//           value={search}
//           onChangeText={setSearch}
//           placeholder="Search todo..."
//           placeholderTextColor="#777"
//           style={styles.searchInput}
//         />

//         {/* ➕ ADD TODO */}
//         <View style={styles.addSection}>
//           <TextInput
//             value={text}
//             onChangeText={setText}
//             placeholder="Add todo..."
//             placeholderTextColor="#777"
//             style={styles.addInput}
//           />

//           <TouchableOpacity
//             onPress={() => {
//               if (!text.trim()) return;
//               addTodo(bookId, text);
//               setText('');
//             }}
//             style={styles.addButton}
//           >
//             <Text style={styles.addButtonText}>Add</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* --- SCROLLABLE LIST --- */}
//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* 🔹 PENDING */}
//         {pending.map(t => (
//           <TodoItem
//             key={t.id}
//             item={t}
//             onToggle={() => toggleTodo(t.bookId, t.id)}
//             onDelete={() => removeTodo(t.bookId, t.id)}
//             onUpdate={(v) => updateTodo(t.bookId, t.id, v)}
//           />
//         ))}

//         {/* ✅ COMPLETED */}
//         {completed.length > 0 && (
//           <Text style={styles.completedHeader}>Completed</Text>
//         )}

//         {completed.map(t => (
//           <TodoItem
//             key={t.id}
//             item={t}
//             onToggle={() => toggleTodo(t.bookId, t.id)}
//             onDelete={() => removeTodo(t.bookId, t.id)}
//             onUpdate={(v) => updateTodo(t.bookId, t.id, v)}
//           />
//         ))}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// /* ================= TODO ITEM COMPONENT ================= */

// function TodoItem({ item, onToggle, onDelete, onUpdate }) {
//   const [editing, setEditing] = useState(false);
//   const [value, setValue] = useState(item.text);

//   return (
//     <View style={styles.todoCard}>
//       <TouchableOpacity onPress={onToggle}>
//         <Text style={{ fontSize: 18, marginRight: 10 }}>
//           {item.completed ? '☑️' : '⬜'}
//         </Text>
//       </TouchableOpacity>

//       {editing ? (
//         <TextInput
//           value={value}
//           onChangeText={setValue}
//           autoFocus
//           onBlur={() => {
//             setEditing(false);
//             if (value.trim() && value !== item.text) {
//               onUpdate(value);
//             } else {
//               setValue(item.text);
//             }
//           }}
//           style={styles.editingInput}
//         />
//       ) : (
//         <TouchableOpacity
//           style={{ flex: 1 }}
//           onLongPress={() => setEditing(true)}
//         >
//           <Text
//             style={{
//               color: item.completed ? '#777' : '#ccc',
//               textDecorationLine: item.completed ? 'line-through' : 'none',
//             }}
//           >
//             {item.text}
//           </Text>
//         </TouchableOpacity>
//       )}

//       <TouchableOpacity onPress={onDelete}>
//         <Text style={{ color: '#ff7777', fontSize: 16 }}>✕</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1c131e',
//   },
//   fixedHeader: {
//     padding: 12,
//     backgroundColor: '#1c131e',
//     zIndex: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#2a1f2f',
//   },
//   searchInput: {
//     backgroundColor: '#2a1f2f',
//     color: '#fff',
//     borderRadius: 10,
//     padding: 10,
//     marginBottom: 10,
//   },
//   addSection: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   addInput: {
//     flex: 1,
//     backgroundColor: '#2a1f2f',
//     color: '#fff',
//     borderRadius: 10,
//     padding: 10,
//   },
//   addButton: {
//     backgroundColor: '#f9eccc',
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     justifyContent: 'center',
//   },
//   addButtonText: {
//     color: '#1c131e',
//     fontWeight: '600',
//   },
//   scrollContent: {
//     paddingHorizontal: 12,
//     paddingTop: 15,
//     paddingBottom: 30,
//   },
//   todoCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#2a1f2f',
//     borderRadius: 10,
//     padding: 10,
//     marginBottom: 10,
//   },
//   editingInput: {
//     flex: 1,
//     color: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#555',
//   },
//   completedHeader: {
//     color: '#888',
//     marginVertical: 10,
//     fontWeight: '600',
//   },
// });

// ListTab.jsx

import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useLibrary } from '@/context/libraryContext';

export default function ListTab() {
  const {
    library,
    addTodo,
    toggleTodo,
    removeTodo,
    updateTodo,
  } = useLibrary();

  const [text, setText] = useState('');
  const [search, setSearch] = useState('');

  // =========================
  // COLLECT TODOS (GLOBAL)
  // =========================
  const todos = useMemo(() => {
    if (!library?.todos) return [];
    return Object.values(library.todos);
  }, [library]);

  // =========================
  // FILTER
  // =========================
  const filtered = todos.filter(t =>
    (t.text || '').toLowerCase().includes(search.toLowerCase())
  );

  const pending = filtered.filter(t => !t.completed);
  const completed = filtered.filter(t => t.completed);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1c131e" />

      {/* --- FIXED HEADER --- */}
      <View style={styles.fixedHeader}>
        {/* 🔍 SEARCH */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search todo..."
          placeholderTextColor="#777"
          style={styles.searchInput}
        />

        {/* ➕ ADD TODO */}
        <View style={styles.addSection}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Add todo..."
            placeholderTextColor="#777"
            style={styles.addInput}
          />

          <TouchableOpacity
            onPress={() => {
              if (!text.trim()) return;
              addTodo(text.trim());
              setText('');
            }}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- LIST --- */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 🔹 PENDING */}
        {pending.map(t => (
          <TodoItem
            key={t.id}
            item={t}
            onToggle={() => toggleTodo(t.id)}
            onDelete={() => removeTodo(t.id)}
            onUpdate={(v) => updateTodo(t.id, v)}
          />
        ))}

        {/* ✅ COMPLETED */}
        {completed.length > 0 && (
          <Text style={styles.completedHeader}>Completed</Text>
        )}

        {completed.map(t => (
          <TodoItem
            key={t.id}
            item={t}
            onToggle={() => toggleTodo(t.id)}
            onDelete={() => removeTodo(t.id)}
            onUpdate={(v) => updateTodo(t.id, v)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= TODO ITEM ================= */

function TodoItem({ item, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.text);

  // keep in sync if updated externally
  useEffect(() => {
    setValue(item.text);
  }, [item.text]);

  return (
    <View style={styles.todoCard}>
      <TouchableOpacity onPress={onToggle}>
        <Text style={{ fontSize: 18, marginRight: 10 }}>
          {item.completed ? '☑️' : '⬜'}
        </Text>
      </TouchableOpacity>

      {editing ? (
        <TextInput
          value={value}
          onChangeText={setValue}
          autoFocus
          onBlur={() => {
            setEditing(false);
            if (value.trim() && value !== item.text) {
              onUpdate(value.trim());
            } else {
              setValue(item.text);
            }
          }}
          style={styles.editingInput}
        />
      ) : (
        <TouchableOpacity
          style={{ flex: 1 }}
          onLongPress={() => setEditing(true)}
        >
          <Text
            style={{
              color: item.completed ? '#777' : '#ccc',
              textDecorationLine: item.completed ? 'line-through' : 'none',
            }}
          >
            {item.text}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onDelete}>
        <Text style={{ color: '#ff7777', fontSize: 16 }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c131e',
  },
  fixedHeader: {
    padding: 12,
    backgroundColor: '#1c131e',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a1f2f',
  },
  searchInput: {
    backgroundColor: '#2a1f2f',
    color: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  addSection: {
    flexDirection: 'row',
    gap: 10,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#2a1f2f',
    color: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  addButton: {
    backgroundColor: '#f9eccc',
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#1c131e',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 15,
    paddingBottom: 30,
  },
  todoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a1f2f',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  editingInput: {
    flex: 1,
    color: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  completedHeader: {
    color: '#888',
    marginVertical: 10,
    fontWeight: '600',
  },
});
