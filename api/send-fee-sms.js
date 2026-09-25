import { getAdmin } from './_lib/firebaseAdmin.js'
import { verifyCaller, ApiError } from './_lib/verifyCaller.js'
import { sendSMS } from './_lib/sms.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const caller = await verifyCaller(req)
    const { studentId, month } = req.body || {}

    if (!studentId || !month) {
      throw new ApiError(400, 'studentId and month are required.')
    }

    const { db } = getAdmin()
    const studentSnap = await db.collection('users').doc(studentId).get()
    if (!studentSnap.exists) throw new ApiError(404, 'Student not found.')
    const student = studentSnap.data()

    const classSnap = await db.collection('classes').doc(student.classId).get()
    if (!classSnap.exists) throw new ApiError(404, 'Class not found.')
    const classData = classSnap.data()

    if (caller.role !== 'admin') {
      if (caller.role !== 'teacher' || classData.teacherId !== caller.uid) {
        throw new ApiError(403, "You are not authorized for this student's class.")
      }
    }

    if (!student.parentPhone) {
      res.status(200).json({ sent: false, reason: 'No parent phone on file.' })
      return
    }

    const teacherSnap = await db.collection('users').doc(classData.teacherId).get()
    const teacherName = teacherSnap.exists ? teacherSnap.data().name : 'your class teacher'

    const result = await sendSMS(
      student.parentPhone,
      `Dear Parent, we confirm receipt of ${month} tuition fee for ${student.name}, class of ${teacherName}, at Nanadahara Tuition. Thank you for your payment.`
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
    if (status === 500) console.error('send-fee-sms failed', err)
    res.status(status).json({ error: err.message || 'Failed to send SMS' })
  }
}
