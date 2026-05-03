export default {
  database_url: process.env.DATABASE_URL as string,
  port: process.env.PORT || 50001,
  jwt_secret: process.env.JWT_SECRET as string,
  jwt_expires_in: process.env.JWT_EXPIRES_IN || '1d',
  /** Same as Firebase web `projectId` / `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — used only to verify ID tokens. */
  firebase_project_id:
    (
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      ''
    ).trim() || undefined,
  /** Comma-separated emails that receive ADMIN role on first sync */
  admin_emails: (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  cors_origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
