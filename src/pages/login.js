/**
 * Login Page Script
 * Handles authentication UI for login.html
 */

import { 
  loginWithEmail, 
  registerWithEmail 
} from '../services/auth.js';
import { initializeFirebase } from '../config/firebase.js';

// DOM Elements
const signinTab = document.getElementById('signin-tab');
const signupTab = document.getElementById('signup-tab');
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');
const signinEmail = document.getElementById('signin-email');
const signinPassword = document.getElementById('signin-password');
const signupName = document.getElementById('signup-name');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const signupConfirm = document.getElementById('signup-confirm');
const signinBtn = document.getElementById('signin-btn');
const signupBtn = document.getElementById('signup-btn');
const switchToSignup = document.getElementById('switch-to-signup');
const toastContainer = document.getElementById('toast-container');

// Toast notification
function showToast(message, type = 'info') {
  // Remove existing toasts (max 3)
  const existingToasts = toastContainer.querySelectorAll('.toast');
  if (existingToasts.length >= 3) {
    existingToasts[0].remove();
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  
  const icons = {
    success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  };
  
  toast.innerHTML = `
    ${icons[type] || icons.info}
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Dismiss">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  });
  
  // Auto remove
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

// Set loading state on buttons
function setButtonLoading(button, loading) {
  if (loading) {
    button.disabled = true;
    button.classList.add('loading');
    button.dataset.originalText = button.textContent;
  } else {
    button.disabled = false;
    button.classList.remove('loading');
    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
    }
  }
}

// Tab switching
function switchTab(tab) {
  const isSignin = tab === 'signin';
  
  signinTab.classList.toggle('active', isSignin);
  signinTab.setAttribute('aria-selected', isSignin);
  signupTab.classList.toggle('active', !isSignin);
  signupTab.setAttribute('aria-selected', !isSignin);
  
  signinForm.classList.toggle('active', isSignin);
  signinForm.hidden = !isSignin;
  signupForm.classList.toggle('active', !isSignin);
  signupForm.hidden = isSignin;
  
  // Update switch link text
  if (switchToSignup) {
    switchToSignup.textContent = isSignin ? 'Create one' : 'Sign in';
  }
}

// Validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate password strength
function validatePassword(password) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  return null;
}

// Handle email/password sign in
async function handleEmailSignIn(e) {
  e.preventDefault();
  
  const email = signinEmail.value.trim();
  const password = signinPassword.value;
  
  if (!email || !password) {
    showToast('Please enter both email and password', 'error');
    return;
  }
  
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }
  
  setButtonLoading(signinBtn, true);
  
  const { user, error } = await loginWithEmail(email, password);
  
  setButtonLoading(signinBtn, false);
  
  if (error) {
    showToast(error, 'error');
    return;
  }
  
  showToast('Signed in successfully!', 'success');
  
// Redirect after short delay
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

// Handle email/password sign up
async function handleEmailSignUp(e) {
  e.preventDefault();
  
  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value;
  const confirm = signupConfirm.value;
  
  if (!name || !email || !password || !confirm) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }
  
  const passwordError = validatePassword(password);
  if (passwordError) {
    showToast(passwordError, 'error');
    return;
  }
  
  if (password !== confirm) {
    showToast('Passwords do not match', 'error');
    return;
  }
  
  setButtonLoading(signupBtn, true);
  
  const { user, error } = await registerWithEmail(email, password, { name });
  
  setButtonLoading(signupBtn, false);
  
  if (error) {
    showToast(error, 'error');
    return;
  }
  
  showToast('Account created successfully!', 'success');
  
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

// Check if user is already logged in and redirect
async function checkExistingAuth() {
  const { auth } = await initializeFirebase();
  
  if (auth && auth.currentUser) {
    window.location.href = 'index.html';
  }
}

// Event Listeners
signinTab.addEventListener('click', () => switchTab('signin'));
signupTab.addEventListener('click', () => switchTab('signup'));

signinForm.addEventListener('submit', handleEmailSignIn);
signupForm.addEventListener('submit', handleEmailSignUp);

switchToSignup.addEventListener('click', (e) => {
  e.preventDefault();
  const currentTab = signinTab.classList.contains('active') ? 'signup' : 'signin';
  switchTab(currentTab);
});

// Keyboard navigation for tabs
[signinTab, signupTab].forEach(tab => {
  tab.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextTab = e.key === 'ArrowRight' ? signupTab : signinTab;
      nextTab.click();
      nextTab.focus();
    }
  });
});

// Initialize - check for existing auth on page load
document.addEventListener('DOMContentLoaded', () => {
  checkExistingAuth();
  
  // Focus first input
  signinEmail.focus();
});