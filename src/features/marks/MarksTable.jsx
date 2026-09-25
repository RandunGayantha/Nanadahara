import { useMemo } from 'react'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Skeleton'
import { ClipboardIcon } from '../../components/icons'

function gradeTone(pct) {
  if (pct >= 75) return 'success'
  if (pct >= 50) return 'warning'
  return 'danger'
}

export default function MarksTable({ marks, loading }) {
  const grouped = useMemo(() => {
    const map = new Map()
    for (const m of marks) {
      const key = m.examName
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(m)
    }
    return Array.from(map.entries())
  }, [marks])

  if (loading) return <SkeletonList rows={3} />
  if (marks.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardIcon className="h-6 w-6" />}
        title="No marks yet"
        description="Your exam results will appear here once your teacher enters them."
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {grouped.map(([examName, items]) => (
        <div key={examName}>
          <p className="mb-2 text-sm font-semibold text-slate-700">{examName}</p>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {items.map((m) => {
              const pct = Math.round((m.marksObtained / m.totalMarks) * 100)
              return (
                <li key={m.id} className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-sm font-medium text-slate-700">{m.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">
                      {m.marksObtained}/{m.totalMarks}
                    </span>
                    <Badge tone={gradeTone(pct)}>{pct}%</Badge>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
