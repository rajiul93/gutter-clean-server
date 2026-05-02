import admin from 'firebase-admin';
import config from '../config';

export function getFirebaseAdmin(): typeof admin {
  if (!admin.apps.length) {
    const key = config.firebase_private_key?.replace(/\\n/g, '\n');
    if (config.firebase_project_id && config.firebase_client_email && key) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebase_project_id,
          clientEmail: config.firebase_client_email,
          privateKey: key,
        }),
      });
    } else {
      throw new Error(
        'Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.',
      );
    }
  }
  return admin;
}
