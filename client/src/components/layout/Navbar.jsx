import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext.jsx'
import AuthPanel from './AuthPanel.jsx'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'sl' ? 'en' : 'sl')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/o-nas', label: t('nav.about') },
    { to: '/cenik', label: t('nav.pricing') },
    { to: '/vadbe', label: t('nav.classes') },
    { to: '/kontakt', label: t('nav.contact') },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-black border-b border-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="font-display text-3xl tracking-widest" style={{ textDecoration: 'none' }}>
            <span style={{ color: 'var(--accent)' }}>ODBIT</span><span style={{ color: 'var(--white)' }}>O</span><span style={{ color: 'var(--accent)' }}>.</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-accent ${isActive ? 'text-accent' : 'text-white/70'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right side — desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="text-xs font-semibold border border-white/20 rounded px-2 py-1 hover:border-accent hover:text-accent transition-colors"
            >
              {i18n.language === 'sl' ? 'EN' : 'SLO'}
            </button>

            {user ? (
              /* Logged in */
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm text-white/70 hover:text-accent transition-colors">Admin</Link>
                )}
                {(user.role === 'staff' || user.role === 'admin') && (
                  <Link to="/osobje" className="text-sm text-white/70 hover:text-accent transition-colors">
                    {t('staff.title')}
                  </Link>
                )}
                {user.role === 'customer' && (
                  <Link to="/dashboard" className="text-sm text-white/70 hover:text-accent transition-colors">
                    {t('nav.dashboard')}
                  </Link>
                )}

                {/* User pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(250,177,32,0.1)', border: '1px solid rgba(250,177,32,0.2)' }}>
                  <span style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: 700 }}>
                    {user.first_name}
                  </span>
                </div>

                <button onClick={handleLogout} className="text-sm text-white/50 hover:text-white transition-colors">
                  {t('nav.logout')}
                </button>

                {user.role === 'customer' && (
                  <Link to="/rezervacija"
                    className="bg-accent text-black font-semibold text-sm px-4 py-2 rounded hover:bg-accent/90 transition-colors">
                    {t('nav.book')}
                  </Link>
                )}
              </>
            ) : (
              /* Not logged in — Moj profil button */
              <div className="relative">
                <button
                  onClick={() => setAuthOpen(v => !v)}
                  className="flex items-center gap-2 font-semibold text-sm px-4 py-2 rounded transition-all"
                  style={{
                    background: authOpen ? 'var(--accent)' : 'transparent',
                    color: authOpen ? '#000' : 'var(--white)',
                    border: '1px solid',
                    borderColor: authOpen ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                  }}
                >
                  <span>👤</span>
                  MOJ PROFIL
                  <span style={{ fontSize: '10px' }}>{authOpen ? '▲' : '▾'}</span>
                </button>

                {authOpen && <AuthPanel onClose={() => setAuthOpen(false)} />}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current" />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 flex flex-col gap-4">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `text-base font-medium ${isActive ? 'text-accent' : 'text-white/70'}`}>
                {label}
              </NavLink>
            ))}
            <div className="flex items-center gap-3 pt-2 border-t border-white/10 flex-wrap">
              <button onClick={toggleLang} className="text-xs border border-white/20 rounded px-2 py-1">
                {i18n.language === 'sl' ? 'EN' : 'SLO'}
              </button>
              {user ? (
                <>
                  <Link to={user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/osobje' : '/dashboard'}
                    onClick={() => setMenuOpen(false)} className="text-sm text-white/70">
                    {t('nav.dashboard')}
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-white/50">{t('nav.logout')}</button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); setAuthOpen(true) }}
                    className="bg-accent text-black font-semibold text-sm px-4 py-2 rounded">
                    MOJ PROFIL
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
