import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Skeleton'
import { CalendarIcon } from '../../components/icons'

export default function AttendanceHistory({ history, percentage, presentCount, totalCount, loading }) {
  if (loading) return <SkeletonList rows={4} />

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-center gap-4">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
            percentage == null
              ? 'bg-slate-100 text-slate-400'
              : percentage >= 75
                ? 'bg-success-50 text-success-700'
                : percentage >= 50
                  ? 'bg-warning-50 text-warning-600'
                  : 'bg-danger-50 text-danger-700'
          }`}
        >
          {percentage == null ? '—' : `${percentage}%`}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Attendance rate</p>
          <p className="text-sm text-slate-500">
            {totalCount === 0 ? 'No records yet' : `${presentCount} of ${totalCount} days present`}
          </p>
        </div>
      </Card>

      {history.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="h-6 w-6" />}
          title="No attendance records"
          description="Your attendance history will show up here once your teacher marks it."
        />
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {history.map((h) => (
            <li key={h.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-slate-700">{h.date}</span>
              <Badge tone={h.status === 'present' ? 'success' : 'danger'}>{h.status}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
