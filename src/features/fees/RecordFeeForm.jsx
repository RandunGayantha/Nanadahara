import { useEffect, useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import { useStudentsInClass } from '../auth/useUsers'
import { notifyFeePaid } from '../../lib/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Alert from '../../components/ui/Alert'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const currentMonthLabel = () => `${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`

export default function RecordFeeForm({ classes, onRecorded }) {
  const { user } = useAuth()
  const [classId, setClassId] = useState(classes[0]?.id || '')
  useEffect(() => {
    if (!classId && classes.length > 0) setClassId(classes[0].id)
  }, [classes, classId])
  const { students } = useStudentsInClass(classId)
  const [studentId, setStudentId] = useState('')
  const [amount, setAmount] = useState('')
  const [month, setMonth] = useState(currentMonthLabel())
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleClassChange = (id) => {
    setClassId(id)
    setStudentId('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!classId || !studentId) {
      setError('Select a class and student')
      return
    }
    const amt = Number(amount)
    if (!amt || amt <= 0) {
      setError('Enter a valid amount')
      return
    }
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'fees'), {
        studentId,
        classId,
        amount: amt,
        month,
        status: 'paid',
        paidOn: serverTimestamp(),
        paidBy: user.uid,
      })
      setSuccess('Payment recorded')
      setAmount('')
      setStudentId('')
      onRecorded?.()

      notifyFeePaid({ studentId, month }).catch((err) =>
        console.error('Failed to send fee confirmation SMS:', err)
      )
    } catch (err) {
      setError(err.message || 'Failed to record payment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select label="Class" value={classId} onChange={(e) => handleClassChange(e.target.value)}>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Select label="Student" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
        <option value="">Select a student</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Amount (LKR)"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Select label="Month" value={month} onChange={(e) => setMonth(e.target.value)}>
          {MONTHS.map((m) => (
            <option key={m} value={`${m} ${new Date().getFullYear()}`}>
              {m} {new Date().getFullYear()}
            </option>
          ))}
        </Select>
      </div>
      <Alert tone="error">{error}</Alert>
      <Alert tone="success">{success}</Alert>
      <Button type="submit" loading={submitting}>
        Record payment
      </Button>
    </form>
  )
}
