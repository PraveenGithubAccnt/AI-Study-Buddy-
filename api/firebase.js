import { getApps, initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_API_KEY, APP_ID} from '@env';

// console.log('API Key:', FIREBASE_API_KEY);
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "study-buddy-fdb27.firebaseapp.com",
  projectId: "study-buddy-fdb27",
  storageBucket: "study-buddy-fdb27.firebasestorage.app",
  messagingSenderId: "67823106415",
  appId: APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);

export { auth, db };
