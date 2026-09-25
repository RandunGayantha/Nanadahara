import { useEffect, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export function useStudentFees(studentId) {
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return
    const q = query(
      collection(db, 'fees'),
      where('studentId', '==', studentId),
      orderBy('month', 'desc')
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        setFees(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [studentId])

  return { fees, loading }
}

export function useClassFees(classId) {
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!classId) {
      setFees([])
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'fees'),
      where('classId', '==', classId),
      orderBy('month', 'desc'),
      limit(100)
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        setFees(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [classId])

  return { fees, loading }
}

export function usePendingFees(pendingLimit = 20) {
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'fees'), where('status', '==', 'pending'), limit(pendingLimit))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setFees(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [pendingLimit])

  return { fees, loading }
}
