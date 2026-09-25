# Nanadahara Tuition Management System

React + Vite + Tailwind frontend, Firebase (Auth, Firestore, Storage) on the
**free Spark plan** — no Cloud Functions, no billing account required. The
handful of operations that need server-side Admin SDK privileges (password
reset, SMS) run as free Vercel Serverless Functions instead.

## 1. Firebase project setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication -> Email/Password**.
3. Enable **Firestore** (production mode) and **Storage**.
4. Add a Web App in Project settings and copy the config values into `.env`
   (copy `.env.example` first).
5. Set `.firebaserc`'s `default` project to your Firebase project ID.

Nothing here requires the Blaze plan — Spark is enough for all of this.

## 2. Install dependencies

```bash
npm install
```

## 3. Deploy Firestore/Storage rules

The Firebase CLI can deploy rules and indexes without Cloud Functions, and
without Blaze:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## 4. Generate a service account key (for the two server-only pieces)

Password reset and SMS notifications need the Admin SDK, which needs a
service account — this is a normal Firebase Auth/Firestore Admin API
credential, unrelated to Cloud Functions or Blaze; it's free on any plan.

1. Firebase Console -> Project settings -> **Service accounts** -> **Generate
   new private key**. Save the JSON somewhere outside this repo.
2. You'll use three fields from it (`project_id`, `client_email`,
   `private_key`) as Vercel environment variables in step 7.

## 5. Create the first admin account

No public signup — every other account is created from the Admin dashboard,
client-side. To bootstrap the very first admin:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json npm run bootstrap-admin -- "Your Name"
```

This prints a `firstname.lastname@nanadahara.lk` username and a temporary
password — sign in with those at `/login`.

## 6. Run the frontend locally

```bash
npm run dev
```

Account creation, class assignment, materials, marks, and attendance all work
from `npm run dev` alone (they talk to Firebase directly). The `/api`
functions (password reset, SMS) only run under Vercel — either deployed, or
locally via `vercel dev` (see step 8) if you want to test them before
deploying.

## 7. Configure the SMS gateway (optional, can be done later)

The two SMS endpoints (`api/send-attendance-sms.js`, `api/send-fee-sms.js`)
call a placeholder `sendSMS` in `api/_lib/sms.js` that posts to your Android
SMS gateway (httpSMS / Textbee). Copy `api/.env.example` to `api/.env` and
fill in `SMS_GATEWAY_URL` / `SMS_GATEWAY_PHONE` / `SMS_GATEWAY_API_KEY` once
you've picked a gateway — update the request shape in `sms.js` to match its
exact API docs.

## 8. Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Framework preset: Vite. Build command `npm run build`, output `dist`
   (Vercel detects these automatically). `/api` is picked up automatically
   as Serverless Functions.
3. Add environment variables in Vercel project settings:
   - The six `VITE_FIREBASE_*` values from your `.env`.
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
     from the service account JSON in step 4 (paste the private key as-is,
     including the `BEGIN/END PRIVATE KEY` lines).
   - `SMS_GATEWAY_URL`, `SMS_GATEWAY_PHONE`, `SMS_GATEWAY_API_KEY` from
     step 7.
4. Deploy. `vercel.json` already rewrites all routes to `index.html` for the
   client-side router.

To test the `/api` functions locally before deploying: `npm install -g
vercel`, `vercel link`, `vercel env pull .env.local`, then `vercel dev`.
