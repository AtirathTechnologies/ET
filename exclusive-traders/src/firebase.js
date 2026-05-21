import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  push,
  serverTimestamp,
  onValue                       // <-- ADDED
} from "firebase/database";

// ================= FIREBASE CONFIG =================
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

// ================= INITIALIZE FIREBASE =================
let app;
let analytics = null;
let auth;
let db;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase initialized");
  } else {
    app = getApps()[0];
    console.log("ℹ️ Using existing Firebase app");
  }

  auth = getAuth(app);
  db = getDatabase(app);

  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
      console.log("📊 Analytics enabled");
    }
  });

} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  throw error;
}

// ================= DEFAULT ADMIN =================
export const DEFAULT_ADMIN = {
  email: "admin@exclusivetrader.com",
  password: "Admin123!"
};

// ================= CORE INTEGRATION FUNCTIONS =================

export const storeUserProfile = async (userId, userData) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    console.log("✅ User profile stored/updated:", userId);
    return { success: true };
  } catch (error) {
    console.error("❌ Error storing user profile:", error);
    return { success: false, error };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    throw error;
  }
};

export const submitQuote = async (quoteData) => {
  try {
    const quotesRef = ref(db, 'quotes');
    const newQuoteRef = push(quotesRef);
    await set(newQuoteRef, {
      ...quoteData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    console.log("✅ Quote submitted successfully");
    return { success: true, quoteId: newQuoteRef.key };
  } catch (error) {
    console.error("❌ Error submitting quote:", error);
    return { success: false, error };
  }
};

export const fetchAllUsers = async () => {
  try {
    const usersRef = ref(db, "users");
    const snapshot = await get(usersRef);
    if (!snapshot.exists()) return [];
    const usersData = snapshot.val();
    return Object.entries(usersData)
      .map(([id, user]) => ({ id, ...user }))
      .filter(user => user.email !== DEFAULT_ADMIN.email);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    if (!snapshot.exists()) return null;
    const userData = snapshot.val();
    if (userData.email === DEFAULT_ADMIN.email) return null;
    return { id: userId, ...userData };
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    throw error;
  }
};

export const updateUser = async (userId, updates) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("❌ Error updating user:", error);
    return { success: false, error };
  }
};

export const deleteUser = async (userId) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    await remove(userRef);
    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return { success: false, error };
  }
};

// ================= ADDITIONAL EXPORTS FOR BACKWARD COMPATIBILITY =================
export const database = db;   // alias for db

// ================= EXPORTS (including onValue) =================
export { 
  ref, 
  get, 
  set, 
  update, 
  remove, 
  push, 
  serverTimestamp, 
  onValue       // <-- now exported
};
export { app, analytics, auth, db };
export { db as quoteDatabase };
export default app;