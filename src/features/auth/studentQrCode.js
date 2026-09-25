const STUDENT_QR_PREFIX = 'NANADAHARA-STUDENT:'

export function encodeStudentQr(uid) {
  return `${STUDENT_QR_PREFIX}${uid}`
}

export function decodeStudentQr(text) {
  if (typeof text !== 'string' || !text.startsWith(STUDENT_QR_PREFIX)) return null
  const uid = text.slice(STUDENT_QR_PREFIX.length).trim()
  return uid || null
}
