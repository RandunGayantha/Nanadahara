import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTeacherClasses } from '../../features/classes/useClasses'
import { useTeacherAnnouncements } from '../../features/announcements/useAnnouncements'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Skeleton'
import PostAnnouncementForm from '../../features/announcements/PostAnnouncementForm'
import AnnouncementsList from '../../features/announcements/AnnouncementsList'
import { BookIcon, UsersIcon, MegaphoneIcon } from '../../components/icons'

export default function TeacherOverview() {
  const { profile } = useAuth()
  const { classes, loading } = useTeacherClasses(profile?.id)
  const { announcements, loading: loadingAnnouncements } = useTeacherAnnouncements(profile?.id)
  const [showPost, setShowPost] = useState(false)

  const classLabel = (classId) => classes.find((c) => c.id === classId)?.name || 'Class'

  return (
    <div className="animate-fade-in">
      <PageHeader title={`Hi, ${profile?.name?.split(' ')[0] || 'there'}`} subtitle="Your classes at a glance" />

      {loading ? (
        <SkeletonList rows={3} />
      ) : classes.length === 0 ? (
        <EmptyState
          icon={<BookIcon className="h-6 w-6" />}
          title="No classes assigned"
          description="Ask your admin to assign you to a class."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {classes.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{c.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <UsersIcon className="h-4 w-4" />
                    {c.studentIds?.length || 0} students
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <BookIcon className="h-4.5 w-4.5" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { to: '/teacher/materials', label: 'Materials' },
          { to: '/teacher/marks', label: 'Marks' },
          { to: '/teacher/attendance', label: 'Attendance' },
          { to: '/teacher/fees', label: 'Fees' },
        ].map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            {l.label}
          </Link>
        ))}
      </div>

      {classes.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <MegaphoneIcon className="h-5 w-5 text-brand-600" />
              Announcements
            </h2>
            <Button size="sm" onClick={() => setShowPost(true)}>
              Post message
            </Button>
          </div>
          <AnnouncementsList
            announcements={announcements}
            loading={loadingAnnouncements}
            classLabel={classLabel}
            canDelete
          />
        </div>
      )}

      <Modal open={showPost} onClose={() => setShowPost(false)} title="Post announcement">
        <PostAnnouncementForm classes={classes} onPosted={() => setShowPost(false)} />
      </Modal>
    </div>
  )
}
