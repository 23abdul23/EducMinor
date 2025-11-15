import { Navigate, Route, Routes } from 'react-router-dom'
import Certificates from './views/Certificates'
import Home from './views/Home'
import Issue from './views/Issue'
import Retrieve from './views/Retrieve'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/certificates" element={<Certificates />} />
      <Route path="/admin/issue-certificate" element={<Issue />} />
      <Route path="/admin/retrieve-certificate" element={<Retrieve />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
