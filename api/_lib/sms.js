import { getAdmin } from './firebaseAdmin.js'

// Cached per warm serverless invocation only (not across cold starts) — mainly
// avoids re-reading Firestore for every message in a single sendSMSBatch call
// (e.g. texting an entire class's worth of parents in one attendance save).
let cachedConfig = null
let cachedAt = 0
const CONFIG_TTL_MS = 30_000

async function getTextbeeConfig() {
  const now = Date.now()
  if (cachedConfig !== null && now - cachedAt < CONFIG_TTL_MS) return cachedConfig
  const { db } = getAdmin()
  const snap = await db.collection('settings').doc('textbee').get()
  cachedConfig = snap.exists ? snap.data() : {}
  cachedAt = now
  return cachedConfig
}

/**
 * Sends a single SMS via TextBee (https://textbee.dev) — a free Android SMS
 * gateway app. The API key and device id are configured by the admin at
 * Admin -> Settings (stored in Firestore `settings/textbee`, not env vars,
 * so they can be changed at runtime without a redeploy).
 */
export async function sendSMS(to, message) {
  const config = await getTextbeeConfig()
  const { apiKey, deviceId } = config || {}

  if (!apiKey || !deviceId) {
    console.warn('TextBee is not configured (Admin -> Settings) — skipping SMS send', { to })
    return { skipped: true }
  }

  try {
    const res = await fetch(`https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ recipients: [to], message }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('TextBee request failed', { to, status: res.status, text })
      return { ok: false, status: res.status }
    }

    return { ok: true }
  } catch (err) {
    console.error('TextBee request threw', { to, error: err.message })
    return { ok: false, error: err.message }
  }
}

/**
 * Sends many SMS messages with bounded concurrency so marking a whole class
 * absent/present doesn't fire 30+ simultaneous requests at the gateway.
 */
export async function sendSMSBatch(messages, { concurrency = 5, delayMs = 250 } = {}) {
  const queue = [...messages]
  const results = []

  async function worker() {
    while (queue.length > 0) {
      const next = queue.shift()
      if (!next) return
      results.push(await sendSMS(next.to, next.message))
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs))
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, messages.length) }, worker)
  await Promise.all(workers)
  return results
}
