import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import embeddedServiceAccount from './serviceAccountKey.js'

let cached = null

/**
 * Lazily initializes the Admin SDK on first call (not at module load), so any
 * init failure turns into a normal JSON error response from the calling
 * handler's try/catch instead of an opaque crash during import.
 *
 * Prefers real FIREBASE_* env vars when set (e.g. if this later moves to
 * Vercel dashboard-managed env vars), falling back to the credentials
 * embedded in ./serviceAccountKey.js otherwise — that fallback is what
 * actually works today, since vercel.json's env/build.env config turned out
 * not to reliably reach Serverless Functions at runtime.
 */
export function getAdmin() {
  if (cached) return cached

  const existing = getApps()
  let app = existing[0]

  if (!app) {
    const projectId = process.env.FIREBASE_PROJECT_ID || embeddedServiceAccount.projectId
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || embeddedServiceAccount.clientEmail
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || embeddedServiceAccount.privateKey)?.replace(
      /\\n/g,
      '\n'
    )

    app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  }

  cached = { auth: getAuth(app), db: getFirestore(app) }
  return cached
}
