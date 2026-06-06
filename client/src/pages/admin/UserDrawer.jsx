import React, { useEffect, useState } from 'react'
import api from '../../services/api.js'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const fmt = (n) => new Intl.NumberFormat('sl-SI', { style: 'currency', currency: 'EUR' }).format(n || 0)

function Badge({ status }) {
  const map = {
    confirmed:  { label: 'POTRJENO',   color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
    cancelled:  { label: 'PREKLICANO', color: '#FF3D00',       bg: 'rgba(255,61,0,0.12)' },
    checked_in: { label: 'PRIJAVLJEN', color: 'var(--accent)', bg: 'rgba(250,177,32,0.12)' },
    pending:    { label: 'V ČAKANJU',  color: 'var(--gray)',   bg: 'var(--dark3)' },
    customer:   { label: 'CUSTOMER',   color: 'var(--white)', bg: 'var(--dark3)' },
    staff:      { label: 'STAFF',      color: 'var(--accent)', bg: 'rgba(250,177,32,0.12)' },
    admin:      { label: 'ADMIN',      color: '#FF3D00',       bg: 'rgba(255,61,0,0.12)' },
    blocked:    { label: 'BLOKIRAN',   color: '#e53e3e',       bg: 'rgba(229,62,62,0.12)' },
  }
  const s = map[status] || map.customer
  return (
    <span className="font-condensed text-xs font-bold tracking-widest px-2 py-1 rounded"
      style={{ background: s.bg, color: s.color }}>{s.label}</span>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div className="font-condensed text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--gray)' }}>
        {label}
      </div>
      <div className="font-condensed text-sm font-bold" style={{ color: 'var(--white)' }}>{children}</div>
    </div>
  )
}

function EditInput({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <div className="font-condensed text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--gray)' }}>
        {label}
      </div>
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg font-condensed text-sm font-bold outline-none"
        style={{ background: 'var(--dark3)', border: '1px solid rgba(250,177,32,0.3)', color: 'var(--white)' }}
      />
    </div>
  )
}

export default function UserDrawer({ userId, onClose, onUpdate, currentUserId }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm]     = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [activeTab, setActiveTab] = useState('oj')

  const load = async () => {
    setLoading(true)
    try {
      const r = await api.get(`/admin/users/${userId}`)
      setUser(r.data)
      setForm({
        first_name: r.data.first_name,
        last_name:  r.data.last_name,
        email:      r.data.email,
        phone:      r.data.phone,
        role:       r.data.role,
      })
    } catch { onClose() }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [userId])

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const save = async () => {
    setSaving(true); setError('')
    try {
      await api.patch(`/admin/users/${userId}`, form)
      setEditing(false)
      await load()
      onUpdate()
    } catch (e) {
      setError(e.response?.data?.error || 'Napaka pri shranjevanju')
    } finally { setSaving(false) }
  }

  const doDelete = async () => {
    try {
      await api.delete(`/admin/users/${userId}`)
      onUpdate()
      onClose()
    } catch (e) {
      setError(e.response?.data?.error || 'Napaka pri brisanju')
    }
  }

  const toggleBlock = async () => {
    try {
      if (user.is_blocked) {
        await api.patch(`/admin/users/${userId}/unblock`)
      } else {
        await api.patch(`/admin/users/${userId}/block`)
      }
      await load()
      onUpdate()
    } catch (e) {
      setError(e.response?.data?.error || 'Napaka')
    }
  }

  const isSelf = user?.id === currentUserId

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.7)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          width: 'min(600px, 100vw)',
          background: 'var(--dark2)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="section-label">Profil uporabnika</div>
          <button onClick={onClose}
            className="font-condensed text-xl font-black leading-none transition-opacity hover:opacity-60"
            style={{ color: 'var(--gray)' }}>✕</button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center font-condensed tracking-widest animate-pulse"
            style={{ color: 'var(--gray)' }}>NALAGAM...</div>
        ) : !user ? null : (
          <div className="flex-1 overflow-y-auto">

            {/* Identity block */}
            <div className="px-6 pt-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="font-condensed font-black text-2xl uppercase tracking-wide mb-1"
                    style={{ color: 'var(--white)' }}>
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="font-condensed text-sm" style={{ color: 'var(--gray)' }}>{user.email}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge status={user.role} />
                  {user.is_blocked && <Badge status="blocked" />}
                </div>
              </div>

              {/* Action buttons */}
              {!editing && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setEditing(true)}
                    className="font-condensed font-black text-xs uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
                    style={{ background: 'var(--accent)', color: 'var(--black)' }}>
                    UREDI
                  </button>

                  {!isSelf && (
                    <>
                      <button onClick={toggleBlock}
                        className="font-condensed font-black text-xs uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
                        style={{
                          background: user.is_blocked ? 'rgba(34,197,94,0.12)' : 'rgba(229,62,62,0.1)',
                          color: user.is_blocked ? 'var(--green)' : '#e53e3e',
                          border: `1px solid ${user.is_blocked ? 'rgba(34,197,94,0.3)' : 'rgba(229,62,62,0.3)'}`,
                        }}>
                        {user.is_blocked ? 'ODBLOKIRAJ' : 'BLOKIRAJ'}
                      </button>

                      <button onClick={() => setConfirmDelete(true)}
                        className="font-condensed font-black text-xs uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
                        style={{
                          background: 'rgba(255,61,0,0.08)',
                          color: '#FF3D00',
                          border: '1px solid rgba(255,61,0,0.2)',
                        }}>
                        IZBRIŠI
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Edit form */}
            {editing ? (
              <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="section-label mb-4">Uredi podatke</div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <EditInput label="Ime" value={form.first_name} onChange={v => setForm(f => ({ ...f, first_name: v }))} />
                  <EditInput label="Priimek" value={form.last_name} onChange={v => setForm(f => ({ ...f, last_name: v }))} />
                  <EditInput label="E-mail" value={form.email} type="email" onChange={v => setForm(f => ({ ...f, email: v }))} />
                  <EditInput label="Telefon" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
                  <div>
                    <div className="font-condensed text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--gray)' }}>
                      Vloga
                    </div>
                    <select
                      value={form.role}
                      onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg font-condensed text-sm font-bold outline-none"
                      style={{ background: 'var(--dark3)', border: '1px solid rgba(250,177,32,0.3)', color: 'var(--white)' }}
                      disabled={isSelf}
                    >
                      <option value="customer">customer</option>
                      <option value="staff">staff</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                </div>
                {error && (
                  <div className="font-condensed text-xs font-bold mb-3" style={{ color: '#FF3D00' }}>{error}</div>
                )}
                <div className="flex gap-2">
                  <button onClick={save} disabled={saving}
                    className="font-condensed font-black text-xs uppercase tracking-widest px-4 py-2 rounded-lg"
                    style={{ background: 'var(--accent)', color: 'var(--black)', opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'SHRANJUJEM...' : 'SHRANI'}
                  </button>
                  <button onClick={() => { setEditing(false); setError('') }}
                    className="font-condensed font-black text-xs uppercase tracking-widest px-4 py-2 rounded-lg"
                    style={{ background: 'var(--dark3)', color: 'var(--gray)', border: '1px solid var(--border)' }}>
                    PREKLIČI
                  </button>
                </div>
              </div>
            ) : (
              /* Info grid */
              <div className="px-6 py-5 grid grid-cols-2 gap-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <Field label="Telefon">{user.phone || '—'}</Field>
                <Field label="Datum rojstva">{fmtDate(user.date_of_birth)}</Field>
                <Field label="Registriran">{fmtDate(user.createdAt)}</Field>
                <Field label="Jezik">{user.preferred_language?.toUpperCase() || 'SL'}</Field>
                <Field label="Izjava sprejeta">{fmtDate(user.waiver_accepted_at)}</Field>
                <Field label="Status">
                  <span style={{ color: user.is_blocked ? '#e53e3e' : 'var(--green)' }}>
                    {user.is_blocked ? 'Blokiran' : 'Aktiven'}
                  </span>
                </Field>
              </div>
            )}

            {/* History tabs */}
            {!editing && (
              <div className="px-6 pt-5">
                <div className="section-label mb-4">Zgodovina</div>

                {/* Tab switcher */}
                <div className="flex gap-2 mb-4">
                  {[
                    { key: 'oj', label: `Open Jump (${user.ojBookings?.length ?? 0})` },
                    { key: 'bd', label: `Rojstni dnevi (${user.bdBookings?.length ?? 0})` },
                  ].map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                      className="font-condensed font-black text-xs uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        background: activeTab === t.key ? 'var(--accent)' : 'var(--dark3)',
                        color: activeTab === t.key ? 'var(--black)' : 'var(--gray)',
                        border: `1px solid ${activeTab === t.key ? 'var(--accent)' : 'var(--border)'}`,
                      }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* OJ bookings */}
                {activeTab === 'oj' && (
                  <div className="flex flex-col gap-2 pb-6">
                    {(!user.ojBookings || user.ojBookings.length === 0) ? (
                      <div className="font-condensed text-sm py-6 text-center" style={{ color: 'var(--gray)' }}>
                        Ni Open Jump rezervacij
                      </div>
                    ) : user.ojBookings.map(b => (
                      <div key={b.id} className="rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
                        style={{ background: 'var(--dark3)', border: '1px solid var(--border)' }}>
                        <div>
                          <div className="font-condensed font-black text-sm" style={{ color: 'var(--white)' }}>
                            {fmtDate(b.date)} · {b.start_time?.slice(0, 5)}–{b.end_time?.slice(0, 5)}
                          </div>
                          <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                            {b.participants} {b.participants === 1 ? 'oseba' : 'oseb'} · {b.booking_code}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-condensed font-black text-sm" style={{ color: 'var(--accent)' }}>
                            {fmt(b.total_price)}
                          </span>
                          <StatusDot status={b.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* BD bookings */}
                {activeTab === 'bd' && (
                  <div className="flex flex-col gap-2 pb-6">
                    {(!user.bdBookings || user.bdBookings.length === 0) ? (
                      <div className="font-condensed text-sm py-6 text-center" style={{ color: 'var(--gray)' }}>
                        Ni rezervacij rojstnih dni
                      </div>
                    ) : user.bdBookings.map(b => (
                      <div key={b.id} className="rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
                        style={{ background: 'var(--dark3)', border: '1px solid var(--border)' }}>
                        <div>
                          <div className="font-condensed font-black text-sm" style={{ color: 'var(--white)' }}>
                            {fmtDate(b.event_date)} · {b.event_time?.slice(0, 5)}
                          </div>
                          <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                            {b.package_label || b.package_id} · {b.children_count} otrok · {b.booking_code}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-condensed font-black text-sm" style={{ color: 'var(--accent)' }}>
                            {fmt(b.total_price)}
                          </span>
                          <StatusDot status={b.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Confirm delete dialog */}
        {confirmDelete && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div className="rounded-2xl p-6 max-w-sm w-full"
              style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }}>
              <div className="section-label mb-3">Izbriši uporabnika</div>
              <p className="font-condensed text-sm mb-6" style={{ color: 'var(--gray)', lineHeight: 1.6 }}>
                Ali res želiš izbrisati uporabnika{' '}
                <strong style={{ color: 'var(--white)' }}>{user?.first_name} {user?.last_name}</strong>?
                Tega dejanja ni mogoče razveljaviti.
              </p>
              {error && (
                <div className="font-condensed text-xs font-bold mb-3" style={{ color: '#FF3D00' }}>{error}</div>
              )}
              <div className="flex gap-2">
                <button onClick={doDelete}
                  className="font-condensed font-black text-xs uppercase tracking-widest px-4 py-2 rounded-lg flex-1"
                  style={{ background: '#e53e3e', color: '#fff' }}>
                  DA, IZBRIŠI
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  className="font-condensed font-black text-xs uppercase tracking-widest px-4 py-2 rounded-lg flex-1"
                  style={{ background: 'var(--dark3)', color: 'var(--gray)', border: '1px solid var(--border)' }}>
                  PREKLIČI
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function StatusDot({ status }) {
  const color = status === 'confirmed' ? 'var(--green)' : status === 'cancelled' ? '#FF3D00' : status === 'checked_in' ? 'var(--accent)' : 'var(--gray)'
  const label = status === 'confirmed' ? 'POTRJENO' : status === 'cancelled' ? 'PREKLICANO' : status === 'checked_in' ? 'CHECK-IN' : status?.toUpperCase()
  return (
    <span className="font-condensed text-xs font-bold tracking-widest px-2 py-0.5 rounded"
      style={{ color, background: color + '22' }}>{label}</span>
  )
}
