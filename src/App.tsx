import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { useAuthSession } from './features/auth/hooks/useAuthSession'
import { AdminPage } from './features/admin/pages/AdminPage'
import { ClassesPage } from './features/classes/pages/ClassesPage'
import { HomePage } from './features/home/pages/HomePage'
import { LessonsPage } from './features/lessons/pages/LessonsPage'
import { LessonDetailPage } from './features/lessons/pages/LessonDetailPage'
import { LessonPlansPage } from './features/lesson-plans/pages/LessonPlansPage'
import { LoginPage } from './features/auth/pages/LoginPage'
import './App.css'

function App() {
  const { session, profile, isLoading, profileError } = useAuthSession()

  return (
    <BrowserRouter>
      <AppRoutes session={session} profile={profile} isLoading={isLoading} profileError={profileError} />
    </BrowserRouter>
  )
}

function AppRoutes({ session, profile, isLoading, profileError }: {
  session: ReturnType<typeof useAuthSession>['session']
  profile: ReturnType<typeof useAuthSession>['profile']
  isLoading: boolean
  profileError: string
}) {
  const location = useLocation()
  if (location.pathname === '/login') return <LoginPage />

  return <AppLayout session={session} profile={profile} authLoading={isLoading} profileError={profileError}>
    <Routes>
          <Route path="/" element={<HomePage session={session} />} />
          <Route path="/lessons" element={<LessonsPage session={session} />} />
          <Route path="/lessons/:lessonId" element={<LessonDetailPage session={session} />} />
          <Route path="/classes" element={<ClassesPage session={session} />} />
          <Route path="/lesson-plans" element={<LessonPlansPage session={session} />} />
          <Route path="/admin" element={<AdminPage profile={profile} session={session} />} />
          <Route path="*" element={<HomePage session={session} />} />
    </Routes>
  </AppLayout>
}

export default App
