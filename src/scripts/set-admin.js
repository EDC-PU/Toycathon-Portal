// This script is used to set a custom claim on a user account to grant admin privileges.
// IMPORTANT: This script should be run from a secure server environment.
// Do not expose your service account credentials on the client-side.

// Usage: node scripts/set-admin.js <user-email-to-make-admin>
require('dotenv').config({ path: '.env' });
const admin = require('firebase-admin');

// IMPORTANT: Your service account credentials should be set as environment variables.
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY
}; 

// This script is deprecated. Admin roles are now managed via the 'isAdmin' field
// in the user's Firestore document. You can set this field to 'true' either
// directly in the Firebase Console or through the user management page in the
// admin dashboard.

console.warn(`
  DEPRECATION WARNING: This script (set-admin.js) is no longer the primary way to manage admin roles.
  
  Admin privileges are now controlled by the 'isAdmin' boolean field in the user's document
  in the 'users' collection in Firestore.
  
  To make a user an admin, you can now:
  1. Go to your Firebase Console -> Firestore Database -> users collection.
  2. Find the document for the user you want to promote.
  3. Add or set the 'isAdmin' field to 'true' (boolean).
  
  Alternatively, once you have admin access yourself, you can manage roles from the
  'Manage Users' page in the application's admin dashboard.
  
  This script will still attempt to set the custom claim, but the application logic
  now primarily relies on the Firestore field.
`);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Error: Please provide the user\'s email as an argument.');
  console.log('Usage: node scripts/set-admin.js <user-email-to-make-admin>');
  process.exit(1);
}

admin.auth().getUserByEmail(userEmail)
  .then((user) => {
    // Add the admin custom claim.
    return admin.auth().setCustomUserClaims(user.uid, { admin: true });
  })
  .then(() => {
    console.log(`Successfully set admin claim for user: ${userEmail}`);
    console.log(`Remember to also set 'isAdmin: true' in their Firestore document.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting custom claim:', error);
    process.exit(1);
  });
