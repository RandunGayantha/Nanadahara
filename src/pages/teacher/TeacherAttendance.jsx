import { useAuth } from '../../context/AuthContext'
import { useTeacherClasses } from '../../features/classes/useClasses'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import AttendanceMarker from '../../features/attendance/AttendanceMarker'
import { CalendarIcon } from '../../components/icons'

export default function TeacherAttendance() {
  const { profile } = useAuth()
  const { classes, loading } = useTeacherClasses(profile?.id)

  return (
    <div className="animate-fade-in">
      <PageHeader title="Mark attendance" subtitle="Tap a student to toggle present / absent" />
      {loading ? null : classes.length === 0 ? (
        <EmptyState icon={<CalendarIcon className="h-6 w-6" />} title="No classes assigned" />
      ) : (
        <Card className="max-w-2xl">
          <AttendanceMarker classes={classes} />
        </Card>
      )}
    </div>
  )
}
