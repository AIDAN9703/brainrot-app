import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace the following with your app's Firebase project configuration
// This info can be found in your Firebase console under Project Settings
const firebaseConfig = {
    apiKey: process.env.GOOGLE_API_KEY,
    authDomain: "brainrot-dictionary.firebaseapp.com",
    projectId: "brainrot-dictionary",
    storageBucket: "brainrot-dictionary.firebasestorage.app",
    messagingSenderId: "491639893030",
    appId: "1:491639893030:web:dea335d0b9afa1d06a8ae7",
    measurementId: "G-6QQNS70DQ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

export { app, auth, db, storage };

// Default export to satisfy Expo Router
export default { app, auth, db, storage }; 