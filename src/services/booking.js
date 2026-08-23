/**
 * Booking Service
 * Firestore operations for bookings, messages, and admin functions.
 */

import { 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp,
  Timestamp,
  doc,
  writeBatch
} from "firebase/firestore";
import { db } from "../firebase/config.js";
import { BUSINESS_CONFIG } from "../config/business.js";

// Collection references
const bookingsRef = collection(db, 'bookings');
const messagesRef = collection(db, 'messages');
const usersRef = collection(db, 'users');

/**
 * Create a new booking
 */
export const createBooking = async (bookingData, userId) => {
  try {
    // Validate required fields
    const requiredFields = ['fullName', 'phone', 'email', 'service', 'projectType', 'location', 'address'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Validate email format
    if (!isValidEmail(bookingData.email)) {
      throw new Error('Invalid email format');
    }
    
    // Validate phone format
    if (!isValidPhone(bookingData.phone)) {
      throw new Error('Invalid phone number format');
    }
    
    // Sanitize data
    const sanitizedData = sanitizeBookingData(bookingData);
    
    const booking = {
      userId,
      ...sanitizedData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(bookingsRef, booking);
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

/**
 * Get user's bookings
 */
export const getUserBookings = async (userId) => {
  try {
    const q = query(
      bookingsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }
};

/**
 * Get single booking by ID
 */
export const getBookingById = async (bookingId) => {
  try {
    const docRef = doc(db, 'bookings', bookingId);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
};

/**
 * Update booking status (admin only)
 */
export const updateBookingStatus = async (bookingId, status, adminNotes = '') => {
  try {
    const validStatuses = BUSINESS_CONFIG.bookingStatuses.map(s => s.id);
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }
    
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, {
      status,
      adminNotes,
      updatedAt: serverTimestamp()
    });
    
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Get all bookings (admin) with pagination and filters
 */
export const getAllBookings = async (options = {}) => {
  try {
    const { 
      status, 
      service, 
      searchTerm, 
      page = 1, 
      pageSize = 10,
      lastDoc = null
    } = options;
    
    let q = query(bookingsRef, orderBy('createdAt', 'desc'));
    
    // Apply filters
    if (status) {
      q = query(q, where('status', '==', status));
    }
    if (service) {
      q = query(q, where('service', '==', service));
    }
    
    // Apply pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc), limit(pageSize));
    } else {
      q = query(q, limit(pageSize));
    }
    
    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Apply search filter client-side (for name, email, phone)
    let filtered = bookings;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = bookings.filter(b => 
        b.fullName?.toLowerCase().includes(term) ||
        b.email?.toLowerCase().includes(term) ||
        b.phone?.includes(term) ||
        b.service?.toLowerCase().includes(term) ||
        b.id?.toLowerCase().includes(term)
      );
    }
    
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const hasMore = snapshot.docs.length === pageSize;
    
    return { bookings: filtered, lastDoc: lastVisible, hasMore };
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return { bookings: [], lastDoc: null, hasMore: false };
  }
};

/**
 * Get bookings count by status (for admin dashboard stats)
 */
export const getBookingsStats = async () => {
  try {
    const statuses = BUSINESS_CONFIG.bookingStatuses.map(s => s.id);
    const stats = {};
    
    for (const status of statuses) {
      const q = query(bookingsRef, where('status', '==', status));
      const snapshot = await getDocs(q);
      stats[status] = snapshot.size;
    }
    
    // Total count
    const totalSnapshot = await getDocs(bookingsRef);
    stats.total = totalSnapshot.size;
    
    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {};
  }
};

/**
 * Send message (user to admin or admin to user)
 */
export const sendMessage = async (messageData, senderId, senderRole) => {
  try {
    if (!messageData.message?.trim()) {
      throw new Error('Message cannot be empty');
    }
    
    const message = {
      ...messageData,
      senderId,
      senderRole,
      message: messageData.message.trim(),
      createdAt: serverTimestamp(),
      read: false
    };
    
    const docRef = await addDoc(messagesRef, message);
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

/**
 * Get messages for a user (or admin for specific user)
 */
export const getMessages = async (userId, bookingId = null) => {
  try {
    let q;
    
    if (bookingId) {
      q = query(
        messagesRef,
        where('bookingId', '==', bookingId),
        orderBy('createdAt', 'asc')
      );
    } else {
      q = query(
        messagesRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (messageIds) => {
  try {
    const batch = writeBatch(db);
    
    messageIds.forEach(id => {
      const docRef = doc(db, 'messages', id);
      batch.update(docRef, { read: true });
    });
    
    await batch.commit();
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async () => {
  try {
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

/**
 * Get user by ID (admin)
 */
export const getUserById = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Validation helpers
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  // Indian phone number validation (10 digits, optionally with +91)
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return phoneRegex.test(cleaned);
}

function sanitizeBookingData(data) {
  const sanitized = {};
  
  // String fields with max lengths
  const stringFields = {
    fullName: 100,
    phone: 20,
    email: 100,
    service: 50,
    projectType: 30,
    location: 200,
    address: 500,
    description: 2000,
    specialRequirements: 2000
  };
  
  for (const [field, maxLength] of Object.entries(stringFields)) {
    if (data[field]) {
      sanitized[field] = String(data[field]).trim().slice(0, maxLength);
    }
  }
  
  // Number fields
  if (data.plotSize) {
    sanitized.plotSize = Math.max(0, Math.min(100000, parseInt(data.plotSize) || 0));
  }
  
  // Array fields
  if (Array.isArray(data.services)) {
    sanitized.services = data.services.filter(s => typeof s === 'string').slice(0, 20);
  }
  if (Array.isArray(data.style)) {
    sanitized.style = data.style.filter(s => typeof s === 'string').slice(0, 10);
  }
  
  // Other fields
  const otherFields = ['floors', 'budgetRange', 'timeline', 'vastu', 'flooring', 'kitchenCountertop', 'bathroomTiles', 'windows'];
  for (const field of otherFields) {
    if (data[field]) {
      sanitized[field] = String(data[field]).trim().slice(0, 50);
    }
  }
  
  return sanitized;
}

export default {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  getAllBookings,
  getBookingsStats,
  sendMessage,
  getMessages,
  markMessagesAsRead,
  getAllUsers,
  getUserById
};