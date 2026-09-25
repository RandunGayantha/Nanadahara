import { arrayRemove, arrayUnion, doc, writeBatch } from 'firebase/firestore'
import { db } from '../../lib/firebase'

/**
 * Moves a student into a class, client-side. Security Rules enforce the
 * real boundary: a teacher may only touch classes they own, and may only
 * change a student's `classId` field (never other fields) when the target
 * class is theirs — so a teacher reassigning a student who is already in
 * a DIFFERENT teacher's class will have that part of the write rejected.
 * We check for that case up front to fail with a clear message instead of
 * a raw permission-denied from a partially-applied batch.
 */
export async function assignStudentToClass({ studentId, classId, currentClassId, isAdmin }) {
  if (!isAdmin && currentClassId && currentClassId !== classId) {
    throw new Error('This student is already in another class — ask an admin to move them.')
  }

  const batch = writeBatch(db)
  batch.update(doc(db, 'users', studentId), { classId })
  batch.update(doc(db, 'classes', classId), { studentIds: arrayUnion(studentId) })
  if (currentClassId && currentClassId !== classId) {
    batch.update(doc(db, 'classes', currentClassId), { studentIds: arrayRemove(studentId) })
  }
  await batch.commit()
}
