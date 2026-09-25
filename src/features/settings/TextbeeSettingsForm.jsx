import { useEffect, useState } from 'react'
import { useTextbeeSettings } from './useTextbeeSettings'
import { saveTextbeeSettings } from './saveTextbeeSettings'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import { SkeletonList } from '../../components/ui/Skeleton'

function SecretInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 pr-16 text-[15px] text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}

export default function TextbeeSettingsForm() {
  const { settings, loading } = useTextbeeSettings()
  const [apiKey, setApiKey] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (settings) {
      setApiKey(settings.apiKey || '')
      setDeviceId(settings.deviceId || '')
    }
  }, [settings])

  const configured = Boolean(settings?.apiKey && settings?.deviceId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!apiKey.trim() || !deviceId.trim()) {
      setError('Both the API key and device ID are required.')
      return
    }
    setSubmitting(true)
    try {
      await saveTextbeeSettings({ apiKey, deviceId })
      setSuccess('TextBee settings saved.')
    } catch (err) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <SkeletonList rows={2} />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">TextBee SMS gateway</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Used to send attendance, fee and new-account SMS via the TextBee Android app.
          </p>
        </div>
        <Badge tone={configured ? 'success' : 'warning'}>{configured ? 'Configured' : 'Not configured'}</Badge>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">API key</label>
          <SecretInput value={apiKey} onChange={setApiKey} placeholder="Paste your TextBee API key" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Device ID</label>
          <SecretInput value={deviceId} onChange={setDeviceId} placeholder="Paste your TextBee device ID" />
        </div>

        <Alert tone="error">{error}</Alert>
        <Alert tone="success">{success}</Alert>

        <Button type="submit" loading={submitting}>
          {configured ? 'Update settings' : 'Save settings'}
        </Button>
      </form>

      <p className="text-xs leading-relaxed text-slate-400">
        Get these from the TextBee app on the Android phone you're using as the SMS gateway: install it, sign in,
        register the device, then copy the API key and device ID from your{' '}
        <a
          href="https://textbee.dev"
          target="_blank"
          rel="noreferrer"
          className="text-brand-600 underline hover:text-brand-700"
        >
          textbee.dev
        </a>{' '}
        dashboard. You can come back and update these at any time — changes apply immediately, no redeploy needed.
      </p>
    </div>
  )
}
