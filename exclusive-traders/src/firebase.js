import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAilv4CYQk1BoVMaWAGZs5cDotcmRHk9Qo",
  authDomain: "et-reg-f8cd9.firebaseapp.com",
  databaseURL: "https://et-reg-f8cd9-default-rtdb.firebaseio.com",
  projectId: "et-reg-f8cd9",
  storageBucket: "et-reg-f8cd9.firebasestorage.app",
  messagingSenderId: "516990767646",
  appId: "1:516990767646:web:7102e357f84700a09dd40f",
  measurementId: "G-C0BXCQXBQJ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getDatabase(app);