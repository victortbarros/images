import { RouterProvider } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { router } from './router/routes'
import { Login } from './pages/Login'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Carregando...</div>
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
