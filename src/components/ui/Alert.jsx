const tones = {
  error: 'bg-danger-50 text-danger-700 border-danger-100',
  success: 'bg-success-50 text-success-700 border-success-100',
  info: 'bg-brand-50 text-brand-700 border-brand-100',
}

export default function Alert({ tone = 'info', children, className = '' }) {
  if (!children) return null
  return (
    <div
      role="alert"
      className={`animate-fade-in rounded-xl border px-3.5 py-2.5 text-sm font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </div>
  )
}
