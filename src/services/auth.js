import { BUSINESS_CONFIG } from "../config/business.js";
import { firebaseConfig } from "../config/firebase.js";

// Initialize Firebase
let firebaseApp = null;
let firebaseAuth = null;
let firebaseFirestore = null;

async function initializeFirebase() {
  if (firebaseApp) {
    return { app: firebaseApp, auth: firebaseAuth, db: firebaseFirestore };
  }
  
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js");
    const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js");
    
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
}

// LocalStorage fallback for offline support
const USERS_KEY = 'smba_users';
const CURRENT_USER_KEY = 'smba_current_user';

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  const userData = localStorage.getItem(CURRENT_USER_KEY);
  return userData ? JSON.parse(userData) : null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getAuthErrorMessage(code) {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Contact support.',
    'auth/requires-recent-login': 'Please sign in again to complete this action.',
    'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
    'auth/user-disabled': 'This account has been disabled. Contact support.',
    'auth/unauthorized-domain': 'This domain is not authorized. Add it to Firebase Console > Authentication > Settings > Authorized domains.',
    'auth/popup-blocked': 'Sign-in popup was blocked. Please allow pop-ups for this site.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.'
  };
  return errorMessages[code] || `An error occurred: ${code}. Please try again.`;
}

// Convert Firebase user to local user format
function firebaseUserToLocal(firebaseUser, additionalData = {}) {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || additionalData.name || '',
    emailVerified: firebaseUser.emailVerified,
    photoURL: firebaseUser.photoURL,
    createdAt: firebaseUser.metadata?.creationTime || new Date().toISOString(),
    lastLoginAt: firebaseUser.metadata?.lastSignInTime || new Date().toISOString(),
    ...additionalData
  };
}

export const registerWithEmail = async (email, password, profileData = {}) => {
  try {
    const { auth } = await initializeFirebase();
    
    if (!auth) {
      throw new Error('Firebase not configured');
    }
    
    const { createUserWithEmailAndPassword, updateProfile } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js");
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Update profile with display name if provided
    if (profileData.name) {
      await updateProfile(firebaseUser, { displayName: profileData.name });
    }
    
    // Convert to local format and store
    const localUser = firebaseUserToLocal(firebaseUser, profileData);
    setCurrentUser(localUser);
    
    // Store in localStorage for offline access
    const users = getUsers();
    const existingIndex = users.findIndex(u => u.uid === localUser.uid);
    if (existingIndex >= 0) {
      users[existingIndex] = localUser;
    } else {
      users.push(localUser);
    }
    saveUsers(users);
    
    // Notify other tabs
    window.dispatchEvent(new CustomEvent('smba-auth-change'));
    
    return { user: localUser, error: null };
  } catch (error) {
    return { user: null, error: getAuthErrorMessage(error.code) };
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const { auth } = await initializeFirebase();
    
    if (!auth) {
      throw new Error('Firebase not configured');
    }
    
    const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js");
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Convert to local format and store
    const localUser = firebaseUserToLocal(firebaseUser);
    setCurrentUser(localUser);
    
    // Update localStorage
    const users = getUsers();
    const existingIndex = users.findIndex(u => u.uid === localUser.uid);
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...localUser, lastLoginAt: new Date().toISOString() };
    } else {
      users.push(localUser);
    }
    saveUsers(users);
    
    window.dispatchEvent(new CustomEvent('smba-auth-change'));
    
    return { user: localUser, error: null };
  } catch (error) {
    return { user: null, error: getAuthErrorMessage(error.code) };
  }
};

export const logoutUser = async () => {
  try {
    const { auth } = await initializeFirebase();
    
    if (auth) {
      const { signOut } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js");
      await signOut(auth);
    }
    
    setCurrentUser(null);
    window.dispatchEvent(new CustomEvent('smba-auth-change'));
    
    return { error: null };
  } catch (error) {
    return { error: getAuthErrorMessage(error.code) };
  }
};

export const resetPassword = async (email) => {
  try {
    const { auth } = await initializeFirebase();
    
    if (!auth) {
      return { error: 'Password reset requires Firebase configuration.' };
    }
    
    const { sendPasswordResetEmail } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js");
    await sendPasswordResetEmail(auth, email);
    
    return { error: null };
  } catch (error) {
    return { error: getAuthErrorMessage(error.code) };
  }
};

export const updateUserName = async (name) => {
  const user = getCurrentUser();
  if (!user) {return { error: 'No user logged in' };}
  
  try {
    const { auth } = await initializeFirebase();
    
    if (auth && auth.currentUser) {
      const { updateProfile } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js");
      await updateProfile(auth.currentUser, { displayName: name });
    }
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.uid === user.uid);
    if (userIndex !== -1) {
      users[userIndex].displayName = name;
      users[userIndex].name = name;
      saveUsers(users);
      setCurrentUser(users[userIndex]);
    }
    return { error: null };
  } catch (error) {
    return { error: getAuthErrorMessage(error.code) };
  }
};

export const checkAdminStatus = async (user) => {
  // Admin removed - always false for public site
  return false;
};

export const onAuthStateChange = async (callback) => {
  // Initial check from localStorage
  const user = getCurrentUser();
  if (user) {
    const profile = { ...user };
    callback({ user, profile, isAdmin: false });
  } else {
    callback({ user: null, profile: null, isAdmin: false });
  }
  
  // Listen for Firebase auth state changes
  const { auth } = await initializeFirebase();
  let unsubscribe = null;
  
  if (auth) {
    const { onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js");
    unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const localUser = firebaseUserToLocal(firebaseUser);
        setCurrentUser(localUser);
        
        // Update localStorage
        const users = getUsers();
        const existingIndex = users.findIndex(u => u.uid === localUser.uid);
        if (existingIndex >= 0) {
          users[existingIndex] = { ...users[existingIndex], ...localUser, lastLoginAt: new Date().toISOString() };
        } else {
          users.push(localUser);
        }
        saveUsers(users);
        
        callback({ user: localUser, profile: localUser, isAdmin: false });
      } else {
        setCurrentUser(null);
        callback({ user: null, profile: null, isAdmin: false });
      }
    });
  }
  
  // Also listen for localStorage changes (for cross-tab sync)
  const handler = async () => {
    const updatedUser = getCurrentUser();
    if (updatedUser) {
      const profile = { ...updatedUser };
      callback({ user: updatedUser, profile, isAdmin: false });
    } else {
      callback({ user: null, profile: null, isAdmin: false });
    }
  };
  
  window.addEventListener('storage', handler);
  window.addEventListener('smba-auth-change', handler);
  
  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
    window.removeEventListener('storage', handler);
    window.removeEventListener('smba-auth-change', handler);
  };
};

export const getUserProfile = async (uid) => {
  const users = getUsers();
  return users.find(u => u.uid === uid) || null;
};

export const updateUserProfile = async (uid, data) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.uid === uid);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...data, updatedAt: new Date().toISOString() };
    saveUsers(users);
    if (getCurrentUser()?.uid === uid) {
      setCurrentUser(users[userIndex]);
    }
  }
  return getUserProfile(uid);
};

export const getWhatsAppUrl = (message = BUSINESS_CONFIG.whatsapp.defaultMessage) => {
  return `${BUSINESS_CONFIG.whatsapp.baseUrl}/${BUSINESS_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
};

export const getTelUrl = () => {
  return BUSINESS_CONFIG.phone.telLink;
};

export default {
  registerWithEmail,
  loginWithEmail,
  logoutUser,
  resetPassword,
  updateUserName,
  onAuthStateChange,
  getUserProfile,
  updateUserProfile,
  checkAdminStatus,
  getWhatsAppUrl,
  getTelUrl
};