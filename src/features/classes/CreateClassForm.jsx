import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useUsersByRole } from '../auth/useUsers'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Alert from '../../components/ui/Alert'

export default function CreateClassForm({ onCreated }) {
  const { users: teachers, loading } = useUsersByRole('teacher')
  const [name, setName] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !teacherId) {
      setError('Class name and teacher are required')
      return
    }
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'classes'), {
        name: name.trim(),
        teacherId,
        studentIds: [],
        createdAt: serverTimestamp(),
      })
      setName('')
      setTeacherId('')
      onCreated?.()
    } catch (err) {
      setError(err.message || 'Failed to create class')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Class name" placeholder="Grade 10 - Mathematics" value={name} onChange={(e) => setName(e.target.value)} />
      <Select label="Teacher" value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
        <option value="">{loading ? 'Loading teachers…' : 'Select a teacher'}</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>
      <Alert tone="error">{error}</Alert>
      <Button type="submit" loading={submitting}>
        Create class
      </Button>
    </form>
  )
}
