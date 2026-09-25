/**
 * One-time bootstrap: creates the very first admin account.
 * After this, all further accounts (admin/teacher/student) should be
 * created from the app's admin dashboard.
 *
 * Usage:
 *   1. Download a service account key from Firebase Console
 *      (Project settings -> Service accounts -> Generate new private key).
 *   2. Set GOOGLE_APPLICATION_CREDENTIALS to its path.
 *   3. node scripts/create-first-admin.cjs "Full Name"
 */
const { initializeApp, applicationDefault } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')

function slugify(part) {
  return part
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '')
}

async function generateUsername(auth, name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = slugify(parts[0] || 'user')
  const last = parts.length > 1 ? slugify(parts[parts.length - 1]) : first
  const base = `${first}.${last}`

  let candidate = base
  let suffix = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const email = `${candidate}@nanadahara.lk`
    try {
      await auth.getUserByEmail(email)
      suffix += 1
      candidate = `${base}${suffix}`
    } catch (err) {
      if (err.code === 'auth/user-not-found') return email
      throw err
    }
  }
}

function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < length; i += 1) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

async function main() {
  const name = process.argv.slice(2).join(' ').trim()
  if (!name) {
    console.error('Usage: node scripts/create-first-admin.cjs "Full Name"')
    process.exit(1)
  }
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your service account key path first.')
    process.exit(1)
  }

  initializeApp({ credential: applicationDefault() })
  const auth = getAuth()
  const db = getFirestore()

  const email = await generateUsername(auth, name)
  const password = generatePassword()

  const user = await auth.createUser({ email, password, displayName: name })

  try {
    const batch = db.batch()
    batch.set(db.collection('users').doc(user.uid), {
      name,
      email,
      role: 'admin',
      createdAt: FieldValue.serverTimestamp(),
    })
    batch.set(db.collection('adminCredentials').doc(user.uid), {
      username: email,
      password,
      name,
      role: 'admin',
      createdAt: FieldValue.serverTimestamp(),
    })
    await batch.commit()
  } catch (err) {
    // Don't leave a stray Auth user with an unrecoverable password behind —
    // e.g. if Firestore isn't set up yet, this undoes createUser() above so
    // the script can simply be re-run once the real problem is fixed.
    await auth.deleteUser(user.uid).catch(() => {})
    throw err
  }

  console.log('Admin account created:')
  console.log('  Username:', email)
  console.log('  Password:', password)
  console.log('\nSign in at your app\'s /login screen with these credentials.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
