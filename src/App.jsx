import { Navigate, Route, Routes } from 'react-router-dom'
import Control from './pages/Control'
import Display from './pages/Display'

function App() {
  return (
    <Routes>
      <Route path="/control" element={<Control />} />
      <Route path="/display" element={<Display />} />
      <Route path="*" element={<Navigate to="/control" replace />} />
    </Routes>
  )
}

export default App
