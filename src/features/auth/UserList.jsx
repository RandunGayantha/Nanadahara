import { lazy, Suspense, useState } from 'react'
import { useUsersByRole } from './useUsers'
import { useAllClasses } from '../classes/useClasses'
import { deleteAccount } from '../../lib/api'
import EditUserForm from './EditUserForm'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Skeleton'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Badge from '../../components/ui/Badge'
import { UsersIcon, TrashIcon, QrCodeIcon } from '../../components/icons'

// Lazy-loaded: pulls in the qrcode library, only needed when an admin opens a student's barcode.
const StudentBarcode = lazy(() => import('./StudentBarcode'))

export default function UserList({ role }) {
  const { users, loading } = useUsersByRole(role)
  const { classes } = useAllClasses()
  const [editingUser, setEditingUser] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)
  const [barcodeUser, setBarcodeUser] = useState(null)

  const className = (classId) => classes.find((c) => c.id === classId)?.name

  if (loading) return <SkeletonList rows={3} />
  if (users.length === 0) {
    return (
      <EmptyState
        icon={<UsersIcon className="h-6 w-6" />}
        title={`No ${role}s yet`}
        description={`${role === 'student' ? 'Students' : 'Teachers'} you create will show up here.`}
      />
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-2.5">
        {users.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{u.name}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  {role === 'student' && (
                    <Badge tone={u.classId ? 'neutral' : 'warning'}>
                      {u.classId ? className(u.classId) || 'Unknown class' : 'Unassigned'}
                    </Badge>
                  )}
                  {role === 'teacher' &&
                    (u.subjects || []).map((s) => (
                      <Badge key={s} tone="brand">
                        {s}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              {role === 'student' && (
                <button
                  onClick={() => setBarcodeUser(u)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="View barcode"
                >
                  <QrCodeIcon className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setEditingUser(u)}
                className="flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Edit
              </button>
              <button
                onClick={() => setDeletingUser(u)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-danger-50 hover:text-danger-600"
                aria-label="Delete"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Modal open={!!editingUser} onClose={() => setEditingUser(null)} title={`Edit ${editingUser?.name || ''}`}>
        {editingUser && (
          <EditUserForm user={editingUser} onSaved={() => setEditingUser(null)} />
        )}
      </Modal>

      <Modal open={!!barcodeUser} onClose={() => setBarcodeUser(null)} title={`${barcodeUser?.name || ''}'s barcode`}>
        {barcodeUser && (
          <Suspense fallback={<p className="text-center text-sm text-slate-500">Loading barcode…</p>}>
            <StudentBarcode uid={barcodeUser.id} name={barcodeUser.name} username={barcodeUser.email} />
          </Suspense>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        title="Delete account?"
        description={`This permanently deletes ${deletingUser?.name}'s login. Their marks, attendance and fee history stay on record. This can't be undone.`}
        onConfirm={async () => {
          await deleteAccount(deletingUser.id)
          setDeletingUser(null)
        }}
      />
    </>
  )
}
