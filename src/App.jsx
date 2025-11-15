import { Navigate, Route, Routes } from 'react-router-dom'
import Certificates from './views/Certificates'
import Home from './views/Home'
import Issue from './views/Issue'
import Retrieve from './views/Retrieve'

import Recruiter from './views/Recruiter'
import Interview from './views/Interviewer'


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/certificates" element={<Certificates />} />
      <Route path="/admin/issue-certificate" element={<Issue />} />
      <Route path="/admin/retrieve-certificate" element={<Retrieve />} />
      <Route path="/recruiter" element={<Recruiter />} />
      <Route path="/interviewer" element={<Interview />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
