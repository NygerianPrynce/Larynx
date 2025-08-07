import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Onboarding from './pages/Onboarding'
import SettingsPage from './pages/SettingsPage'
import InventoryPage from './pages/InventoryPage'
import InventoryStandalone from './pages/InventoryStandalone'
import Home from './pages/Home'
import AnalyticsPage from './pages/AnalyticsPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import { Error404, Error500, Error403 } from './pages/ErrorPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding/*" element={<Onboarding />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/manage-inventory" element={<InventoryStandalone />} />
      <Route path="/home" element={<Home />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      
      {/* Error Pages */}
      <Route path="/error/500" element={<Error500 />} />
      <Route path="/error/403" element={<Error403 />} />
      
      {/* 404 - Must be last route */}
      <Route path="*" element={<Error404 />} />
    </Routes>
  )
}

export default App