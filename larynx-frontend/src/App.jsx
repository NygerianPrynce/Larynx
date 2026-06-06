import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Onboarding from './pages/Onboarding'
import HomeModern from './pages/HomeModern'
import OfferingsModern from './pages/OfferingsModern'
import AnalyticsModern from './pages/AnalyticsModern'
import SettingsDashboardClean from './pages/SettingsDashboardClean'
import Outreach from './pages/Outreach'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import { Error404, Error500, Error403 } from './pages/ErrorPage'
import AuthGuard from './components/AuthGuard'

function App() {
  return (
    <AuthGuard>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* App */}
        <Route path="/onboarding/*" element={<Onboarding />} />
        <Route path="/home" element={<HomeModern />} />
        <Route path="/manage-inventory" element={<OfferingsModern />} />
        <Route path="/analytics" element={<AnalyticsModern />} />
        <Route path="/settings" element={<SettingsDashboardClean />} />
        <Route path="/outreach" element={<Outreach />} />

        {/* Errors */}
        <Route path="/error/500" element={<Error500 />} />
        <Route path="/error/403" element={<Error403 />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </AuthGuard>
  )
}

export default App
