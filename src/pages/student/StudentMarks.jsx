import { useAuth } from '../../context/AuthContext'
import { useStudentMarks } from '../../features/marks/useMarks'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import MarksChart from '../../features/marks/MarksChart'
import MarksTable from '../../features/marks/MarksTable'

export default function StudentMarks() {
  const { profile } = useAuth()
  const { marks, loading } = useStudentMarks(profile?.id)

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div>
        <PageHeader title="My marks" subtitle="Performance across exams" />
        <Card>
          <MarksChart marks={marks} />
        </Card>
      </div>
      <MarksTable marks={marks} loading={loading} />
    </div>
  )
}
