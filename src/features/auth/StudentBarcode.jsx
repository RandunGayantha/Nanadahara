import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { encodeStudentQr } from './studentQrCode'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { DownloadIcon } from '../../components/icons'

export default function StudentBarcode({ uid, name, username }) {
  const canvasRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!uid || !canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, encodeStudentQr(uid), {
      width: 220,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
    }).catch((err) => setError(err.message || 'Failed to generate barcode'))
  }, [uid])

  const download = () => {
    const qrCanvas = canvasRef.current
    if (!qrCanvas) return
    const padding = 24
    const qrSize = qrCanvas.width
    const textHeight = 52
    const out = document.createElement('canvas')
    out.width = qrSize + padding * 2
    out.height = qrSize + padding * 2 + textHeight
    const ctx = out.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, out.width, out.height)
    ctx.drawImage(qrCanvas, padding, padding)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#0f172a'
    ctx.font = '600 15px sans-serif'
    ctx.fillText(name || 'Student', out.width / 2, padding + qrSize + 22)
    if (username) {
      ctx.fillStyle = '#64748b'
      ctx.font = '400 12px sans-serif'
      ctx.fillText(username, out.width / 2, padding + qrSize + 40)
    }

    const link = document.createElement('a')
    const safeName = (name || 'student').trim().toLowerCase().replace(/\s+/g, '-')
    link.download = `${safeName}-attendance-barcode.png`
    link.href = out.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <canvas ref={canvasRef} />
      </div>
      <Alert tone="error">{error}</Alert>
      <p className="text-center text-xs text-slate-500">
        Print or save this code. Teachers can scan it with their phone or webcam to mark attendance instantly.
      </p>
      <Button variant="secondary" onClick={download} className="w-full">
        <DownloadIcon className="h-4 w-4" />
        Download barcode
      </Button>
    </div>
  )
}
