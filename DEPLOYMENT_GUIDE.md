# Shree Mahakal Building Associates - Production Deployment Guide

## Overview
This document outlines the steps to deploy the Shree Mahakal Building Associates website as a production-ready Firebase application.

## Prerequisites

1. **Node.js 18+** installed
2. **Firebase CLI** installed: `npm install -g firebase-tools`
3. **Firebase Project** created in Firebase Console
4. **Git** for version control

## Firebase Project Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `shree-mahakal-associates` (or your preferred name)
4. Enable Google Analytics (optional)
5. Wait for project creation

### 2. Enable Firebase Services
In Firebase Console, enable:
- **Authentication** > Sign-in method > Email/Password + Google
- **Firestore Database** > Create database > Start in test mode (we'll secure it)
- **App Check** (optional but recommended) > reCAPTCHA v3
- **Hosting** (if using Firebase Hosting)

### 3. Configure Authentication
1. **Authentication** > **Settings** > **Authorized domains**
   - Add: `localhost` (for development)
   - Add: your production domain when ready
2. **Authentication** > **Sign-in method** > **Email/Password** > Enable
3. **Authentication** > **Sign-in method** > **Google** > Enable + Add authorized domain

### 4. Get Firebase Config
1. **Project Settings** > **General** > **Your apps** > **Web app** (</>)
2. Register app with nickname: "Shree Mahakal Web"
3. Copy the `firebaseConfig` object values

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local` file (never commit this):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_RECAPTCHA_V3_SITE_KEY=your_recaptcha_v3_key (optional)
```

### 3. Update Firebase Config
Edit `src/firebase/config.js` and replace placeholder values with your actual config.

### 4. Start Development Server
```bash
npm run dev
```

### 5. Run Firebase Emulators (Optional)
```bash
# In separate terminal
firebase emulators:start

# Then update src/firebase/config.js to use emulators:
# if (window.location.hostname === 'localhost') {
#   connectAuthEmulator(auth, 'http://localhost:9099');
#   connectFirestoreEmulator(db, 'localhost', 8080);
# }
```

## Security Configuration

### 1. Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```
Or deploy all:
```bash
firebase deploy
```

### 2. Set Admin Custom Claims
**IMPORTANT**: Admin access must be granted via Firebase Custom Claims (server-side only).

**Option A: Firebase Console (for testing only)**
1. Go to Authentication > Users
2. Find admin user > Click "Custom claims" (not available in console directly)

**Option B: Admin SDK (Recommended)**
```javascript
// Run this in a secure environment (Cloud Function, Admin SDK script)
const admin = require('firebase-admin');
admin.initializeApp();

await admin.auth().setCustomUserClaims('USER_UID_HERE', { admin: true });
```

**Option C: Cloud Function (Production)**
Deploy a callable Cloud Function that only super-admins can invoke to grant admin claims.

### 3. Configure App Check
1. Get reCAPTCHA v3 Site Key from [Google reCAPTCHA](https://www.google.com/recaptcha/admin/create)
2. Add to Firebase Console > App Check > Register app
3. Add site key to `.env.local` as `VITE_RECAPTCHA_V3_SITE_KEY`
4. Uncomment App Check code in `index.html`

### 4. Authorized Domains
In Firebase Console > Authentication > Settings > Authorized domains:
- `localhost` (development)
- `your-domain.com` (production)
- `your-project.web.app` (Firebase Hosting)

## Production Deployment

### 1. Build for Production
```bash
npm run build
```

### 2. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

Or deploy everything:
```bash
firebase deploy
```

### 3. Verify Deployment
- Check site loads correctly
- Test authentication flow
- Test booking submission
- Test admin panel access
- Verify WhatsApp/Call buttons work

## Post-Deployment Checklist

### Security
- [ ] Firestore rules deployed and tested
- [ ] Admin custom claims set for admin users
- [ ] App Check enabled (if using)
- [ ] Authorized domains configured
- [ ] No secrets in source code
- [ ] `.gitignore` includes `.env*` files
- [ ] No service account keys in repo

### Functionality
- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Booking form submits to Firestore
- [ ] Admin panel accessible to admins only
- [ ] Admin can view/update bookings
- [ ] WhatsApp/Call buttons work
- [ ] Mobile responsive

### Data
- [ ] Test booking creates document in `bookings` collection
- [ ] User profile creates document in `users` collection
- [ ] Messages work between user and admin
- [ ] Admin can see all bookings

## Manual Firebase Console Steps Required

These **cannot** be automated and must be done manually:

1. **Set Admin Custom Claims** - Run Admin SDK script for each admin user
2. **Enable App Check** - Register reCAPTCHA v3 in Firebase Console
3. **Configure Authorized Domains** - Add production domain
4. **Set up Email Templates** - Customize verification/password reset emails in Auth > Templates
5. **Enable Billing** (if needed) - For production usage beyond free tier
6. **Set up Monitoring** - Firebase Console > Monitoring for errors/performance

## Security Audit Checklist

Run before production launch:

```bash
# Check for vulnerabilities
npm audit

# Verify no secrets in code
grep -r "apiKey\|secret\|password" src/ --exclude-dir=node_modules

# Test security rules locally (if using emulators)
firebase emulators:exec "npm test"
```

## Maintenance

### Regular Tasks
- Monitor Firebase Console for errors
- Check Firestore usage/costs
- Review admin access periodically
- Update dependencies monthly: `npm update`
- Run security audit: `npm audit`

### Backup Strategy
- Firestore: Enable automatic backups (if on Blaze plan)
- Export rules: `firebase firestore:rules:get > firestore.rules.backup`

## Support

For issues:
1. Check Firebase Console > Logs
2. Check browser console for errors
3. Verify Firebase config values
4. Ensure all services are enabled

## Emergency Contacts

- Firebase Support: [Firebase Console > Support](https://console.firebase.google.com/support)
- Project Owner: [Client Email]
- Developer: [Your Email]