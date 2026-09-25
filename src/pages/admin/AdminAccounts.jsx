import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import CreateAccountForm from '../../features/auth/CreateAccountForm'
import UserList from '../../features/auth/UserList'
import { PlusIcon } from '../../components/icons'

export default function AdminAccounts() {
  const [showCreate, setShowCreate] = useState(false)
  const [tab, setTab] = useState('student')

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Accounts"
        subtitle="Manage student and teacher logins"
        action={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <PlusIcon className="h-4 w-4" /> New account
          </Button>
        }
      />

      <div className="mb-4 inline-flex rounded-xl border border-slate-200 bg-white p-1">
        {['student', 'teacher'].map((r) => (
          <button
            key={r}
            onClick={() => setTab(r)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              tab === r ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {r}s
          </button>
        ))}
      </div>

      <UserList role={tab} />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New account">
        <CreateAccountForm />
      </Modal>
    </div>
  )
}
