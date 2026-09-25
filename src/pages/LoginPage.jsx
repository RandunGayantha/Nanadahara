import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import Alert from '../components/ui/Alert'
import Footer from '../components/Footer'
import loginHeroLandscape from '../images/login-hero.webp'
import loginHeroDesktop from '../images/dextop.webp'

export default function LoginPage() {
  const { user, profile, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user && profile) {
    return <Navigate to={`/${profile.role}`} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const value = email.trim().toLowerCase()
    if (!value) {
      setError('Enter your username')
      return
    }
    setSubmitting(true)
    try {
      await signInWithEmailAndPassword(auth, value, password)
    } catch (err) {
      if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(err.code)) {
        setError('Incorrect username or password')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-svh bg-white lg:flex">
      {/* Brand hero — landscape crop as a top banner on mobile/tablet; a
          dedicated desktop crop (close to a 3:4 ratio, matching a tall side
          column much more closely) on wide desktop. object-contain: the
          whole image is always visible, no cropping, no scrolling. Pinned to
          the left edge (object-left) rather than centered, and any leftover
          space is white so it reads as one continuous area with the form
          side rather than a separate colored block. */}
      <div className="w-full shrink-0 overflow-hidden bg-white lg:h-svh lg:w-1/2 xl:w-3/5">
        <picture className="contents">
          <source media="(min-width: 1024px)" srcSet={loginHeroDesktop} />
          <img
            src={loginHeroLandscape}
            alt="Nanadahara Tuition — Educational Institute, Matugama"
            className="w-full h-auto lg:h-full lg:w-full lg:object-contain lg:object-left"
          />
        </picture>
      </div>

      {/* Sign-in form */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:h-svh lg:py-0">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <div className="mt-2 h-1 w-10 rounded-full bg-[#f2c40c]" />
            <p className="mt-3 text-sm text-slate-500">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="text-sm font-medium text-slate-700">
                  Username
                </label>
                <input
                  id="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="username"
                  placeholder="john.doe@nanadahara.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0f2a52]/30 focus:border-[#0f2a52]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-[15px] text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0f2a52]/30 focus:border-[#0f2a52]"
                />
              </div>

              <Alert tone="error">{error}</Alert>

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0f2a52] text-sm font-medium text-white transition-all duration-150 hover:bg-[#0b2140] active:scale-[0.98] active:bg-[#081832] disabled:cursor-not-allowed disabled:bg-[#0f2a52]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2a52] focus-visible:ring-offset-2"
              >
                {submitting && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                Sign in
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Accounts are created by your administrator. Contact them if you need access.
          </p>
          <Footer />
        </div>
      </div>
    </div>
  )
}
