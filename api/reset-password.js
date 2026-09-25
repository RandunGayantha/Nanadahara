import { getAdmin } from './_lib/firebaseAdmin.js'
import { verifyCaller, ApiError } from './_lib/verifyCaller.js'

function randomPassword(length = 10) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < length; i += 1) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const caller = await verifyCaller(req)
    if (caller.role !== 'admin') {
      throw new ApiError(403, 'Only an admin can reset passwords.')
    }

    const { uid } = req.body || {}
    if (!uid || typeof uid !== 'string') {
      throw new ApiError(400, 'uid is required.')
    }

    const { auth, db } = getAdmin()
    const credRef = db.collection('adminCredentials').doc(uid)
    const credSnap = await credRef.get()
    if (!credSnap.exists) {
      throw new ApiError(404, 'No account found for that user.')
    }

    const password = randomPassword()
    await auth.updateUser(uid, { password })
    await credRef.update({ password })

    res.status(200).json({ password })
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500
    if (status === 500) console.error('reset-password failed', err)
    res.status(status).json({ error: err.message || 'Failed to reset password' })
  }
}
