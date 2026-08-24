const BOOKINGS_KEY = 'smba_bookings';
const MESSAGES_KEY = 'smba_messages';

function getBookings() {
  return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
}

function saveBookings(bookings) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

function getAllMessages() {
  return JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
}

function saveMessages(messages) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const createBooking = async (data, userId) => {
  try {
    const bookings = getBookings();
    const booking = {
      id: generateId(),
      ...data,
      userId,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    bookings.unshift(booking);
    saveBookings(bookings);
    
    return { id: booking.id, error: null };
  } catch (error) {
    return { id: null, error: 'Failed to create booking' };
  }
};

export const getUserBookings = async (userId) => {
  const bookings = getBookings();
  return bookings.filter(b => b.userId === userId);
};

export const sendMessage = async (data) => {
  try {
const messages = getAllMessages();
    const message = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      read: false
    };
    
    messages.push(message);
    saveMessages(messages);
    
    return { id: message.id, error: null };
  } catch (error) {
    return { id: null, error: 'Failed to send message' };
  }
};

export const getMessages = async (userId, bookingId = null) => {
  const messages = getAllMessages();
  return messages.filter(m => 
    (bookingId ? m.bookingId === bookingId : m.userId === userId)
  );
};

export default {
  createBooking,
  getUserBookings,
  sendMessage,
  getMessages
};