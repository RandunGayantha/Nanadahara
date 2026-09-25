import { getAdmin } from './_lib/firebaseAdmin.js'
import { verifyCaller, ApiError } from './_lib/verifyCaller.js'
import { FieldValue } from 'firebase-admin/firestore'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const caller = await verifyCaller(req)
    if (caller.role !== 'admin') {
      throw new ApiError(403, 'Only an admin can delete accounts.')
    }

    const { uid } = req.body || {}
    if (!uid || typeof uid !== 'string') {
      throw new ApiError(400, 'uid is required.')
    }
    if (uid === caller.uid) {
      throw new ApiError(400, "You can't delete your own account.")
    }

    const { auth, db } = getAdmin()
    const userSnap = await db.collection('users').doc(uid).get()
    const user = userSnap.exists ? userSnap.data() : null

    await auth.deleteUser(uid).catch((err) => {
      if (err.code !== 'auth/user-not-found') throw err
    })

    const batch = db.batch()
    batch.delete(db.collection('users').doc(uid))
    batch.delete(db.collection('adminCredentials').doc(uid))
    if (user?.role === 'student' && user.classId) {
      batch.update(db.collection('classes').doc(user.classId), {
        studentIds: FieldValue.arrayRemove(uid),
      })
    }
    await batch.commit()

    res.status(200).json({ ok: true })
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500
    if (status === 500) console.error('delete-account failed', err)
    res.status(status).json({ error: err.message || 'Failed to delete account' })
  }
}
