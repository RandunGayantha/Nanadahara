import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import { useStudentsInClass } from '../auth/useUsers'
import { decodeStudentQr } from '../auth/studentQrCode'
import { notifyAttendance } from '../../lib/api'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Alert from '../../components/ui/Alert'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Skeleton'
import { CalendarIcon, CameraIcon, CheckIcon, XIcon } from '../../components/icons'

// Lazy-loaded: pulls in the html5-qrcode/zxing scanning engine, only needed
// once a teacher actually turns scan mode on, not on every attendance page load.
const BarcodeScanner = lazy(() => import('./BarcodeScanner'))

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function AttendanceMarker({ classes }) {
  const { user } = useAuth()
  const [classId, setClassId] = useState(classes[0]?.id || '')
  useEffect(() => {
    if (!classId && classes.length > 0) setClassId(classes[0].id)
  }, [classes, classId])
  const [date, setDate] = useState(todayStr())
  const { students, loading } = useStudentsInClass(classId)
  const [statuses, setStatuses] = useState({})
  const [existingDoc, setExistingDoc] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [scanMode, setScanMode] = useState(false)
  const [scanFeedback, setScanFeedback] = useState(null)

  const docId = classId && date ? `${classId}_${date}` : null
  // Snapshot of what was already saved for this class+date, so we can tell
  // which students are NEWLY marked absent (vs. already-absent from a prior
  // save) and only text their parents about the change, not every re-save.
  const baselineRef = useRef({})

  useEffect(() => {
    if (!docId) return
    const unsub = onSnapshot(doc(db, 'attendance', docId), (snap) => {
      if (snap.exists()) {
        const records = snap.data().records || {}
        baselineRef.current = records
        setStatuses(records)
        setExistingDoc(true)
      } else {
        baselineRef.current = {}
        setExistingDoc(false)
        setStatuses({})
      }
    })
    return unsub
  }, [docId])

  useEffect(() => {
    setStatuses((prev) => {
      const next = { ...prev }
      for (const s of students) {
        if (!next[s.id]) next[s.id] = 'present'
      }
      return next
    })
  }, [students])

  const toggle = (studentId) => {
    setStatuses((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }))
  }

  // Kept in a ref (not a dependency) so the scan handler doesn't get
  // recreated — and the camera restarted — every time the roster snapshot updates.
  const studentsRef = useRef(students)
  useEffect(() => {
    studentsRef.current = students
  }, [students])

  useEffect(() => {
    setScanMode(false)
    setScanFeedback(null)
  }, [classId])

  const lastScanRef = useRef({ code: '', time: 0 })

  const handleScan = useCallback((text) => {
    const now = Date.now()
    if (text === lastScanRef.current.code && now - lastScanRef.current.time < 2500) return
    lastScanRef.current = { code: text, time: now }

    const uid = decodeStudentQr(text)
    if (!uid) {
      setScanFeedback({ tone: 'error', message: 'Not a recognized student barcode' })
      return
    }
    const student = studentsRef.current.find((s) => s.id === uid)
    if (!student) {
      setScanFeedback({ tone: 'error', message: "That student isn't in this class" })
      return
    }
    setStatuses((prev) => ({ ...prev, [uid]: 'present' }))
    setScanFeedback({ tone: 'success', message: `${student.name} marked present` })
  }, [])

  const handleScanError = useCallback((err) => {
    console.error('Barcode scanner error:', err)
  }, [])

  const handleSave = async () => {
    setError('')
    setSuccess('')
    if (!docId || students.length === 0) return
    setSaving(true)
    try {
      const records = {}
      for (const s of students) records[s.id] = statuses[s.id] || 'present'

      const newlyAbsentIds = Object.entries(records)
        .filter(([id, status]) => status === 'absent' && baselineRef.current[id] !== 'absent')
        .map(([id]) => id)
      const newlyPresentIds = Object.entries(records)
        .filter(([id, status]) => status === 'present' && baselineRef.current[id] !== 'present')
        .map(([id]) => id)

      await setDoc(doc(db, 'attendance', docId), {
        classId,
        date,
        records,
        markedBy: user.uid,
      })
      baselineRef.current = records
      setSuccess('Attendance saved')

      if (newlyAbsentIds.length > 0 || newlyPresentIds.length > 0) {
        notifyAttendance({ classId, date, presentIds: newlyPresentIds, absentIds: newlyAbsentIds }).catch((err) =>
          console.error('Failed to send attendance SMS:', err)
        )
      }
    } catch (err) {
      setError(err.message || 'Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const presentCount = students.filter((s) => statuses[s.id] !== 'absent').length

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Date</label>
          <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3.5">
            <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="date"
              value={date}
              max={todayStr()}
              onChange={(e) => setDate(e.target.value)}
              className="h-full w-full bg-transparent text-[15px] text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {existingDoc && <Alert tone="info">Attendance already marked for this date — editing will update it.</Alert>}

      {!loading && students.length > 0 && (
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant={scanMode ? 'secondary' : 'primary'}
            onClick={() => setScanMode((v) => !v)}
            className="w-full"
          >
            <CameraIcon className="h-4 w-4" />
            {scanMode ? 'Stop scanning' : 'Scan barcode to mark present'}
          </Button>
          {scanMode && (
            <Suspense fallback={<p className="text-center text-sm text-slate-500">Loading scanner…</p>}>
              <BarcodeScanner onDecode={handleScan} onError={handleScanError} />
            </Suspense>
          )}
          {scanMode && scanFeedback && <Alert tone={scanFeedback.tone}>{scanFeedback.message}</Alert>}
        </div>
      )}

      {loading ? (
        <SkeletonList rows={3} />
      ) : students.length === 0 ? (
        <EmptyState title="No students in this class" />
      ) : (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">
              {presentCount} / {students.length} present
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {students.map((s) => {
              const status = statuses[s.id] || 'present'
              const present = status === 'present'
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => toggle(s.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
                      present
                        ? 'border-success-500/30 bg-success-50'
                        : 'border-danger-500/30 bg-danger-50'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-600">
                        {s.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="truncate text-sm font-medium text-slate-800">{s.name}</span>
                    </div>
                    <span
                      className={`flex h-9 min-w-[92px] items-center justify-center gap-1.5 rounded-full px-3 text-xs font-bold uppercase tracking-wide ${
                        present ? 'bg-success-600 text-white' : 'bg-danger-600 text-white'
                      }`}
                    >
                      {present ? <CheckIcon className="h-3.5 w-3.5" /> : <XIcon className="h-3.5 w-3.5" />}
                      {present ? 'Present' : 'Absent'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <Alert tone="error">{error}</Alert>
          <Alert tone="success">{success}</Alert>

          <div className="sticky bottom-20 md:bottom-0 md:static">
            <Button onClick={handleSave} loading={saving} className="w-full shadow-card-lg md:shadow-none">
              Save attendance
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
