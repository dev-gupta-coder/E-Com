import { Routes, Route } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ProtectedRoute from '../components/ProtectedRoute'

// Step 17 (BUILD-STEPS.md): remaining real routes get wired in here as each page is built

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8">Home — build me in Step 13</div>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <div className="p-8">Account page placeholder — build me in a later step</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default AppRoutes
