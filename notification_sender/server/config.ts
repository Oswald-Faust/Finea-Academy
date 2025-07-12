import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialisation de Firebase Admin
const serviceAccountPath = path.resolve(process.env.SERVICE_ACCOUNT_PATH || '');

if (!serviceAccountPath) {
  throw new Error('SERVICE_ACCOUNT_PATH environment variable is required');
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

export const messaging = admin.messaging();
export const db = admin.firestore();
