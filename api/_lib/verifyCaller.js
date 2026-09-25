import { getAdmin } from './firebaseAdmin.js'

class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

/**
 * Verifies the caller's Firebase ID token (sent as `Authorization: Bearer
 * <token>`) and looks up their role from Firestore — there are no custom
 * claims in this app, since setting them requires Cloud Functions, so
 * `users/{uid}.role` is the single source of truth on both client and
 * server.
 */
export async function verifyCaller(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) throw new ApiError(401, 'Missing Authorization header.')

  const { auth, db } = getAdmin()

  let decoded
  try {
    decoded = await auth.verifyIdToken(token)
  } catch {
    throw new ApiError(401, 'Invalid or expired session.')
  }

  const userSnap = await db.collection('users').doc(decoded.uid).get()
  if (!userSnap.exists) throw new ApiError(403, 'No account found for this user.')

  return { uid: decoded.uid, role: userSnap.data().role, profile: userSnap.data() }
}

export { ApiError }
