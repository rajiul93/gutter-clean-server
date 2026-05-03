/**
 * Vercel serverless entry: all HTTP traffic is rewritten here (see `vercel.json`).
 * DB connect runs via middleware in `app.ts` on each invocation.
 */
import app from '../app';

export default app;
