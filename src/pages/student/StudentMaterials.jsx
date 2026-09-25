import { useAuth } from '../../context/AuthContext'
import { useClassMaterials } from '../../features/materials/useMaterials'
import PageHeader from '../../components/ui/PageHeader'
import MaterialsList from '../../features/materials/MaterialsList'

export default function StudentMaterials() {
  const { profile } = useAuth()
  const { materials, loading } = useClassMaterials(profile?.classId)

  return (
    <div className="animate-fade-in">
      <PageHeader title="Materials" subtitle="Notes and papers for your class" />
      <MaterialsList materials={materials} loading={loading} />
    </div>
  )
}
