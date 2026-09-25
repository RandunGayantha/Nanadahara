import { useEffect, useState } from 'react'
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Alert from '../../components/ui/Alert'

const ALL_CLASSES = '__all__'

export default function PostAnnouncementForm({ classes, onPosted }) {
  const { user } = useAuth()
  const [classId, setClassId] = useState(classes[0]?.id || '')
  useEffect(() => {
    if (!classId && classes.length > 0) setClassId(classes[0].id)
  }, [classes, classId])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!classId) {
      setError('Select a class')
      return
    }
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required')
      return
    }
    setSubmitting(true)
    try {
      const targetClassIds = classId === ALL_CLASSES ? classes.map((c) => c.id) : [classId]

      const batch = writeBatch(db)
      for (const target of targetClassIds) {
        batch.set(doc(collection(db, 'announcements')), {
          classId: target,
          teacherId: user.uid,
          title: title.trim(),
          message: message.trim(),
          createdAt: serverTimestamp(),
        })
      }
      await batch.commit()

      setSuccess(
        targetClassIds.length > 1
          ? `Sent to ${targetClassIds.length} classes`
          : 'Announcement posted'
      )
      setTitle('')
      setMessage('')
      onPosted?.()
    } catch (err) {
      setError(err.message || 'Failed to post announcement')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select label="Send to" value={classId} onChange={(e) => setClassId(e.target.value)}>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
        {classes.length > 1 && <option value={ALL_CLASSES}>All my classes</option>}
      </Select>
      <Input label="Title" placeholder="Term test postponed" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Message</label>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write the announcement for your students…"
          className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        />
      </div>
      <Alert tone="error">{error}</Alert>
      <Alert tone="success">{success}</Alert>
      <Button type="submit" loading={submitting}>
        Post announcement
      </Button>
    </form>
  )
}
