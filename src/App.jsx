import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { PageSpinner } from './components/ui/Spinner'
import AppShell from './layouts/AppShell'
import LoginPage from './pages/LoginPage'

import { HomeIcon, BookIcon, ClipboardIcon, CalendarIcon, CardIcon, UsersIcon, KeyIcon, SettingsIcon } from './components/icons'

import AdminOverview from './pages/admin/AdminOverview'
import AdminClasses from './pages/admin/AdminClasses'
import AdminAccounts from './pages/admin/AdminAccounts'
import AdminLogins from './pages/admin/AdminLogins'
import AdminFees from './pages/admin/AdminFees'
import AdminSettings from './pages/admin/AdminSettings'

import TeacherOverview from './pages/teacher/TeacherOverview'
import TeacherMaterials from './pages/teacher/TeacherMaterials'
import TeacherMarks from './pages/teacher/TeacherMarks'
import TeacherAttendance from './pages/teacher/TeacherAttendance'
import TeacherFees from './pages/teacher/TeacherFees'

import StudentOverview from './pages/student/StudentOverview'
import StudentMaterials from './pages/student/StudentMaterials'
import StudentMarks from './pages/student/StudentMarks'
import StudentAttendance from './pages/student/StudentAttendance'
import StudentFees from './pages/student/StudentFees'

const adminNav = [
  { to: '/admin', end: true, label: 'Home', icon: HomeIcon },
  { to: '/admin/classes', label: 'Classes', icon: BookIcon },
  { to: '/admin/accounts', label: 'Accounts', icon: UsersIcon },
  { to: '/admin/logins', label: 'Logins', icon: KeyIcon },
  { to: '/admin/fees', label: 'Fees', icon: CardIcon },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
]

const teacherNav = [
  { to: '/teacher', end: true, label: 'Home', icon: HomeIcon },
  { to: '/teacher/materials', label: 'Materials', icon: BookIcon },
  { to: '/teacher/marks', label: 'Marks', icon: ClipboardIcon },
  { to: '/teacher/attendance', label: 'Attendance', icon: CalendarIcon },
  { to: '/teacher/fees', label: 'Fees', icon: CardIcon },
]

const studentNav = [
  { to: '/student', end: true, label: 'Home', icon: HomeIcon },
  { to: '/student/materials', label: 'Materials', icon: BookIcon },
  { to: '/student/marks', label: 'Marks', icon: ClipboardIcon },
  { to: '/student/attendance', label: 'Attendance', icon: CalendarIcon },
  { to: '/student/fees', label: 'Fees', icon: CardIcon },
]

function RootRedirect() {
  const { user, profile, loading } = useAuth()
  if (loading) return <PageSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <PageSpinner />
  return <Navigate to={`/${profile.role}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AppShell navItems={adminNav} title="Admin" />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="classes" element={<AdminClasses />} />
            <Route path="accounts" element={<AdminAccounts />} />
            <Route path="logins" element={<AdminLogins />} />
            <Route path="fees" element={<AdminFees />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route
            path="/teacher"
            element={
              <ProtectedRoute role="teacher">
                <AppShell navItems={teacherNav} title="Teacher" />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherOverview />} />
            <Route path="materials" element={<TeacherMaterials />} />
            <Route path="marks" element={<TeacherMarks />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="fees" element={<TeacherFees />} />
          </Route>

          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <AppShell navItems={studentNav} title="Student" />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentOverview />} />
            <Route path="materials" element={<StudentMaterials />} />
            <Route path="marks" element={<StudentMarks />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="fees" element={<StudentFees />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
