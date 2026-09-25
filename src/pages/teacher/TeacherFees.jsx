import { useAuth } from '../../context/AuthContext'
import { useTeacherClasses } from '../../features/classes/useClasses'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import RecordFeeForm from '../../features/fees/RecordFeeForm'
import { CardIcon } from '../../components/icons'

export default function TeacherFees() {
  const { profile } = useAuth()
  const { classes, loading } = useTeacherClasses(profile?.id)

  return (
    <div className="animate-fade-in">
      <PageHeader title="Record fee payment" subtitle="Log a payment for a student in your class" />
      {loading ? null : classes.length === 0 ? (
        <EmptyState icon={<CardIcon className="h-6 w-6" />} title="No classes assigned" />
      ) : (
        <Card className="max-w-xl">
          <RecordFeeForm classes={classes} />
        </Card>
      )}
    </div>
  )
}
