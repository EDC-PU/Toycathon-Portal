// This script is used to set a custom claim on a user account to grant admin privileges.
// IMPORTANT: This script should be run from a secure server environment.
// Do not expose your service account credentials on the client-side.

// Usage: node scripts/set-admin.js <user-email-to-make-admin>

const admin = require('firebase-admin');

// IMPORTANT: Replace with the path to your service account key file.
const serviceAccount = require('./service-account-key.json'); 

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
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting custom claim:', error);
    process.exit(1);
  });
