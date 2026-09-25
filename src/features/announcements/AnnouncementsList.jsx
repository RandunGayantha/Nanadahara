import { useState } from 'react'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Skeleton'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { MegaphoneIcon, TrashIcon } from '../../components/icons'

function formatDate(ts) {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

export default function AnnouncementsList({ announcements, loading, classLabel, canDelete }) {
  const [deletingId, setDeletingId] = useState(null)

  if (loading) return <SkeletonList rows={2} />
  if (announcements.length === 0) {
    return (
      <EmptyState
        icon={<MegaphoneIcon className="h-6 w-6" />}
        title="No announcements yet"
        description="Important messages from your teacher will show up here."
      />
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-2.5">
        {announcements.map((a) => (
          <li key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <MegaphoneIcon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{a.title}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{a.message}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {classLabel ? `${classLabel(a.classId)} · ` : ''}
                  {formatDate(a.createdAt)}
                </p>
              </div>
              {canDelete && (
                <button
                  onClick={() => setDeletingId(a.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-danger-50 hover:text-danger-600"
                  aria-label="Delete announcement"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Delete announcement?"
        description="Students will no longer see this message."
        onConfirm={async () => {
          await deleteDoc(doc(db, 'announcements', deletingId))
          setDeletingId(null)
        }}
      />
    </>
  )
}
