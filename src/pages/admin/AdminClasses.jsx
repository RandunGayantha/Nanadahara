import { useMemo, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Skeleton'
import { useAllClasses } from '../../features/classes/useClasses'
import { useUsersByRole } from '../../features/auth/useUsers'
import CreateClassForm from '../../features/classes/CreateClassForm'
import EditClassForm from '../../features/classes/EditClassForm'
import AddStudentToClass from '../../features/classes/AddStudentToClass'
import ClassRoster from '../../features/classes/ClassRoster'
import { deleteClass } from '../../features/classes/deleteClass'
import { PlusIcon, BookIcon, UsersIcon, TrashIcon } from '../../components/icons'

export default function AdminClasses() {
  const { classes, loading } = useAllClasses()
  const { users: teachers } = useUsersByRole('teacher')
  const [showCreate, setShowCreate] = useState(false)
  const [activeClassId, setActiveClassId] = useState(null)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const activeClass = useMemo(
    () => classes.find((c) => c.id === activeClassId) || null,
    [classes, activeClassId]
  )

  const teacherName = (id) => teachers.find((t) => t.id === id)?.name || '—'

  const closeDetail = () => {
    setActiveClassId(null)
    setEditing(false)
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Classes"
        subtitle="Create classes and manage rosters"
        action={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <PlusIcon className="h-4 w-4" /> New class
          </Button>
        }
      />

      {loading ? (
        <SkeletonList rows={3} />
      ) : classes.length === 0 ? (
        <EmptyState
          icon={<BookIcon className="h-6 w-6" />}
          title="No classes yet"
          description="Create your first class to start assigning teachers and students."
          action={
            <Button size="sm" onClick={() => setShowCreate(true)}>
              Create class
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {classes.map((c) => (
            <Card
              key={c.id}
              className="cursor-pointer transition-shadow hover:shadow-card-lg"
              onClick={() => setActiveClassId(c.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{c.name}</p>
                  <p className="mt-0.5 text-sm text-slate-500">Teacher: {teacherName(c.teacherId)}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <BookIcon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <UsersIcon className="h-3.5 w-3.5" />
                {c.studentIds?.length || 0} students
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New class">
        <CreateClassForm onCreated={() => setShowCreate(false)} />
      </Modal>

      <Modal open={!!activeClass} onClose={closeDetail} title={editing ? 'Edit class' : activeClass?.name}>
        {activeClass && editing && (
          <EditClassForm
            classId={activeClass.id}
            initialName={activeClass.name}
            initialTeacherId={activeClass.teacherId}
            onSaved={() => setEditing(false)}
          />
        )}
        {activeClass && !editing && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Teacher: {teacherName(activeClass.teacherId)}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => setDeleting(true)} aria-label="Delete class">
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <AddStudentToClass classId={activeClass.id} />
            <ClassRoster classId={activeClass.id} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        title="Delete class?"
        description={`This permanently deletes "${activeClass?.name}". Students in it will become unassigned (not deleted) and can be added to another class.`}
        onConfirm={async () => {
          await deleteClass(activeClass.id)
          setDeleting(false)
          closeDetail()
        }}
      />
    </div>
  )
}
