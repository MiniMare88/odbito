import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext.jsx'
import AuthPanel from './AuthPanel.jsx'

const PONUDBA_ITEMS = [
  { to: '/vadbe',           label: 'URNIK TRENINGOV' },
  { to: '/rezervacija',     label: 'URNIK OPEN JUMP' },
  { to: '/darilne-kartice', label: 'BONI' },
  { to: null,               label: 'ŠOLE IN PODJETJA', soon: true },
]

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [ponudbaOpen, setPonudbaOpen] = useState(false)   // desktop dropdown
  const [ponudbaMobOpen, setPonudbaMobOpen] = useState(false) // mobile expand
  const dropdownRef = useRef(null)

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'sl' ? 'en' : 'sl')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setPonudbaOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close dropdown on route change
  useEffect(() => { setPonudbaOpen(false); setPonudbaMobOpen(false) }, [location])

  const ponudbaActive = PONUDBA_ITEMS.some(i => i.to && location.pathname.startsWith(i.to))

  const navLinks = [
    { to: '/',       label: 'DOMOV' },
    { to: '/o-nas',  label: 'O NAS' },
    { to: '/cenik',  label: 'CENIK' },
    // PONUDBA handled separately
    { to: '/kontakt', label: 'KONTAKT' },
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
            {/* DOMOV, O NAS, CENIK */}
            {navLinks.slice(0, 3).map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-accent ${isActive ? 'text-accent' : 'text-white/70'}`
                }>
                {label}
              </NavLink>
            ))}

            {/* PONUDBA dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setPonudbaOpen(v => !v)}
                className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-accent"
                style={{ color: ponudbaActive || ponudbaOpen ? 'var(--accent)' : 'rgba(255,255,255,0.7)' }}>
                PONUDBA
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transition: 'transform 0.2s', transform: ponudbaOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {ponudbaOpen && (
                <div className="absolute top-full left-0 mt-2 py-1 rounded-xl z-50"
                  style={{ background: '#131518', border: '1px solid var(--border)', minWidth: 210, boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
                  {PONUDBA_ITEMS.map(item => (
                    item.soon ? (
                      <div key={item.label} className="flex items-center justify-between px-4 py-2.5 cursor-default">
                        <span className="font-condensed font-black text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.label}</span>
                        <span className="font-condensed font-bold text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(250,177,32,0.1)', color: 'var(--accent)', fontSize: 9, letterSpacing: '0.1em' }}>KMALU</span>
                      </div>
                    ) : (
                      <Link key={item.to} to={item.to} onClick={() => setPonudbaOpen(false)}
                        className="flex items-center px-4 py-2.5 transition-colors hover:bg-white/5"
                        style={{ textDecoration: 'none' }}>
                        <span className="font-condensed font-black text-xs tracking-widest uppercase"
                          style={{ color: location.pathname === item.to ? 'var(--accent)' : 'rgba(255,255,255,0.75)' }}>
                          {item.label}
                        </span>
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* KONTAKT */}
            {navLinks.slice(3).map(({ to, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-accent ${isActive ? 'text-accent' : 'text-white/70'}`
                }>
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
          <button className="md:hidden text-white p-2 flex items-center justify-center" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"
            style={{ width: 36, height: 36 }}>
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <line x1="3" y1="3" x2="17" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="17" y1="3" x2="3" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                <line x1="0" y1="1" x2="22" y2="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="0" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="0" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden" style={{
            background: '#16181C',
            borderTop: '1px solid rgba(250,177,32,0.2)',
            borderBottom: '3px solid var(--accent)',
            padding: '20px 0 24px',
          }}>

            {/* Nav links — brez bubbles, večji tekst */}
            <div className="flex flex-col gap-1">
              {navLinks.slice(0, 3).map(({ to, label }) => (
                <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}
                  style={({ isActive }) => ({
                    textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    color: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.85)',
                    fontFamily: 'Bebas Neue, sans-serif',
                    fontSize: 28, letterSpacing: '0.06em',
                  })}>
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />}
                    </>
                  )}
                </NavLink>
              ))}

              {/* PONUDBA — expandable row */}
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => setPonudbaMobOpen(v => !v)}
                  className="w-full flex items-center justify-between"
                  style={{
                    padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, letterSpacing: '0.06em',
                    color: ponudbaActive || ponudbaMobOpen ? 'var(--accent)' : 'rgba(255,255,255,0.85)',
                  }}>
                  PONUDBA
                  <svg width="14" height="8" viewBox="0 0 14 8" fill="none"
                    style={{ transition: 'transform 0.2s', transform: ponudbaMobOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                    <path d="M1 1l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {ponudbaMobOpen && (
                  <div className="flex flex-col gap-0 pb-2" style={{ paddingLeft: 16, borderLeft: '2px solid var(--accent)' }}>
                    {PONUDBA_ITEMS.map(item => (
                      item.soon ? (
                        <div key={item.label} className="flex items-center gap-3 py-2">
                          <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
                            {item.label}
                          </span>
                          <span style={{ fontSize: 9, background: 'rgba(250,177,32,0.12)', color: 'var(--accent)', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.12em', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}>KMALU</span>
                        </div>
                      ) : (
                        <Link key={item.to} to={item.to}
                          onClick={() => { setMenuOpen(false); setPonudbaMobOpen(false) }}
                          style={{
                            textDecoration: 'none', padding: '8px 0',
                            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
                            fontSize: 15, letterSpacing: '0.12em', textTransform: 'uppercase',
                            color: location.pathname === item.to ? 'var(--accent)' : 'rgba(255,255,255,0.7)',
                          }}>
                          {item.label}
                        </Link>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* KONTAKT */}
              {navLinks.slice(3).map(({ to, label }) => (
                <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
                  style={({ isActive }) => ({
                    textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    color: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.85)',
                    fontFamily: 'Bebas Neue, sans-serif',
                    fontSize: 28, letterSpacing: '0.06em',
                  })}>
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Auth row */}
            <div className="flex items-center gap-3 pt-5 flex-wrap">
              {user ? (
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/osobje' : '/dashboard'}
                    onClick={() => setMenuOpen(false)}
                    style={{ textDecoration: 'none', background: 'var(--accent)', color: '#000', padding: '8px 18px', borderRadius: 8, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    👤 MOJ PROFIL
                  </Link>
                  <button onClick={handleLogout} style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/prijava" onClick={() => setMenuOpen(false)}
                    style={{ textDecoration: 'none', background: 'var(--accent)', color: '#000', padding: '8px 18px', borderRadius: 8, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    PRIJAVI SE
                  </Link>
                  <Link to="/registracija" onClick={() => setMenuOpen(false)}
                    style={{ textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', padding: '8px 18px', borderRadius: 8, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    REGISTRIRAJ SE
                  </Link>
                </>
              )}
              <button onClick={toggleLang} style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '5px 8px', background: 'none', cursor: 'pointer', marginLeft: 'auto' }}>
                {i18n.language === 'sl' ? 'EN' : 'SLO'}
              </button>
            </div>

          </div>
        )}
      </div>
    </nav>
  )
}
