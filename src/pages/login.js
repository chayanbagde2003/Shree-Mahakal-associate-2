/**
 * Login Page Script
 * Handles authentication UI for login.html
 */

import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle 
} from '../services/auth.js';
import { initializeFirebase } from '../config/firebase.js';

// DOM Elements
const googleSigninBtn = document.getElementById('google-signin');
const emailForm = document.getElementById('email-form');
const emailInput = document.getElementById('email-input');
const pwInput = document.getElementById('pw-input');
const emailSigninBtn = document.getElementById('email-signin');
const emailSignupBtn = document.getElementById('email-signup');

// Toast notification
function showToast(message, isError = false) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) {
    existing.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : 'success'}`;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    ${isError 
      ? 'background: linear-gradient(135deg, #ef4444, #dc2626); color: white;' 
      : 'background: linear-gradient(135deg, #22c55e, #16a34a); color: white;'}
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Set loading state on buttons
function setButtonLoading(button, loading) {
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = '<span class="spinner"></span> Please wait...';
    button.style.opacity = '0.7';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
    button.style.opacity = '1';
  }
}

// Check if user is already logged in and redirect
async function checkExistingAuth() {
  const { auth } = await initializeFirebase();
  
  if (auth && auth.currentUser) {
    // User is logged in, redirect based on admin status
    const isAdmin = auth.currentUser.email === 'admin@shreemahakal.com' || auth.currentUser.uid === 'admin';
    if (isAdmin) {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'index.html';
    }
  }
}

// Handle email/password sign in
async function handleEmailSignIn(e) {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  const password = pwInput.value;
  
  if (!email || !password) {
    showToast('Please enter both email and password', true);
    return;
  }
  
  setButtonLoading(emailSigninBtn, true);
  
  const { user, error } = await loginWithEmail(email, password);
  
  setButtonLoading(emailSigninBtn, false);
  
  if (error) {
    showToast(error, true);
    return;
  }
  
  showToast('Signed in successfully!');
  
  // Redirect after short delay
  setTimeout(() => {
    const isAdmin = user.email === 'admin@shreemahakal.com' || user.uid === 'admin';
    window.location.href = isAdmin ? 'admin.html' : 'index.html';
  }, 1000);
}

// Handle email/password sign up
async function handleEmailSignUp() {
  const email = emailInput.value.trim();
  const password = pwInput.value;
  
  if (!email || !password) {
    showToast('Please enter both email and password', true);
    return;
  }
  
  if (password.length < 6) {
    showToast('Password should be at least 6 characters', true);
    return;
  }
  
  setButtonLoading(emailSignupBtn, true);
  
  const { user, error } = await registerWithEmail(email, password);
  
  setButtonLoading(emailSignupBtn, false);
  
  if (error) {
    showToast(error, true);
    return;
  }
  
  showToast('Account created successfully!');
  
  setTimeout(() => {
    const isAdmin = user.email === 'admin@shreemahakal.com' || user.uid === 'admin';
    window.location.href = isAdmin ? 'admin.html' : 'index.html';
  }, 1000);
}

// Handle Google sign in
async function handleGoogleSignIn() {
  setButtonLoading(googleSigninBtn, true);
  
  const { user, error } = await loginWithGoogle();
  
  setButtonLoading(googleSigninBtn, false);
  
  if (error) {
    showToast(error, true);
    return;
  }
  
  showToast('Signed in with Google successfully!');
  
  setTimeout(() => {
    const isAdmin = user.email === 'admin@shreemahakal.com' || user.uid === 'admin';
    window.location.href = isAdmin ? 'admin.html' : 'index.html';
  }, 1000);
}

// Event Listeners
emailForm.addEventListener('submit', handleEmailSignIn);
emailSignupBtn.addEventListener('click', handleEmailSignUp);
googleSigninBtn.addEventListener('click', handleGoogleSignIn);

// Initialize - check for existing auth on page load
document.addEventListener('DOMContentLoaded', () => {
  checkExistingAuth();
});

// Add spinner styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
    margin-right: 8px;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);