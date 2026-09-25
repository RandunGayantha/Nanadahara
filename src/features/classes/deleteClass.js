import { doc, getDoc, writeBatch } from 'firebase/firestore'
import { db } from '../../lib/firebase'

/**
 * Deletes a class and unassigns every student in it (clears their classId
 * rather than leaving it pointing at a class that no longer exists).
 */
export async function deleteClass(classId) {
  const classSnap = await getDoc(doc(db, 'classes', classId))
  const studentIds = classSnap.exists() ? classSnap.data().studentIds || [] : []

  const batch = writeBatch(db)
  for (const studentId of studentIds) {
    batch.update(doc(db, 'users', studentId), { classId: null })
  }
  batch.delete(doc(db, 'classes', classId))
  await batch.commit()
}
