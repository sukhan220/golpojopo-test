import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCX7XFkHWffdUiCm6wHj2C_uQerFfME2EQ",
  authDomain: "golpojolpo-68e5b.firebaseapp.com",
  projectId: "golpojolpo-68e5b",
  storageBucket: "golpojolpo-68e5b.appspot.com",
  messagingSenderId: "814218238664",
  appId: "1:814218238664:android:28708f95999b29cfd563fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Use persistent auth for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

