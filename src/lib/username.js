import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import { db } from './firebase'

const DOMAIN = '@nanadahara.lk'

function slugify(part) {
  return part
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '')
}

function baseUsername(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = slugify(parts[0] || 'user')
  const last = parts.length > 1 ? slugify(parts[parts.length - 1]) : first
  return `${first}.${last}`
}

/**
 * Generates a unique @nanadahara.lk login email for a display name, appending
 * an incrementing number on collision (checked against the users collection,
 * which mirrors every account's login email).
 */
export async function generateUsername(name) {
  const base = baseUsername(name)
  let candidate = base
  let suffix = 1

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const email = `${candidate}${DOMAIN}`
    const snap = await getDocs(
      query(collection(db, 'users'), where('email', '==', email), limit(1))
    )
    if (snap.empty) return email
    suffix += 1
    candidate = `${base}${suffix}`
  }
}

export function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

export { DOMAIN }
