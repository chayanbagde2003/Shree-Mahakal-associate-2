/**
 * Firebase Configuration Module
 * Centralized Firebase initialization for the entire application.
 * 
 * IMPORTANT: Replace the placeholder values with your actual Firebase project config.
 * Get these from: Firebase Console > Project Settings > General > Your apps > Web app
 */

// Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Check if Firebase config is valid (not placeholders)
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" 
  && firebaseConfig.projectId !== "YOUR_PROJECT_ID"
  && firebaseConfig.appId !== "YOUR_APP_ID";

// Initialize Firebase
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

let app = null;
let auth = null;
let db = null;
let analytics = null;

// Initialize Firebase App only if configured
if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Initialize Analytics (only in production)
    isSupported().then(supported => {
      if (supported && typeof window !== 'undefined') {
        analytics = getAnalytics(app);
      }
    });
  } catch (error) {
    console.warn('Firebase initialization failed:', error.message);
  }
} else {
  console.warn('Firebase not configured - using placeholder config. Please update src/firebase/config.js with your Firebase project credentials.');
}



// Development emulators (only for local development)
// Uncomment and configure if using Firebase Local Emulator Suite
// if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

export { app, auth, db, analytics };
export default app;