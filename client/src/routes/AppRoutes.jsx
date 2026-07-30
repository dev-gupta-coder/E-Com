import { Routes, Route } from 'react-router-dom'

// Step 17 (BUILD-STEPS.md): real routes get wired in here as each page is built

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8">Home — build me in Step 13</div>} />
    </Routes>
  )
}

export default AppRoutes
