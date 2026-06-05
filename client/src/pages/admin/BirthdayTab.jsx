import React, { useEffect, useState, useCallback } from 'react'
import api from '../../services/api.js'

// ── Helpers ───────────────────────────────────────────────────────────

const fmt = (n) => new Intl.NumberFormat('sl-SI', { style: 'currency', currency: 'EUR' }).format(n || 0)
const fmtDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('sl-SI') : '—'

const STATUS_MAP = {
  inquiry:   { label: 'POVPRAŠEVANJE', color: 'var(--accent)',  bg: 'rgba(250,177,32,0.12)' },
  confirmed: { label: 'POTRJENO',     color: 'var(--green)',   bg: 'rgba(34,197,94,0.12)'  },
  completed: { label: 'IZVEDENO',     color: '#a78bfa',        bg: 'rgba(167,139,250,0.12)' },
  cancelled: { label: 'PREKLICANO',   color: '#FF3D00',        bg: 'rgba(255,61,0,0.12)'   },
}

const PKG_COLORS = {
  bd_basic:    '#7BB3E8',
  bd_standard: 'var(--accent)',
  bd_premium:  '#a78bfa',
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.inquiry
  return (
    <span className="font-condensed text-xs font-bold tracking-widest px-2 py-1 rounded"
      style={{ background: s.bg, color: s.color }}>{s.label}</span>
  )
}

function StatCard({ label, value, color, sub }) {
  return (
    <div className="card">
      <div className="font-condensed text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--gray)' }}>{label}</div>
      <div className="font-display text-4xl leading-none mb-1" style={{ color: color || 'var(--accent)' }}>{value}</div>
      {sub && <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>{sub}</div>}
    </div>
  )
}

// ── Detail panel ──────────────────────────────────────────────────────

function DetailPanel({ booking, onClose, onUpdate }) {
  const [status, setStatus] = useState(booking.status)
  const [adminNotes, setAdminNotes] = useState(booking.admin_notes || '')
  const [saving, setSaving] = useState(false)

  const saveStatus = async (newStatus) => {
    setSaving(true)
    try {
      await api.patch(`/birthday/admin/${booking.id}/status`, { status: newStatus })
      setStatus(newStatus)
      onUpdate()
    } finally { setSaving(false) }
  }

  const saveNotes = async () => {
    setSaving(true)
    try {
      await api.patch(`/birthday/admin/${booking.id}/notes`, { admin_notes: adminNotes })
    } finally { setSaving(false) }
  }

  const pkgColor = PKG_COLORS[booking.package_id] || 'var(--accent)'

  return (
    <div className="card flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-condensed font-black text-sm uppercase tracking-wide mb-1"
            style={{ color: 'var(--white)' }}>
            {booking.contact_first_name} {booking.contact_last_name}
          </div>
          <div className="font-condensed text-xs mb-2" style={{ color: 'var(--gray)' }}>
            {booking.contact_email} · {booking.contact_phone}
          </div>
          <StatusBadge status={status} />
        </div>
        <button onClick={onClose}
          className="font-condensed font-bold text-xs tracking-widest uppercase px-3 py-1.5 rounded"
          style={{ background: 'var(--dark3)', color: 'var(--gray)', border: '1px solid var(--border)', flexShrink: 0 }}>
          ZAPRI ✕
        </button>
      </div>

      {/* Key details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          ['Datum', fmtDate(booking.event_date)],
          ['Ura', booking.event_time],
          ['Paket', booking.package_label],
          ['Jubilejnik', `${booking.child_name}, ${booking.child_age} let`],
          ['Število otrok', `${booking.children_count} (extra: ${booking.extra_children})`],
          ['Skupaj', fmt(booking.total_price)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg px-3 py-2.5" style={{ background: 'var(--dark3)', border: '1px solid var(--border)' }}>
            <div className="font-condensed text-xs font-bold tracking-widest uppercase mb-0.5" style={{ color: 'var(--gray)' }}>{k}</div>
            <div className="font-condensed font-black text-sm" style={{ color: 'var(--white)' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Package badge */}
      <div className="rounded-lg px-4 py-2 flex items-center gap-3"
        style={{ background: `${pkgColor}10`, border: `1px solid ${pkgColor}30` }}>
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: pkgColor }} />
        <span className="font-condensed font-black text-sm uppercase tracking-wide" style={{ color: pkgColor }}>
          {booking.package_label}
        </span>
        <span className="font-condensed text-xs ml-auto" style={{ color: 'var(--gray)' }}>
          Base: {fmt(booking.base_price)}
          {booking.extra_children > 0 && ` + ${booking.extra_children}× extra`}
          {' = '}<strong style={{ color: pkgColor }}>{fmt(booking.total_price)}</strong>
        </span>
      </div>

      {/* Booking code */}
      <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
        Koda: <span style={{ color: 'var(--white)', fontFamily: 'monospace' }}>
          {booking.booking_code?.split('-')[0].toUpperCase()}
        </span>
        {' · '} Prejeto: {new Date(booking.createdAt).toLocaleDateString('sl-SI')}
      </div>

      {/* Customer notes */}
      {booking.notes && (
        <div>
          <div className="font-condensed text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--gray)' }}>
            Opombe stranke
          </div>
          <div className="rounded-lg px-3 py-2.5 font-condensed text-sm"
            style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'rgba(245,245,240,0.7)', lineHeight: 1.6 }}>
            {booking.notes}
          </div>
        </div>
      )}

      {/* Admin notes */}
      <div>
        <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>
          Interne opombe (vidne samo adminu)
        </label>
        <textarea
          value={adminNotes}
          onChange={e => setAdminNotes(e.target.value)}
          onBlur={saveNotes}
          rows={3}
          placeholder="Posebnosti, dogovori, kontakt..."
          className="w-full px-3 py-2.5 rounded-lg text-sm resize-none outline-none transition-all font-condensed"
          style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        />
      </div>

      {/* Status buttons */}
      <div>
        <div className="font-condensed text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--gray)' }}>
          Spremeni status
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_MAP).map(([k, s]) => (
            <button key={k} onClick={() => saveStatus(k)} disabled={saving || status === k}
              className="font-condensed font-black text-xs tracking-widest uppercase px-3 py-2 rounded-lg transition-all"
              style={{
                background: status === k ? s.bg : 'var(--dark3)',
                color: status === k ? s.color : 'var(--gray)',
                border: `1px solid ${status === k ? s.color + '50' : 'var(--border)'}`,
                opacity: saving ? 0.5 : 1,
              }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main BirthdayTab ──────────────────────────────────────────────────

export default function BirthdayTab() {
  const [stats, setStats]       = useState(null)
  const [data, setData]         = useState({ bookings: [], total: 0 })
  const [loading, setLoading]   = useState(false)
  const [selected, setSelected] = useState(null)

  // Filters
  const [status, setStatus]   = useState('')
  const [pkgId, setPkgId]     = useState('')
  const [search, setSearch]   = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]   = useState('')
  const [page, setPage]       = useState(1)
  const LIMIT = 15

  const loadStats = () =>
    api.get('/birthday/admin/stats').then(r => setStats(r.data)).catch(() => {})

  const load = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams({ page, limit: LIMIT })
    if (status)   p.set('status', status)
    if (pkgId)    p.set('package_id', pkgId)
    if (search)   p.set('search', search)
    if (dateFrom) p.set('date_from', dateFrom)
    if (dateTo)   p.set('date_to', dateTo)
    api.get(`/birthday/admin/list?${p}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, status, pkgId, search, dateFrom, dateTo])

  useEffect(() => { loadStats(); load() }, [load])

  const handleUpdate = () => { loadStats(); load() }

  const selectBooking = (b) => setSelected(prev => prev?.id === b.id ? null : b)

  const selBkg = data.bookings.find(b => b.id === selected?.id) || selected

  return (
    <div>
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Skupaj RD" value={stats.total} />
          <StatCard label="Čaka potrditev" value={stats.inquiries} color="#FAB120" />
          <StatCard label="Potrjeno" value={stats.confirmed} color="var(--green)" />
          <StatCard label="Prihodki RD" value={fmt(stats.totalRevenue)} color="var(--accent)" />
        </div>
      )}

      {/* Detail panel */}
      {selBkg && (
        <div className="mb-6">
          <DetailPanel
            booking={selBkg}
            onClose={() => setSelected(null)}
            onUpdate={handleUpdate}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text" placeholder="Ime, e-mail, otrok..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="px-3 py-2.5 rounded-lg text-sm outline-none font-condensed"
          style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)', width: '200px' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />

        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2.5 rounded-lg font-condensed font-bold text-xs tracking-widest uppercase outline-none"
          style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}>
          <option value="">VSI STATUSI</option>
          <option value="inquiry">POVPRAŠEVANJE</option>
          <option value="confirmed">POTRJENO</option>
          <option value="completed">IZVEDENO</option>
          <option value="cancelled">PREKLICANO</option>
        </select>

        <select value={pkgId} onChange={e => { setPkgId(e.target.value); setPage(1) }}
          className="px-3 py-2.5 rounded-lg font-condensed font-bold text-xs tracking-widest uppercase outline-none"
          style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}>
          <option value="">VSI PAKETI</option>
          <option value="bd_basic">BASIC</option>
          <option value="bd_standard">STANDARD</option>
          <option value="bd_premium">PREMIUM</option>
        </select>

        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
          className="px-3 py-2.5 rounded-lg text-sm outline-none font-condensed"
          style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}
          placeholder="Od" />
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
          className="px-3 py-2.5 rounded-lg text-sm outline-none font-condensed"
          style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}
          placeholder="Do" />
      </div>

      <div className="font-condensed text-xs font-bold tracking-widest mb-3" style={{ color: 'var(--gray)' }}>
        {data.total} rezervacij
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center font-condensed tracking-widest animate-pulse" style={{ color: 'var(--gray)' }}>NALAGAM...</div>
      ) : data.bookings.length === 0 ? (
        <div className="card py-12 text-center">
          <div className="font-display text-4xl mb-3" style={{ color: 'var(--dark3)' }}>RD.</div>
          <div className="font-condensed font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>
            Ni rezervacij
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.bookings.map(b => {
            const isSelected = selected?.id === b.id
            const pkgColor = PKG_COLORS[b.package_id] || 'var(--accent)'
            return (
              <div key={b.id}
                onClick={() => selectBooking(b)}
                className="card py-3 cursor-pointer transition-all"
                style={{
                  opacity: b.status === 'cancelled' ? 0.5 : 1,
                  borderColor: isSelected ? 'var(--accent)' : undefined,
                  background: isSelected ? 'rgba(250,177,32,0.04)' : undefined,
                }}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Package color dot */}
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: pkgColor }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-condensed font-black text-sm uppercase tracking-wide" style={{ color: 'var(--white)' }}>
                          {b.contact_first_name} {b.contact_last_name}
                        </span>
                        <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                          za {b.child_name} ({b.child_age} let)
                        </span>
                      </div>
                      <div className="font-condensed text-xs mt-0.5" style={{ color: 'var(--gray)' }}>
                        {fmtDate(b.event_date)} · {b.event_time} ·{' '}
                        <span style={{ color: pkgColor }}>{b.package_label}</span> ·{' '}
                        {b.children_count} otrok · {fmt(b.total_price)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={b.status} />
                    <span className="font-condensed text-xs" style={{ color: 'var(--dark3)' }}>›</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {data.total > LIMIT && (
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
            className="btn-secondary px-4 py-2 text-xs">←</button>
          <span className="font-condensed font-bold text-sm self-center" style={{ color: 'var(--gray)' }}>
            {page} / {Math.ceil(data.total / LIMIT)}
          </span>
          <button onClick={() => setPage(p => p+1)} disabled={page >= Math.ceil(data.total / LIMIT)}
            className="btn-secondary px-4 py-2 text-xs">→</button>
        </div>
      )}
    </div>
  )
}
