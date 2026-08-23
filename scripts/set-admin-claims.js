/**
 * Admin Claims Setup Script
 * 
 * Run this script in a secure environment to grant admin custom claims.
 * 
 * PREREQUISITES:
 * 1. Install Firebase Admin SDK: npm install firebase-admin
 * 2. Download service account key from Firebase Console:
 *    Project Settings > Service Accounts > Generate new private key
 * 3. Save as service-account.json in this directory (DO NOT COMMIT)
 * 
 * USAGE:
 * node scripts/set-admin-claims.js <user-email> [additional-emails...]
 * 
 * Example:
 * node scripts/set-admin-claims.js your-admin@email.com another-admin@email.com
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account
const serviceAccountPath = path.join(__dirname, 'service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ service-account.json not found!');
  console.error('Please download from Firebase Console > Project Settings > Service Accounts');
  console.error('Save as scripts/service-account.json');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaims(emails) {
  if (emails.length === 0) {
    console.error('Usage: node scripts/set-admin-claims.js <email1> [email2...]');
    process.exit(1);
  }

  console.log('🔐 Setting admin claims for:', emails.join(', '));

  for (const email of emails) {
    try {
      // Get user by email
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // Check if already admin
      const currentClaims = userRecord.customClaims || {};
      if (currentClaims.admin === true) {
        console.log(`✅ ${email} already has admin claim`);
        continue;
      }
      
      // Set admin claim
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        ...currentClaims,
        admin: true
      });
      
      console.log(`✅ Admin claim granted to ${email} (UID: ${userRecord.uid})`);
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.error(`❌ User not found: ${email}`);
      } else {
        console.error(`❌ Error setting claim for ${email}:`, error.message);
      }
    }
  }
  
  console.log('\n✅ Done! Users must sign out and sign back in for claims to take effect.');
}

// Run with command line arguments
const emails = process.argv.slice(2);
setAdminClaims(emails).catch(console.error);