/**
 * Admin Service
 * Admin-only operations for managing bookings, users, and messages.
 * These functions require admin custom claims.
 */

import { 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  collection,
  doc,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/config.js";
import { BUSINESS_CONFIG } from "../config/business.js";

/**
 * Check if current user is admin
 * This should be called before any admin operation
 */
export const requireAdmin = async (user) => {
  if (!user) {throw new Error('Not authenticated');}
  
  const idTokenResult = await user.getIdTokenResult();
  if (!idTokenResult.claims.admin) {
    throw new Error('Admin access required');
  }
  
  return true;
};

/**
 * Get all bookings with pagination and filters (Admin)
 */
export const adminGetAllBookings = async (options = {}) => {
  const { 
    status, 
    service, 
    searchTerm, 
    page = 1, 
    pageSize = 20,
    lastDoc = null
  } = options;
  
  let q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  
  if (status) {
    q = query(q, where('status', '==', status));
  }
  
  if (service) {
    q = query(q, where('service', '==', service));
  }
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc), limit(pageSize));
  } else {
    q = query(q, limit(pageSize));
  }
  
  const snapshot = await getDocs(q);
  let bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Apply search filter client-side
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    bookings = bookings.filter(b => 
      b.fullName?.toLowerCase().includes(term) ||
      b.email?.toLowerCase().includes(term) ||
      b.phone?.includes(term) ||
      b.service?.toLowerCase().includes(term) ||
      b.id?.toLowerCase().includes(term)
    );
  }
  
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];
  const hasMore = snapshot.docs.length === pageSize;
  
  return { bookings, lastDoc: lastVisible, hasMore };
};

/**
 * Get booking statistics for admin dashboard
 */
export const adminGetBookingsStats = async () => {
  try {
    const statuses = BUSINESS_CONFIG.bookingStatuses.map(s => s.id);
    const stats = { total: 0 };
    
    // Get all bookings once
    const snapshot = await getDocs(collection(db, 'bookings'));
    stats.total = snapshot.size;
    
    // Count by status
    for (const status of statuses) {
      stats[status] = 0;
    }
    
    snapshot.docs.forEach(doc => {
      const status = doc.data().status;
      if (statuses.includes(status)) {
        stats[status]++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return { total: 0 };
  }
};

/**
 * Update booking status (Admin)
 */
export const adminUpdateBookingStatus = async (bookingId, status, adminNotes = '') => {
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
  
  return { success: true };
};

/**
 * Get all users (Admin)
 */
export const adminGetAllUsers = async () => {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get user by ID (Admin)
 */
export const adminGetUserById = async (userId) => {
  const docRef = doc(db, 'users', userId);
  const snapshot = await getDoc(docRef);
  
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
};

/**
 * Get all messages for a user or booking (Admin)
 */
export const adminGetMessages = async (userId, bookingId = null) => {
  let q;
  
  if (bookingId) {
    q = query(
      collection(db, 'messages'),
      where('bookingId', '==', bookingId),
      orderBy('createdAt', 'asc')
    );
  } else if (userId) {
    q = query(
      collection(db, 'messages'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Mark messages as read (Admin)
 */
export const adminMarkMessagesAsRead = async (messageIds) => {
  const batch = writeBatch(db);
  
  messageIds.forEach(id => {
    const docRef = doc(db, 'messages', id);
    batch.update(docRef, { read: true });
  });
  
  await batch.commit();
  return { success: true };
};

/**
 * Send admin reply to user
 */
export const adminSendReply = async (userId, message, bookingId = null, adminId) => {
  const messageData = {
    userId,
    bookingId,
    senderId: adminId,
    senderRole: 'admin',
    message: message.trim(),
    createdAt: serverTimestamp(),
    read: false
  };
  
  const docRef = await addDoc(collection(db, 'messages'), messageData);
  return { id: docRef.id, success: true };
};

/**
 * Get WhatsApp URL for a booking
 */
export const getBookingWhatsAppUrl = (booking) => {
  const message = `Hello, I have submitted a booking request.

Booking ID: ${booking.id}
Service: ${booking.service}
Name: ${booking.fullName}
Phone: ${booking.phone}
Location: ${booking.location}

I would like to discuss my project.`;
  
  return `https://wa.me/919399330188?text=${encodeURIComponent(message)}`;
};

/**
 * Get tel URL for a booking
 */
export const getBookingTelUrl = (booking) => {
  return `tel:+91${booking.phone.replace(/[^\d]/g, '')}`;
};

export default {
  requireAdmin,
  adminGetAllBookings,
  adminGetBookingsStats,
  adminUpdateBookingStatus,
  adminGetAllUsers,
  adminGetUserById,
  adminGetMessages,
  adminMarkMessagesAsRead,
  adminSendReply,
  getBookingWhatsAppUrl,
  getBookingTelUrl
};