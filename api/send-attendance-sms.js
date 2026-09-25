import { getAdmin } from './_lib/firebaseAdmin.js'
import { verifyCaller, ApiError } from './_lib/verifyCaller.js'
import { sendSMSBatch } from './_lib/sms.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const caller = await verifyCaller(req)
    const { classId, date, presentIds = [], absentIds = [] } = req.body || {}

    if (!classId || !date || (presentIds.length === 0 && absentIds.length === 0)) {
      throw new ApiError(400, 'classId, date and at least one of presentIds/absentIds are required.')
    }

    const { db } = getAdmin()

    const classSnap = await db.collection('classes').doc(classId).get()
    if (!classSnap.exists) throw new ApiError(404, 'Class not found.')
    const classData = classSnap.data()

    if (caller.role !== 'admin') {
      if (caller.role !== 'teacher' || classData.teacherId !== caller.uid) {
        throw new ApiError(403, 'You are not assigned to this class.')
      }
    }

    const teacherSnap = await db.collection('users').doc(classData.teacherId).get()
    const teacherName = teacherSnap.exists ? teacherSnap.data().name : 'your class teacher'

    const studentIds = [...new Set([...presentIds, ...absentIds])]
    const studentDocs = await Promise.all(studentIds.map((id) => db.collection('users').doc(id).get()))
    const studentsById = new Map(studentDocs.filter((s) => s.exists).map((s) => [s.id, s.data()]))

    const messages = []

    for (const id of presentIds) {
      const student = studentsById.get(id)
      if (!student?.parentPhone) continue
      messages.push({
        to: student.parentPhone,
        message: `Dear Parent, this is to inform you that ${student.name} has arrived for today's class with ${teacherName} at Nanadahara Tuition. Thank you.`,
      })
    }

    for (const id of absentIds) {
      const student = studentsById.get(id)
      if (!student?.parentPhone) continue
      messages.push({
        to: student.parentPhone,
        message: `Dear Parent, we would like to inform you that ${student.name} was marked absent for today's class with ${teacherName} at Nanadahara Tuition.`,
      })
    }

    let results = []
    if (messages.length > 0) results = await sendSMSBatch(messages)

    const sent = results.filter((r) => r.ok).length
    const skipped = results.filter((r) => r.skipped).length
    const failed = results.filter((r) => !r.ok && !r.skipped).length

    res.status(200).json({
      sent,
      skipped,
      failed,
      reason: skipped > 0 ? 'TextBee is not configured yet — add your API key and device ID in Admin -> Settings.' : undefined,
    })
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500
    if (status === 500) console.error('send-attendance-sms failed', err)
    res.status(status).json({ error: err.message || 'Failed to send SMS' })
  }
}
