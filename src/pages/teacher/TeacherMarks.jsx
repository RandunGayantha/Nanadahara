import { useAuth } from '../../context/AuthContext'
import { useTeacherClasses } from '../../features/classes/useClasses'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import MarksEntryForm from '../../features/marks/MarksEntryForm'
import { ClipboardIcon } from '../../components/icons'

export default function TeacherMarks() {
  const { profile } = useAuth()
  const { classes, loading } = useTeacherClasses(profile?.id)
  const subjects = profile?.subjects || []

  return (
    <div className="animate-fade-in">
      <PageHeader title="Enter marks" subtitle="Record exam results for your class" />
      {loading ? null : classes.length === 0 ? (
        <EmptyState icon={<ClipboardIcon className="h-6 w-6" />} title="No classes assigned" />
      ) : (
        <Card className="max-w-2xl">
          <MarksEntryForm classes={classes} subjects={subjects} />
        </Card>
      )}
    </div>
  )
}
