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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
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
  email: import.meta.env.VITE_ADMIN_EMAIL,
  password: import.meta.env.VITE_ADMIN_PASSWORD
};

// ================= CORE INTEGRATION FUNCTIONS =================

export const storeUserProfile = async (userId, userData) => {
  try {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    let userKey = userId;
    if (snapshot.exists()) {
      const usersObj = snapshot.val();
      const foundEntry = Object.entries(usersObj).find(([k, u]) => u.uid === userId || u.tempUserId === userId || k === userId);
      if (foundEntry) {
        userKey = foundEntry[0];
      }
    }
    const userRef = ref(db, `users/${userKey}`);
    await update(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    console.log("✅ User profile stored/updated:", userKey);
    return { success: true };
  } catch (error) {
    console.error("❌ Error storing user profile:", error);
    return { success: false, error };
  }
};

export const getUserProfile = async (userId, userEmail = null) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    let snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    // Search lookup for sequential key mapping or email
    const usersRef = ref(db, 'users');
    snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const usersObj = snapshot.val();
      const foundEntry = Object.entries(usersObj).find(([k, u]) => 
        u.uid === userId || u.tempUserId === userId || 
        (u.email && userEmail && u.email.toLowerCase() === userEmail.toLowerCase()) ||
        (u.email && auth.currentUser?.email && u.email.toLowerCase() === auth.currentUser.email.toLowerCase())
      );
      if (foundEntry) {
        return foundEntry[1];
      }
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    throw error;
  }
};

const cleanUndefined = (obj) => {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  }
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = cleanUndefined(val);
      }
    }
    return cleaned;
  }
  return obj;
};

export const submitQuote = async (quoteData) => {
  try {
    const quotesRef = ref(db, 'quotes');
    const snapshot = await get(quotesRef);
    
    let nextNum = 1;
    if (snapshot.exists()) {
      const quotesObj = snapshot.val();
      const keys = Object.keys(quotesObj);
      let maxNum = 0;
      keys.forEach(k => {
        if (k.startsWith('quote-')) {
          const num = parseInt(k.substring(6), 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      });
      nextNum = maxNum + 1;
    }
    
    const quoteKey = `quote-${nextNum}`;
    const specificQuoteRef = ref(db, `quotes/${quoteKey}`);
    
    const cleanedData = cleanUndefined({
      ...quoteData,
      id: quoteKey,
      status: 'pending'
    });
    
    await set(specificQuoteRef, {
      ...cleanedData,
      createdAt: serverTimestamp()
    });
    
    console.log(`✅ Quote submitted successfully as ${quoteKey}`);
    return { success: true, quoteId: quoteKey };
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
    let snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      if (userData.email === DEFAULT_ADMIN.email) return null;
      return { id: userId, ...userData };
    }
    // Search lookup for sequential key mapping
    const usersRef = ref(db, 'users');
    snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const usersObj = snapshot.val();
      const foundEntry = Object.entries(usersObj).find(([k, u]) => u.uid === userId || u.tempUserId === userId);
      if (foundEntry) {
        const userData = foundEntry[1];
        if (userData.email === DEFAULT_ADMIN.email) return null;
        return { id: foundEntry[0], ...userData };
      }
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    throw error;
  }
};

export const updateUser = async (userId, updates) => {
  try {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    let userKey = userId;
    if (snapshot.exists()) {
      const usersObj = snapshot.val();
      const foundEntry = Object.entries(usersObj).find(([k, u]) => u.uid === userId || u.tempUserId === userId || k === userId);
      if (foundEntry) {
        userKey = foundEntry[0];
      }
    }
    const userRef = ref(db, `users/${userKey}`);
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
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    let userKey = userId;
    if (snapshot.exists()) {
      const usersObj = snapshot.val();
      const foundEntry = Object.entries(usersObj).find(([k, u]) => u.uid === userId || u.tempUserId === userId || k === userId);
      if (foundEntry) {
        userKey = foundEntry[0];
      }
    }
    const userRef = ref(db, `users/${userKey}`);
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