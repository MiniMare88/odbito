import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import Navbar from '../../components/layout/Navbar.jsx'
import PrijaveTab from './PrijaveTab.jsx'
import UrnikTab from './UrnikTab.jsx'
import BirthdayTab from './BirthdayTab.jsx'
import UrnikParkaTab from './UrnikParkaTab.jsx'
import VouchersTab from './VouchersTab.jsx'
import UserDrawer from './UserDrawer.jsx'

// ── Helpers ───────────────────────────────────────────────────────────

const fmt = (n) => new Intl.NumberFormat('sl-SI', { style: 'currency', currency: 'EUR' }).format(n || 0)

// DD.MM.LLLL — vedno dan in mesec, leto opcijsko
function fmtDate(d, { year = true } = {}) {
  if (!d) return '—'
  const dt = new Date(d + 'T12:00:00')
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const yyyy = dt.getFullYear()
  return year ? `${dd}.${mm}.${yyyy}` : `${dd}.${mm}.`
}

// YYYY-MM-DD → DD.MM.
function fmtDayMonth(isoDate) {
  if (!isoDate) return '—'
  const [, m, d] = isoDate.split('-')
  return `${d}.${m}.`
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className="px-4 py-2.5 rounded-lg font-condensed font-bold text-xs tracking-widest uppercase transition-all whitespace-nowrap"
      style={{ background: active ? 'var(--accent)' : 'transparent', color: active ? 'var(--black)' : 'var(--gray)' }}>
      {children}
    </button>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card">
      <div className="font-condensed text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--gray)' }}>{label}</div>
      <div className="font-display text-4xl leading-none mb-1" style={{ color: color || 'var(--accent)' }}>{value}</div>
      {sub && <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>{sub}</div>}
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1.5 block" style={{ color: 'var(--gray)' }}>{label}</label>}
      <input {...props}
        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
        style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)', ...props.style }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
    </div>
  )
}

function Badge({ status }) {
  const map = {
    confirmed:  { label: 'POTRJENO',   color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
    checked_in: { label: 'PRIJAVLJEN', color: 'var(--accent)', bg: 'rgba(250,177,32,0.12)' },
    cancelled:  { label: 'PREKLICANO', color: '#FF3D00',       bg: 'rgba(255,61,0,0.12)' },
    active:     { label: 'AKTIVNA',    color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
    expired:    { label: 'POTEKLA',    color: 'var(--gray)',  bg: 'var(--dark3)' },
    customer:   { label: 'CUSTOMER',   color: 'var(--white)', bg: 'var(--dark3)' },
    staff:      { label: 'STAFF',      color: 'var(--accent)', bg: 'rgba(250,177,32,0.12)' },
    admin:      { label: 'ADMIN',      color: '#FF3D00',      bg: 'rgba(255,61,0,0.12)' },
    blocked:    { label: 'BLOKIRAN',   color: '#e53e3e',      bg: 'rgba(229,62,62,0.12)' },
  }
  const s = map[status] || map.customer
  return (
    <span className="font-condensed text-xs font-bold tracking-widest px-2 py-1 rounded"
      style={{ background: s.bg, color: s.color }}>{s.label}</span>
  )
}

// ── Tab: Overview ─────────────────────────────────────────────────────

function OverviewTab() {
  const [stats, setStats] = useState(null)
  useEffect(() => { api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {}) }, [])
  if (!stats) return <div className="py-16 text-center font-condensed tracking-widest animate-pulse" style={{ color: 'var(--gray)' }}>NALAGAM...</div>
  return (
    <div>
      <div className="section-label mb-5">Prihodki</div>
      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard label="Danes" value={fmt(stats.todayRevenue)} color="var(--accent)" />
        <StatCard label="Ta mesec" value={fmt(stats.monthRevenue)} color="var(--accent)" />
        <StatCard label="Skupaj" value={fmt(stats.totalRevenue)} color="var(--accent)" />
      </div>
      <div className="section-label mb-5">Rezervacije</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Danes" value={stats.todayBookings} />
        <StatCard label="Ta mesec" value={stats.monthBookings} />
        <StatCard label="Skupaj" value={stats.totalBookings} />
        <StatCard label="Aktivne naročnine" value={stats.activeSubscriptions} color="var(--green)" />
      </div>
      <div className="section-label mb-5">Rojstni dnevi</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Skupaj RD" value={stats.bdTotal || 0} />
        <StatCard label="Čaka potrd." value={stats.bdInquiries || 0} color="#FAB120" />
        <StatCard label="Prihodki RD" value={fmt(stats.bdRevenue)} color="#a78bfa" />
        <StatCard label="Stranke" value={stats.totalUsers} />
      </div>
    </div>
  )
}

// ── Tab: Bookings ─────────────────────────────────────────────────────

function BookingsTab() {
  const [data, setData] = useState({ bookings: [], total: 0 })
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [cancelling, setCancelling] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 15 })
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    api.get(`/admin/bookings?${params}`).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [page, search, status])

  useEffect(() => { load() }, [load])

  const cancel = async (id) => {
    if (!confirm('Prekliči rezervacijo?')) return
    setCancelling(id)
    try { await api.patch(`/admin/bookings/${id}/cancel`); load() } catch {} finally { setCancelling(null) }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <Input placeholder="Iščite po imenu ali e-mailu..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }} style={{ width: '220px' }} />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2.5 rounded-lg font-condensed font-bold text-xs tracking-widest uppercase outline-none"
          style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}>
          <option value="">VSI STATUSI</option>
          <option value="confirmed">POTRJENO</option>
          <option value="checked_in">PRIJAVLJEN</option>
          <option value="cancelled">PREKLICANO</option>
        </select>
      </div>

      <div className="font-condensed text-xs font-bold tracking-widest mb-3" style={{ color: 'var(--gray)' }}>
        {data.total} rezervacij
      </div>

      {loading ? (
        <div className="py-12 text-center font-condensed tracking-widest animate-pulse" style={{ color: 'var(--gray)' }}>NALAGAM...</div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.bookings.map(b => (
            <div key={b.id} className="card py-3" style={{ opacity: b.status === 'cancelled' ? 0.5 : 1 }}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-condensed font-black text-sm uppercase tracking-wide" style={{ color: 'var(--white)' }}>
                      {b.user?.first_name} {b.user?.last_name}
                    </div>
                    <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                      {fmtDate(b.date)} · {b.start_time?.slice(0,5)}–{b.end_time?.slice(0,5)} · {b.participants}× · {fmt(b.total_price)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={b.status} />
                  {b.status !== 'cancelled' && (
                    <button onClick={() => cancel(b.id)} disabled={cancelling === b.id}
                      className="font-condensed text-xs font-bold tracking-widest uppercase px-2 py-1 rounded transition-all"
                      style={{ background: 'rgba(255,61,0,0.1)', color: '#FF3D00', border: '1px solid rgba(255,61,0,0.2)' }}>
                      {cancelling === b.id ? '...' : 'PREKLIČI'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.total > 15 && (
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-secondary px-4 py-2 text-xs">←</button>
          <span className="font-condensed font-bold text-sm self-center" style={{ color: 'var(--gray)' }}>
            {page} / {Math.ceil(data.total / 15)}
          </span>
          <button onClick={() => setPage(p => p+1)} disabled={page >= Math.ceil(data.total/15)} className="btn-secondary px-4 py-2 text-xs">→</button>
        </div>
      )}
    </div>
  )
}

// ── Tab: Users ────────────────────────────────────────────────────────

function UsersTab() {
  const { user: currentUser } = useAuth()
  const [data, setData]           = useState({ users: [], total: 0 })
  const [search, setSearch]       = useState('')
  const [role, setRole]           = useState('')
  const [page, setPage]           = useState(1)
  const [loading, setLoading]     = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 20 })
    if (search) params.set('search', search)
    if (role)   params.set('role', role)
    api.get(`/admin/users?${params}`).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [page, search, role])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <Input placeholder="Iščite..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }} style={{ width: '220px' }} />
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1) }}
          className="px-3 py-2.5 rounded-lg font-condensed font-bold text-xs tracking-widest uppercase outline-none"
          style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}>
          <option value="">VSE VLOGE</option>
          <option value="customer">CUSTOMER</option>
          <option value="staff">STAFF</option>
          <option value="admin">ADMIN</option>
        </select>
      </div>

      <div className="font-condensed text-xs font-bold tracking-widest mb-3" style={{ color: 'var(--gray)' }}>
        {data.total} uporabnikov
      </div>

      {loading ? (
        <div className="py-12 text-center font-condensed tracking-widest animate-pulse" style={{ color: 'var(--gray)' }}>NALAGAM...</div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.users.map(u => (
            <div key={u.id}
              onClick={() => setSelectedId(u.id)}
              className="card py-3 cursor-pointer transition-all"
              style={{ opacity: u.is_blocked ? 0.7 : 1 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(250,177,32,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = ''}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="font-condensed font-black text-sm uppercase tracking-wide" style={{ color: 'var(--white)' }}>
                    {u.first_name} {u.last_name}
                  </div>
                  <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                    {u.email} · {u.phone || '—'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {u.is_blocked && <Badge status="blocked" />}
                  <Badge status={u.role} />
                  <span className="font-condensed text-xs" style={{ color: 'var(--gray)', opacity: 0.5 }}>›</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedId && (
        <UserDrawer
          userId={selectedId}
          currentUserId={currentUser?.id}
          onClose={() => setSelectedId(null)}
          onUpdate={load}
        />
      )}
    </div>
  )
}

// ── Tab: Closures ─────────────────────────────────────────────────────

function ClosuresTab() {
  const [closures, setClosures] = useState([])
  const [form, setForm] = useState({ date: '', reason_sl: '', reason_en: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = () => api.get('/admin/closures').then(r => setClosures(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try { await api.post('/admin/closures', form); setForm({ date: '', reason_sl: '', reason_en: '' }); load() }
    catch (err) { setError(err.response?.data?.error || 'Napaka') }
    finally { setSubmitting(false) }
  }
  const remove = async (id) => {
    if (!confirm('Odstrani zaprtje?')) return
    await api.delete(`/admin/closures/${id}`).catch(() => {})
    load()
  }

  return (
    <div>
      <div className="card mb-6">
        <div className="section-label mb-4">Dodaj zaprtje parka</div>
        <form onSubmit={add} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Datum" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            <Input label="Razlog (SLO)" value={form.reason_sl} onChange={e => setForm(f => ({ ...f, reason_sl: e.target.value }))} placeholder="npr. Državni praznik" />
            <Input label="Razlog (EN)" value={form.reason_en} onChange={e => setForm(f => ({ ...f, reason_en: e.target.value }))} placeholder="e.g. Public holiday" />
          </div>
          {error && <div className="text-xs font-condensed font-bold" style={{ color: '#FF3D00' }}>{error}</div>}
          <button type="submit" disabled={submitting || !form.date} className="btn-primary self-start"
            style={{ opacity: (!form.date || submitting) ? 0.5 : 1 }}>
            {submitting ? 'DODAJAM...' : '+ DODAJ ZAPRTJE'}
          </button>
        </form>
      </div>

      <div className="section-label mb-4">Prihodnja zaprtja</div>
      {closures.length === 0 ? (
        <div className="card text-center py-10"><p style={{ color: 'var(--gray)' }}>Ni zaprtij.</p></div>
      ) : (
        <div className="flex flex-col gap-2">
          {closures.map(c => (
            <div key={c.id} className="card py-3 flex items-center justify-between gap-4">
              <div>
                <div className="font-condensed font-black text-base" style={{ color: 'var(--accent)' }}>{fmtDate(c.date)}</div>
                {c.reason_sl && <div className="font-condensed text-xs mt-0.5" style={{ color: 'var(--gray)' }}>{c.reason_sl}</div>}
              </div>
              <button onClick={() => remove(c.id)}
                className="font-condensed text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded"
                style={{ background: 'rgba(255,61,0,0.1)', color: '#FF3D00', border: '1px solid rgba(255,61,0,0.2)' }}>
                ODSTRANI
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Tab: Discount Codes ───────────────────────────────────────────────

function DiscountTab() {
  const [codes, setCodes] = useState([])
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', max_uses: '', expires_at: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = () => api.get('/admin/discount-codes').then(r => setCodes(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('')
    try {
      await api.post('/admin/discount-codes', { ...form, value: Number(form.value), max_uses: form.max_uses ? Number(form.max_uses) : null })
      setForm({ code: '', type: 'percentage', value: '', max_uses: '', expires_at: '' }); load()
    } catch (err) { setError(err.response?.data?.error || 'Napaka') }
    finally { setSubmitting(false) }
  }

  const toggle = async (id) => {
    await api.patch(`/admin/discount-codes/${id}/toggle`).catch(() => {}); load()
  }

  return (
    <div>
      <div className="card mb-6">
        <div className="section-label mb-4">Nova discount koda</div>
        <form onSubmit={create} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Koda" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="POLETJE25" required />
            <div>
              <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1.5 block" style={{ color: 'var(--gray)' }}>Tip</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg font-condensed font-bold text-xs outline-none"
                style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}>
                <option value="percentage">ODSTOTEK (%)</option>
                <option value="fixed">FIKSNI ZNESEK (€)</option>
              </select>
            </div>
            <Input label={form.type === 'percentage' ? 'Vrednost (%)' : 'Vrednost (€)'}
              type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              placeholder={form.type === 'percentage' ? '10' : '5.00'} required />
            <Input label="Max uporab (prazno = ∞)" type="number" value={form.max_uses}
              onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="100" />
            <Input label="Poteče (prazno = nikoli)" type="date" value={form.expires_at}
              onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
          </div>
          {error && <div className="text-xs font-condensed font-bold" style={{ color: '#FF3D00' }}>{error}</div>}
          <button type="submit" disabled={submitting} className="btn-primary self-start"
            style={{ opacity: submitting ? 0.5 : 1 }}>
            {submitting ? 'USTVARJAM...' : '+ USTVARI KODO'}
          </button>
        </form>
      </div>

      <div className="section-label mb-4">Obstoječe kode ({codes.length})</div>
      {codes.length === 0 ? (
        <div className="card text-center py-10"><p style={{ color: 'var(--gray)' }}>Ni kod.</p></div>
      ) : (
        <div className="flex flex-col gap-2">
          {codes.map(c => (
            <div key={c.id} className="card py-3 flex items-center justify-between gap-4 flex-wrap"
              style={{ opacity: c.is_active ? 1 : 0.5 }}>
              <div>
                <div className="font-display text-2xl leading-none mb-1" style={{ color: 'var(--accent)' }}>{c.code}</div>
                <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                  {c.type === 'percentage' ? `${c.value}%` : fmt(c.value)} ·
                  {' '}{c.uses_count}/{c.max_uses ?? '∞'} uporab ·
                  {c.expires_at ? ` poteče ${fmtDate(c.expires_at.split('T')[0])}` : ' brez izteka'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-condensed text-xs font-bold px-2 py-1 rounded"
                  style={{ background: c.is_active ? 'rgba(34,197,94,0.12)' : 'var(--dark3)', color: c.is_active ? 'var(--green)' : 'var(--gray)' }}>
                  {c.is_active ? 'AKTIVNA' : 'DEAKTIVIRANA'}
                </span>
                <button onClick={() => toggle(c.id)}
                  className="font-condensed text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded transition-all"
                  style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--gray)' }}>
                  {c.is_active ? 'DEAKTIVIRAJ' : 'AKTIVIRAJ'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Tab: Waiver ───────────────────────────────────────────────────────

function WaiverTab() {
  const [waivers, setWaivers] = useState([])
  const [form, setForm] = useState({ version: '', content_sl: '', content_en: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = () => api.get('/admin/waiver').then(r => setWaivers(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('')
    try { await api.post('/admin/waiver', form); setForm({ version: '', content_sl: '', content_en: '' }); load() }
    catch (err) { setError(err.response?.data?.error || 'Napaka') }
    finally { setSubmitting(false) }
  }

  const activate = async (id) => {
    await api.patch(`/admin/waiver/${id}/activate`).catch(() => {}); load()
  }

  return (
    <div>
      <div className="card mb-6">
        <div className="section-label mb-4">Nova različica izjave</div>
        <form onSubmit={create} className="flex flex-col gap-4">
          <Input label="Različica (npr. v2.0)" value={form.version}
            onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="v2.0" required />
          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1.5 block" style={{ color: 'var(--gray)' }}>Vsebina (SLO)</label>
            <textarea value={form.content_sl} onChange={e => setForm(f => ({ ...f, content_sl: e.target.value }))} required rows={6}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-vertical"
              style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}
              placeholder="Besedilo izjave v slovenščini..." />
          </div>
          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1.5 block" style={{ color: 'var(--gray)' }}>Vsebina (EN)</label>
            <textarea value={form.content_en} onChange={e => setForm(f => ({ ...f, content_en: e.target.value }))} required rows={6}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-vertical"
              style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}
              placeholder="Waiver content in English..." />
          </div>
          {error && <div className="text-xs font-condensed font-bold" style={{ color: '#FF3D00' }}>{error}</div>}
          <button type="submit" disabled={submitting} className="btn-primary self-start"
            style={{ opacity: submitting ? 0.5 : 1 }}>
            {submitting ? 'SHRANJUJEM...' : '+ OBJAVI RAZLIČICO'}
          </button>
        </form>
      </div>

      <div className="section-label mb-4">Vse različice</div>
      <div className="flex flex-col gap-2">
        {waivers.map(w => (
          <div key={w.id} className="card py-3 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="font-condensed font-black text-base uppercase tracking-wide" style={{ color: 'var(--white)' }}>
                Različica {w.version}
              </div>
              <div className="font-condensed text-xs mt-0.5" style={{ color: 'var(--gray)' }}>
                {w.content_sl?.slice(0, 80)}…
              </div>
            </div>
            <div className="flex items-center gap-2">
              {w.is_current && (
                <span className="font-condensed text-xs font-bold px-2 py-1 rounded"
                  style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}>AKTIVNA</span>
              )}
              {!w.is_current && (
                <button onClick={() => activate(w.id)}
                  className="font-condensed text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded"
                  style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--gray)' }}>
                  AKTIVIRAJ
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Occupancy ────────────────────────────────────────────────────

// Za urno zasedenost (absolutno število)
const OCC_COLORS = [
  { max: 0,  bg: 'transparent',           text: 'var(--dark3)' },
  { max: 24, bg: 'rgba(34,197,94,0.20)',  text: '#22c55e' },
  { max: 34, bg: 'rgba(234,179,8,0.25)',  text: '#eab308' },
  { max: 44, bg: 'rgba(249,115,22,0.30)', text: '#f97316' },
  { max: 54, bg: 'rgba(239,68,68,0.30)',  text: '#ef4444' },
  { max: Infinity, bg: 'rgba(153,27,27,0.45)', text: '#fca5a5' },
]
function occStyle(n) {
  const c = OCC_COLORS.find(c => n <= c.max)
  return { background: c.bg, color: c.text }
}

// Za mesečni pogled — barve po % zasedenosti (kapaciteta pride iz urnika)
const OCC_PCT_COLORS = [
  { maxPct: 0,   bg: 'transparent',           text: 'var(--dark3)' },
  { maxPct: 50,  bg: 'rgba(34,197,94,0.20)',  text: '#22c55e' },
  { maxPct: 70,  bg: 'rgba(234,179,8,0.28)',  text: '#eab308' },
  { maxPct: 80,  bg: 'rgba(249,115,22,0.32)', text: '#f97316' },
  { maxPct: 90,  bg: 'rgba(239,68,68,0.32)',  text: '#ef4444' },
  { maxPct: Infinity, bg: 'rgba(153,27,27,0.48)', text: '#fca5a5' },
]

function scheduleToCapacity(sched) {
  // Dnevna kapaciteta = ure odprtosti × 50 (kapaciteta na uro)
  if (!sched?.is_open || !sched.open_time || !sched.close_time) return 0
  const [oh, om] = sched.open_time.split(':').map(Number)
  const [ch, cm] = sched.close_time.split(':').map(Number)
  const hours = Math.floor(((ch * 60 + cm) - (oh * 60 + om)) / 60)
  return hours * 50
}

function occStyleByPct(visitors, dayCapacity) {
  const cap = dayCapacity || 1
  const pct = (visitors / cap) * 100
  const c = OCC_PCT_COLORS.find(c => pct <= c.maxPct)
  return { background: c.bg, color: c.text, pct: Math.round(pct) }
}

const SL_DAYS = ['Ned', 'Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob']
const SL_MONTHS = ['Januar', 'Februar', 'Marec', 'April', 'Maj', 'Junij',
  'Julij', 'Avgust', 'September', 'Oktober', 'November', 'December']

function OccupancyTab() {
  const [subView, setSubView] = useState('month')
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [weekDate, setWeekDate] = useState(today.toISOString().split('T')[0])
  const [dayDate, setDayDate]   = useState(today.toISOString().split('T')[0])
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [schedRange, setSchedRange] = useState({})  // { 'YYYY-MM-DD': { is_open, open_time, close_time } }
  const [weeklySchedule, setWeeklySchedule] = useState([])  // 7 rows

  // Naloži tedenski urnik enkrat
  useEffect(() => {
    api.get('/park-schedule/weekly').then(r => setWeeklySchedule(r.data)).catch(() => {})
  }, [])

  // Pomočnik: kapaciteta za datum iz schedRange ali weeklySchedule
  const getDayCap = useCallback((dateStr) => {
    const sched = schedRange[dateStr]
    if (sched) return scheduleToCapacity(sched)
    // fallback na tedenska
    const dow = new Date(dateStr + 'T12:00:00').getDay()
    const ws = weeklySchedule.find(w => w.day_of_week === dow)
    return scheduleToCapacity(ws)
  }, [schedRange, weeklySchedule])

  // Pomočnik: je dan odprt
  const isDayOpen = useCallback((dateStr) => {
    const sched = schedRange[dateStr]
    if (sched) return sched.is_open
    const dow = new Date(dateStr + 'T12:00:00').getDay()
    const ws = weeklySchedule.find(w => w.day_of_week === dow)
    return ws?.is_open || false
  }, [schedRange, weeklySchedule])

  const load = useCallback(() => {
    setLoading(true)
    let url
    if (subView === 'month') url = `/admin/occupancy?view=month&year=${year}&month=${month}`
    else if (subView === 'week') url = `/admin/occupancy?view=week&date=${weekDate}`
    else url = `/admin/occupancy?view=day&date=${dayDate}`
    api.get(url).then(r => {
      setData(r.data)
      // Naloži schedule range za prikazano obdobje
      let from, to
      if (r.data.view === 'month') {
        const pad = n => String(n).padStart(2,'0')
        const last = new Date(r.data.year, r.data.month, 0).getDate()
        from = `${r.data.year}-${pad(r.data.month)}-01`
        to   = `${r.data.year}-${pad(r.data.month)}-${last}`
      } else if (r.data.view === 'week') {
        from = r.data.days[0]; to = r.data.days[6]
      } else {
        from = to = r.data.date
      }
      api.get(`/park-schedule/range?from=${from}&to=${to}`)
        .then(s => setSchedRange(s.data))
        .catch(() => {})
    }).catch(() => {}).finally(() => setLoading(false))
  }, [subView, year, month, weekDate, dayDate])

  useEffect(() => { load() }, [load])

  const NavArrow = ({ onClick, children }) => (
    <button onClick={onClick}
      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base transition-all"
      style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--gray)', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'var(--black)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--dark3)'; e.currentTarget.style.color = 'var(--gray)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
      {children}
    </button>
  )

  const SubBtn = ({ k, label }) => (
    <button onClick={() => setSubView(k)}
      className="px-4 py-2 rounded-lg font-condensed font-bold text-xs tracking-widest uppercase transition-all"
      style={{ background: subView === k ? 'var(--accent)' : 'var(--dark3)', color: subView === k ? 'var(--black)' : 'var(--gray)' }}>
      {label}
    </button>
  )

  // Legenda podatki
  const legendMonth = [
    ['0 %',    'transparent',           'var(--gray)'],
    ['1–50 %', 'rgba(34,197,94,0.20)',  '#22c55e'],
    ['50–70 %','rgba(234,179,8,0.28)',  '#eab308'],
    ['70–80 %','rgba(249,115,22,0.32)', '#f97316'],
    ['80–90 %','rgba(239,68,68,0.32)',  '#ef4444'],
    ['90+ %',  'rgba(153,27,27,0.48)', '#fca5a5'],
  ]
  const legendHour = [
    ['0',     'transparent',           'var(--gray)'],
    ['1–24',  'rgba(34,197,94,0.20)',  '#22c55e'],
    ['25–34', 'rgba(234,179,8,0.25)',  '#eab308'],
    ['35–44', 'rgba(249,115,22,0.30)', '#f97316'],
    ['45–54', 'rgba(239,68,68,0.30)',  '#ef4444'],
    ['55+',   'rgba(153,27,27,0.45)', '#fca5a5'],
  ]
  const legend = subView === 'month' ? legendMonth : legendHour

  return (
    <div>
      {/* Kontrolna vrstica: filtri + ločnica + sub-view preklopniki */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-3 rounded-xl"
        style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }}>

        {/* Navigacija glede na view */}
        {subView === 'month' && (() => {
          const prev = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
          const next = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }
          return (
            <div className="flex items-center gap-1">
              <NavArrow onClick={prev}>←</NavArrow>
              <span className="font-condensed font-black text-sm px-2 min-w-[130px] text-center" style={{ color: 'var(--white)' }}>
                {SL_MONTHS[month - 1]} {year}
              </span>
              <NavArrow onClick={next}>→</NavArrow>
            </div>
          )
        })()}

        {subView === 'week' && (() => {
          const shift = (days) => {
            const d = new Date(weekDate + 'T12:00:00')
            d.setDate(d.getDate() + days)
            setWeekDate(d.toISOString().split('T')[0])
          }
          return (
            <div className="flex items-center gap-1">
              <NavArrow onClick={() => shift(-7)}>←</NavArrow>
              <input type="date" value={weekDate} onChange={e => setWeekDate(e.target.value)}
                className="font-condensed font-black text-sm px-3 py-2 rounded-lg outline-none text-center"
                style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)', minWidth: '130px' }} />
              <NavArrow onClick={() => shift(7)}>→</NavArrow>
            </div>
          )
        })()}

        {subView === 'day' && (() => {
          const shift = (days) => {
            const d = new Date(dayDate + 'T12:00:00')
            d.setDate(d.getDate() + days)
            setDayDate(d.toISOString().split('T')[0])
          }
          return (
            <div className="flex items-center gap-1">
              <NavArrow onClick={() => shift(-1)}>←</NavArrow>
              <input type="date" value={dayDate} onChange={e => setDayDate(e.target.value)}
                className="font-condensed font-black text-sm px-3 py-2 rounded-lg outline-none text-center"
                style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)', minWidth: '130px' }} />
              <NavArrow onClick={() => shift(1)}>→</NavArrow>
            </div>
          )
        })()}

        {/* Ločnica */}
        <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }} />

        {/* Sub-view preklopniki */}
        <SubBtn k="month" label="Mesečno" />
        <SubBtn k="week"  label="Tedensko" />
        <SubBtn k="day"   label="Dnevno" />
      </div>

      {loading && <div className="py-16 text-center font-condensed tracking-widest animate-pulse" style={{ color: 'var(--gray)' }}>NALAGAM...</div>}

      {/* MONTH VIEW */}
      {!loading && data?.view === 'month' && (() => {
        const daysInMonth = new Date(data.year, data.month, 0).getDate()
        const firstDow = new Date(`${data.year}-${String(data.month).padStart(2, '0')}-01T12:00:00`).getDay()
        // Mon-first offset
        const offset = firstDow === 0 ? 6 : firstDow - 1
        const cells = []
        for (let i = 0; i < offset; i++) cells.push(null)
        for (let d = 1; d <= daysInMonth; d++) cells.push(d)
        const rows = []
        for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
        while (rows[rows.length - 1].length < 7) rows[rows.length - 1].push(null)

        return (
          <div>
            <div className="section-label mb-4">{SL_MONTHS[data.month - 1]} {data.year}</div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: '420px' }}>
                <thead>
                  <tr>
                    {['Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob', 'Ned'].map(d => (
                      <th key={d} className="font-condensed text-xs tracking-widest uppercase pb-2 text-center" style={{ color: 'var(--gray)' }}>{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((day, ci) => {
                        if (!day) return <td key={ci} className="p-1" />
                        const dateStr = `${data.year}-${String(data.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        const val = data.data[dateStr] || 0
                        const isToday = dateStr === new Date().toISOString().split('T')[0]
                        const isOJ = isDayOpen(dateStr)
                        const dayCap = getDayCap(dateStr)
                        const { background, color, pct } = isOJ ? occStyleByPct(val, dayCap) : { background: 'transparent', color: 'var(--dark3)', pct: 0 }
                        return (
                          <td key={ci} className="p-1">
                            <div className="rounded-lg p-2 text-center transition-all cursor-default"
                              style={{
                                background, color,
                                border: isToday ? '2px solid var(--accent)' : '2px solid transparent',
                                opacity: isOJ ? 1 : 0.3,
                                minHeight: '64px',
                              }}>
                              <div className="font-condensed text-xs font-bold mb-1" style={{ color: isToday ? 'var(--accent)' : 'var(--gray)' }}>{day}</div>
                              {isOJ && val > 0 && (
                                <>
                                  <div className="font-display text-lg leading-none">{val}</div>
                                  <div className="font-condensed text-xs mt-0.5 opacity-70">{pct} %</div>
                                </>
                              )}
                              {isOJ && val === 0 && <div className="font-display text-lg leading-none" style={{ color: 'var(--dark3)' }}>–</div>}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

      {/* WEEK VIEW */}
      {!loading && data?.view === 'week' && (() => {
        const hours = Array.from({ length: 13 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00`)

        // Skupni seštevek obiskovalcev po urah za SUM vrstico
        const dayTotals = {}
        data.days.forEach(d => {
          const isOJ = isDayOpen(d)
          if (!isOJ) { dayTotals[d] = null; return }
          const dayData = data.data[d] || {}
          dayTotals[d] = Object.values(dayData).reduce((s, v) => s + (Number(v) || 0), 0)
        })

        return (
          <div>
            <div className="section-label mb-4">Teden: {fmtDate(data.days[0])} – {fmtDate(data.days[6])}</div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: '560px' }}>
                <thead>
                  <tr>
                    <th className="w-14 pb-2" />
                    {data.days.map((d) => {
                      const dow = new Date(d + 'T12:00:00').getDay()
                      const isOJ = isDayOpen(d)
                      return (
                        <th key={d} className="pb-2 text-center font-condensed text-xs tracking-widest uppercase"
                          style={{ color: isOJ ? 'var(--white)' : 'var(--dark3)' }}>
                          {SL_DAYS[dow]}<br />
                          <span style={{ color: 'var(--gray)', fontSize: '10px' }}>{fmtDayMonth(d)}</span>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {hours.map(h => (
                    <tr key={h}>
                      <td className="font-condensed text-xs pr-2 text-right py-0.5" style={{ color: 'var(--gray)' }}>{h}</td>
                      {data.days.map(d => {
                        const val = data.data[d]?.[h] || 0
                        const isOJ = isDayOpen(d)
                        const style = isOJ ? occStyle(val) : { background: 'var(--dark3)', color: 'transparent' }
                        return (
                          <td key={d} className="p-0.5">
                            <div className="rounded flex items-center justify-center font-condensed font-bold text-xs transition-all"
                              style={{ ...style, height: '32px', minWidth: '40px', opacity: isOJ ? 1 : 0.2 }}>
                              {isOJ && val > 0 ? val : isOJ ? '–' : ''}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}

                  {/* SUM vrstica */}
                  <tr>
                    <td className="font-condensed text-xs font-black pr-2 text-right pt-2 pb-0.5 tracking-widest uppercase"
                      style={{ color: 'var(--accent)', borderTop: '1px solid var(--border)' }}>
                      SUM
                    </td>
                    {data.days.map(d => {
                      const total = dayTotals[d]
                      const isOJ = isDayOpen(d)
                      const dayCap = getDayCap(d)
                      return (
                        <td key={d} className="p-0.5 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                          <div className="rounded flex flex-col items-center justify-center font-condensed font-black transition-all"
                            style={{
                              height: '38px', minWidth: '40px',
                              background: isOJ && total > 0 ? 'rgba(250,177,32,0.12)' : 'transparent',
                              color: isOJ && total > 0 ? 'var(--accent)' : 'var(--dark3)',
                              border: isOJ && total > 0 ? '1px solid rgba(250,177,32,0.25)' : '1px solid transparent',
                              fontSize: '12px', lineHeight: 1.2,
                            }}>
                            {isOJ ? (total > 0 ? (
                              <>
                                <span>{total}</span>
                                {dayCap > 0 && <span style={{ fontSize: '9px', opacity: 0.6 }}>/ {dayCap}</span>}
                              </>
                            ) : '–') : ''}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

      {/* DAY VIEW */}
      {!loading && data?.view === 'day' && (() => {
        // Seštevek vseh ur obiska čez dan
        const totalVisitors = data.slots.reduce((sum, s) => sum + (s.occupancy || 0), 0)
        // Skupna dnevna kapaciteta = število aktivnih (OJ) slotov × kapaciteta na slot
        const activeSlots = data.slots.filter(s => s.occupancy !== null && s.occupancy !== undefined).length
        const dayCapacity = activeSlots * data.capacity
        const pctTotal = dayCapacity > 0 ? Math.min(100, (totalVisitors / dayCapacity) * 100) : 0
        return (
          <div>
            <div className="section-label mb-4">
              {new Date(data.date + 'T12:00:00').toLocaleDateString('sl-SI', { weekday: 'long' })} · {fmtDate(data.date)}
            </div>
            <div className="space-y-1">
              {data.slots.map(slot => {
                const pct = Math.min(100, (slot.occupancy / data.capacity) * 100)
                const style = occStyle(slot.occupancy)
                return (
                  <div key={slot.time} className="flex items-center gap-3">
                    <div className="font-condensed text-xs w-12 text-right flex-shrink-0" style={{ color: 'var(--gray)' }}>{slot.time}</div>
                    <div className="flex-1 rounded" style={{ background: 'var(--dark3)', height: '28px', position: 'relative', overflow: 'hidden' }}>
                      {slot.occupancy > 0 && (
                        <div className="absolute left-0 top-0 h-full rounded transition-all"
                          style={{ width: `${pct}%`, background: style.background, borderRight: `2px solid ${style.color}` }} />
                      )}
                    </div>
                    <div className="font-condensed font-bold text-xs w-16 flex-shrink-0" style={slot.occupancy > 0 ? style : { color: 'var(--dark3)' }}>
                      {slot.occupancy > 0 ? `${slot.occupancy} / ${data.capacity}` : '–'}
                    </div>
                  </div>
                )
              })}

              {/* SUM vrstica — seštevek vseh ur obiska / skupna dnevna kapaciteta */}
              <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="font-condensed text-xs font-black w-12 text-right flex-shrink-0 tracking-widest uppercase"
                  style={{ color: 'var(--accent)' }}>SUM</div>
                <div className="flex-1 rounded" style={{ background: 'var(--dark3)', height: '32px', position: 'relative', overflow: 'hidden' }}>
                  {totalVisitors > 0 && (
                    <div className="absolute left-0 top-0 h-full rounded transition-all"
                      style={{ width: `${pctTotal}%`, background: 'rgba(250,177,32,0.25)', borderRight: '2px solid var(--accent)' }} />
                  )}
                </div>
                <div className="font-condensed font-black text-sm w-16 flex-shrink-0"
                  style={{ color: totalVisitors > 0 ? 'var(--accent)' : 'var(--dark3)' }}>
                  {totalVisitors > 0 ? `${totalVisitors} / ${dayCapacity}` : '–'}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Legenda pod prikazom */}
      {!loading && data && (
        <div className="flex flex-wrap gap-3 mt-6 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
          {legend.map(([lbl, bg, col]) => (
            <div key={lbl} className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded" style={{ background: bg, border: '1px solid var(--border)' }} />
              <span className="font-condensed text-xs" style={{ color: col }}>
                {lbl}{subView !== 'month' ? ' os.' : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Nav groups ────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    key: 'overview',
    label: null, // standalone — no group label
    tabs: [{ key: 'overview', label: 'Pregled' }],
  },
  {
    key: 'park',
    label: 'PARK',
    tabs: [
      { key: 'occupancy',    label: 'Zasedenost' },
      { key: 'urnik-parka',  label: 'Urnik OJ' },
      { key: 'bookings',     label: 'Rezervacije' },
      { key: 'users',     label: 'Uporabniki' },
      { key: 'closures',  label: 'Zaprtja' },
      { key: 'discounts', label: 'Popusti' },
      { key: 'vouchers',  label: 'Boni' },
      { key: 'waiver',    label: 'Izjava' },
    ],
  },
  {
    key: 'osebje',
    label: 'OSEBJE',
    tabs: [
      { key: 'prijave', label: 'Prijave' },
      { key: 'urnik',   label: 'Urnik' },
    ],
  },
  {
    key: 'birthday',
    label: 'ROJSTNI DNEVI',
    tabs: [
      { key: 'birthday', label: 'Rezervacije RD' },
    ],
  },
]

function NavGroup({ group, activeTab, onSelect }) {
  const isActive = group.tabs.some(t => t.key === activeTab)
  return (
    <div className="flex flex-col gap-1">
      {group.label && (
        <div className="font-condensed font-bold tracking-widest px-2 pt-1"
          style={{ fontSize: '9px', color: isActive ? 'var(--accent)' : 'var(--dark3)', letterSpacing: '0.15em' }}>
          {group.label}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {group.tabs.map(t => (
          <button
            key={t.key}
            disabled={t.soon}
            onClick={() => !t.soon && onSelect(t.key)}
            className="text-left px-3 py-2 rounded-lg font-condensed font-bold text-xs tracking-widest uppercase transition-all whitespace-nowrap flex items-center gap-2"
            style={{
              background: activeTab === t.key ? 'var(--accent)' : 'transparent',
              color: activeTab === t.key ? 'var(--black)' : t.soon ? 'var(--dark3)' : 'var(--gray)',
              cursor: t.soon ? 'default' : 'pointer',
            }}>
            {t.label}
            {t.soon && (
              <span className="font-condensed font-bold tracking-widest rounded px-1.5 py-0.5"
                style={{ fontSize: '8px', background: 'var(--dark3)', color: 'var(--gray)', letterSpacing: '0.1em' }}>
                KMALU
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main AdminPanel ───────────────────────────────────────────────────

export default function AdminPanel() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')

  return (
    <div className="min-h-screen" style={{ background: 'var(--black)' }}>
      <Navbar />
      <div className="px-4 py-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="section-label mb-2">Administracija</div>
            <h1 className="font-display leading-none" style={{ fontSize: '52px', color: 'var(--white)' }}>
              ADMIN<span style={{ color: 'var(--accent)' }}>.</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>
              {user?.first_name} {user?.last_name}
            </span>
            <button onClick={() => { logout(); navigate('/prijava') }}
              className="font-condensed text-xs font-bold tracking-widest uppercase transition-colors"
              style={{ color: 'var(--gray)' }}>ODJAVA</button>
          </div>
        </div>

        {/* Layout: sidebar nav + content */}
        <div className="flex gap-6 items-start">

          {/* Sidebar navigation */}
          <nav className="flex-shrink-0 w-44 flex flex-col gap-3 sticky top-6"
            style={{ background: 'var(--dark2)', borderRadius: '16px', padding: '12px', border: '1px solid var(--border)' }}>
            {NAV_GROUPS.map((group, gi) => (
              <React.Fragment key={group.key}>
                {gi > 0 && <div style={{ height: '1px', background: 'var(--border)', margin: '2px 0' }} />}
                <NavGroup group={group} activeTab={tab} onSelect={setTab} />
              </React.Fragment>
            ))}
          </nav>

          {/* Content area */}
          <div className="flex-1 min-w-0">
            {tab === 'overview'   && <OverviewTab />}
            {tab === 'occupancy'   && <OccupancyTab />}
            {tab === 'urnik-parka' && <UrnikParkaTab />}
            {tab === 'prijave'    && <PrijaveTab />}
            {tab === 'urnik'      && <UrnikTab />}
            {tab === 'bookings'   && <BookingsTab />}
            {tab === 'users'      && <UsersTab />}
            {tab === 'closures'   && <ClosuresTab />}
            {tab === 'discounts'  && <DiscountTab />}
            {tab === 'vouchers'   && <VouchersTab />}
            {tab === 'waiver'     && <WaiverTab />}
            {tab === 'birthday'   && <BirthdayTab />}
          </div>

        </div>
      </div>
    </div>
  )
}
