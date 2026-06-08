import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import PasswordGate from './components/layout/PasswordGate.jsx'

// Public pages
import Home from './pages/public/Home.jsx'
import About from './pages/public/About.jsx'
import Pricing from './pages/public/Pricing.jsx'
import Classes from './pages/public/Classes.jsx'
import Contact from './pages/public/Contact.jsx'
import Waiver from './pages/public/Waiver.jsx'
import DarilneKartice from './pages/public/DarilneKartice.jsx'
import PoletneKonitnice from './pages/public/PoletneKonitnice.jsx'

// Kiosk
import KioskRegister from './pages/kiosk/KioskRegister.jsx'

// Legal pages
import VarovanjeZasebnosti from './pages/legal/VarovanjeZasebnosti.jsx'
import PogojiUporabe from './pages/legal/PogojiUporabe.jsx'
import PolitikaPiskotkov from './pages/legal/PolitikaPiskotkov.jsx'
import ObvestiloVideonadzor from './pages/legal/ObvestiloVideonadzor.jsx'
import PogojiNagradnihIger from './pages/legal/PogojiNagradnihIger.jsx'

// Auth pages
import Register from './pages/auth/Register.jsx'
import Login from './pages/auth/Login.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import ResetPassword from './pages/auth/ResetPassword.jsx'
import VerifyEmail from './pages/auth/VerifyEmail.jsx'

// Protected pages (lazy)
const CustomerDashboard = React.lazy(() => import('./pages/dashboard/CustomerDashboard.jsx'))
const BookingFlow = React.lazy(() => import('./pages/rezervacija/BookingFlow.jsx'))
const BirthdayBookingFlow = React.lazy(() => import('./pages/rezervacija/BirthdayBookingFlow.jsx'))
const ClassSubscriptionFlow = React.lazy(() => import('./pages/rezervacija/ClassSubscriptionFlow.jsx'))
const StaffPortal = React.lazy(() => import('./pages/staff/StaffPortal.jsx'))
const AdminPanel = React.lazy(() => import('./pages/admin/AdminPanel.jsx'))

function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <PasswordGate>
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black text-accent font-display text-4xl">ODBITO</div>}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<AppLayout><Home /></AppLayout>} />
            <Route path="/o-nas" element={<AppLayout><About /></AppLayout>} />
            <Route path="/cenik" element={<AppLayout><Pricing /></AppLayout>} />
            <Route path="/vadbe" element={<AppLayout><Classes /></AppLayout>} />
            <Route path="/kontakt" element={<AppLayout><Contact /></AppLayout>} />
            <Route path="/izjava" element={<AppLayout><Waiver /></AppLayout>} />
            <Route path="/darilne-kartice" element={<AppLayout><DarilneKartice /></AppLayout>} />
            <Route path="/poletne-pocitnice" element={<AppLayout><PoletneKonitnice /></AppLayout>} />

            {/* Auth */}
            <Route path="/registracija" element={<AppLayout><Register /></AppLayout>} />
            <Route path="/prijava" element={<AppLayout><Login /></AppLayout>} />
            <Route path="/pozabljeno-geslo" element={<AppLayout><ForgotPassword /></AppLayout>} />
            <Route path="/novo-geslo" element={<AppLayout><ResetPassword /></AppLayout>} />
            <Route path="/potrdi-email" element={<AppLayout><VerifyEmail /></AppLayout>} />

            {/* Customer protected */}
            <Route path="/dashboard/*" element={
              <ProtectedRoute roles={['customer', 'admin', 'staff']}>
                <AppLayout><CustomerDashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/rezervacija" element={
              <AppLayout><BookingFlow /></AppLayout>
            } />
            <Route path="/rojstni-dan" element={
              <AppLayout><BirthdayBookingFlow /></AppLayout>
            } />
            <Route path="/vadbe/prijava/:classTypeId" element={
              <ProtectedRoute roles={['customer']}>
                <AppLayout><ClassSubscriptionFlow /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Staff */}
            <Route path="/osobje/*" element={
              <ProtectedRoute roles={['staff', 'admin']}>
                <StaffPortal />
              </ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin/*" element={
              <ProtectedRoute roles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            } />

            {/* Legal */}
            <Route path="/zasebnost" element={<VarovanjeZasebnosti />} />
            <Route path="/pogoji-uporabe" element={<PogojiUporabe />} />
            <Route path="/piskotki" element={<PolitikaPiskotkov />} />
            <Route path="/videonadzor" element={<ObvestiloVideonadzor />} />
            <Route path="/nagradne-igre" element={<PogojiNagradnihIger />} />

            {/* Kiosk — hidden, no navbar/footer */}
            <Route path="/kiosk/register" element={<KioskRegister />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
    </PasswordGate>
  )
}
