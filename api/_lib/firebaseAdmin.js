import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

let cached = null

/**
 * Lazily initializes the Admin SDK on first call (not at module load), so a
 * missing env var turns into a normal JSON error response from the calling
 * handler's try/catch instead of an opaque crash during import.
 */
export function getAdmin() {
  if (cached) return cached

  const existing = getApps()
  let app = existing[0]

  if (!app) {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Server is missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY environment variables.'
      )
    }

    app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  }

  cached = { auth: getAuth(app), db: getFirestore(app) }
  return cached
}
