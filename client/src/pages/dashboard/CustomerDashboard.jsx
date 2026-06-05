import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

function QRModal({ bookingId, bookingCode, onClose }) {
  const [qr, setQr] = useState(null)
  useEffect(() => {
    api.get(`/openjump/booking/${bookingId}/qr`)
      .then(r => setQr(r.data.qr))
      .catch(() => {})
  }, [bookingId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,10,14,0.92)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="rounded-2xl p-8 max-w-xs w-full text-center"
        style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}>
        <div className="section-label justify-center mb-4">QR koda za check-in</div>
        {qr ? (
          <img src={qr} alt="QR" className="w-full rounded-xl mb-4" style={{ background: '#fff', padding: '8px' }} />
        ) : (
          <div className="w-full aspect-square rounded-xl mb-4 flex items-center justify-center"
            style={{ background: 'var(--dark3)' }}>
            <span className="font-condensed text-xs tracking-widest animate-pulse" style={{ color: 'var(--gray)' }}>NALAGAM...</span>
          </div>
        )}
        <div className="font-display text-2xl mb-4" style={{ color: 'var(--accent)', letterSpacing: '0.1em' }}>
          {bookingCode?.split('-')[0].toUpperCase()}
        </div>
        <a href={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001'}/api/openjump/booking/${bookingId}/ics`}
          className="btn-secondary w-full text-center block mb-3" style={{ fontSize: '13px', padding: '10px' }}>
          📅 PRENESI .ICS
        </a>
        <button onClick={onClose} className="font-condensed text-xs font-bold tracking-widest uppercase"
          style={{ color: 'var(--gray)' }}>ZAPRI</button>
      </div>
    </div>
  )
}

function SubStatusBadge({ status }) {
  const map = {
    active:    { label: 'AKTIVNA',    color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
    expired:   { label: 'POTEKLA',    color: 'var(--gray)',  bg: 'var(--dark3)' },
    cancelled: { label: 'PREKLICANA', color: '#FF3D00',      bg: 'rgba(255,61,0,0.12)' },
  }
  const s = map[status] || map.expired
  return (
    <span className="font-condensed text-xs font-bold tracking-widest px-2 py-1 rounded"
      style={{ background: s.bg, color: s.color }}>{s.label}</span>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('sl-SI', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status, payment }) {
  const map = {
    confirmed: { label: 'POTRJENO', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
    checked_in: { label: 'PRISOTEN', color: 'var(--accent)', bg: 'rgba(250,177,32,0.12)' },
    cancelled: { label: 'PREKLICANO', color: '#FF3D00', bg: 'rgba(255,61,0,0.12)' },
  }
  const s = map[status] || map.confirmed
  return (
    <span className="font-condensed text-xs font-bold tracking-widest px-2 py-1 rounded"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

export default function CustomerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [qrModal, setQrModal] = useState(null) // { id, booking_code }

  useEffect(() => {
    Promise.all([
      api.get('/openjump/my-bookings'),
      api.get('/classes/my-subscriptions'),
    ]).then(([b, s]) => {
      setBookings(b.data)
      setSubscriptions(s.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const upcoming = bookings.filter(b => b.date >= today && b.status !== 'cancelled')
  const past = bookings.filter(b => b.date < today || b.status === 'cancelled')

  const handleLogout = async () => {
    await logout()
    navigate('/prijava')
  }

  const activeSubs = subscriptions.filter(s => s.status === 'active')

  const tabs = [
    { key: 'upcoming',  label: 'Open Jump', count: upcoming.length },
    { key: 'past',      label: 'Pretekle',  count: past.length },
    { key: 'subs',      label: 'Naročnine', count: activeSubs.length },
    { key: 'profile',   label: 'Profil',    count: null },
  ]

  const shown = activeTab === 'upcoming' ? upcoming : activeTab === 'past' ? past : []
  const planLabel = { monthly: 'Mesečna', yearly: 'Letna', seasonal: 'Sezonska' }

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-12" style={{ background: 'var(--black)' }}>
      {qrModal && <QRModal bookingId={qrModal.id} bookingCode={qrModal.booking_code} onClose={() => setQrModal(null)} />}
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="section-label mb-3">Nadzorna plošča</div>
            <h1 className="font-display" style={{ fontSize: '52px', color: 'var(--white)', lineHeight: 1 }}>
              ZDRAVO,<br />
              <span style={{ color: 'var(--accent)' }}>{user?.first_name?.toUpperCase()}.</span>
            </h1>
          </div>
          <Link to="/rezervacija" className="btn-primary">+ NOVA REZERVACIJA</Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Open Jump',  value: bookings.length },
            { label: 'Prihajajoče', value: upcoming.length },
            { label: 'Naročnine',  value: activeSubs.length },
            { label: 'Pretekle',   value: past.length },
          ].map(s => (
            <div key={s.label} className="card text-center py-5">
              <div className="font-display text-5xl mb-1" style={{ color: 'var(--accent)', lineHeight: 1 }}>{s.value}</div>
              <div className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--dark2)' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2.5 rounded-lg font-condensed font-bold text-sm tracking-widest uppercase transition-all"
              style={{
                background: activeTab === tab.key ? 'var(--accent)' : 'transparent',
                color: activeTab === tab.key ? 'var(--black)' : 'var(--gray)',
              }}>
              {tab.label}
              {tab.count !== null && <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* Bookings list */}
        {activeTab !== 'profile' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <span className="font-condensed text-sm tracking-widest animate-pulse" style={{ color: 'var(--gray)' }}>NALAGAM...</span>
              </div>
            ) : shown.length === 0 ? (
              <div className="text-center py-16 card">
                <div className="font-display text-4xl mb-3" style={{ color: 'var(--dark3)' }}>0</div>
                <p style={{ color: 'var(--gray)' }}>
                  {activeTab === 'upcoming' ? 'Nimaš prihajajočih rezervacij.' : 'Nimaš preteklih rezervacij.'}
                </p>
                {activeTab === 'upcoming' && (
                  <Link to="/rezervacija" className="btn-primary inline-block mt-6">REZERVIRAJ TERMIN</Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {shown.map(b => (
                  <div key={b.id} className="card">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="font-condensed font-black text-lg tracking-wide uppercase mb-1" style={{ color: 'var(--white)' }}>
                          {formatDate(b.date)}
                        </div>
                        <div className="font-display text-3xl mb-2" style={{ color: 'var(--accent)', lineHeight: 1 }}>
                          {b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-condensed text-sm font-bold" style={{ color: 'var(--gray)' }}>
                            {b.participants} {b.participants === 1 ? 'oseba' : 'osebi/oseb'}
                          </span>
                          <span style={{ color: 'var(--border)' }}>·</span>
                          <span className="font-condensed text-sm font-bold" style={{ color: 'var(--gray)' }}>
                            {Number(b.duration_hours)}h
                          </span>
                          <span style={{ color: 'var(--border)' }}>·</span>
                          <span className="font-condensed font-bold" style={{ color: 'var(--white)' }}>
                            €{Number(b.total_price).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={b.status} payment={b.payment_status} />
                        <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                          #{b.booking_code?.split('-')[0].toUpperCase()}
                        </span>
                        {activeTab === 'upcoming' && b.status !== 'cancelled' && (
                          <button onClick={() => setQrModal({ id: b.id, booking_code: b.booking_code })}
                            className="font-condensed text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg transition-all"
                            style={{ background: 'rgba(250,177,32,0.1)', border: '1px solid rgba(250,177,32,0.3)', color: 'var(--accent)' }}>
                            QR KODA
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Subscriptions tab */}
        {activeTab === 'subs' && (
          <>
            {subscriptions.length === 0 ? (
              <div className="text-center py-16 card">
                <p style={{ color: 'var(--gray)' }}>Nimaš nobene naročnine.</p>
                <Link to="/vadbe" className="btn-primary inline-block mt-6">OGLEJ SI VADBE</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {subscriptions.map(s => {
                  const daysLeft = Math.ceil((new Date(s.end_date) - new Date()) / 86400000)
                  const color = s.classType?.color_hex || 'var(--accent)'
                  return (
                    <div key={s.id} className="card" style={{ borderLeft: `3px solid ${color}` }}>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="font-condensed font-black text-lg tracking-wide uppercase mb-1" style={{ color: 'var(--white)' }}>
                            {s.classType?.name_sl}
                          </div>
                          <div className="font-condensed font-bold text-sm mb-2" style={{ color }}>
                            {planLabel[s.plan_type] || s.plan_type}
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-condensed text-xs font-bold" style={{ color: 'var(--gray)' }}>
                              Do: {new Date(s.end_date + 'T12:00:00').toLocaleDateString('sl-SI')}
                            </span>
                            {s.status === 'active' && daysLeft <= 14 && daysLeft > 0 && (
                              <span className="font-condensed text-xs font-bold px-2 py-0.5 rounded"
                                style={{ background: 'rgba(250,177,32,0.12)', color: 'var(--accent)' }}>
                                Še {daysLeft} dni
                              </span>
                            )}
                          </div>
                        </div>
                        <SubStatusBadge status={s.status} />
                      </div>
                    </div>
                  )
                })}
                <Link to="/vadbe" className="btn-secondary text-center mt-2">+ DODAJ NAROČNINO</Link>
              </div>
            )}
          </>
        )}

        {/* Profile tab */}
        {activeTab === 'profile' && user && (
          <div className="flex flex-col gap-4">
            <div className="card">
              <div className="section-label mb-5">Osebni podatki</div>
              <div className="flex flex-col gap-3">
                {[
                  ['Ime', `${user.first_name} ${user.last_name}`],
                  ['E-mail', user.email],
                  ['Telefon', user.phone || '—'],
                  ['Datum rojstva', user.date_of_birth ? new Date(user.date_of_birth + 'T12:00:00').toLocaleDateString('sl-SI') : '—'],
                  ['Vloga', user.role],
                  ['Jezik', user.preferred_language === 'sl' ? 'Slovenščina' : 'English'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>{k}</span>
                    <span className="font-condensed font-bold text-sm" style={{ color: 'var(--white)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="section-label mb-5">Izjava o odgovornosti</div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-condensed font-bold text-sm" style={{ color: 'var(--white)' }}>
                    Različica: {user.waiver_version || '—'}
                  </span>
                  <p className="text-xs mt-1" style={{ color: 'var(--gray)' }}>
                    {user.waiver_accepted_at
                      ? `Sprejeta: ${new Date(user.waiver_accepted_at).toLocaleDateString('sl-SI')}`
                      : 'Izjava ni bila sprejeta'}
                  </p>
                </div>
                <Link to="/izjava" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                  OGLEJ SI →
                </Link>
              </div>
            </div>

            <button onClick={handleLogout}
              className="font-condensed font-bold text-sm tracking-widest uppercase py-3 rounded-xl transition-colors"
              style={{ background: 'rgba(255,61,0,0.08)', border: '1px solid rgba(255,61,0,0.2)', color: '#FF3D00' }}>
              ODJAVA
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
