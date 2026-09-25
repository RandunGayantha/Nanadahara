import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Skeleton'
import { CardIcon } from '../../components/icons'

function formatDate(ts) {
  if (!ts?.toDate) return '—'
  return ts.toDate().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function FeesList({ fees, loading, showStudentName, studentNameOf }) {
  if (loading) return <SkeletonList rows={3} />
  if (fees.length === 0) {
    return (
      <EmptyState
        icon={<CardIcon className="h-6 w-6" />}
        title="No fee records"
        description="Payments recorded for this student will appear here."
      />
    )
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {fees.map((f) => (
        <li
          key={f.id}
          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="min-w-0">
            <p className="font-medium text-slate-800">
              {showStudentName ? studentNameOf?.(f.studentId) : f.month}
            </p>
            <p className="text-sm text-slate-400">
              {showStudentName ? f.month : `Paid on ${formatDate(f.paidOn)}`}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="font-semibold text-slate-900">LKR {Number(f.amount).toLocaleString()}</span>
            <Badge tone={f.status === 'paid' ? 'success' : 'warning'}>{f.status}</Badge>
          </div>
        </li>
      ))}
    </ul>
  )
}
