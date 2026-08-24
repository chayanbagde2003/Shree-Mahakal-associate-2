import { BUSINESS_CONFIG } from "../config/business.js";

const BOOKINGS_KEY = 'smba_bookings';
const MESSAGES_KEY = 'smba_messages';
const USERS_KEY = 'smba_users';

function getBookings() {
  return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
}

function saveBookings(bookings) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

function getMessages() {
  return JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
}

function saveMessages(messages) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

export const requireAdmin = async (user) => {
  if (!user) {throw new Error('Not authenticated');}
  
  const isAdmin = user.email === 'admin@shreemahakal.com' || user.uid === 'admin';
  if (!isAdmin) {
    throw new Error('Admin access required');
  }
  
  return true;
};

export const adminGetAllBookings = async (options = {}) => {
  const { 
    status, 
    service, 
    searchTerm, 
    page = 1, 
    pageSize = 20
  } = options;
  
  let bookings = getBookings();
  bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  if (status) {
    bookings = bookings.filter(b => b.status === status);
  }
  
  if (service) {
    bookings = bookings.filter(b => b.planChoice === service);
  }
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    bookings = bookings.filter(b => 
      b.fullName?.toLowerCase().includes(term) ||
      b.email?.toLowerCase().includes(term) ||
      b.phone?.includes(term) ||
      b.planChoice?.toLowerCase().includes(term) ||
      b.id?.toLowerCase().includes(term)
    );
  }
  
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedBookings = bookings.slice(start, end);
  
  return { 
    bookings: paginatedBookings, 
    lastDoc: null, 
    hasMore: end < bookings.length 
  };
};

export const adminGetBookingsStats = async () => {
  try {
    const bookings = getBookings();
    const statuses = BUSINESS_CONFIG.bookingStatuses.map(s => s.id);
    const stats = { total: bookings.length };
    
    for (const status of statuses) {
      stats[status] = 0;
    }
    
    bookings.forEach(b => {
      const status = b.status;
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

export const adminUpdateBookingStatus = async (bookingId, status, adminNotes = '') => {
  const validStatuses = BUSINESS_CONFIG.bookingStatuses.map(s => s.id);
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }
  
  const bookings = getBookings();
  const bookingIndex = bookings.findIndex(b => b.id === bookingId);
  
  if (bookingIndex !== -1) {
    bookings[bookingIndex].status = status;
    bookings[bookingIndex].adminNotes = adminNotes;
    bookings[bookingIndex].updatedAt = new Date().toISOString();
    saveBookings(bookings);
  }
  
  return { success: true };
};

export const adminGetAllUsers = async () => {
  const users = getUsers();
  return users.map(u => ({ ...u })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const adminGetUserById = async (userId) => {
  const users = getUsers();
  return users.find(u => u.uid === userId) || null;
};

export const adminGetMessages = async (userId, bookingId = null) => {
  const messages = getMessages();
  let filtered = messages;
  
  if (bookingId) {
    filtered = messages.filter(m => m.bookingId === bookingId);
  } else if (userId) {
    filtered = messages.filter(m => m.userId === userId);
  }
  
  return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

export const adminMarkMessagesAsRead = async (messageIds) => {
  const messages = getMessages();
  messageIds.forEach(id => {
    const msgIndex = messages.findIndex(m => m.id === id);
    if (msgIndex !== -1) {
      messages[msgIndex].read = true;
    }
  });
  saveMessages(messages);
  return { success: true };
};

export const adminSendReply = async (userId, message, bookingId = null, adminId) => {
  const messageData = {
    userId,
    bookingId,
    senderId: adminId,
    senderRole: 'admin',
    message: message.trim(),
    createdAt: new Date().toISOString(),
    read: false
  };
  
  const messages = getMessages();
  messages.push(messageData);
  saveMessages(messages);
  
  return { id: messageData.id, success: true };
};

export const getBookingWhatsAppUrl = (booking) => {
  const message = `Hello, I have submitted a booking request.

Booking ID: ${booking.id}
Service: ${booking.planChoice}
Name: ${booking.fullName}
Phone: ${booking.phone}
Location: ${booking.location}

I would like to discuss my project.`;
  
  return `https://wa.me/919399330188?text=${encodeURIComponent(message)}`;
};

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