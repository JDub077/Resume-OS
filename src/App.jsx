import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ExperienceInput from './pages/ExperienceInput.jsx'
import ExperienceLibrary from './pages/ExperienceLibrary.jsx'
import MaterialGenerate from './pages/MaterialGenerate.jsx'
import TemplateCommunity from './pages/TemplateCommunity.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="input" element={<ExperienceInput />} />
        <Route path="input/:id" element={<ExperienceInput />} />
        <Route path="library" element={<ExperienceLibrary />} />
        <Route path="generate" element={<MaterialGenerate />} />
        <Route path="templates" element={<TemplateCommunity />} />
      </Route>
    </Routes>
  )
}

export default App
