import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import { fetchCurrentUser } from './features/auth/authSlice'

function App() {
  const dispatch = useDispatch()
  const location = useLocation()

  // Tokens live in httpOnly cookies -- Redux has no way to know if the user
  // is already logged in without asking the server, so this runs once on load.
  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Keyed by pathname so navigating away from a crashed route mounts a
          fresh boundary (hasError: false) instead of staying stuck on the
          fallback -- error boundary state doesn't reset on its own. */}
      <ErrorBoundary key={location.pathname}>
        <AppRoutes />
      </ErrorBoundary>
    </div>
  )
}

export default App
