import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import Navbar from '../../components/layout/Navbar.jsx'
import MojUrnik from './MojUrnik.jsx'

// ── Sub-components ──────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div className="card text-center py-5">
      <div className="font-display text-5xl mb-1 leading-none" style={{ color: color || 'var(--accent)' }}>{value}</div>
      <div className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>{label}</div>
    </div>
  )
}

function CheckInResult({ result, onDismiss }) {
  if (!result) return null
  const ok = result.success
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,10,14,0.92)', backdropFilter: 'blur(8px)' }}
      onClick={onDismiss}>
      <div className="rounded-2xl p-8 max-w-sm w-full text-center"
        style={{ background: 'var(--dark2)', border: `2px solid ${ok ? 'var(--green)' : '#FF3D00'}` }}
        onClick={e => e.stopPropagation()}>
        <div className="text-5xl mb-4">{ok ? '✓' : '✗'}</div>
        <div className="font-display text-3xl mb-3" style={{ color: ok ? 'var(--green)' : '#FF3D00', lineHeight: 1 }}>
          {ok ? 'CHECK-IN OK' : 'NAPAKA'}
        </div>
        <p className="font-condensed font-bold mb-2" style={{ color: 'var(--white)' }}>{result.message}</p>
        {ok && result.booking && (
          <div className="mt-4 text-left rounded-xl p-4" style={{ background: 'var(--dark3)' }}>
            {[
              ['Ura', `${result.booking.start_time} – ${result.booking.end_time}`],
              ['Udeleženci', result.booking.participants],
              ['Telefon', result.booking.user?.phone || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>{k}</span>
                <span className="font-condensed font-bold text-sm" style={{ color: 'var(--white)' }}>{v}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={onDismiss} className="btn-primary mt-6 w-full">NAPREJ</button>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────

export default function StaffPortal() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('checkin')
  const [stats, setStats] = useState(null)
  const [ojBookings, setOjBookings] = useState([])
  const [classSessions, setClassSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [checkInResult, setCheckInResult] = useState(null)
  const inputRef = useRef(null)

  const today = new Date().toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    if (activeTab === 'openjump') loadOJ()
    if (activeTab === 'classes') loadClasses()
    if (activeTab === 'checkin') setTimeout(() => inputRef.current?.focus(), 100)
  }, [activeTab])

  async function loadStats() {
    try {
      const { data } = await api.get('/staff/stats')
      setStats(data)
    } catch {}
  }

  async function loadOJ() {
    setLoading(true)
    try {
      const { data } = await api.get('/staff/openjump/today')
      setOjBookings(data)
    } catch {} finally { setLoading(false) }
  }

  async function loadClasses() {
    setLoading(true)
    try {
      const { data } = await api.get('/staff/classes/today')
      setClassSessions(data)
    } catch {} finally { setLoading(false) }
  }

  async function handleCheckIn(e) {
    e.preventDefault()
    if (!code.trim()) return
    setScanning(true)
    try {
      const { data } = await api.post('/staff/openjump/checkin', { code: code.trim().toUpperCase() })
      setCheckInResult(data)
      setCode('')
      loadStats()
      if (activeTab === 'openjump') loadOJ()
    } catch (err) {
      setCheckInResult({ success: false, message: err.response?.data?.error || 'Rezervacija ni najdena' })
    } finally { setScanning(false) }
  }

  async function handleClassCheckIn(attendanceId) {
    try {
      const { data } = await api.post(`/staff/classes/checkin/${attendanceId}`)
      setCheckInResult(data)
      loadClasses()
    } catch (err) {
      setCheckInResult({ success: false, message: err.response?.data?.error || 'Napaka pri check-inu' })
    }
  }

  const [urnikUnread, setUrnikUnread] = useState(0)

  useEffect(() => {
    // Check for unread staff notifications
    api.get('/schedule/my/notifications').then(r => setUrnikUnread(r.data.unread)).catch(() => {})
  }, [])

  const tabs = [
    { key: 'checkin',  label: 'QR CHECK-IN' },
    { key: 'openjump', label: 'OPEN JUMP' },
    { key: 'classes',  label: 'VADBE' },
    { key: 'urnik',    label: 'MOJ URNIK', badge: urnikUnread },
  ]

  const ojChecked = ojBookings.filter(b => b.status === 'checked_in').length
  const ojPending = ojBookings.filter(b => b.status === 'confirmed').length

  return (
    <div className="min-h-screen" style={{ background: 'var(--black)' }}>
      <Navbar />

      {checkInResult && <CheckInResult result={checkInResult} onDismiss={() => setCheckInResult(null)} />}

      <div className="px-4 py-10 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="section-label mb-2">Osebje</div>
            <h1 className="font-display leading-none" style={{ fontSize: '52px', color: 'var(--white)' }}>
              STAFF<span style={{ color: 'var(--accent)' }}>.</span>
            </h1>
            <p className="font-condensed text-sm mt-1" style={{ color: 'var(--gray)' }}>{today}</p>
          </div>
          <div className="badge" style={{ '--badge-dot': 'var(--green)' }}>AKTIVEN</div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-3 mb-8">
            <StatCard label="Skupaj OJ" value={stats.ojTotal} />
            <StatCard label="Check-in" value={stats.ojCheckedIn} color="var(--green)" />
            <StatCard label="Čaka" value={stats.ojPending} color="var(--accent)" />
            <StatCard label="Vadbe" value={stats.classSessions} color="var(--accent3)" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto" style={{ background: 'var(--dark2)' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="relative flex-1 py-2.5 rounded-lg font-condensed font-bold text-xs tracking-widest uppercase transition-all whitespace-nowrap"
              style={{
                background: activeTab === t.key ? 'var(--accent)' : 'transparent',
                color: activeTab === t.key ? 'var(--black)' : 'var(--gray)',
              }}>
              {t.label}
              {t.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-condensed font-bold"
                  style={{ background: '#ef4444', color: '#fff', fontSize: '9px' }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── QR CHECK-IN TAB ── */}
        {activeTab === 'checkin' && (
          <div>
            <div className="card mb-6 text-center py-8">
              <div className="section-label justify-center mb-4">Vnesi ali skeniraj kodo</div>
              <form onSubmit={handleCheckIn} className="flex gap-3 max-w-md mx-auto">
                <input
                  ref={inputRef}
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXXXX ali UUID..."
                  className="flex-1 px-4 py-3 rounded-lg font-condensed font-bold text-lg tracking-widest outline-none"
                  style={{
                    background: 'var(--dark3)',
                    border: '1px solid var(--border)',
                    color: 'var(--accent)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  autoComplete="off"
                  autoCapitalize="characters"
                />
                <button type="submit" disabled={!code.trim() || scanning}
                  className="btn-primary px-6"
                  style={{ opacity: (!code.trim() || scanning) ? 0.5 : 1 }}>
                  {scanning ? '...' : '✓'}
                </button>
              </form>
              <p className="font-condensed text-xs tracking-widest mt-4" style={{ color: 'var(--gray)' }}>
                Vnesi rezervacijsko kodo ali polni UUID iz QR kode
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card text-center py-6" style={{ borderTop: '2px solid var(--green)' }}>
                <div className="font-display text-5xl leading-none mb-1" style={{ color: 'var(--green)' }}>
                  {stats?.ojCheckedIn ?? '—'}
                </div>
                <div className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>
                  Preverjenih danes
                </div>
              </div>
              <div className="card text-center py-6" style={{ borderTop: '2px solid var(--accent)' }}>
                <div className="font-display text-5xl leading-none mb-1" style={{ color: 'var(--accent)' }}>
                  {stats?.ojPending ?? '—'}
                </div>
                <div className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>
                  Čaka na check-in
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── OPEN JUMP TAB ── */}
        {activeTab === 'openjump' && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <span className="font-condensed text-sm tracking-widest animate-pulse" style={{ color: 'var(--gray)' }}>NALAGAM...</span>
              </div>
            ) : ojBookings.length === 0 ? (
              <div className="card text-center py-16">
                <p style={{ color: 'var(--gray)' }}>Ni rezervacij za danes.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Summary bar */}
                <div className="flex items-center gap-4 px-4 py-3 rounded-xl mb-2"
                  style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }}>
                  <span className="font-condensed text-sm font-bold tracking-wider" style={{ color: 'var(--gray)' }}>
                    Skupaj: <span style={{ color: 'var(--white)' }}>{ojBookings.length}</span>
                  </span>
                  <span className="font-condensed text-sm font-bold tracking-wider" style={{ color: 'var(--green)' }}>
                    ✓ {ojChecked}
                  </span>
                  <span className="font-condensed text-sm font-bold tracking-wider" style={{ color: 'var(--accent)' }}>
                    ⏳ {ojPending}
                  </span>
                </div>

                {ojBookings.map(b => {
                  const isIn = b.status === 'checked_in'
                  return (
                    <div key={b.id} className="card" style={{
                      borderLeft: `3px solid ${isIn ? 'var(--green)' : 'var(--accent)'}`,
                      opacity: isIn ? 0.7 : 1,
                    }}>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <div className="font-condensed font-black text-base uppercase tracking-wide mb-0.5" style={{ color: 'var(--white)' }}>
                            {b.user?.first_name} {b.user?.last_name}
                          </div>
                          <div className="font-display text-2xl leading-none" style={{ color: isIn ? 'var(--green)' : 'var(--accent)' }}>
                            {b.start_time?.slice(0,5)} – {b.end_time?.slice(0,5)}
                          </div>
                          <div className="flex gap-3 mt-1">
                            <span className="font-condensed text-xs font-bold" style={{ color: 'var(--gray)' }}>
                              {b.participants} oseb
                            </span>
                            <span className="font-condensed text-xs font-bold" style={{ color: 'var(--gray)' }}>
                              #{b.booking_code?.split('-')[0].toUpperCase()}
                            </span>
                            {b.user?.phone && (
                              <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                                {b.user.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-condensed text-xs font-bold tracking-widest px-3 py-1.5 rounded-lg"
                          style={{
                            background: isIn ? 'rgba(34,197,94,0.12)' : 'rgba(250,177,32,0.12)',
                            color: isIn ? 'var(--green)' : 'var(--accent)',
                          }}>
                          {isIn ? '✓ PRIJAVLJEN' : 'ČA KA'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CLASSES TAB ── */}
        {activeTab === 'classes' && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <span className="font-condensed text-sm tracking-widest animate-pulse" style={{ color: 'var(--gray)' }}>NALAGAM...</span>
              </div>
            ) : classSessions.length === 0 ? (
              <div className="card text-center py-16">
                <p style={{ color: 'var(--gray)' }}>Ni vadb za danes.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {classSessions.map(session => (
                  <div key={session.id} className="card" style={{ borderTop: `3px solid ${session.class_type.color_hex}` }}>
                    {/* Session header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-condensed font-black text-lg uppercase tracking-wide" style={{ color: 'var(--white)' }}>
                          {session.class_type.name_sl}
                        </div>
                        <div className="font-display text-2xl leading-none" style={{ color: session.class_type.color_hex }}>
                          {session.start_time} – {session.end_time}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-3xl leading-none" style={{ color: session.class_type.color_hex }}>
                          {session.registered}/{session.class_type.capacity}
                        </div>
                        <div className="font-condensed text-xs tracking-widest" style={{ color: 'var(--gray)' }}>
                          PRIJAVLJENIH
                        </div>
                        {session.waitlisted > 0 && (
                          <div className="font-condensed text-xs font-bold mt-1" style={{ color: 'var(--accent)' }}>
                            +{session.waitlisted} čakalna lista
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Attendance list */}
                    {session.attendance.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {session.attendance.map(a => {
                          const attended = a.status === 'attended'
                          const waitlisted = a.status === 'waitlisted'
                          return (
                            <div key={a.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                              style={{
                                background: attended ? 'rgba(34,197,94,0.08)' : waitlisted ? 'rgba(250,177,32,0.06)' : 'var(--dark3)',
                                border: `1px solid ${attended ? 'rgba(34,197,94,0.2)' : waitlisted ? 'rgba(250,177,32,0.15)' : 'var(--border)'}`,
                                opacity: attended ? 0.75 : 1,
                              }}>
                              <div>
                                <span className="font-condensed font-bold text-sm" style={{ color: 'var(--white)' }}>
                                  {a.user?.first_name} {a.user?.last_name}
                                </span>
                                {a.user?.phone && (
                                  <span className="font-condensed text-xs ml-2" style={{ color: 'var(--gray)' }}>
                                    {a.user.phone}
                                  </span>
                                )}
                                {waitlisted && (
                                  <span className="font-condensed text-xs ml-2 font-bold" style={{ color: 'var(--accent)' }}>
                                    čakalna lista
                                  </span>
                                )}
                              </div>
                              {!attended && !waitlisted ? (
                                <button onClick={() => handleClassCheckIn(a.id)}
                                  className="font-condensed text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg transition-all"
                                  style={{ background: 'var(--accent)', color: 'var(--black)' }}>
                                  PRIJAVI
                                </button>
                              ) : attended ? (
                                <span className="font-condensed text-xs font-bold" style={{ color: 'var(--green)' }}>✓ PRISOTEN</span>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-center py-4" style={{ color: 'var(--gray)' }}>Ni prijavljenih.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Moj urnik tab */}
        {activeTab === 'urnik' && <MojUrnik />}

        {/* Footer */}
        <div className="mt-12 pt-6 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>
            {user?.first_name} {user?.last_name} · {user?.role}
          </span>
          <button onClick={() => { logout(); navigate('/prijava') }}
            className="font-condensed text-xs font-bold tracking-widest uppercase transition-colors"
            style={{ color: 'var(--gray)' }}>
            ODJAVA
          </button>
        </div>

      </div>
    </div>
  )
}
