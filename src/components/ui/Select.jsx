export default function Select({ label, error, className = '', id, children, ...props }) {
  const selectId = id || props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`h-11 w-full rounded-xl border bg-white px-3.5 text-[15px] text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 ${
          error ? 'border-danger-500' : 'border-slate-200'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs font-medium text-danger-600">{error}</p>}
    </div>
  )
}
