import { useSelector } from 'react-redux'

export function useAuth() {
  const { user, status, error, initialized } = useSelector((state) => state.auth)

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    status,
    error,
    initialized,
  }
}
