import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useUsersByRole } from '../auth/useUsers'
import { assignStudentToClass } from './assignStudentToClass'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Alert from '../../components/ui/Alert'

export default function AddStudentToClass({ classId }) {
  const { role } = useAuth()
  const { users: students, loading } = useUsersByRole('student')
  const [studentId, setStudentId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const available = useMemo(
    () => students.filter((s) => s.classId !== classId),
    [students, classId]
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!studentId) {
      setError('Select a student')
      return
    }
    setSubmitting(true)
    try {
      const student = students.find((s) => s.id === studentId)
      await assignStudentToClass({
        studentId,
        classId,
        currentClassId: student?.classId || null,
        isAdmin: role === 'admin',
      })
      setSuccess('Student added to class')
      setStudentId('')
    } catch (err) {
      setError(err.message || 'Failed to add student')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Select label="Add student" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          <option value="">{loading ? 'Loading students…' : 'Select a student'}</option>
          {available.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.classId ? '(currently in another class)' : ''}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" loading={submitting} className="sm:mb-0">
        Add
      </Button>
      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}
    </form>
  )
}
