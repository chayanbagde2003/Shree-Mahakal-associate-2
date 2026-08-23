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