const VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

export default function SetupRequired() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-warning-50 text-warning-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M4.5 19.5h15a1.5 1.5 0 001.3-2.25l-7.5-13a1.5 1.5 0 00-2.6 0l-7.5 13A1.5 1.5 0 004.5 19.5z" />
          </svg>
        </div>
        <h1 className="text-lg font-bold text-slate-900">Firebase isn't configured yet</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Create a <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">.env</code> file
          in the project root (copy <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">.env.example</code>)
          and fill in your Firebase web app config:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-3.5 text-xs text-slate-100">
          {VARS.map((v) => `${v}=\n`).join('')}
        </pre>
        <p className="mt-3 text-sm text-slate-500">
          Find these under Firebase Console → Project settings → General → Your apps → Web app.
          After saving <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">.env</code>, restart{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">npm run dev</code>.
        </p>
      </div>
    </div>
  )
}
