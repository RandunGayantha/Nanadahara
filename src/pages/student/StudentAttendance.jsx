import { useAuth } from '../../context/AuthContext'
import { useStudentAttendance } from '../../features/attendance/useAttendance'
import PageHeader from '../../components/ui/PageHeader'
import AttendanceHistory from '../../features/attendance/AttendanceHistory'

export default function StudentAttendance() {
  const { profile } = useAuth()
  const { history, percentage, presentCount, totalCount, loading } = useStudentAttendance(
    profile?.id,
    profile?.classId
  )

  return (
    <div className="animate-fade-in">
      <PageHeader title="My attendance" />
      <AttendanceHistory
        history={history}
        percentage={percentage}
        presentCount={presentCount}
        totalCount={totalCount}
        loading={loading}
      />
    </div>
  )
}
