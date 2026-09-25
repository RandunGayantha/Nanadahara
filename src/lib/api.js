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

  // `npm run dev` (plain Vite) doesn't serve /api at all, so this request
  // 404s against something that isn't our JSON handler (Vite's dev server,
  // or a static host with no matching route) — surface that distinctly
  // instead of a generic error, since it's the most likely failure mode
  // until this is deployed to Vercel (or run locally via `vercel dev`).
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(
      `/api/${path} isn't reachable (status ${res.status}, non-JSON response). The /api functions only run ` +
        "under Vercel — use `vercel dev` locally, or deploy this project, for this to work."
    )
  }

  const data = await res.json().catch(() => ({}))
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
