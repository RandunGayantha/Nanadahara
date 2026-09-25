import { useStudentsInClass } from '../auth/useUsers'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { UsersIcon } from '../../components/icons'

export default function ClassRoster({ classId }) {
  const { students, loading } = useStudentsInClass(classId)

  if (loading) return <SkeletonList rows={2} />
  if (students.length === 0) {
    return (
      <EmptyState
        icon={<UsersIcon className="h-6 w-6" />}
        title="No students yet"
        description="Add students to this class using the form above."
      />
    )
  }

  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
      {students.map((s) => (
        <li key={s.id} className="flex items-center gap-3 bg-white px-3.5 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {s.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{s.name}</p>
            <p className="truncate text-xs text-slate-400">{s.email}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
