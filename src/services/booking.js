import { initializeFirebase } from "../config/firebase.js";

const BOOKINGS_COLLECTION = 'bookings';
const MESSAGES_COLLECTION = 'messages';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function getDb() {
  const { db } = await initializeFirebase();
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  return db;
}

export const createBooking = async (data, userId) => {
  try {
    const db = await getDb();
    const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js");
    
    const booking = {
      ...data,
      userId,
      status: 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), booking);
    
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { id: null, error: 'Failed to create booking' };
  }
};

export const getUserBookings = async (userId) => {
  try {
    const db = await getDb();
    const { collection, query, where, orderBy, getDocs } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js");
    
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
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

export const sendMessage = async (data) => {
  try {
    const db = await getDb();
    const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js");
    
    const message = {
      ...data,
      createdAt: serverTimestamp(),
      read: false
    };
    
    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), message);
    
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Error sending message:', error);
    return { id: null, error: 'Failed to send message' };
  }
};

export const getMessages = async (userId, bookingId = null) => {
  try {
    const db = await getDb();
    const { collection, query, where, orderBy, getDocs } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js");
    
    let q;
    if (bookingId) {
      q = query(
        collection(db, MESSAGES_COLLECTION),
        where('bookingId', '==', bookingId),
        orderBy('createdAt', 'asc')
      );
    } else {
      q = query(
        collection(db, MESSAGES_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'asc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export default {
  createBooking,
  getUserBookings,
  sendMessage,
  getMessages
};