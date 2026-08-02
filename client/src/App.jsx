import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import AppRoutes from './routes/AppRoutes'
import Navbar from './components/Navbar'
import { fetchCurrentUser } from './features/auth/authSlice'

function App() {
  const dispatch = useDispatch()

  // Tokens live in httpOnly cookies -- Redux has no way to know if the user
  // is already logged in without asking the server, so this runs once on load.
  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AppRoutes />
    </div>
  )
}

export default App
