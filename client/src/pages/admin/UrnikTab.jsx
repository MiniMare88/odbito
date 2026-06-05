import React, { useEffect, useState, useCallback } from 'react'
import api from '../../services/api.js'

// ── Helpers ───────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0') }
function fmtDate(d) {
  if (!d) return ''
  const dt = new Date(d + 'T12:00:00')
  return `${String(dt.getDate()).padStart(2,'0')}.${String(dt.getMonth()+1).padStart(2,'0')}.`
}
function fmtDateFull(d) {
  if (!d) return ''
  const dt = new Date(d + 'T12:00:00')
  return `${String(dt.getDate()).padStart(2,'0')}.${String(dt.getMonth()+1).padStart(2,'0')}.${dt.getFullYear()}`
}
function mondayOf(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const dow = d.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}
function addDays(isoDate, n) {
  const d = new Date(isoDate + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const DAY_NAMES_SHORT = ['Ned','Pon','Tor','Sre','Čet','Pet','Sob']
const AVAIL_COLORS = {
  available:   { bg: 'rgba(34,197,94,0.20)',   text: '#22c55e',  label: 'Razpoložljiv' },
  possible:    { bg: 'rgba(234,179,8,0.20)',    text: '#eab308',  label: 'Morda' },
  unavailable: { bg: 'rgba(239,68,68,0.18)',    text: '#ef4444',  label: 'Nedosegljiv' },
}
const STATUS_COLORS = {
  confirmed: { bg: 'rgba(59,130,246,0.25)', text: '#60a5fa', border: '#3b82f6' },
  pending:   { bg: 'rgba(250,177,32,0.18)', text: '#FAB120', border: '#FAB120' },
  rejected:  { bg: 'rgba(239,68,68,0.15)',  text: '#ef4444', border: '#ef4444' },
}
const DAY_STATUS_COLORS = {
  confirmed: '#22c55e',
  partial:   '#eab308',
  empty:     '#ef4444',
}

// ── Propose Block Modal ───────────────────────────────────────────────
function ProposeModal({ date, staff, preselectedStaff, onClose, onProposed }) {
  const [staffId, setStaffId] = useState(preselectedStaff || '')
  const [hourStart, setHourStart] = useState(9)
  const [hourEnd, setHourEnd] = useState(13)
  const [role, setRole] = useState('')
  const [segment, setSegment] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const dow = date ? new Date(date + 'T12:00:00').getDay() : 1
  const isOJ = dow === 0 || dow === 5 || dow === 6

  async function submit() {
    if (!staffId || hourStart >= hourEnd) { setError('Preveri polja'); return }
    setSaving(true); setError('')
    try {
      await api.post('/schedule/manager/propose', {
        staff_member_id: +staffId,
        date, hour_start: hourStart, hour_end: hourEnd,
        role: role || undefined,
        segment: segment || (isOJ ? 'open_jump' : 'akademija'),
        note: note || undefined,
      })
      onProposed()
      onClose()
    } catch(e) {
      setError(e.response?.data?.error || 'Napaka')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div className="font-condensed font-bold tracking-widest text-xs mb-4" style={{ color: 'var(--gray)' }}>
          PREDLOGI TERMINA · {fmtDateFull(date)}
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Zaposleni</label>
            <select value={staffId} onChange={e => setStaffId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}>
              <option value="">Izberi zaposlenega…</option>
              {staff.map(m => <option key={m.id} value={m.id}>{m.user.first_name} {m.user.last_name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Začetek</label>
              <select value={hourStart} onChange={e => setHourStart(+e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}>
                {Array.from({length:15},(_,i)=>i+8).map(h => <option key={h} value={h}>{pad(h)}:00</option>)}
              </select>
            </div>
            <div>
              <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Konec</label>
              <select value={hourEnd} onChange={e => setHourEnd(+e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}>
                {Array.from({length:15},(_,i)=>i+8).filter(h=>h>hourStart).map(h => <option key={h} value={h}>{pad(h)}:00</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Vloga</label>
              <select value={role} onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}>
                <option value="">— nedefinirano —</option>
                <option value="animator">Animator</option>
                <option value="trener">Trener</option>
                <option value="pomocnik_trenerja">Pomočnik trenerja</option>
              </select>
            </div>
            <div>
              <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Segment</label>
              <select value={segment} onChange={e => setSegment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }}>
                <option value="">— auto —</option>
                <option value="open_jump">Open Jump</option>
                <option value="akademija">Akademija</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Opomba (opcijsko)</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Npr. zamenjava za Marka…"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)' }} />
          </div>

          {error && <div className="font-condensed text-xs p-2 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{error}</div>}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={onClose} className="font-condensed font-bold text-xs tracking-widest uppercase py-2.5 rounded-lg"
              style={{ background: 'var(--dark3)', color: 'var(--gray)' }}>PREKLIČI</button>
            <button onClick={submit} disabled={saving}
              className="font-condensed font-bold text-xs tracking-widest uppercase py-2.5 rounded-lg"
              style={{ background: 'var(--accent)', color: 'var(--black)', opacity: saving ? 0.6 : 1 }}>
              {saving ? '...' : 'PREDLAGAJ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Day View ──────────────────────────────────────────────────────────
function DayView({ date, staff, onBack, onRefresh }) {
  const [dayData, setDayData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [proposeFor, setProposeFor] = useState(null) // staffMemberId for pre-select

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/schedule/manager/day?date=${date}`)
      setDayData(data)
    } catch {} finally { setLoading(false) }
  }, [date])

  useEffect(() => { load() }, [load])

  async function unlockBlock(id) {
    await api.patch(`/schedule/manager/proposals/${id}/unlock`)
    load()
  }
  async function deleteBlock(id) {
    if (!confirm('Izbriši predlog?')) return
    await api.delete(`/schedule/manager/proposals/${id}`)
    load()
  }

  if (loading) return <div className="py-16 text-center font-condensed animate-pulse" style={{ color: 'var(--gray)' }}>NALAGAM...</div>
  if (!dayData) return null

  const dow = new Date(date + 'T12:00:00').getDay()
  const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  // Group proposals for sidebar
  const confirmedProposals = dayData.proposals.filter(p => p.status === 'confirmed')
  const pendingProposals = dayData.proposals.filter(p => p.status === 'pending')
  const rejectedProposals = dayData.proposals.filter(p => p.status === 'rejected')

  return (
    <div>
      {proposeFor !== null && (
        <ProposeModal date={date} staff={staff} preselectedStaff={proposeFor}
          onClose={() => setProposeFor(null)} onProposed={() => { setProposeFor(null); load(); onRefresh() }} />
      )}

      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="font-condensed font-bold text-xs tracking-widest uppercase px-3 py-2 rounded-lg"
          style={{ background: 'var(--dark3)', color: 'var(--gray)' }}>← NAZAJ</button>
        <div>
          <div className="section-label">{dayLabel}</div>
        </div>
        <button onClick={() => setProposeFor('')} className="ml-auto font-condensed font-bold text-xs tracking-widest uppercase px-4 py-2 rounded-lg"
          style={{ background: 'var(--accent)', color: 'var(--black)' }}>
          + DODAJ TERMIN
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hour grid */}
        <div className="lg:col-span-2">
          <div className="section-label mb-3">Urna razpoložljivost osebja</div>
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full border-collapse" style={{ minWidth: '480px' }}>
              <thead>
                <tr style={{ background: 'var(--dark3)', borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left py-2 px-3 font-condensed text-xs tracking-widest w-16" style={{ color: 'var(--gray)' }}>URA</th>
                  {staff.map(m => (
                    <th key={m.id} className="text-center py-2 px-2 font-condensed text-xs" style={{ color: 'var(--white)' }}>
                      {m.user.first_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dayData.hourGrid.map((row, i) => (
                  <tr key={row.hour} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td className="py-2 px-3 font-condensed text-xs font-bold" style={{ color: 'var(--gray)' }}>{row.label}</td>
                    {staff.map(m => {
                      const avail = row.availability.find(a => a.staffMemberId === m.id)
                      const proposal = row.proposals.find(p => p.staffMemberId === m.id)
                      const ac = avail ? AVAIL_COLORS[avail.status] : null
                      const sc = proposal ? STATUS_COLORS[proposal.status] : null
                      return (
                        <td key={m.id} className="py-1 px-1 text-center">
                          {proposal ? (
                            <div className="rounded text-xs font-condensed font-bold px-1 py-1"
                              style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}44` }}>
                              {proposal.status === 'confirmed' ? '✓' : proposal.status === 'pending' ? '⏳' : '✗'}
                              {proposal.role && <span className="ml-1 opacity-70">{proposal.role.slice(0,3)}</span>}
                            </div>
                          ) : avail ? (
                            <div className="rounded text-xs font-condensed font-bold px-1 py-1"
                              style={{ background: ac.bg, color: ac.text }}>
                              {avail.status === 'available' ? '✓' : avail.status === 'possible' ? '?' : '✗'}
                            </div>
                          ) : (
                            <div className="rounded text-xs py-1" style={{ color: 'var(--dark3)', background: 'var(--dark3)' }}>—</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Proposals sidebar */}
        <div className="space-y-4">
          <div className="section-label mb-3">Predlagani termini</div>

          {[...confirmedProposals, ...pendingProposals, ...rejectedProposals].length === 0 && (
            <div className="text-center py-8 font-condensed text-xs" style={{ color: 'var(--gray)' }}>Ni predlogov za ta dan</div>
          )}

          {[
            { list: confirmedProposals, label: 'Potrjeno', color: '#60a5fa' },
            { list: pendingProposals,   label: 'Čaka na potrditev', color: '#FAB120' },
            { list: rejectedProposals,  label: 'Zavrnjeno', color: '#ef4444' },
          ].map(({ list, label, color }) => list.length > 0 && (
            <div key={label}>
              <div className="font-condensed text-xs font-bold tracking-widest uppercase mb-2" style={{ color }}>{label}</div>
              <div className="space-y-2">
                {list.map(p => {
                  const name = `${p.staffMember.user.first_name} ${p.staffMember.user.last_name}`
                  const sc = STATUS_COLORS[p.status]
                  return (
                    <div key={p.id} className="p-3 rounded-xl" style={{ background: sc.bg, border: `1px solid ${sc.border}33` }}>
                      <div className="font-condensed font-bold text-sm" style={{ color: 'var(--white)' }}>{name}</div>
                      <div className="font-condensed text-xs" style={{ color: sc.text }}>
                        {pad(p.hour_start)}:00 – {pad(p.hour_end)}:00
                        {p.role && ` · ${p.role}`}
                      </div>
                      {p.rejection_reason && (
                        <div className="font-condensed text-xs mt-1" style={{ color: '#ef4444' }}>"{p.rejection_reason}"</div>
                      )}
                      <div className="flex gap-2 mt-2">
                        {p.status === 'confirmed' && p.locked && (
                          <button onClick={() => unlockBlock(p.id)}
                            className="font-condensed text-xs tracking-widest uppercase px-2 py-1 rounded"
                            style={{ background: 'var(--dark3)', color: 'var(--gray)' }}>
                            ODKLENI
                          </button>
                        )}
                        {p.status !== 'confirmed' && (
                          <button onClick={() => deleteBlock(p.id)}
                            className="font-condensed text-xs tracking-widest uppercase px-2 py-1 rounded"
                            style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                            IZBRIŠI
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Quick assign per staff */}
          <div className="pt-2">
            <div className="font-condensed text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--gray)' }}>Hitro dodeli</div>
            <div className="space-y-1">
              {staff.map(m => (
                <button key={m.id} onClick={() => setProposeFor(m.id)}
                  className="w-full text-left px-3 py-2 rounded-lg font-condensed text-xs transition-all"
                  style={{ background: 'var(--dark3)', color: 'var(--white)', border: '1px solid var(--border)' }}>
                  + {m.user.first_name} {m.user.last_name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main UrnikTab ─────────────────────────────────────────────────────
export default function UrnikTab() {
  const [weekDate, setWeekDate] = useState(() => mondayOf(new Date().toISOString().split('T')[0]))
  const [weekData, setWeekData] = useState(null)
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [proposeModal, setProposeModal] = useState(false)

  const loadWeek = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/schedule/manager/week?date=${weekDate}`)
      setWeekData(data)
      setStaff(data.staff || [])
    } catch {} finally { setLoading(false) }
  }, [weekDate])

  useEffect(() => { loadWeek() }, [loadWeek])

  function prevWeek() { setWeekDate(d => addDays(d, -7)); setSelectedDay(null) }
  function nextWeek() { setWeekDate(d => addDays(d, 7));  setSelectedDay(null) }
  function goToday()  { setWeekDate(mondayOf(new Date().toISOString().split('T')[0])); setSelectedDay(null) }

  if (selectedDay) {
    return <DayView date={selectedDay} staff={staff} onBack={() => setSelectedDay(null)} onRefresh={loadWeek} />
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div>
      {proposeModal && (
        <ProposeModal date={todayStr} staff={staff} onClose={() => setProposeModal(false)}
          onProposed={() => { setProposeModal(false); loadWeek() }} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="section-label">Urnik osebja</div>
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="font-condensed font-bold text-xs px-3 py-2 rounded-lg"
            style={{ background: 'var(--dark3)', color: 'var(--gray)' }}>←</button>
          <button onClick={goToday} className="font-condensed font-bold text-xs tracking-widest uppercase px-3 py-2 rounded-lg"
            style={{ background: 'var(--dark3)', color: 'var(--gray)' }}>DANES</button>
          <button onClick={nextWeek} className="font-condensed font-bold text-xs px-3 py-2 rounded-lg"
            style={{ background: 'var(--dark3)', color: 'var(--gray)' }}>→</button>
          <button onClick={() => setProposeModal(true)} className="font-condensed font-bold text-xs tracking-widest uppercase px-4 py-2 rounded-lg"
            style={{ background: 'var(--accent)', color: 'var(--black)' }}>+ PREDLAGAJ TERMIN</button>
        </div>
      </div>

      {/* No staff warning */}
      {staff.length === 0 && !loading && (
        <div className="p-6 rounded-xl text-center mb-6" style={{ background: 'var(--dark3)', border: '1px solid var(--border)' }}>
          <div className="font-condensed font-bold mb-1" style={{ color: 'var(--white)' }}>Ni osebja</div>
          <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>Dodeli vlogo "staff" uporabniku v zavihku Uporabniki.</div>
        </div>
      )}

      {/* Week grid */}
      {loading && <div className="py-16 text-center font-condensed animate-pulse" style={{ color: 'var(--gray)' }}>NALAGAM...</div>}

      {!loading && weekData && (
        <div>
          {/* Week range */}
          <div className="font-condensed text-xs mb-4" style={{ color: 'var(--gray)' }}>
            {fmtDateFull(weekData.monday)} – {fmtDateFull(addDays(weekData.monday, 6))}
          </div>

          {/* 7-day overview cards */}
          <div className="grid grid-cols-7 gap-2 mb-8">
            {weekData.days.map(day => {
              const dow = new Date(day.date + 'T12:00:00').getDay()
              const isToday = day.date === todayStr
              const statusColor = DAY_STATUS_COLORS[day.status] || 'var(--dark3)'
              return (
                <button key={day.date} onClick={() => setSelectedDay(day.date)}
                  className="rounded-xl p-3 text-center transition-all"
                  style={{
                    background: isToday ? 'rgba(250,177,32,0.08)' : 'var(--dark3)',
                    border: `2px solid ${isToday ? 'var(--accent)' : 'var(--border)'}`,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = isToday ? 'var(--accent)' : 'var(--border)'}>
                  <div className="font-condensed text-xs font-bold mb-1"
                    style={{ color: isToday ? 'var(--accent)' : 'var(--gray)' }}>
                    {DAY_NAMES_SHORT[dow]}
                  </div>
                  <div className="font-condensed text-xs mb-2" style={{ color: 'var(--gray)' }}>{fmtDate(day.date)}</div>
                  {/* Status dot */}
                  <div className="w-3 h-3 rounded-full mx-auto" style={{ background: statusColor, opacity: day.isOJ || day.isAkademija ? 1 : 0.3 }} />
                  {day.proposalCount > 0 && (
                    <div className="font-condensed text-xs mt-1" style={{ color: 'var(--gray)' }}>{day.proposalCount}×</div>
                  )}
                  {!day.isOJ && !day.isAkademija && (
                    <div className="font-condensed" style={{ fontSize: '9px', color: 'var(--dark3)', marginTop: '2px' }}>PROST</div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Staff availability heatmap */}
          {staff.length > 0 && (
            <div>
              <div className="section-label mb-4">Razpoložljivost osebja ta teden</div>
              <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
                <table className="w-full border-collapse" style={{ minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: 'var(--dark3)', borderBottom: '1px solid var(--border)' }}>
                      <th className="text-left py-2 px-3 font-condensed text-xs tracking-widest w-36" style={{ color: 'var(--gray)' }}>ZAPOSLENI</th>
                      {weekData.days.map(day => {
                        const dow = new Date(day.date + 'T12:00:00').getDay()
                        return (
                          <th key={day.date} className="text-center py-2 px-2 font-condensed text-xs"
                            style={{ color: day.date === todayStr ? 'var(--accent)' : 'var(--gray)' }}>
                            {DAY_NAMES_SHORT[dow]}<br />
                            <span style={{ fontSize: '10px' }}>{fmtDate(day.date)}</span>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((m, mi) => (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--border)', background: mi % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                        <td className="py-2 px-3 font-condensed text-xs font-bold" style={{ color: 'var(--white)' }}>
                          {m.user.first_name} {m.user.last_name}
                          {m.primary_role && <div className="text-xs font-normal" style={{ color: 'var(--gray)' }}>{m.primary_role}</div>}
                        </td>
                        {weekData.days.map(day => {
                          const dayAvail = weekData.availability.filter(a => a.date === day.date && a.staff_member_id === m.id)
                          const dayProposals = weekData.proposals.filter(p => p.date === day.date && p.staff_member_id === m.id && p.status !== 'rejected')
                          const hasConfirmed = dayProposals.some(p => p.status === 'confirmed')
                          const hasPending   = dayProposals.some(p => p.status === 'pending')
                          const availCount = dayAvail.filter(a => a.status === 'available').length
                          const possibleCount = dayAvail.filter(a => a.status === 'possible').length

                          return (
                            <td key={day.date} className="py-2 px-2 text-center">
                              <button onClick={() => setSelectedDay(day.date)}
                                className="w-full rounded flex flex-col items-center justify-center gap-0.5 py-1 transition-all"
                                style={{ minHeight: '40px', background: hasConfirmed ? 'rgba(59,130,246,0.2)' : hasPending ? 'rgba(250,177,32,0.1)' : 'transparent', border: '1px solid transparent' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                                {hasConfirmed && <span style={{ color: '#60a5fa', fontSize: '12px' }}>✓</span>}
                                {hasPending && !hasConfirmed && <span style={{ color: '#FAB120', fontSize: '12px' }}>⏳</span>}
                                {availCount > 0 && <span style={{ color: '#22c55e', fontSize: '10px' }}>{availCount}h✓</span>}
                                {possibleCount > 0 && <span style={{ color: '#eab308', fontSize: '10px' }}>{possibleCount}h?</span>}
                                {!hasConfirmed && !hasPending && availCount === 0 && possibleCount === 0 && (
                                  <span style={{ color: 'var(--dark3)', fontSize: '10px' }}>—</span>
                                )}
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4">
                {[
                  ['✓ Potrjen termin', '#60a5fa'],
                  ['⏳ Čaka na potrditev', '#FAB120'],
                  ['✓h Razpoložljiv', '#22c55e'],
                  ['?h Morda', '#eab308'],
                ].map(([l, c]) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <span className="font-condensed text-xs" style={{ color: c }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
