import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Skeleton'
import { BookIcon, DownloadIcon } from '../../components/icons'

function formatDate(ts) {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MaterialsList({ materials, loading }) {
  if (loading) return <SkeletonList rows={3} />
  if (materials.length === 0) {
    return (
      <EmptyState
        icon={<BookIcon className="h-6 w-6" />}
        title="No materials yet"
        description="Notes and papers uploaded for this class will show up here."
      />
    )
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {materials.map((m) => (
        <li key={m.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">{m.title}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <Badge tone="brand">{m.subject}</Badge>
              <Badge tone={m.type === 'paper' ? 'warning' : 'neutral'}>{m.type}</Badge>
              <span className="text-xs text-slate-400">{formatDate(m.uploadedAt)}</span>
            </div>
          </div>
          <a
            href={m.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors hover:bg-brand-100"
            aria-label="Download"
          >
            <DownloadIcon className="h-5 w-5" />
          </a>
        </li>
      ))}
    </ul>
  )
}
