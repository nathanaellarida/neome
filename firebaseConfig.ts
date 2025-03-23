// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 🔥 Replace with your Firebase Config (from Firebase Console)
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_WEB_API_KEY",
  authDomain: "neomesystem.firebaseapp.com",
  projectId: "neomesystem",
  storageBucket: "neomesystem.appspot.com",
  messagingSenderId: "474612616419",
  appId: "1:474612616419:web:d7b8909e54ec1aee0409d6",
  measurementId: "G-Y3704V01ZP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
