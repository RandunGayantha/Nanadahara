import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import TextbeeSettingsForm from '../../features/settings/TextbeeSettingsForm'

export default function AdminSettings() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Settings" subtitle="Configure app-wide integrations" />
      <Card>
        <TextbeeSettingsForm />
      </Card>
    </div>
  )
}
