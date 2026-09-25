import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTeacherClasses } from '../../features/classes/useClasses'
import { useClassMaterials } from '../../features/materials/useMaterials'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import EmptyState from '../../components/ui/EmptyState'
import UploadMaterialForm from '../../features/materials/UploadMaterialForm'
import MaterialsList from '../../features/materials/MaterialsList'
import { BookIcon } from '../../components/icons'

export default function TeacherMaterials() {
  const { profile } = useAuth()
  const { classes, loading: loadingClasses } = useTeacherClasses(profile?.id)
  const subjects = profile?.subjects || []
  const [filterClassId, setFilterClassId] = useState('')
  const activeClassId = filterClassId || classes[0]?.id || ''
  const { materials, loading } = useClassMaterials(activeClassId)

  if (!loadingClasses && classes.length === 0) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Materials" />
        <EmptyState icon={<BookIcon className="h-6 w-6" />} title="No classes assigned" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div>
        <PageHeader title="Upload material" subtitle="Share notes or papers with your class" />
        <Card className="max-w-xl">
          <UploadMaterialForm classes={classes} subjects={subjects} />
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-800">Uploaded materials</h2>
          <div className="w-44">
            <Select value={activeClassId} onChange={(e) => setFilterClassId(e.target.value)}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <MaterialsList materials={materials} loading={loading} />
      </div>
    </div>
  )
}
