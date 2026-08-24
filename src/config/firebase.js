/**
 * Firebase Configuration Module
 * Uses environment variables for secure credential management
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let firebaseApp = null;
let firebaseAuth = null;
let firebaseFirestore = null;

export const initializeFirebase = async () => {
  if (firebaseApp) {
    return { app: firebaseApp, auth: firebaseAuth, db: firebaseFirestore };
  }
  
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
    
    // Validate config
    const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missingKeys = requiredKeys.filter(key => !firebaseConfig[key] || firebaseConfig[key].includes('your_'));
    if (missingKeys.length > 0) {
      console.warn('Firebase config incomplete. Missing:', missingKeys.join(', '));
      console.warn('Copy .env.example to .env and fill in your values');
      return { app: null, auth: null, db: null };
    }
    
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    firebaseFirestore = getFirestore(firebaseApp);
    
    return { app: firebaseApp, auth: firebaseAuth, db: firebaseFirestore };
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return { app: null, auth: null, db: null };
  }
};

export const validateFirebaseConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = required.filter(key => !firebaseConfig[key] || firebaseConfig[key].includes('your_'));
  
  if (missing.length > 0) {
    console.warn('Firebase config incomplete. Missing:', missing.join(', '));
    console.warn('Copy .env.example to .env and fill in your values');
    return false;
  }
  return true;
};

export default firebaseConfig;