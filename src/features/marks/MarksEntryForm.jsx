import { useEffect, useState } from 'react'
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import { useStudentsInClass } from '../auth/useUsers'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Alert from '../../components/ui/Alert'
import EmptyState from '../../components/ui/EmptyState'
import { ClipboardIcon } from '../../components/icons'

export default function MarksEntryForm({ classes, subjects }) {
  const { user } = useAuth()
  const [classId, setClassId] = useState(classes[0]?.id || '')
  useEffect(() => {
    if (!classId && classes.length > 0) setClassId(classes[0].id)
  }, [classes, classId])
  const { students, loading } = useStudentsInClass(classId)
  const [examName, setExamName] = useState('')
  const [subject, setSubject] = useState(subjects[0] || '')
  const [totalMarks, setTotalMarks] = useState('100')
  const [scores, setScores] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setScores({})
  }, [classId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!classId || !examName.trim() || !subject || !totalMarks) {
      setError('Fill in exam name, subject and total marks')
      return
    }
    const entries = students.filter((s) => scores[s.id] !== undefined && scores[s.id] !== '')
    if (entries.length === 0) {
      setError('Enter at least one score')
      return
    }
    setSubmitting(true)
    try {
      const batch = writeBatch(db)
      for (const s of entries) {
        const markRef = doc(collection(db, 'marks'))
        batch.set(markRef, {
          studentId: s.id,
          classId,
          subject,
          examName: examName.trim(),
          marksObtained: Number(scores[s.id]),
          totalMarks: Number(totalMarks),
          enteredBy: user.uid,
          date: serverTimestamp(),
        })
      }
      await batch.commit()
      setSuccess(`Saved marks for ${entries.length} student${entries.length > 1 ? 's' : ''}`)
      setScores({})
    } catch (err) {
      setError(err.message || 'Failed to save marks')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
          {subjects.length === 0 && <option value="">—</option>}
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Input label="Exam name" placeholder="Term 1 Test" value={examName} onChange={(e) => setExamName(e.target.value)} />
        <Input label="Total marks" type="number" min="1" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Scores</p>
        {loading ? null : students.length === 0 ? (
          <EmptyState icon={<ClipboardIcon className="h-6 w-6" />} title="No students in this class" />
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
            {students.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 bg-white px-3.5 py-2.5">
                <span className="text-sm font-medium text-slate-700">{s.name}</span>
                <input
                  type="number"
                  min="0"
                  max={totalMarks || undefined}
                  placeholder="—"
                  value={scores[s.id] ?? ''}
                  onChange={(e) => setScores((prev) => ({ ...prev, [s.id]: e.target.value }))}
                  className="h-10 w-20 rounded-lg border border-slate-200 px-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Alert tone="error">{error}</Alert>
      <Alert tone="success">{success}</Alert>
      <Button type="submit" loading={submitting} disabled={students.length === 0}>
        Save marks
      </Button>
    </form>
  )
}
