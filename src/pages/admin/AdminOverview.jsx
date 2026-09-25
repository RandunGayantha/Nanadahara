import { Link } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import { useAllClasses } from '../../features/classes/useClasses'
import { useUsersByRole } from '../../features/auth/useUsers'
import { usePendingFees } from '../../features/fees/useFees'
import { BookIcon, UsersIcon, CardIcon, PlusIcon, KeyIcon } from '../../components/icons'

function StatCard({ icon: Icon, label, value, loading, tone }) {
  return (
    <Card>
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      {loading ? <Skeleton className="h-7 w-12" /> : <p className="text-2xl font-bold text-slate-900">{value}</p>}
      <p className="mt-0.5 text-sm text-slate-500">{label}</p>
    </Card>
  )
}

export default function AdminOverview() {
  const { classes, loading: loadingClasses } = useAllClasses()
  const { users: students, loading: loadingStudents } = useUsersByRole('student')
  const { users: teachers, loading: loadingTeachers } = useUsersByRole('teacher')
  const { fees: pendingFees, loading: loadingFees } = usePendingFees()

  return (
    <div className="animate-fade-in">
      <PageHeader title="Overview" subtitle="A snapshot of your tuition center" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={BookIcon} label="Classes" value={classes.length} loading={loadingClasses} tone="bg-brand-50 text-brand-600" />
        <StatCard icon={UsersIcon} label="Students" value={students.length} loading={loadingStudents} tone="bg-success-50 text-success-600" />
        <StatCard icon={UsersIcon} label="Teachers" value={teachers.length} loading={loadingTeachers} tone="bg-warning-50 text-warning-600" />
        <StatCard icon={CardIcon} label="Pending fees" value={pendingFees.length} loading={loadingFees} tone="bg-danger-50 text-danger-600" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link to="/admin/accounts" className="group">
          <Card className="flex items-center gap-3 transition-shadow group-hover:shadow-card-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <PlusIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Create account</p>
              <p className="text-xs text-slate-400">Add a teacher or student</p>
            </div>
          </Card>
        </Link>
        <Link to="/admin/classes" className="group">
          <Card className="flex items-center gap-3 transition-shadow group-hover:shadow-card-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600">
              <BookIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Manage classes</p>
              <p className="text-xs text-slate-400">Create classes & rosters</p>
            </div>
          </Card>
        </Link>
        <Link to="/admin/logins" className="group">
          <Card className="flex items-center gap-3 transition-shadow group-hover:shadow-card-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50 text-warning-600">
              <KeyIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">View logins</p>
              <p className="text-xs text-slate-400">Usernames & passwords</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
