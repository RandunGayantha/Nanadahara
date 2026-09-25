import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export function useAllClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'classes'), orderBy('name'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [])

  return { classes, loading }
}

export function useTeacherClasses(teacherId) {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!teacherId) return
    const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [teacherId])

  return { classes, loading }
}
