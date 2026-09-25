import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

let instanceCount = 0

export default function BarcodeScanner({ onDecode, onError }) {
  const [containerId] = useState(() => `barcode-scanner-${++instanceCount}`)
  const scannerRef = useRef(null)
  const [starting, setStarting] = useState(true)
  const [cameraError, setCameraError] = useState('')

  useEffect(() => {
    let cancelled = false
    // Only stop()/clear() once start() has actually resolved — calling stop()
    // while the camera is still starting (or failed to start) throws synchronously,
    // which happens in practice whenever this effect's cleanup fires quickly
    // (e.g. React StrictMode's mount->cleanup->mount, or toggling scan mode fast).
    let isRunning = false
    const scanner = new Html5Qrcode(containerId, { verbose: false })
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => onDecode(decodedText),
        () => {}
      )
      .then(() => {
        isRunning = true
        if (cancelled) {
          scanner.stop().then(() => scanner.clear()).catch(() => {})
          return
        }
        setStarting(false)
      })
      .catch((err) => {
        if (cancelled) return
        const message = err?.message || String(err)
        setCameraError(message)
        setStarting(false)
        onError?.(err)
      })

    return () => {
      cancelled = true
      scannerRef.current = null
      if (isRunning) {
        scanner.stop().then(() => scanner.clear()).catch(() => {})
      }
    }
  }, [containerId, onDecode, onError])

  return (
    <div className="flex flex-col gap-2">
      <div id={containerId} className="overflow-hidden rounded-2xl border border-slate-200 bg-black [&_video]:mx-auto" />
      {starting && !cameraError && <p className="text-center text-sm text-slate-500">Starting camera…</p>}
      {cameraError && (
        <p className="text-center text-sm text-danger-600">
          Couldn't access the camera ({cameraError}). Check camera permissions for this site and try again.
        </p>
      )}
    </div>
  )
}
