

//libaryContext.jsx
import { LibraryStorage } from '@/utils/libraryStorage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadLibrary = async () => {
    const data = await LibraryStorage.getAll();
    setLibrary(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const refresh = async () => {
    await loadLibrary();
  };

  const api = {
    library,
    loading,
    refresh,

    /* ⭐ BOOKLIST */
    toggleFavorite: async (book) => {
      await LibraryStorage.toggleFavorite(book);
      refresh();
    },

    removeBooklist: async (bookId) => {
      await LibraryStorage.removeBooklist(bookId);
      refresh();
    },


    /* 🕘 HISTORY */
    saveHistory: async (bookId, payload) => {
      await LibraryStorage.saveHistory(bookId, payload);
      refresh();
    },
    clearHistory: async () => {
      await LibraryStorage.clearHistory();
      refresh();
    },


    /* 📚 BOOKLISTS */
    createBooklist: async (title) => {
      const id = await LibraryStorage.createBooklist(title);
      refresh();
      return id;
    },

    addToBooklist: async (listId, bookId) => {
      await LibraryStorage.addToBooklist(listId, bookId);
      refresh();
    },

    removeFromBooklist: async (listId, bookId) => {
      await LibraryStorage.removeFromBooklist(listId, bookId);
      refresh();
    },

    removeBooklist: async (listId) => {
      await LibraryStorage.removeBooklist(listId);
      refresh();
    },



    /* 📝 NOTES */

    addNote: async (bookId, sourceType, type, payload) => {
      await LibraryStorage.addNote(bookId, sourceType, type, payload);
      refresh();
    },


    removeNote: async (bookId, type, noteId) => {
      await LibraryStorage.removeNote(bookId, type, noteId);
      refresh();
    },

    renameNote: async (bookId, type, noteId, newTitle) => {
      await LibraryStorage.renameNote(bookId, type, noteId, newTitle);
      refresh();
    },

    updateNoteContent: async (bookId, type, noteId, content) => {
      await LibraryStorage.updateNoteContent(bookId, type, noteId, content);
      refresh();
    },

    // 👇 এই ফাংশনটি নতুন যোগ করা হলো পিন বা অন্যান্য আপডেট হ্যান্ডেল করার জন্য
    updateNote: async (bookId, type, noteId, updatedData) => {
      await LibraryStorage.updateNote(bookId, type, noteId, updatedData);
      refresh();
    },

    /* 📝 TODOS */
    addTodo: async (text) => {
      const id = await LibraryStorage.addTodo(text);
      refresh();
      return id;
    },


    toggleTodo: async (todoId) => {
      await LibraryStorage.toggleTodo(todoId);
      refresh();
    },

    updateTodo: async (todoId, newText) => {
      await LibraryStorage.updateTodo(todoId, newText);
      refresh();
    },

    removeTodo: async (todoId) => {
      await LibraryStorage.removeTodo(todoId);
      refresh();
    },


    /* 🎧 PLAYLIST */
    createPlaylist: async (title) => {
      const id = await LibraryStorage.createPlaylist(title);
      refresh();
      return id;
    },

    // addToPlaylist: async (playlistId, bookId) => {
      
    //   await LibraryStorage.addToPlaylist(playlistId, bookId);
    //   refresh();
    // },

    removePlaylist: async (playlistId) => {
      await LibraryStorage.removePlaylist(playlistId);
      refresh();
    },

 

    // এখানে bookId-র বদলে itemData (পুরো অবজেক্ট) গ্রহণ করবে
    addToPlaylist: async (playlistId, itemData) => {
      await LibraryStorage.addToPlaylist(playlistId, itemData);
      refresh();
    },

    // এখানে bookId-র বদলে targetItem (পুরো অবজেক্ট) গ্রহণ করবে যাতে isPart চেক করা যায়
    removeFromPlaylist: async (playlistId, targetItem) => {
      await LibraryStorage.removeFromPlaylist(playlistId, targetItem);
      refresh();
    }
  };

  return (
    <LibraryContext.Provider value={api}>
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider');
  return ctx;
};
