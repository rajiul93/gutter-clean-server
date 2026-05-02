import { createRemoteJWKSet, jwtVerify } from 'jose';

/** Google-hosted JWKS for Firebase Auth ID tokens (no service account required). */
const firebaseJwks = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
  ),
);

export type VerifiedFirebaseToken = {
  uid: string;
  email: string;
  name?: string;
  picture?: string;
};

/**
 * Verifies a Firebase ID token using public keys (same approach as Firebase docs for third-party JWT verify).
 * Requires FIREBASE_PROJECT_ID to match the token's `aud` / `iss` (your Firebase project ID).
 */
export async function verifyFirebaseIdToken(
  idToken: string,
  projectId: string,
): Promise<VerifiedFirebaseToken> {
  const { payload } = await jwtVerify(idToken, firebaseJwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  const sub = typeof payload.sub === 'string' ? payload.sub : '';
  const email = typeof payload.email === 'string' ? payload.email : '';
  if (!sub || !email) {
    throw new Error('Token missing sub or email');
  }

  return {
    uid: sub,
    email,
    name: typeof payload.name === 'string' ? payload.name : undefined,
    picture: typeof payload.picture === 'string' ? payload.picture : undefined,
  };
}
