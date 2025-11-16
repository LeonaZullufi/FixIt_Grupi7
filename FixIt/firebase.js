
import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyAs5VK7OVQ39v1hazIycRfpCwi8KQnZRuA",
  authDomain: "login-register-5243e.firebaseapp.com",
  projectId: "login-register-5243e",
  storageBucket: "login-register-5243e.firebasestorage.app",
  messagingSenderId: "483051599257",
 
};

const app = initializeApp(firebaseConfig);


let auth;

if (Platform.OS === "web") {

  auth = getAuth(app);
} else {

  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

const db = getFirestore(app);

export { app, auth, db, signOut, onAuthStateChanged };
