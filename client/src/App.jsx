import AppRoutes from './routes/AppRoutes'
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AppRoutes />
    </div>
  )
}

export default App
