import { useAuth } from '../../context/AuthContext'
import { useStudentFees } from '../../features/fees/useFees'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import FeesList from '../../features/fees/FeesList'

export default function StudentFees() {
  const { profile } = useAuth()
  const { fees, loading } = useStudentFees(profile?.id)
  const pending = fees.filter((f) => f.status === 'pending')

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <PageHeader title="My fees" subtitle="Payment history and pending dues" />
      {pending.length > 0 && (
        <Card className="border-warning-200 bg-warning-50">
          <p className="text-sm font-semibold text-warning-700">
            {pending.length} pending due{pending.length > 1 ? 's' : ''}
          </p>
          <p className="mt-0.5 text-sm text-warning-600">
            Total: LKR {pending.reduce((sum, f) => sum + Number(f.amount), 0).toLocaleString()}
          </p>
        </Card>
      )}
      <FeesList fees={fees} loading={loading} />
    </div>
  )
}
