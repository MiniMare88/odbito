import React, { useEffect, useState, useCallback } from 'react'
import api from '../../services/api.js'

// ── Helpers ───────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—'
  const dt = new Date(d)
  return `${String(dt.getDate()).padStart(2,'0')}.${String(dt.getMonth()+1).padStart(2,'0')}.${dt.getFullYear()}`
}
const ROLE_LABELS = { animator: 'Animator', trener: 'Trener', pomocnik_trenerja: 'Pomočnik trenerja' }

function StatusBadge({ status }) {
  if (!status) return <span style={{ color: 'var(--gray)', fontSize: '11px' }}>—</span>
  return (
    <span className="font-condensed text-xs font-bold px-2 py-0.5 rounded"
      style={{ background: status.color + '22', color: status.color, border: `1px solid ${status.color}55` }}>
      {status.label}
    </span>
  )
}

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>{label}</label>}
      <input {...props} className="w-full px-3 py-2 rounded-lg text-sm outline-none"
        style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}
        onFocus={e => e.target.style.borderColor='var(--accent)'}
        onBlur={e => e.target.style.borderColor='var(--border)'} />
    </div>
  )
}

// ── Status Manager Modal ──────────────────────────────────────────────
function StatusManagerModal({ statuses, onClose, onSaved }) {
  const [list, setList] = useState(statuses)
  const [newLabel, setNewLabel] = useState('')
  const [newColor, setNewColor] = useState('#6b7280')
  const [newTrigger, setNewTrigger] = useState(false)

  async function addStatus() {
    if (!newLabel.trim()) return
    const { data } = await api.post('/applications/statuses', { label: newLabel, color: newColor, is_staff_trigger: newTrigger })
    setList(l => [...l, data])
    setNewLabel('')
    onSaved()
  }
  async function removeStatus(id) {
    await api.delete(`/applications/statuses/${id}`)
    setList(l => l.filter(s => s.id !== id))
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div className="font-condensed font-bold tracking-widest uppercase text-xs mb-4" style={{ color: 'var(--gray)' }}>Upravljanje statusov</div>
        <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
          {list.map(s => (
            <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--dark3)' }}>
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="font-condensed text-sm flex-1" style={{ color: 'var(--white)' }}>{s.label}</span>
              {s.is_staff_trigger && <span className="font-condensed text-xs" style={{ color: 'var(--green)' }}>★ Zaposlen</span>}
              <button onClick={() => removeStatus(s.id)} className="font-condensed text-xs" style={{ color: '#ef4444' }}>✕</button>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="section-label">Dodaj status</div>
          <div className="flex gap-2">
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Naziv statusa"
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }} />
            <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-0" style={{ background: 'var(--dark3)' }} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={newTrigger} onChange={e => setNewTrigger(e.target.checked)} />
            <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>Označi kot "Zaposlen" (is_staff_trigger)</span>
          </label>
          <button onClick={addStatus} className="btn-primary w-full">DODAJ STATUS</button>
        </div>
        <button onClick={onClose} className="w-full mt-3 font-condensed text-xs py-2" style={{ color: 'var(--gray)' }}>ZAPRI</button>
      </div>
    </div>
  )
}

// ── Application Detail Modal ──────────────────────────────────────────
function DetailModal({ app, statuses, onClose, onSaved }) {
  const [form, setForm] = useState({
    status_id: app.status_id || '',
    admin_notes: app.admin_notes || '',
    first_name: app.first_name,
    last_name: app.last_name,
    email: app.email,
    phone: app.phone || '',
    desired_role: app.desired_role,
    availability: app.availability || '',
    message: app.message || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    try {
      await api.patch(`/applications/${app.id}`, form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved()
    } finally { setSaving(false) }
  }

  const f = (k) => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between px-6 py-4" style={{ background: 'var(--dark2)', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="font-display text-xl" style={{ color: 'var(--white)' }}>{app.first_name} {app.last_name}</div>
            <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>{app.email} · {fmtDate(app.submitted_at)}</div>
          </div>
          <button onClick={onClose} className="font-condensed text-xl" style={{ color: 'var(--gray)' }}>✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status */}
          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Status</label>
            <select value={form.status_id} onChange={f('status_id')}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}>
              <option value="">— Brez statusa —</option>
              {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Ime" value={form.first_name} onChange={f('first_name')} />
            <Input label="Priimek" value={form.last_name} onChange={f('last_name')} />
            <Input label="E-mail" value={form.email} onChange={f('email')} />
            <Input label="Telefon" value={form.phone} onChange={f('phone')} />
          </div>

          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Želena vloga</label>
            <select value={form.desired_role} onChange={f('desired_role')}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}>
              <option value="animator">Animator</option>
              <option value="trener">Trener</option>
              <option value="pomocnik_trenerja">Pomočnik trenerja</option>
            </select>
          </div>

          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Razpoložljivost</label>
            <textarea value={form.availability} onChange={f('availability')} rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }} />
          </div>

          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Sporočilo / motivacijsko pismo</label>
            <textarea value={form.message} onChange={f('message')} rows={4}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }} />
          </div>

          {/* Admin notes — internal only */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(250,177,32,0.06)', border: '1px solid rgba(250,177,32,0.2)' }}>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--accent)' }}>Interne opombe (vidno samo adminu)</label>
            <textarea value={form.admin_notes} onChange={f('admin_notes')} rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }} />
          </div>

          {app.cv_url && (
            <a href={app.cv_url} target="_blank" rel="noreferrer"
              className="font-condensed text-xs font-bold tracking-widest uppercase flex items-center gap-2"
              style={{ color: 'var(--accent)' }}>
              ↗ OGLED CV-ja
            </a>
          )}

          <button onClick={save} disabled={saving}
            className="btn-primary w-full"
            style={{ opacity: saving ? 0.6 : 1 }}>
            {saved ? '✓ SHRANJENO' : saving ? 'SHRANJUJEM...' : 'SHRANI SPREMEMBE'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main PrijaveTab ───────────────────────────────────────────────────
export default function PrijaveTab() {
  const [data, setData] = useState({ applications: [], total: 0 })
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('submitted_at')
  const [order, setOrder] = useState('DESC')
  const [selected, setSelected] = useState([])
  const [detail, setDetail] = useState(null)
  const [showStatusMgr, setShowStatusMgr] = useState(false)
  const [bulkStatus, setBulkStatus] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 25, sort, order })
    if (search) params.set('search', search)
    if (filterStatus) params.set('status', filterStatus)
    if (filterRole) params.set('role', filterRole)
    try {
      const { data: d } = await api.get(`/applications?${params}`)
      setData(d)
    } catch {} finally { setLoading(false) }
  }, [page, search, filterStatus, filterRole, sort, order])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    api.get('/applications/statuses/list').then(r => setStatuses(r.data)).catch(() => {})
  }, [])

  function toggleSort(col) {
    if (sort === col) setOrder(o => o === 'DESC' ? 'ASC' : 'DESC')
    else { setSort(col); setOrder('ASC') }
  }

  function toggleSelect(id) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  function selectAll() {
    if (selected.length === data.applications.length) setSelected([])
    else setSelected(data.applications.map(a => a.id))
  }

  async function bulkAction(action) {
    if (!selected.length) return
    const body = { ids: selected, action }
    if (action === 'status') {
      if (!bulkStatus) return
      body.status_id = bulkStatus
    }
    await api.post('/applications/bulk', body)
    setSelected([])
    load()
  }

  async function deleteOne(id) {
    if (!confirm('Izbriši prijavo?')) return
    await api.delete(`/applications/${id}`)
    load()
  }

  const totalPages = Math.ceil(data.total / 25)

  function SortTh({ col, children }) {
    const active = sort === col
    return (
      <th className="text-left py-3 px-3 font-condensed text-xs font-bold tracking-widest uppercase cursor-pointer select-none whitespace-nowrap"
        style={{ color: active ? 'var(--accent)' : 'var(--gray)' }}
        onClick={() => toggleSort(col)}>
        {children} {active ? (order === 'ASC' ? '↑' : '↓') : ''}
      </th>
    )
  }

  return (
    <div>
      {detail && <DetailModal app={detail} statuses={statuses} onClose={() => setDetail(null)} onSaved={load} />}
      {showStatusMgr && <StatusManagerModal statuses={statuses} onClose={() => setShowStatusMgr(false)} onSaved={() => api.get('/applications/statuses/list').then(r => setStatuses(r.data))} />}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="section-label mb-1">Kadrovske prijave</div>
          <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>{data.total} prijav skupaj</div>
        </div>
        <button onClick={() => setShowStatusMgr(true)}
          className="font-condensed font-bold text-xs tracking-widest uppercase px-4 py-2 rounded-lg"
          style={{ background: 'var(--dark3)', color: 'var(--gray)', border: '1px solid var(--border)' }}>
          UPRAVLJAJ STATUSE
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Iskanje po imenu ali e-pošti…"
          className="px-3 py-2 rounded-lg text-sm outline-none flex-1 min-w-48"
          style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }} />
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-lg text-sm"
          style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}>
          <option value="">Vsi statusi</option>
          {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-lg text-sm"
          style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}>
          <option value="">Vse vloge</option>
          <option value="animator">Animator</option>
          <option value="trener">Trener</option>
          <option value="pomocnik_trenerja">Pomočnik trenerja</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-xl" style={{ background: 'rgba(250,177,32,0.08)', border: '1px solid rgba(250,177,32,0.2)' }}>
          <span className="font-condensed text-xs font-bold" style={{ color: 'var(--accent)' }}>{selected.length} izbranih</span>
          <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs"
            style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}>
            <option value="">Izberi status…</option>
            {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <button onClick={() => bulkAction('status')} disabled={!bulkStatus}
            className="font-condensed font-bold text-xs tracking-widest uppercase px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--accent)', color: 'var(--black)', opacity: bulkStatus ? 1 : 0.5 }}>
            NASTAVI STATUS
          </button>
          <button onClick={() => bulkAction('delete')}
            className="font-condensed font-bold text-xs tracking-widest uppercase px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
            IZBRIŠI
          </button>
          <button onClick={() => setSelected([])} className="font-condensed text-xs ml-auto" style={{ color: 'var(--gray)' }}>Prekliči</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full border-collapse" style={{ minWidth: '700px' }}>
          <thead>
            <tr style={{ background: 'var(--dark3)', borderBottom: '1px solid var(--border)' }}>
              <th className="w-10 py-3 px-3">
                <input type="checkbox" checked={selected.length === data.applications.length && data.applications.length > 0}
                  onChange={selectAll} />
              </th>
              <SortTh col="first_name">Ime</SortTh>
              <SortTh col="email">E-mail</SortTh>
              <th className="text-left py-3 px-3 font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>Vloga</th>
              <SortTh col="submitted_at">Datum</SortTh>
              <th className="text-left py-3 px-3 font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>Status</th>
              <th className="w-20 py-3 px-3" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="py-12 text-center font-condensed tracking-widest animate-pulse" style={{ color: 'var(--gray)' }}>NALAGAM...</td></tr>
            )}
            {!loading && data.applications.length === 0 && (
              <tr><td colSpan={7} className="py-12 text-center font-condensed" style={{ color: 'var(--gray)' }}>Ni prijav</td></tr>
            )}
            {!loading && data.applications.map((a, i) => (
              <tr key={a.id} className="cursor-pointer transition-colors"
                style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--dark3)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}>
                <td className="py-3 px-3" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggleSelect(a.id)} />
                </td>
                <td className="py-3 px-3" onClick={() => setDetail(a)}>
                  <span className="font-condensed font-bold text-sm" style={{ color: 'var(--white)' }}>
                    {a.first_name} {a.last_name}
                  </span>
                </td>
                <td className="py-3 px-3" onClick={() => setDetail(a)}>
                  <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>{a.email}</span>
                </td>
                <td className="py-3 px-3" onClick={() => setDetail(a)}>
                  <span className="font-condensed text-xs font-bold px-2 py-0.5 rounded"
                    style={{ background: 'var(--dark3)', color: 'var(--white)', border: '1px solid var(--border)' }}>
                    {ROLE_LABELS[a.desired_role] || a.desired_role}
                  </span>
                </td>
                <td className="py-3 px-3" onClick={() => setDetail(a)}>
                  <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>{fmtDate(a.submitted_at)}</span>
                </td>
                <td className="py-3 px-3" onClick={() => setDetail(a)}>
                  <StatusBadge status={a.status} />
                </td>
                <td className="py-3 px-3 text-right" onClick={e => e.stopPropagation()}>
                  <button onClick={() => deleteOne(a.id)} className="font-condensed text-xs" style={{ color: '#ef4444' }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>Stran {page} / {totalPages}</span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => setPage(p => p-1)}
              className="font-condensed font-bold text-xs px-3 py-2 rounded-lg"
              style={{ background: 'var(--dark3)', color: 'var(--gray)', opacity: page <= 1 ? 0.3 : 1 }}>←</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p+1)}
              className="font-condensed font-bold text-xs px-3 py-2 rounded-lg"
              style={{ background: 'var(--dark3)', color: 'var(--gray)', opacity: page >= totalPages ? 0.3 : 1 }}>→</button>
          </div>
        </div>
      )}
    </div>
  )
}
