import { auth } from './firebase'

/**
 * Calls one of the small Vercel serverless functions under /api that need
 * Admin SDK privileges (password reset, SMS) — everything else in this app
 * talks to Firebase directly from the client. Attaches the caller's ID
 * token so the function can verify who's asking.
 */
async function callApi(path, body) {
  const idToken = await auth.currentUser?.getIdToken()
  if (!idToken) throw new Error('You must be signed in.')

  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
  })

  // A non-JSON response means the request never reached our handler's own
  // try/catch — either `npm run dev` (plain Vite doesn't serve /api at all,
  // so this 404s against nothing) or, on an actual Vercel deployment, a
  // platform-level function crash (bad bundling, missing env vars the code
  // didn't defensively check, a timeout, etc). Surface the raw body so the
  // real cause is visible instead of guessing which case it is.
  const rawText = await res.text()
  let data
  try {
    data = rawText ? JSON.parse(rawText) : {}
  } catch {
    throw new Error(
      `/api/${path} returned a non-JSON response (status ${res.status}): ${
        rawText.slice(0, 300) || '(empty body)'
      }`
    )
  }

  if (!res.ok) {
    throw new Error(data.error || 'Request failed')
  }
  return data
}

export const resetPassword = (uid) => callApi('reset-password', { uid })

export const deleteAccount = (uid) => callApi('delete-account', { uid })

export const notifyAttendance = (payload) => callApi('send-attendance-sms', payload)

export const notifyFeePaid = (payload) => callApi('send-fee-sms', payload)

export const notifyAccountCredentials = (payload) => callApi('send-credentials-sms', payload)
