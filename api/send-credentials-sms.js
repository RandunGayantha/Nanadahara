import { verifyCaller, ApiError } from './_lib/verifyCaller.js'
import { sendSMS } from './_lib/sms.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const caller = await verifyCaller(req)
    if (caller.role !== 'admin') throw new ApiError(403, 'Not authorized.')

    const { phone, name, username, password, role } = req.body || {}
    if (!phone || !name || !username || !password || !role) {
      throw new ApiError(400, 'phone, name, username, password and role are required.')
    }

    const roleLabel = role === 'teacher' ? 'teacher' : 'student'
    const result = await sendSMS(
      phone,
      `Dear ${name}, your Nanadahara Tuition ${roleLabel} account has been created. Username: ${username}  Password: ${password}  Please keep these credentials confidential.`
    )

    if (result.skipped) {
      res.status(200).json({
        sent: false,
        reason: 'TextBee is not configured yet — add your API key and device ID in Admin -> Settings.',
      })
      return
    }
    if (!result.ok) {
      throw new ApiError(502, 'TextBee rejected the SMS. Double-check the API key and device ID in Admin -> Settings.')
    }

    res.status(200).json({ sent: true })
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500
    if (status === 500) console.error('send-credentials-sms failed', err)
    res.status(status).json({ error: err.message || 'Failed to send SMS' })
  }
}
