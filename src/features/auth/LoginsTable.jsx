import { useState } from 'react'
import { useAdminCredentials } from './useAdminCredentials'
import { resetPassword as resetPasswordApi } from '../../lib/api'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'
import Alert from '../../components/ui/Alert'
import { CopyIcon, CheckIcon, KeyIcon, UsersIcon } from '../../components/icons'

export default function LoginsTable() {
  const { rows, loading } = useAdminCredentials()
  const [copiedId, setCopiedId] = useState('')
  const [resettingId, setResettingId] = useState('')
  const [error, setError] = useState('')

  const copy = (row) => {
    navigator.clipboard.writeText(`Username: ${row.username}\nPassword: ${row.password}`)
    setCopiedId(row.id)
    setTimeout(() => setCopiedId(''), 1500)
  }

  const resetPassword = async (row) => {
    setError('')
    setResettingId(row.id)
    try {
      await resetPasswordApi(row.id)
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setResettingId('')
    }
  }

  if (loading) return <SkeletonList rows={4} />
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<UsersIcon className="h-6 w-6" />}
        title="No accounts yet"
        description="Accounts you create will show up here with their login credentials."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Alert tone="error">{error}</Alert>
      {/* Mobile: cards */}
      <div className="flex flex-col gap-3 sm:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900">{row.name}</p>
              <Badge tone={row.role === 'teacher' ? 'brand' : 'neutral'}>{row.role}</Badge>
            </div>
            <p className="mt-2 font-mono text-sm text-slate-600">{row.username}</p>
            <p className="font-mono text-sm text-slate-600">{row.password}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => copy(row)}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 active:bg-slate-100"
              >
                {copiedId === row.id ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                {copiedId === row.id ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={() => resetPassword(row)}
                disabled={resettingId === row.id}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 active:bg-slate-100 disabled:opacity-50"
              >
                <KeyIcon className="h-4 w-4" />
                {resettingId === row.id ? 'Resetting…' : 'Reset'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Password</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
                <td className="px-4 py-3">
                  <Badge tone={row.role === 'teacher' ? 'brand' : 'neutral'}>{row.role}</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-slate-600">{row.username}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{row.password}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => copy(row)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      title="Copy credentials"
                    >
                      {copiedId === row.id ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => resetPassword(row)}
                      disabled={resettingId === row.id}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                      title="Reset password"
                    >
                      <KeyIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
