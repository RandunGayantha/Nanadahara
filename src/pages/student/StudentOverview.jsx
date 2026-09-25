import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useStudentAttendance } from '../../features/attendance/useAttendance'
import { useStudentFees } from '../../features/fees/useFees'
import { useClassAnnouncements } from '../../features/announcements/useAnnouncements'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import AnnouncementsList from '../../features/announcements/AnnouncementsList'
import { CalendarIcon, CardIcon, BookIcon, ClipboardIcon, MegaphoneIcon } from '../../components/icons'

export default function StudentOverview() {
  const { profile } = useAuth()
  const { percentage, loading: loadingAttendance } = useStudentAttendance(profile?.id, profile?.classId)
  const { fees, loading: loadingFees } = useStudentFees(profile?.id)
  const { announcements, loading: loadingAnnouncements } = useClassAnnouncements(profile?.classId)

  const pendingDues = fees.filter((f) => f.status === 'pending')

  return (
    <div className="animate-fade-in">
      <PageHeader title={`Hi, ${profile?.name?.split(' ')[0] || 'there'}`} subtitle="Here's how things are looking" />

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <CalendarIcon className="h-5 w-5" />
          </div>
          {loadingAttendance ? (
            <Skeleton className="h-7 w-14" />
          ) : (
            <p className="text-2xl font-bold text-slate-900">{percentage == null ? '—' : `${percentage}%`}</p>
          )}
          <p className="mt-0.5 text-sm text-slate-500">Attendance</p>
        </Card>
        <Card>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50 text-warning-600">
            <CardIcon className="h-5 w-5" />
          </div>
          {loadingFees ? (
            <Skeleton className="h-7 w-10" />
          ) : (
            <p className="text-2xl font-bold text-slate-900">{pendingDues.length}</p>
          )}
          <p className="mt-0.5 text-sm text-slate-500">Pending dues</p>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Link to="/student/materials" className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center transition-colors hover:bg-slate-50">
          <BookIcon className="h-5 w-5 text-brand-600" />
          <span className="text-xs font-semibold text-slate-700">Materials</span>
        </Link>
        <Link to="/student/marks" className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center transition-colors hover:bg-slate-50">
          <ClipboardIcon className="h-5 w-5 text-brand-600" />
          <span className="text-xs font-semibold text-slate-700">Marks</span>
        </Link>
        <Link to="/student/fees" className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center transition-colors hover:bg-slate-50">
          <CardIcon className="h-5 w-5 text-brand-600" />
          <span className="text-xs font-semibold text-slate-700">Fees</span>
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
          <MegaphoneIcon className="h-5 w-5 text-brand-600" />
          Announcements
        </h2>
        <AnnouncementsList announcements={announcements} loading={loadingAnnouncements} />
      </div>
    </div>
  )
}
