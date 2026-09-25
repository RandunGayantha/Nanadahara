import { useState } from 'react'
import { XIcon } from '../../components/icons'

const PRESET_SUBJECTS = [
  'Maths', 'Science', 'English', 'History', 'ICT', 'Commerce',
  'Sinhala', 'Buddhism', 'Physics', 'Chemistry', 'Biology', 'Geography',
]

export default function SubjectPicker({ value, onChange }) {
  const [customInput, setCustomInput] = useState('')

  const addSubject = (raw) => {
    const subject = raw.trim()
    if (!subject) return
    if (value.some((s) => s.toLowerCase() === subject.toLowerCase())) return
    onChange([...value, subject])
  }

  const removeSubject = (subject) => onChange(value.filter((s) => s !== subject))

  const handleAddClick = () => {
    addSubject(customInput)
    setCustomInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddClick()
    }
  }

  const suggestions = PRESET_SUBJECTS.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">Subjects</span>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1.5 pl-3 pr-1.5 text-sm font-medium text-brand-700"
            >
              {s}
              <button
                type="button"
                onClick={() => removeSubject(s)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-brand-500 hover:bg-brand-100"
                aria-label={`Remove ${s}`}
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a subject and press Enter"
          className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        />
        <button
          type="button"
          onClick={handleAddClick}
          className="h-10 shrink-0 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Add
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => addSubject(s)}
              className="rounded-full border border-dashed border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 hover:border-brand-300 hover:text-brand-600"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
