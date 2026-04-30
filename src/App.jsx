import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import AddLead from './pages/AddLeads'
import LeadDetail from './pages/LeadDetail'
import Revival from './pages/Revival'
import EditLead from './pages/EditLead'


function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/add-lead" element={<AddLead />} />
          <Route path="/leads/:id" element={<LeadDetail />} />
          <Route path="/revival" element={<Revival />} />
          <Route path="/leads/:id/edit" element={<EditLead />} />

        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App