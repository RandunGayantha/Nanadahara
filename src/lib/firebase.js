import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// True only if every required value is present — an empty or missing .env
// (the default state right after cloning this repo) leaves these undefined,
// and Firebase throws synchronously during init rather than at call time.
// main.jsx checks this before rendering the app, so that shows up as a
// clear setup screen instead of a blank white page.
export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean)

let app, auth, db, storage, secondaryApp, secondaryAuth

if (firebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)

  // A second, independent Firebase App instance used ONLY to create new
  // Auth users from the admin dashboard. createUserWithEmailAndPassword()
  // always signs in as the new user on whichever app instance it's called
  // on — running it here instead of on `auth` means the admin's own
  // session on the primary app is never touched.
  secondaryApp = initializeApp(firebaseConfig, 'admin-account-creation')
  secondaryAuth = getAuth(secondaryApp)
}

export { app, auth, db, storage, secondaryAuth }
