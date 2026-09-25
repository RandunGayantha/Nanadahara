import { useEffect, useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { storage, db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Alert from '../../components/ui/Alert'
import { UploadIcon } from '../../components/icons'

export default function UploadMaterialForm({ classes, subjects, onUploaded }) {
  const { user } = useAuth()
  const [classId, setClassId] = useState(classes[0]?.id || '')
  useEffect(() => {
    if (!classId && classes.length > 0) setClassId(classes[0].id)
  }, [classes, classId])
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState(subjects[0] || '')
  const [type, setType] = useState('note')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!classId || !title.trim() || !subject || !file) {
      setError('Fill in all fields and choose a file')
      return
    }
    setUploading(true)
    try {
      const path = `materials/${classId}/${Date.now()}-${file.name}`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file)
      const fileUrl = await getDownloadURL(storageRef)

      await addDoc(collection(db, 'materials'), {
        classId,
        teacherId: user.uid,
        title: title.trim(),
        fileUrl,
        type,
        subject,
        uploadedAt: serverTimestamp(),
      })

      setSuccess('Material uploaded')
      setTitle('')
      setFile(null)
      e.target.reset?.()
      onUploaded?.()
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Input label="Title" placeholder="Algebra revision notes" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
          {subjects.length === 0 && <option value="">—</option>}
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="note">Note</option>
          <option value="paper">Paper</option>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">File (PDF or image)</label>
        <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-brand-300 hover:text-brand-500">
          <UploadIcon className="h-5 w-5" />
          <span className="text-sm font-medium">{file ? file.name : 'Tap to choose a file'}</span>
          <input
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>
      <Alert tone="error">{error}</Alert>
      <Alert tone="success">{success}</Alert>
      <Button type="submit" loading={uploading}>
        Upload material
      </Button>
    </form>
  )
}
