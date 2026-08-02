import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function ProtectedRoute({ children }) {
  const { isAuthenticated, initialized } = useAuth()

  // Haven't heard back from GET /me yet -- don't redirect prematurely.
  if (!initialized) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute

// agr login nhi hua to login pr switch ho jayega page
