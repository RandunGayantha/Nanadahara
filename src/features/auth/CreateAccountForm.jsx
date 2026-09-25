import { lazy, Suspense, useState } from 'react'
import { createAccount } from './createAccount'
import { useAllClasses } from '../classes/useClasses'
import SubjectPicker from './SubjectPicker'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Alert from '../../components/ui/Alert'
import { notifyAccountCredentials } from '../../lib/api'
import { CheckIcon, CopyIcon } from '../../components/icons'

// Lazy-loaded: pulls in the qrcode library, only needed right after a student account is created.
const StudentBarcode = lazy(() => import('./StudentBarcode'))

function readableAuthError(err) {
  if (err?.code === 'auth/email-already-in-use') {
    return 'That username was just taken — please try again.'
  }
  return err?.message || 'Failed to create account'
}

export default function CreateAccountForm({ onCreated }) {
  const { classes } = useAllClasses()
  const [name, setName] = useState('')
  const [role, setRole] = useState('student')
  const [classId, setClassId] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [phone, setPhone] = useState('')
  const [subjects, setSubjects] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  // idle | sending | sent | skipped | error
  const [smsStatus, setSmsStatus] = useState('idle')
  const [smsMessage, setSmsMessage] = useState('')

  const reset = () => {
    setName('')
    setRole('student')
    setClassId('')
    setParentPhone('')
    setPhone('')
    setSubjects([])
  }

  const sendCredentialsSms = async (target) => {
    setSmsStatus('sending')
    setSmsMessage('')
    try {
      const data = await notifyAccountCredentials({
        phone: target.phone,
        name: target.name,
        username: target.username,
        password: target.password,
        role: target.role,
      })
      if (data.sent) {
        setSmsStatus('sent')
      } else {
        setSmsStatus('skipped')
        setSmsMessage(data.reason || 'SMS was not sent.')
      }
    } catch (err) {
      setSmsStatus('error')
      setSmsMessage(err.message || 'Failed to send SMS')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (role === 'student' && !classId) {
      setError('Select a class for the student')
      return
    }
    if (role === 'student' && !parentPhone.trim()) {
      setError('Parent phone is required for students')
      return
    }
    if (role === 'teacher' && !phone.trim()) {
      setError('Phone number is required for teachers')
      return
    }
    setSubmitting(true)
    try {
      const submittedName = name.trim()
      const submittedRole = role
      const submittedPhone = role === 'student' ? parentPhone.trim() : phone.trim()
      const res = await createAccount({
        name: submittedName,
        role,
        classId: role === 'student' ? classId : null,
        parentPhone: role === 'student' ? submittedPhone : null,
        subjects: role === 'teacher' ? subjects : [],
        phone: role === 'teacher' ? submittedPhone : null,
      })
      const created = { ...res, name: submittedName, role: submittedRole, phone: submittedPhone }
      setResult(created)
      reset()
      onCreated?.()

      sendCredentialsSms(created)
    } catch (err) {
      setError(readableAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const copyCreds = () => {
    navigator.clipboard.writeText(`Username: ${result.username}\nPassword: ${result.password}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (result) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="success">Account created successfully</Alert>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Username</p>
          <p className="mb-2 font-mono text-sm text-slate-800">{result.username}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Temporary password</p>
          <p className="font-mono text-sm text-slate-800">{result.password}</p>
        </div>
        <p className="text-xs text-slate-500">
          Share these credentials securely. They're also saved under "View all logins".
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={copyCreds} className="flex-1">
            {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy credentials'}
          </Button>
          <Button
            onClick={() => {
              setResult(null)
              setSmsStatus('idle')
              setSmsMessage('')
            }}
            className="flex-1"
          >
            Create another
          </Button>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700">Credentials SMS</p>
              <p className="truncate text-xs text-slate-500">{result.phone}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => sendCredentialsSms(result)}
              loading={smsStatus === 'sending'}
            >
              {smsStatus === 'sent' ? 'Resend SMS' : 'Send SMS'}
            </Button>
          </div>
          {smsStatus === 'sent' && <Alert tone="success" className="mt-3">SMS sent to {result.phone}.</Alert>}
          {(smsStatus === 'skipped' || smsStatus === 'error') && (
            <Alert tone="error" className="mt-3">{smsMessage}</Alert>
          )}
        </div>

        {result.role === 'student' && (
          <div className="border-t border-slate-100 pt-4">
            <Suspense fallback={<p className="text-center text-sm text-slate-500">Loading barcode…</p>}>
              <StudentBarcode uid={result.uid} name={result.name} username={result.username} />
            </Suspense>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Full name" placeholder="Kasun Perera" value={name} onChange={(e) => setName(e.target.value)} />

      <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </Select>

      {role === 'student' && (
        <>
          <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">Select a class</option>
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

      {role === 'teacher' && (
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

      <Alert tone="error">{error}</Alert>

      <Button type="submit" loading={submitting}>
        Create account
      </Button>
    </form>
  )
}
