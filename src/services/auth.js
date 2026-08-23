/**
 * Authentication Service
 * Shared authentication logic for the entire application.
 * Uses Firebase Authentication with Firestore for user profiles.
 */

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "../firebase/config.js";
import { BUSINESS_CONFIG } from "../config/business.js";

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Create user profile in Firestore after registration
 */
export const createUserProfile = async (user, additionalData = {}) => {
  if (!user) {return;}
  
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);
  
  if (!snapshot.exists()) {
    const { email, displayName, photoURL } = user;
    const createdAt = serverTimestamp();
    
    const userData = {
      uid: user.uid,
      email,
      name: displayName || additionalData.name || '',
      phone: additionalData.phone || '',
      city: additionalData.city || '',
      address: additionalData.address || '',
      photoURL: photoURL || '',
      role: 'user',
      emailVerified: user.emailVerified,
      createdAt,
      updatedAt: createdAt,
      ...additionalData
    };
    
    await setDoc(userRef, userData);
  }
  
  return userRef;
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);
  
  if (snapshot.exists()) {
    return { uid, ...snapshot.data() };
  }
  
  return null;
};

/**
 * Update user profile in Firestore
 */
export const updateUserProfile = async (uid, data) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
  return getUserProfile(uid);
};

/**
 * Register new user with email/password
 */
export const registerWithEmail = async (email, password, profileData = {}) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Create user profile in Firestore
    await createUserProfile(user, profileData);
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Sign in with email/password
 */
export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Sign in with Google
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create/update profile
    await createUserProfile(user);
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Sign out current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Update user's display name
 */
export const updateUserName = async (name) => {
  if (!auth.currentUser) {return { error: 'No user logged in' };}
  
  try {
    await updateProfile(auth.currentUser, { displayName: name });
    await updateUserProfile(auth.currentUser.uid, { name });
    return { error: null };
  } catch (error) {
    return { error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Check if current user is admin (via custom claims)
 */
export const checkAdminStatus = async (user) => {
  if (!user) {return false;}
  
  try {
    const idTokenResult = await user.getIdTokenResult();
    return idTokenResult.claims.admin === true;
  } catch {
    return false;
  }
};

/**
 * Auth state observer - returns unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const isAdmin = await checkAdminStatus(user);
      const profile = await getUserProfile(user.uid);
      callback({ user, profile, isAdmin });
    } else {
      callback({ user: null, profile: null, isAdmin: false });
    }
  });
};

/**
 * Get WhatsApp URL with pre-filled message
 */
export const getWhatsAppUrl = (message = BUSINESS_CONFIG.whatsapp.defaultMessage) => {
  return `${BUSINESS_CONFIG.whatsapp.baseUrl}/${BUSINESS_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
};

/**
 * Get Tel URL for phone calls
 */
export const getTelUrl = () => {
  return BUSINESS_CONFIG.phone.telLink;
};

/**
 * Convert Firebase auth error codes to user-friendly messages
 */
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
    'auth/requires-recent-login': 'Please sign in again to complete this action.'
  };
  
  return errorMessages[code] || 'An error occurred. Please try again.';
}

export default {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
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