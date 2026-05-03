# server-setup (gutter-clean-server)

## Deploy on Vercel

- Set **`DATABASE_URL`**, **`JWT_SECRET`**, **`CORS_ORIGIN`**, **`FIREBASE_PROJECT_ID`** (and any other env vars from `.env.example`) in the Vercel project.
- This repo uses **`api/index.ts`** + **`vercel.json`** rewrites so traffic hits Express on serverless. You do **not** need to run `server.ts` on Vercel; Mongo connects on each request via middleware in `app.ts`.
- Atlas: allow **`0.0.0.0/0`** under Network Access unless you use fixed egress IPs.

## Local

```bash
pnpm install
pnpm dev
```

Uses `server.ts` (connects to Mongo, then `app.listen`).