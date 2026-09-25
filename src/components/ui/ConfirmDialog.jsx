import { useState } from 'react'
import Modal from './Modal'
import Button from './Button'
import Alert from './Alert'

export default function ConfirmDialog({ open, onClose, title, description, confirmLabel = 'Delete', onConfirm }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async () => {
    setError('')
    setSubmitting(true)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-500">{description}</p>
        <Alert tone="error">{error}</Alert>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={submitting} className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
