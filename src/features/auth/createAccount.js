import { createUserWithEmailAndPassword, deleteUser, signOut } from 'firebase/auth'
import { arrayUnion, doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db, secondaryAuth } from '../../lib/firebase'
import { generatePassword, generateUsername } from '../../lib/username'

/**
 * Creates a new Auth user + its Firestore docs, entirely client-side.
 *
 * Runs createUserWithEmailAndPassword on a SECOND Firebase App instance
 * (secondaryAuth) so it doesn't touch the admin's own session on the
 * primary app — the standard workaround for "admin creates other users"
 * without a server. If the Firestore writes fail after the Auth user was
 * created, the (still signed-in, on the secondary instance) new user
 * deletes itself to avoid leaving an orphaned account.
 */
export async function createAccount({ name, role, classId, parentPhone, subjects, phone }) {
  const email = await generateUsername(name)
  const password = generatePassword()

  const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password)
  const uid = credential.user.uid

  try {
    const userDoc = { name, email, role, createdAt: serverTimestamp() }
    if (role === 'student') {
      userDoc.classId = classId
      userDoc.parentPhone = parentPhone
    } else {
      userDoc.subjects = subjects || []
      userDoc.phone = phone
    }

    const batch = writeBatch(db)
    batch.set(doc(db, 'users', uid), userDoc)
    batch.set(doc(db, 'adminCredentials', uid), {
      username: email,
      password,
      name,
      role,
      createdAt: serverTimestamp(),
    })
    if (role === 'student') {
      batch.update(doc(db, 'classes', classId), { studentIds: arrayUnion(uid) })
    }
    await batch.commit()
  } catch (err) {
    await deleteUser(credential.user).catch(() => {})
    throw err
  } finally {
    await signOut(secondaryAuth).catch(() => {})
  }

  return { uid, username: email, password }
}
