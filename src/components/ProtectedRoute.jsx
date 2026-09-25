import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageSpinner } from './ui/Spinner'

export default function ProtectedRoute({ role, children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <PageSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <PageSpinner />
  if (role && profile.role !== role) return <Navigate to={`/${profile.role}`} replace />

  return children
}
