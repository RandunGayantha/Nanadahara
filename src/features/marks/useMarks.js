import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export function useStudentMarks(studentId) {
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return
    const q = query(collection(db, 'marks'), where('studentId', '==', studentId), orderBy('date', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMarks(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [studentId])

  return { marks, loading }
}
