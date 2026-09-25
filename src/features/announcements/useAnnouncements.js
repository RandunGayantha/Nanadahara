import { useEffect, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export function useClassAnnouncements(classId, take = 20) {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!classId) {
      setAnnouncements([])
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'announcements'),
      where('classId', '==', classId),
      orderBy('createdAt', 'desc'),
      limit(take)
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [classId, take])

  return { announcements, loading }
}

export function useTeacherAnnouncements(teacherId, take = 20) {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!teacherId) return
    const q = query(
      collection(db, 'announcements'),
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc'),
      limit(take)
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [teacherId, take])

  return { announcements, loading }
}
