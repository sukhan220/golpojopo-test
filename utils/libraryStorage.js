

// libraryStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEY = 'APP_LIBRARY_V1';

const defaultState = {
  playlists: {},
  booklists: {},
  history: {},
  notes: {}, // 👇 structure inside created dynamically
  todos: {},
  tags: {},
};

function cloneDefault() {
  return JSON.parse(JSON.stringify(defaultState));
}



async function getAll() {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : cloneDefault();
    }

    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : cloneDefault();
  } catch (e) {
    console.log('getAll error', e);
    return cloneDefault();
  }
}

async function saveAll(data) {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(KEY, JSON.stringify(data));
      return;
    }

    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.log('saveAll error', e);
  }
}


function ensureNoteBuckets(data, bookId, sourceType = 'book') {

  if (!data.notes) data.notes = {};


  if (!data.notes[bookId]) {
    data.notes[bookId] = {
      sourceType,   // 'book' | 'audio'
      quotes: [],   // only for book
      clips: [],    // only for audio
      diaries: []
    };
  }
}


const getMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const LibraryStorage = {

  /* ⭐ BOOKLIST */

  async toggleFavorite(book) {
    const data = await getAll();
    if (!data.booklists) data.booklists = {};
    if (data.booklists[book.id]) {
      delete data.booklists[book.id];
    } else {
      data.booklists[book.id] = {
        type: book.audio ? 'audio' : 'book',
        addedAt: Date.now(),
      };
    }
    await saveAll(data);
  },

  async removeBooklist(bookId) {
    const data = await getAll();
    delete data.booklists?.[bookId];
    await saveAll(data);
  },


  /* 📚 BOOKLISTS */

  async createBooklist(title) {
    const data = await getAll();
    const id = Date.now().toString();

    data.booklists[id] = {
      title,
      items: [],
      createdAt: Date.now(),
    };

    await saveAll(data);
    return id;
  },

  async addToBooklist(booklistId, bookId) {
    const data = await getAll();
    const list = data.booklists?.[booklistId];
    if (!list) return;

    if (!list.items.includes(bookId)) {
      list.items.push(bookId);
      await saveAll(data);
    }
  },

  async removeFromBooklist(booklistId, bookId) {
    const data = await getAll();
    const list = data.booklists?.[booklistId];
    if (!list) return;

    list.items = list.items.filter(id => id !== bookId);
    await saveAll(data);
  },

  async removeBooklist(booklistId) {
    const data = await getAll();
    delete data.booklists?.[booklistId];
    await saveAll(data);
  },


  /* 🎧 PLAYLIST */

  async createPlaylist(title) {
    const data = await getAll();
    const id = Date.now().toString();
    data.playlists[id] = { title, items: [] };
    await saveAll(data);
    return id;
  },

  async removePlaylist(playlistId) {
    const data = await getAll();
    delete data.playlists?.[playlistId];
    await saveAll(data);
  },

  // async removeFromPlaylist(playlistId, bookId) {
  //   const data = await getAll();
  //   const list = data.playlists?.[playlistId];
  //   if (!list) return;

  //   // ফিল্টার করে নির্দিষ্ট bookId টি বাদ দিন
  //   list.items = list.items.filter(id => id !== bookId);

  //   await saveAll(data);
  // },

  // async addToPlaylist(playlistId, bookId) {
  //   const data = await getAll();
  //   const list = data.playlists?.[playlistId];
  //   if (!list) return;
  //   if (!list.items.includes(bookId)) {
  //     list.items.push(bookId);
  //     await saveAll(data);
  //   }
  // },

  async addToPlaylist(playlistId, itemData) {
  const data = await getAll();
  const list = data.playlists?.[playlistId];
  if (!list) return;

  const exists = list.items.some(it => {
    if (itemData.isPart) {
      // পার্ট হলে: মেইন আইডি + পার্ট নাম্বার দুইটাই মিলতে হবে
      return it.isPart && it.bookId === itemData.bookId && it.partNo === itemData.partNo;
    } 
    // পার্ট না হলে: শুধু মেইন বুক আইডি (bookId) চেক করলেই হবে
    return !it.isPart && it.bookId === itemData.bookId;
  });

  if (!exists) {
    list.items.push(itemData);
    await saveAll(data);
  }
},

async removeFromPlaylist(playlistId, targetItem) {
  const data = await getAll();
  const list = data.playlists?.[playlistId];
  if (!list) return;

  list.items = list.items.filter(it => {
    if (targetItem.isPart) {
      // পার্ট হলে: বুক আইডি ও পার্ট নাম্বার ম্যাচ করলে বাদ দাও
      return !(it.isPart && it.bookId === targetItem.bookId && it.partNo === targetItem.partNo);
    }
    // পার্ট না হলে: বুক আইডি ম্যাচ করলে এবং সেটি পার্ট না হলে বাদ দাও
    return !(!it.isPart && it.bookId === targetItem.bookId);
  });

  await saveAll(data);
},
  /* 🕘 HISTORY */






  async saveHistory(bookId, payload) {
    const data = await getAll();

    if (!data.history) data.history = {};

    data.history[bookId] = {
      ...payload,        // type, page / second
      lastReadAt: Date.now(),
    };

    await saveAll(data);
  },

  async clearHistory() {
    const data = await getAll();
    data.history = {};
    await saveAll(data);
  },


  /* 📝 NOTES (MENU BASED) */





  async removeNote(bookId, type, noteId) {
    const data = await getAll();
    ensureNoteBuckets(data, bookId);
    data.notes[bookId][type] =
      data.notes[bookId][type].filter(n => n.id !== noteId);
    await saveAll(data);
  },

  async renameNote(bookId, type, noteId, newTitle) {
    const data = await getAll();
    ensureNoteBuckets(data, bookId);
    const note = data.notes[bookId][type].find(n => n.id === noteId);
    if (note) {
      note.title = newTitle;
      note.updatedAt = Date.now();
      await saveAll(data);
    }
  },




  // async addNote(bookId, sourceType = 'general', type, payload) {
   
  //   const data = await getAll();

  //   ensureNoteBuckets(data, bookId, sourceType);

  //   // নতুন অবজেক্ট তৈরি
  //   const newNote = {
  //     id: payload.id,
  //     title: payload.title || 'Untitled',
  //     content: payload.content || '',
  //     ref: payload.ref || null,
  //     // 👇 এখানে payload.meta যোগ করা হলো, যা আপনার player.jsx থেকে আসছে
  //     meta: payload.meta || null,
  //     createdAt: Date.now(),
  //     updatedAt: payload.id,
  //   };

  //   data.notes[bookId][type].push(newNote);

    
  //   await saveAll(data);
  // },

async addNote(bookId, sourceType = 'general', type, payload) {
    const data = await getAll();

    ensureNoteBuckets(data, bookId, sourceType);

    // ১. নিশ্চিত করুন নোটের একটি ইউনিক আইডি আছে
    const uniqueId = payload.id || Date.now().toString();

    // ২. নতুন অবজেক্ট তৈরি
    const newNote = {
      id: uniqueId,
      title: payload.title || 'Untitled',
      content: payload.content || '',
      ref: payload.ref || null,
      meta: payload.meta || null,
      isPinned: payload.isPinned || false, // ডিফল্ট পিন ফলস
      createdAt: Date.now(),
      updatedAt: Date.now(), // 👈 এটি অবশ্যই বর্তমান সময় হতে হবে
    };

    // ৩. ডাটা পুশ করুন
    if (!data.notes[bookId][type]) {
      data.notes[bookId][type] = [];
    }
    
    data.notes[bookId][type].push(newNote);

    // ৪. স্টোরেজে সেভ করুন
    await saveAll(data);
    return newNote; // রিটার্ন করা ভালো যাতে এডিটর কনফার্ম হতে পারে
},

  // এটি LibraryStorage অবজেক্টের ভেতরে যোগ করুন
async updateNote(bookId, type, noteId, updatedData) {
    const data = await getAll();
    ensureNoteBuckets(data, bookId);
    
    // নির্দিষ্ট ডায়েরি বা নোটটি খুঁজে বের করা
    const noteIndex = data.notes[bookId][type].findIndex(n => n.id === noteId);
    
    if (noteIndex !== -1) {
      // আগের ডাটার সাথে নতুন ডাটা (যেমন: isPinned: true) মার্জ করা
      data.notes[bookId][type][noteIndex] = {
        ...data.notes[bookId][type][noteIndex],
        ...updatedData,
        updatedAt: Date.now(),
      };
      await saveAll(data);
    }
},




  /* 📝 TODOS */


  async addTodo(text = '') {
    console.log('Adding todo:', { text });
    const data = await getAll();
    if (!data.todos) data.todos = {};

    const id = Date.now().toString();

    data.todos[id] = {
      id,
      text,
      completed: false,
      createdAt: Date.now(),
      updatedAt: null,
    };

    await saveAll(data);
    return id;
  },

  async toggleTodo(todoId) {
    const data = await getAll();
    const todo = data.todos?.[todoId];
    if (!todo) return;

    todo.completed = !todo.completed;
    todo.updatedAt = Date.now();

    await saveAll(data);
  },


  async updateTodo(todoId, newText) {
    const data = await getAll();
    const todo = data.todos?.[todoId];
    if (!todo) return;

    todo.text = newText;
    todo.updatedAt = Date.now();

    await saveAll(data);
  },

  async removeTodo(todoId) {
    const data = await getAll();
    if (!data.todos) return;

    delete data.todos[todoId];
    await saveAll(data);
  },



  /* 📝 NOTES CONTENT UPDATE */



  async updateNoteContent(bookId, type, noteId, content) {
    const data = await getAll();
    ensureNoteBuckets(data, bookId);
    const note = data.notes[bookId][type].find(n => n.id === noteId);
    if (note) {
      note.content = content;
      note.updatedAt = Date.now();
      await saveAll(data);
    }
  },

  async getAll() {
    return await getAll();
  },
};
