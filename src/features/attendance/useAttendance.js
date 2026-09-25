import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export function useClassAttendance(classId, take = 60) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!classId) {
      setRecords([])
      setLoading(false)
      return
    }
    const q = query(collection(db, 'attendance'), where('classId', '==', classId), orderBy('date', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRecords(snap.docs.slice(0, take).map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [classId, take])

  return { records, loading }
}

export function useStudentAttendance(studentId, classId) {
  const { records, loading } = useClassAttendance(classId, 365)

  const { history, percentage, presentCount, totalCount } = useMemo(() => {
    const history = records
      .filter((r) => r.records && Object.prototype.hasOwnProperty.call(r.records, studentId))
      .map((r) => ({ id: r.id, date: r.date, status: r.records[studentId] }))

    const totalCount = history.length
    const presentCount = history.filter((h) => h.status === 'present').length
    const percentage = totalCount === 0 ? null : Math.round((presentCount / totalCount) * 100)

    return { history, percentage, presentCount, totalCount }
  }, [records, studentId])

  return { history, percentage, presentCount, totalCount, loading }
}
