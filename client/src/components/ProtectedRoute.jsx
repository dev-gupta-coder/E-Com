import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, initialized } = useAuth()

  // Haven't heard back from GET /me yet -- don't redirect prematurely.
  if (!initialized) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute

// agr login nhi hua to login pr switch ho jayega page
