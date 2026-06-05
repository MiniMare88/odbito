import React, { useEffect, useState, useCallback } from 'react'
import api from '../../services/api.js'

// ── Helpers ───────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0') }
function mondayOf(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const dow = d.getDay()
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  return d.toISOString().split('T')[0]
}
function addDays(isoDate, n) {
  const d = new Date(isoDate + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}
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

const DAY_NAMES = ['Ned', 'Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob']

// Availability cycle: null → available → possible → unavailable → null
const AVAIL_CYCLE = [null, 'available', 'possible', 'unavailable']
const AVAIL_STYLE = {
  available:   { bg: 'rgba(34,197,94,0.22)',  border: '#22c55e', text: '#22c55e',  icon: '✓', label: 'Razpoložljiv' },
  possible:    { bg: 'rgba(234,179,8,0.20)',   border: '#eab308', text: '#eab308',  icon: '?', label: 'Morda' },
  unavailable: { bg: 'rgba(239,68,68,0.18)',   border: '#ef4444', text: '#ef4444',  icon: '✗', label: 'Nedosegljiv' },
  pending:     { bg: 'rgba(250,177,32,0.12)',  border: '#FAB120', text: '#FAB120',  icon: '⏳', label: 'Čaka na potrditev', pulse: true },
  confirmed:   { bg: 'rgba(59,130,246,0.22)',  border: '#3b82f6', text: '#60a5fa',  icon: '▪', label: 'Potrjen termin' },
}

// ── Notification Panel ────────────────────────────────────────────────
function NotificationPanel({ notifications, onRespond, onReadAll }) {
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function respond(proposalId, response) {
    setSubmitting(true)
    try {
      await api.post(`/schedule/my/proposals/${proposalId}/respond`, {
        response,
        rejection_reason: response === 'reject' ? rejectReason : undefined,
      })
      setRejectingId(null)
      setRejectReason('')
      onRespond()
    } finally { setSubmitting(false) }
  }

  const pending = notifications.filter(n => n.proposal?.status === 'pending')
  const others  = notifications.filter(n => n.proposal?.status !== 'pending' || !n.proposal)

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="section-label">Obvestila</div>
        {notifications.some(n => !n.read) && (
          <button onClick={onReadAll} className="font-condensed text-xs tracking-widest uppercase"
            style={{ color: 'var(--gray)' }}>OZNAČI VSE KOT PREBRANO</button>
        )}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-6 font-condensed text-xs" style={{ color: 'var(--gray)' }}>Ni novih obvestil</div>
      )}

      {/* Pending proposals — need action */}
      {pending.map(n => {
        const p = n.proposal
        const dateStr = p?.date ? new Date(p.date + 'T12:00:00').toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long' }) : ''
        return (
          <div key={n.id} className="p-4 rounded-xl mb-3"
            style={{ background: 'rgba(59,130,246,0.08)', border: '2px solid rgba(59,130,246,0.3)' }}>
            <div className="font-condensed font-bold text-sm mb-1" style={{ color: '#60a5fa' }}>
              Predlagan termin
            </div>
            <div className="font-condensed text-sm mb-3" style={{ color: 'var(--white)' }}>
              {dateStr} · {p ? `${pad(p.hour_start)}:00 – ${pad(p.hour_end)}:00` : ''}
            </div>

            {rejectingId === n.id ? (
              <div className="space-y-2">
                <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                  placeholder="Razlog zavrnitve…"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--dark3)', border: '1px solid #ef4444', color: 'var(--white)' }} />
                <div className="flex gap-2">
                  <button onClick={() => { setRejectingId(null); setRejectReason('') }}
                    className="flex-1 font-condensed font-bold text-xs tracking-widest uppercase py-2 rounded-lg"
                    style={{ background: 'var(--dark3)', color: 'var(--gray)' }}>NAZAJ</button>
                  <button onClick={() => respond(p.id, 'reject')} disabled={!rejectReason.trim() || submitting}
                    className="flex-1 font-condensed font-bold text-xs tracking-widest uppercase py-2 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', opacity: (!rejectReason.trim() || submitting) ? 0.5 : 1 }}>
                    POTRDI ZAVRNITEV
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => respond(p.id, 'confirm')} disabled={submitting}
                  className="flex-1 font-condensed font-bold text-xs tracking-widest uppercase py-2.5 rounded-lg"
                  style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                  ✓ POTRJUJEM
                </button>
                <button onClick={() => setRejectingId(n.id)} disabled={submitting}
                  className="flex-1 font-condensed font-bold text-xs tracking-widest uppercase py-2.5 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                  ✗ ZAVRNEM
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* Other notifications */}
      {others.slice(0, 10).map(n => (
        <div key={n.id} className="flex items-start gap-3 py-2.5 px-3 rounded-lg mb-1"
          style={{ background: n.read ? 'transparent' : 'rgba(250,177,32,0.05)', border: '1px solid var(--border)' }}>
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
            style={{ background: n.read ? 'var(--dark3)' : 'var(--accent)' }} />
          <div>
            <div className="font-condensed text-xs" style={{ color: 'var(--white)' }}>{n.message}</div>
            <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
              {new Date(n.created_at).toLocaleDateString('sl-SI')}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Hour Cell ─────────────────────────────────────────────────────────
function HourCell({ hour, avail, proposal, locked, onToggle }) {
  // Determine visual state
  let style, icon, label, clickable = true

  if (proposal?.status === 'confirmed' || locked) {
    style = AVAIL_STYLE.confirmed
    icon = style.icon; label = style.label; clickable = false
  } else if (proposal?.status === 'pending') {
    style = AVAIL_STYLE.pending
    icon = style.icon; label = style.label; clickable = false
  } else if (avail) {
    style = AVAIL_STYLE[avail]
    icon = style.icon; label = style.label
  } else {
    style = null; icon = ''; label = 'Ni označeno'
  }

  return (
    <button
      onClick={clickable ? onToggle : undefined}
      className="w-full rounded-lg flex items-center justify-center font-condensed font-bold text-xs transition-all select-none"
      style={{
        height: '36px',
        background: style ? style.bg : 'var(--dark3)',
        border: `1px solid ${style ? style.border : 'var(--border)'}`,
        color: style ? style.text : 'var(--gray)',
        cursor: clickable ? 'pointer' : 'default',
        animation: proposal?.status === 'pending' ? 'pulse 2s infinite' : 'none',
        opacity: (!style && !clickable) ? 0.4 : 1,
      }}
      title={label}>
      {icon}
    </button>
  )
}

// ── Week View ─────────────────────────────────────────────────────────
function WeekView({ monday, grid, proposals, onToggleAvail }) {
  const hours = Array.from({ length: 15 }, (_, i) => i + 8)
  const days = grid.map(d => d.date)
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full border-collapse" style={{ minWidth: '520px' }}>
        <thead>
          <tr style={{ background: 'var(--dark3)', borderBottom: '1px solid var(--border)' }}>
            <th className="w-14 py-2 px-2" />
            {grid.map(day => {
              const dow = new Date(day.date + 'T12:00:00').getDay()
              const isToday = day.date === todayStr
              return (
                <th key={day.date} className="py-2 px-2 text-center font-condensed text-xs"
                  style={{ color: isToday ? 'var(--accent)' : 'var(--gray)' }}>
                  {DAY_NAMES[dow]}<br />
                  <span style={{ fontSize: '10px' }}>{fmtDate(day.date)}</span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {hours.map((h, hi) => (
            <tr key={h} style={{ borderBottom: '1px solid var(--border)', background: hi % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
              <td className="py-1 px-2 font-condensed text-xs font-bold text-right" style={{ color: 'var(--gray)' }}>
                {pad(h)}:00
              </td>
              {grid.map(day => {
                const slot = day.hours.find(s => s.hour === h)
                const proposal = slot?.proposal
                const isLocked = proposal?.locked && proposal?.status === 'confirmed'
                return (
                  <td key={day.date} className="py-1 px-1">
                    <HourCell
                      hour={h}
                      avail={slot?.availability}
                      proposal={proposal}
                      locked={isLocked}
                      onToggle={() => onToggleAvail(day.date, h, slot?.availability)}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Month View ────────────────────────────────────────────────────────
function MonthView({ year, month, weekData, onDayClick, selectedDay }) {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDow = new Date(`${year}-${String(month).padStart(2,'0')}-01T12:00:00`).getDay()
  const offset = firstDow === 0 ? 6 : firstDow - 1
  const cells = Array(offset).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  const rows = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i+7))

  function daySummary(day) {
    if (!day || !weekData) return null
    const iso = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    // We don't have month-level data, just week-level — show available hours count
    const dayGrid = weekData.grid.find(g => g.date === iso)
    if (!dayGrid) return { type: 'no_data' }
    const confirmedHours = dayGrid.hours.filter(h => h.proposal?.status === 'confirmed').length
    const pendingHours   = dayGrid.hours.filter(h => h.proposal?.status === 'pending').length
    const availHours     = dayGrid.hours.filter(h => h.availability === 'available').length
    const possibleHours  = dayGrid.hours.filter(h => h.availability === 'possible').length
    return { iso, confirmedHours, pendingHours, availHours, possibleHours }
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth: '360px' }}>
        <thead>
          <tr>
            {['Pon','Tor','Sre','Čet','Pet','Sob','Ned'].map(d => (
              <th key={d} className="font-condensed text-xs tracking-widest uppercase pb-2 text-center" style={{ color: 'var(--gray)' }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((day, ci) => {
                if (!day) return <td key={ci} className="p-1" />
                const iso = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                const sum = daySummary(day)
                const isToday = iso === todayStr
                const isSelected = iso === selectedDay
                return (
                  <td key={ci} className="p-1">
                    <button onClick={() => onDayClick(iso)}
                      className="w-full rounded-xl p-2 text-center transition-all"
                      style={{
                        background: isSelected ? 'rgba(250,177,32,0.12)' : 'var(--dark3)',
                        border: `2px solid ${isToday ? 'var(--accent)' : isSelected ? 'var(--accent)' : 'var(--border)'}`,
                        minHeight: '64px',
                      }}>
                      <div className="font-condensed text-xs font-bold mb-1"
                        style={{ color: isToday ? 'var(--accent)' : 'var(--gray)' }}>{day}</div>
                      {sum && sum.type !== 'no_data' && (
                        <div className="space-y-0.5">
                          {sum.confirmedHours > 0 && (
                            <div className="font-condensed" style={{ fontSize: '10px', color: '#60a5fa' }}>{sum.confirmedHours}h ▪</div>
                          )}
                          {sum.pendingHours > 0 && (
                            <div className="font-condensed" style={{ fontSize: '10px', color: '#FAB120' }}>{sum.pendingHours}h ⏳</div>
                          )}
                          {sum.availHours > 0 && (
                            <div className="font-condensed" style={{ fontSize: '10px', color: '#22c55e' }}>{sum.availHours}h ✓</div>
                          )}
                        </div>
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
  )
}

// ── Main MojUrnik ─────────────────────────────────────────────────────
export default function MojUrnik() {
  const [viewMode, setViewMode] = useState('week') // 'week' | 'month'
  const [weekDate, setWeekDate] = useState(() => mondayOf(new Date().toISOString().split('T')[0]))
  const [weekData, setWeekData] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [selectedMonthDay, setSelectedMonthDay] = useState(null)
  const today = new Date()
  const [monthYear, setMonthYear] = useState(today.getFullYear())
  const [monthMonth, setMonthMonth] = useState(today.getMonth() + 1)

  const loadWeek = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/schedule/my/week?date=${weekDate}`)
      setWeekData(data)
    } catch {} finally { setLoading(false) }
  }, [weekDate])

  const loadNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/schedule/my/notifications')
      setNotifications(data.notifications)
      setUnread(data.unread)
    } catch {}
  }, [])

  useEffect(() => { loadWeek(); loadNotifications() }, [loadWeek, loadNotifications])

  async function toggleAvail(date, hour, current) {
    const idx = AVAIL_CYCLE.indexOf(current)
    const next = AVAIL_CYCLE[(idx + 1) % AVAIL_CYCLE.length]
    try {
      await api.put('/schedule/my/availability', { date, hour, status: next })
      loadWeek()
    } catch(e) {
      if (e.response?.status === 409 || e.response?.data?.results?.[0]?.error) {
        // Locked — ignore silently
      }
    }
  }

  async function markAllRead() {
    await api.patch('/schedule/my/notifications/read-all')
    loadNotifications()
  }

  function prevWeek() { setWeekDate(d => addDays(d, -7)) }
  function nextWeek() { setWeekDate(d => addDays(d, 7)) }
  function goToday()  { setWeekDate(mondayOf(new Date().toISOString().split('T')[0])) }

  const mondayDate = weekDate
  const sundayDate = addDays(weekDate, 6)

  // Pending count for notification badge
  const pendingCount = notifications.filter(n => n.proposal?.status === 'pending').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="section-label mb-1">Moj urnik</div>
          <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>Označi svojo razpoložljivost</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button onClick={() => setShowNotifs(s => !s)}
            className="relative font-condensed font-bold text-xs tracking-widest uppercase px-3 py-2 rounded-lg"
            style={{ background: showNotifs ? 'var(--accent)' : 'var(--dark3)', color: showNotifs ? 'var(--black)' : 'var(--gray)' }}>
            🔔
            {(unread > 0 || pendingCount > 0) && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-condensed font-bold"
                style={{ background: '#ef4444', color: 'var(--white)', fontSize: '9px' }}>
                {pendingCount || unread}
              </span>
            )}
          </button>

          {/* View toggle */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--dark3)' }}>
            {[['week','TEDEN'],['month','MESEC']].map(([k,l]) => (
              <button key={k} onClick={() => setViewMode(k)}
                className="font-condensed font-bold text-xs tracking-widest uppercase px-3 py-1.5 rounded"
                style={{ background: viewMode === k ? 'var(--accent)' : 'transparent', color: viewMode === k ? 'var(--black)' : 'var(--gray)' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications panel */}
      {showNotifs && (
        <NotificationPanel
          notifications={notifications}
          onRespond={() => { loadWeek(); loadNotifications() }}
          onReadAll={() => { markAllRead() }}
        />
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-5">
        {Object.entries(AVAIL_STYLE).map(([k, s]) => (
          <div key={k} className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded flex items-center justify-center font-condensed font-bold text-xs"
              style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
              {s.icon}
            </div>
            <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Week navigation */}
      {viewMode === 'week' && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button onClick={prevWeek} className="font-condensed font-bold text-xs px-3 py-2 rounded-lg"
            style={{ background: 'var(--dark3)', color: 'var(--gray)' }}>←</button>
          <button onClick={goToday} className="font-condensed font-bold text-xs tracking-widest uppercase px-3 py-2 rounded-lg"
            style={{ background: 'var(--dark3)', color: 'var(--gray)' }}>DANES</button>
          <button onClick={nextWeek} className="font-condensed font-bold text-xs px-3 py-2 rounded-lg"
            style={{ background: 'var(--dark3)', color: 'var(--gray)' }}>→</button>
          <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
            {fmtDateFull(mondayDate)} – {fmtDateFull(sundayDate)}
          </span>
          {loading && <span className="font-condensed text-xs animate-pulse" style={{ color: 'var(--gray)' }}>...</span>}
        </div>
      )}

      {/* Month navigation */}
      {viewMode === 'month' && (
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => { if (monthMonth === 1) { setMonthYear(y=>y-1); setMonthMonth(12) } else setMonthMonth(m=>m-1) }}
            className="font-condensed font-bold text-xs px-3 py-2 rounded-lg"
            style={{ background: 'var(--dark3)', color: 'var(--gray)' }}>←</button>
          <span className="font-condensed font-bold text-sm flex-1 text-center"
            style={{ color: 'var(--white)' }}>
            {['Januar','Februar','Marec','April','Maj','Junij','Julij','Avgust','September','Oktober','November','December'][monthMonth-1]} {monthYear}
          </span>
          <button onClick={() => { if (monthMonth === 12) { setMonthYear(y=>y+1); setMonthMonth(1) } else setMonthMonth(m=>m+1) }}
            className="font-condensed font-bold text-xs px-3 py-2 rounded-lg"
            style={{ background: 'var(--dark3)', color: 'var(--gray)' }}>→</button>
        </div>
      )}

      {/* Views */}
      {viewMode === 'week' && weekData && (
        <WeekView
          monday={weekDate}
          grid={weekData.grid}
          proposals={weekData.proposals}
          onToggleAvail={toggleAvail}
        />
      )}

      {viewMode === 'month' && (
        <MonthView
          year={monthYear}
          month={monthMonth}
          weekData={weekData}
          onDayClick={(iso) => { setSelectedMonthDay(iso === selectedMonthDay ? null : iso); setWeekDate(mondayOf(iso)); setViewMode('week') }}
          selectedDay={selectedMonthDay}
        />
      )}

      {/* Click instruction */}
      <div className="mt-4 font-condensed text-xs text-center" style={{ color: 'var(--dark3)' }}>
        Klikni na uro da spremenite razpoložljivost · Zaklenjeni termini se ne morejo spremeniti
      </div>
    </div>
  )
}
