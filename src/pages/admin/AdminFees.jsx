import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import { useAllClasses } from '../../features/classes/useClasses'
import RecordFeeForm from '../../features/fees/RecordFeeForm'
import { CardIcon } from '../../components/icons'

export default function AdminFees() {
  const { classes, loading } = useAllClasses()

  return (
    <div className="animate-fade-in">
      <PageHeader title="Record fee payment" subtitle="Log a payment for any student" />
      <Card className="max-w-xl">
        {loading ? null : classes.length === 0 ? (
          <EmptyState
            icon={<CardIcon className="h-6 w-6" />}
            title="No classes yet"
            description="Create a class before recording fee payments."
          />
        ) : (
          <RecordFeeForm classes={classes} />
        )}
      </Card>
    </div>
  )
}
