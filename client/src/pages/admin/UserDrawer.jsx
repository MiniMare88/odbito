import React, { useEffect, useState } from 'react'
import api from '../../services/api.js'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtDateTime(d) {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' · ' + dt.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' })
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

function StatusDot({ status }) {
  const color = status === 'confirmed' ? 'var(--green)' : status === 'cancelled' ? '#FF3D00' : status === 'checked_in' ? 'var(--accent)' : 'var(--gray)'
  const label = status === 'confirmed' ? 'POTRJENO' : status === 'cancelled' ? 'PREKLICANO' : status === 'checked_in' ? 'CHECK-IN' : status?.toUpperCase()
  return (
    <span className="font-condensed text-xs font-bold tracking-widest px-2 py-0.5 rounded"
      style={{ color, background: color + '22' }}>{label}</span>
  )
}

// ── Notes section ─────────────────────────────────────────────────────

function NotesSection({ userId }) {
  const [notes, setNotes]     = useState([])
  const [text, setText]       = useState('')
  const [saving, setSaving]   = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const r = await api.get(`/admin/users/${userId}/notes`)
      setNotes(r.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [userId])

  const addNote = async () => {
    if (!text.trim()) return
    setSaving(true)
    try {
      await api.post(`/admin/users/${userId}/notes`, { content: text.trim() })
      setText('')
      await load()
    } catch {}
    finally { setSaving(false) }
  }

  const deleteNote = async (noteId) => {
    if (!confirm('Izbriši to noto?')) return
    try {
      await api.delete(`/admin/users/${userId}/notes/${noteId}`)
      setNotes(n => n.filter(x => x.id !== noteId))
    } catch {}
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote()
  }

  return (
    <div className="px-6 pt-5 pb-6" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="section-label mb-4">Zapisnik / Notes</div>

      {/* Add note */}
      <div className="mb-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Dodaj opombo o uporabniku... (⌘+Enter za shranitev)"
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg font-condensed text-sm outline-none resize-none"
          style={{
            background: 'var(--dark3)',
            border: '1px solid var(--border)',
            color: 'var(--white)',
            lineHeight: 1.6,
          }}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="font-condensed text-xs" style={{ color: 'var(--gray)', opacity: 0.5 }}>
            {text.length > 0 ? `${text.length} znakov` : ''}
          </span>
          <button
            onClick={addNote}
            disabled={!text.trim() || saving}
            className="font-condensed font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-lg transition-all"
            style={{
              background: text.trim() ? 'var(--accent)' : 'var(--dark3)',
              color: text.trim() ? 'var(--black)' : 'var(--border)',
              opacity: saving ? 0.6 : 1,
              cursor: text.trim() ? 'pointer' : 'default',
            }}>
            {saving ? 'SHRANJUJEM...' : '+ SHRANI NOTO'}
          </button>
        </div>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="font-condensed text-xs animate-pulse" style={{ color: 'var(--gray)' }}>Nalagam...</div>
      ) : notes.length === 0 ? (
        <div className="font-condensed text-sm py-4 text-center" style={{ color: 'var(--gray)', opacity: 0.5 }}>
          Ni zapiskov za tega uporabnika
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map(note => (
            <div key={note.id} className="rounded-xl p-3"
              style={{ background: 'var(--dark3)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-condensed text-xs font-bold" style={{ color: 'var(--accent)' }}>
                    {note.author ? `${note.author.first_name} ${note.author.last_name}` : 'Admin'}
                  </span>
                  <span className="font-condensed text-xs" style={{ color: 'var(--gray)', opacity: 0.6 }}>
                    {fmtDateTime(note.createdAt)}
                  </span>
                </div>
                <button onClick={() => deleteNote(note.id)}
                  className="font-condensed text-xs font-bold transition-opacity hover:opacity-100"
                  style={{ color: '#FF3D00', opacity: 0.5, flexShrink: 0 }}>
                  ✕
                </button>
              </div>
              <p className="font-condensed text-sm" style={{ color: 'var(--white)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main drawer ───────────────────────────────────────────────────────

export default function UserDrawer({ userId, onClose, onUpdate, currentUserId }) {
  const [user, setUser]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(false)
  const [form, setForm]           = useState({})
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
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
      onUpdate(); onClose()
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
      await load(); onUpdate()
    } catch (e) {
      setError(e.response?.data?.error || 'Napaka')
    }
  }

  const isSelf = user?.id === currentUserId

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          width: 'min(600px, 100vw)',
          background: 'var(--dark2)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
        }}>

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
                  {/* UREDI — modra */}
                  <button onClick={() => setEditing(true)}
                    className="font-condensed font-black text-xs uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
                    style={{
                      background: 'rgba(59,130,246,0.15)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59,130,246,0.35)',
                    }}>
                    UREDI
                  </button>

                  {!isSelf && (
                    <>
                      {/* BLOKIRAJ — siva/temna z oranžnim odtenkom */}
                      <button onClick={toggleBlock}
                        className="font-condensed font-black text-xs uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
                        style={user.is_blocked ? {
                          background: 'rgba(34,197,94,0.1)',
                          color: '#4ade80',
                          border: '1px solid rgba(34,197,94,0.3)',
                        } : {
                          background: 'rgba(30,30,30,0.9)',
                          color: '#d97706',
                          border: '1px solid rgba(120,100,50,0.4)',
                        }}>
                        {user.is_blocked ? 'ODBLOKIRAJ' : 'BLOKIRAJ'}
                      </button>

                      {/* IZBRIŠI — rdeča */}
                      <button onClick={() => setConfirmDelete(true)}
                        className="font-condensed font-black text-xs uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
                        style={{
                          background: 'rgba(220,38,38,0.12)',
                          color: '#f87171',
                          border: '1px solid rgba(220,38,38,0.35)',
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
                    <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg font-condensed text-sm font-bold outline-none"
                      style={{ background: 'var(--dark3)', border: '1px solid rgba(250,177,32,0.3)', color: 'var(--white)' }}
                      disabled={isSelf}>
                      <option value="customer">customer</option>
                      <option value="staff">staff</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                </div>
                {error && <div className="font-condensed text-xs font-bold mb-3" style={{ color: '#FF3D00' }}>{error}</div>}
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
                  <span style={{ color: user.is_blocked ? '#f87171' : 'var(--green)' }}>
                    {user.is_blocked ? 'Blokiran' : 'Aktiven'}
                  </span>
                </Field>
              </div>
            )}

            {/* History tabs */}
            {!editing && (
              <div className="px-6 pt-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="section-label mb-4">Zgodovina</div>
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

                {activeTab === 'oj' && (
                  <div className="flex flex-col gap-2 pb-5">
                    {(!user.ojBookings || user.ojBookings.length === 0) ? (
                      <div className="font-condensed text-sm py-6 text-center" style={{ color: 'var(--gray)' }}>Ni Open Jump rezervacij</div>
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
                          <span className="font-condensed font-black text-sm" style={{ color: 'var(--accent)' }}>{fmt(b.total_price)}</span>
                          <StatusDot status={b.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'bd' && (
                  <div className="flex flex-col gap-2 pb-5">
                    {(!user.bdBookings || user.bdBookings.length === 0) ? (
                      <div className="font-condensed text-sm py-6 text-center" style={{ color: 'var(--gray)' }}>Ni rezervacij rojstnih dni</div>
                    ) : user.bdBookings.map(b => (
                      <div key={b.id} className="rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
                        style={{ background: 'var(--dark3)', border: '1px solid var(--border)' }}>
                        <div>
                          <div className="font-condensed font-black text-sm" style={{ color: 'var(--white)' }}>
                            {fmtDate(b.party_date)} · {b.party_time?.slice(0, 5)}
                          </div>
                          <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                            {b.package_key} · {b.children_count} otrok · {b.booking_code}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-condensed font-black text-sm" style={{ color: 'var(--accent)' }}>{fmt(b.total_price)}</span>
                          <StatusDot status={b.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes section */}
            {!editing && <NotesSection userId={userId} />}

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
              {error && <div className="font-condensed text-xs font-bold mb-3" style={{ color: '#FF3D00' }}>{error}</div>}
              <div className="flex gap-2">
                <button onClick={doDelete}
                  className="font-condensed font-black text-xs uppercase tracking-widest px-4 py-2 rounded-lg flex-1"
                  style={{ background: 'rgba(220,38,38,0.2)', color: '#f87171', border: '1px solid rgba(220,38,38,0.4)' }}>
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
