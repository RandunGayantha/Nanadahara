import { useState } from 'react'
import { arrayRemove, doc, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAllClasses } from '../classes/useClasses'
import { assignStudentToClass } from '../classes/assignStudentToClass'
import SubjectPicker from './SubjectPicker'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Alert from '../../components/ui/Alert'

export default function EditUserForm({ user, onSaved }) {
  const { classes } = useAllClasses()
  const [name, setName] = useState(user.name || '')
  const [classId, setClassId] = useState(user.classId || '')
  const [parentPhone, setParentPhone] = useState(user.parentPhone || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [subjects, setSubjects] = useState(user.subjects || [])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setSubmitting(true)
    try {
      const fields = { name: name.trim() }
      if (user.role === 'student') fields.parentPhone = parentPhone.trim()
      if (user.role === 'teacher') {
        fields.subjects = subjects
        fields.phone = phone.trim()
      }

      await updateDoc(doc(db, 'users', user.id), fields)
      await updateDoc(doc(db, 'adminCredentials', user.id), { name: name.trim() })

      const previousClassId = user.classId || ''
      if (user.role === 'student' && classId !== previousClassId) {
        if (classId) {
          await assignStudentToClass({
            studentId: user.id,
            classId,
            currentClassId: previousClassId || null,
            isAdmin: true,
          })
        } else {
          const batch = writeBatch(db)
          batch.update(doc(db, 'users', user.id), { classId: null })
          if (previousClassId) {
            batch.update(doc(db, 'classes', previousClassId), { studentIds: arrayRemove(user.id) })
          }
          await batch.commit()
        }
      }

      onSaved?.()
    } catch (err) {
      setError(err.message || 'Failed to save changes')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />

      {user.role === 'student' && (
        <>
          <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">Unassigned</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input
            label="Parent phone"
            placeholder="+94771234567"
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value)}
          />
        </>
      )}

      {user.role === 'teacher' && (
        <>
          <Input
            label="Phone"
            placeholder="+94771234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <SubjectPicker value={subjects} onChange={setSubjects} />
        </>
      )}

      <p className="text-xs text-slate-400">
        Username ({user.email}) can't be changed here — reset their password instead if they need new credentials.
      </p>

      <Alert tone="error">{error}</Alert>
      <Button type="submit" loading={submitting}>
        Save changes
      </Button>
    </form>
  )
}
