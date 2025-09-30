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
import AuthGuard from './components/AuthGuard'
import TailwindTest from './components/TailwindTest'
import ShadcnTest from './components/ShadcnTest'
import FramerTest from './components/FramerTest'
import SettingsPageModern from './pages/SettingsPageModern'
import SettingsDashboard from './pages/SettingsDashboard'
import SettingsDashboardClean from './pages/SettingsDashboardClean'
import HomeModern from './pages/HomeModern'
import OfferingsModern from './pages/OfferingsModern'
import AnalyticsModern from './pages/AnalyticsModern'
import LoginPageModern from './pages/LoginPageModern'
import LandingPage from './pages/LandingPage'
import LoadingScreenTest from './pages/LoadingScreenTest'
import ErrorPagesTest from './pages/ErrorPagesTest'
import SigEditorTest from './pages/SigEditorTest'
import OnboardingSigEditorTest from './pages/OnboardingSigEditorTest'
import OnboardingInventoryTest from './pages/OnboardingInventoryTest'

function App() {
  return (
    <AuthGuard>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LandingPage />} />
        <Route path="/onboarding/*" element={<Onboarding />} />
        <Route path="/settings" element={<SettingsDashboardClean />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/manage-inventory" element={<OfferingsModern />} />
        <Route path="/home" element={<HomeModern />} />
        <Route path="/analytics" element={<AnalyticsModern />} />
        <Route path="/tailwind-test" element={<TailwindTest />} />
        <Route path="/shadcn-test" element={<ShadcnTest />} />
        <Route path="/framer-test" element={<FramerTest />} />
        <Route path="/settings-modern" element={<SettingsPageModern />} />
        <Route path="/settings-dashboard" element={<SettingsDashboard />} />
        <Route path="/settings-clean" element={<SettingsDashboardClean />} />
        <Route path="/home-modern" element={<HomeModern />} />
        <Route path="/offerings-modern" element={<OfferingsModern />} />
        <Route path="/analytics-modern" element={<AnalyticsModern />} />
        <Route path="/login-modern" element={<LoginPageModern />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/loading-test" element={<LoadingScreenTest />} />
        <Route path="/error-test" element={<ErrorPagesTest />} />
        <Route path="/sig-editor-test" element={<SigEditorTest />} />
        <Route path="/onboarding-sig-editor-test" element={<OnboardingSigEditorTest />} />
        <Route path="/onboarding-inventory-test" element={<OnboardingInventoryTest />} />
        
        {/* Error Pages */}
        <Route path="/error/500" element={<Error500 />} />
        <Route path="/error/403" element={<Error403 />} />
        
        {/* 404 - Must be last route */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </AuthGuard>
  )
}

export default App