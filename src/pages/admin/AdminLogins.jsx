import PageHeader from '../../components/ui/PageHeader'
import LoginsTable from '../../features/auth/LoginsTable'

export default function AdminLogins() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="All logins" subtitle="Usernames and passwords for every account you've created" />
      <LoginsTable />
    </div>
  )
}
