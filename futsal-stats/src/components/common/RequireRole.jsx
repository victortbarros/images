import { Navigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

// Bloqueia rotas conforme o papel do usuário no time atual.
// `allow` é uma função (role) => boolean (ver utils/permissions.js)
export function RequireRole({ allow, children }) {
  const { userRole, dataLoading } = useApp()
  if (dataLoading) return null
  if (!allow(userRole)) return <Navigate to="/" replace />
  return children
}
