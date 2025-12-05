// src/firebasegetquote.js
// Firebase configuration and initialization for Get Quote functionality

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration for quotes
const firebaseConfig = {
  apiKey: "AIzaSyBtmyexM78vVascfmExnwTnbXjDnxh4XtQ",
  authDomain: "et-getquote.firebaseapp.com",
  databaseURL: "https://et-getquote-default-rtdb.firebaseio.com",
  projectId: "et-getquote",
  storageBucket: "et-getquote.firebasestorage.app",
  messagingSenderId: "686843981203",
  appId: "1:686843981203:web:68656bde55932b9a6acc66",
  measurementId: "G-772LRM5FDB"
};

// Initialize Firebase app for quotes (this is a separate instance)
const quoteApp = initializeApp(firebaseConfig, "quoteApp");
const analytics = getAnalytics(quoteApp);
const quoteDatabase = getDatabase(quoteApp);

// Export the database instance for use in other components
export { quoteDatabase, analytics };
export default quoteApp;