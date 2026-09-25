import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export function useClassMaterials(classId) {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!classId) {
      setMaterials([])
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'materials'),
      where('classId', '==', classId),
      orderBy('uploadedAt', 'desc')
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMaterials(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [classId])

  return { materials, loading }
}
