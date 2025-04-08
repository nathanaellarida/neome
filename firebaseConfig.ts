import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_WEB_API_KEY",
  authDomain: "neome-beac7.firebaseapp.com",
  projectId: "neome-beac7",
  storageBucket: "neome-beac7.appspot.com", // ✅ Correct bucket format
  messagingSenderId: "661096119075",
  appId: "1:661096119075:web:1904d314ad5648c0936a96",
  measurementId: "G-69RDXYTCW9"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // ✅ Official Firestore reference
const storage = getStorage(app);
const auth = getAuth(app);

// Export everything
export { app, db, storage, auth };
