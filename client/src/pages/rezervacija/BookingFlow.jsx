import React, { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../services/api.js'
import pricing from '../../data/pricing.json'

// ── Config (iz data/pricing.json) ────────────────────────────────────────────

const TICKETS = pricing.openJump.packages
  .filter(p => p.duration >= 60)
  .map(p => ({ min: p.duration, label: `Fun park ${p.duration} min`, price: p.price, id: p.id, popular: p.popular }))

const EXTRAS = [
  { id: 'socks', label: pricing.openJump.socks.label, icon: '🧦', price: pricing.openJump.socks.price },
]

// OPEN_HOURS se naloži dinamično iz API — privzete vrednosti za SSR/fallback
let OPEN_HOURS = {
  5: { open: 15, close: 20 },
  6: { open: 10, close: 21 },
  0: { open: 10, close: 20 },
}
// Naloži iz /api/park-schedule/weekly in posodobi OPEN_HOURS
api.get('/park-schedule/weekly').then(r => {
  const newHours = {}
  r.data.forEach(d => {
    if (d.is_open && d.open_time && d.close_time) {
      const [oh] = d.open_time.split(':').map(Number)
      const [ch] = d.close_time.split(':').map(Number)
      newHours[d.day_of_week] = { open: oh, close: ch, open_time: d.open_time, close_time: d.close_time }
    }
  })
  Object.assign(OPEN_HOURS, {})  // počisti
  Object.keys(OPEN_HOURS).forEach(k => delete OPEN_HOURS[k])
  Object.assign(OPEN_HOURS, newHours)
}).catch(() => {})

const CAPACITY = pricing.openJump.capacity
const MONTHS_SL   = ['jan','feb','mar','apr','maj','jun','jul','avg','sep','okt','nov','dec']
const MONTHS_FULL = ['januar','februar','marec','april','maj','junij','julij','avgust','september','oktober','november','december']
const DAYS_SHORT  = ['Ned','Pon','Tor','Sre','Čet','Pet','Sob']
const DAYS_FULL   = ['Nedelja','Ponedeljek','Torek','Sreda','Četrtek','Petek','Sobota']

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMondayOf(date) {
  const d = new Date(date)
  const dow = d.getDay()
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  d.setHours(0,0,0,0)
  return d
}
function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d
}
function isSameDay(a, b) {
  return a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
}
function fmtDate(date) {
  return `${date.getDate()}. ${MONTHS_FULL[date.getMonth()]} ${date.getFullYear()}`
}
function fmtTime(h, m = 0) {
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
}
function durationToPackageKey(min) {
  const pkg = pricing.openJump.packages.find(p => p.duration === min)
  return pkg ? pkg.id : pricing.openJump.packages[0].id
}
function getOccupancyInfo(booked) {
  if (booked >= 50) return { color:'#ef4444', bg:'rgba(239,68,68,0.08)', border:'rgba(239,68,68,0.25)', dot:'#ef4444', label:'Zadnja mesta!', short:'Zadnje!' }
  if (booked >= 45) return { color:'#f97316', bg:'rgba(249,115,22,0.08)', border:'rgba(249,115,22,0.25)', dot:'#f97316', label:'Skoraj polno!', short:'Skoraj' }
  if (booked >= 30) return { color:'#eab308', bg:'rgba(234,179,8,0.08)', border:'rgba(234,179,8,0.25)', dot:'#eab308', label:'Se polni — pohiti!', short:'Pohiti' }
  return { color:'#22c55e', bg:'rgba(34,197,94,0.08)', border:'rgba(34,197,94,0.2)', dot:'#22c55e', label:'Prosto', short:'Prosto' }
}
function getEarliestStartMin() {
  const now = new Date()
  const currentMin = now.getHours() * 60 + now.getMinutes()
  const nextSlot = Math.ceil(currentMin / 30) * 30
  return (nextSlot - currentMin) < 15 ? nextSlot + 30 : nextSlot
}
function generateSlots(date, durationMin) {
  const dow = date.getDay()
  const hours = OPEN_HOURS[dow]
  if (!hours) return []
  const today = new Date(); today.setHours(0,0,0,0)
  const earliestMin = isSameDay(date, today) ? getEarliestStartMin() : 0
  const slots = []
  for (let m = hours.open * 60; m < hours.close * 60; m += 30) {
    const endMin = m + durationMin
    if (endMin > hours.close * 60) break
    if (m < earliestMin) continue
    const startH = Math.floor(m / 60)
    const startMm = m % 60
    slots.push({ start: fmtTime(startH, startMm), end: fmtTime(Math.floor(endMin/60), endMin%60), booked: 0, available: CAPACITY })
  }
  return slots
}
function totalTickets(ticketQty) {
  return Object.values(ticketQty).reduce((s, v) => s + v, 0)
}
function maxDurationFromTickets(ticketQty) {
  let max = 60
  TICKETS.forEach((t, i) => { if ((ticketQty[i] || 0) > 0 && t.min > max) max = t.min })
  return max
}
function calcTicketsTotal(ticketQty) {
  return TICKETS.reduce((sum, t, i) => sum + t.price * (ticketQty[i] || 0), 0)
}
function calcExtrasTotal(extras) {
  return EXTRAS.reduce((sum, e) => {
    const item = extras[e.id]
    if (!item || item.haveOwn) return sum
    return sum + e.price * (item.qty || 0)
  }, 0)
}

// ── Back button (shared) ──────────────────────────────────────────────────────

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="font-condensed font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2 px-4 py-2 rounded-xl"
      style={{ color: 'var(--white)', background: 'var(--dark2)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--white)' }}>
      ← Nazaj
    </button>
  )
}

// Gumb "Naprej" — enak izgled kot BackBtn
function NextBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="font-condensed font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2 px-4 py-2 rounded-xl"
      style={{ color: 'var(--white)', background: 'var(--dark2)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--white)' }}>
      Naprej →
    </button>
  )
}

// ── Order Summary sidebar ─────────────────────────────────────────────────────

function OrderSummary({ day, slot, visitors, extras }) {
  const hasTickets = visitors && totalTickets(visitors.ticketQty) > 0
  const ticketsTotal = visitors ? calcTicketsTotal(visitors.ticketQty) : 0
  const extrasTotal = extras ? calcExtrasTotal(extras) : 0
  const total = ticketsTotal + extrasTotal

  return (
    <div className="rounded-2xl overflow-hidden sticky top-8"
      style={{ background: 'var(--dark2)', border: '1px solid var(--border)', minWidth: 240 }}>

      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(250,177,32,0.05)' }}>
        <div className="font-condensed font-black text-xs uppercase tracking-widest mb-0.5" style={{ color: 'var(--accent)' }}>
          Povzetek nakupa
        </div>
        {day ? (
          <div className="font-condensed font-bold text-sm" style={{ color: 'var(--white)' }}>
            {DAYS_SHORT[day.getDay()]}, {day.getDate()}. {MONTHS_SL[day.getMonth()]}
            {slot && <span style={{ color: 'var(--accent)' }}> · {slot.start}</span>}
          </div>
        ) : (
          <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>Ni izbranega datuma</div>
        )}
      </div>

      {/* Tickets */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="font-condensed text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gray)' }}>
          Vstopnice
        </div>
        {hasTickets ? (
          <div className="flex flex-col gap-2">
            {TICKETS.map((t, i) => {
              const qty = visitors.ticketQty[i] || 0
              if (qty === 0) return null
              return (
                <div key={t.min} className="flex justify-between items-baseline">
                  <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                    {qty}× {t.label}
                  </span>
                  <span className="font-condensed font-bold text-sm" style={{ color: 'var(--white)' }}>
                    {(t.price * qty).toFixed(2).replace('.', ',')} €
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="font-condensed text-xs" style={{ color: 'var(--border)' }}>—</div>
        )}
      </div>

      {/* Extras */}
      {extras && (
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="font-condensed text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gray)' }}>
            Dodatki
          </div>
          {EXTRAS.map(e => {
            const item = extras[e.id]
            if (!item || (item.qty === 0 && !item.haveOwn)) return (
              <div key={e.id} className="font-condensed text-xs" style={{ color: 'var(--border)' }}>—</div>
            )
            return (
              <div key={e.id} className="flex justify-between items-baseline mb-1">
                <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                  {e.icon} {item.haveOwn ? `${e.label} (imam)` : `${item.qty}× ${e.label}`}
                </span>
                <span className="font-condensed font-bold text-sm" style={{ color: item.haveOwn ? 'var(--gray)' : 'var(--white)' }}>
                  {item.haveOwn ? '—' : `${(e.price * item.qty).toFixed(2).replace('.', ',')} €`}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Visitors */}
      {visitors && (visitors.adults + visitors.kids + visitors.youngKids) > 0 && (
        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="font-condensed text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--gray)' }}>
            Obiskovalci
          </div>
          {visitors.adults > 0 && (
            <div className="flex justify-between">
              <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>Odrasli</span>
              <span className="font-condensed font-bold text-xs" style={{ color: 'var(--white)' }}>{visitors.adults}</span>
            </div>
          )}
          {visitors.kids > 0 && (
            <div className="flex justify-between">
              <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>Otroci</span>
              <span className="font-condensed font-bold text-xs" style={{ color: 'var(--white)' }}>{visitors.kids}</span>
            </div>
          )}
          {visitors.youngKids > 0 && (
            <div className="flex justify-between">
              <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>Mlajši otroci</span>
              <span className="font-condensed font-bold text-xs" style={{ color: 'var(--white)' }}>{visitors.youngKids}</span>
            </div>
          )}
        </div>
      )}

      {/* Total */}
      <div className="px-5 py-4" style={{ background: total > 0 ? 'rgba(250,177,32,0.06)' : 'transparent' }}>
        <div className="flex justify-between items-baseline">
          <span className="font-condensed font-black text-xs uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            Skupaj
          </span>
          <span className="font-display" style={{ fontSize: 28, color: total > 0 ? 'var(--accent)' : 'var(--border)' }}>
            {total.toFixed(2).replace('.', ',')} €
          </span>
        </div>
        {total === 0 && (
          <div className="font-condensed text-xs mt-1" style={{ color: 'var(--border)' }}>
            Izberi vstopnice za seštevek
          </div>
        )}
      </div>
    </div>
  )
}

// ── Step indicator ────────────────────────────────────────────────────────────

// Koraki — "Odbita želja" je samodejno opravljen (uporabnik pride z izbiro Open Jump)
const FLOW_STEPS = ['Odbita želja', 'Obiskovalci', 'Termin', 'Dodatno', 'Potrditev']
const STEP_INDEX = { visitors: 1, schedule: 2, extras: 3, auth: 4, confirm: 4 }

// Progress: 5 korakov × 20 %. "Odbita želja" je že opravljena → start na 20 %.
function progressPercent(step, purchased) {
  if (purchased) return 100
  const done = STEP_INDEX[step] ?? 1   // koliko korakov je za nami
  return done * 20
}

function ProgressMeter({ percent }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="font-condensed font-black text-xs uppercase tracking-widest" style={{ color: 'var(--gray)' }}>
          Do zaključka nakupa
        </span>
        <span className="font-display" style={{ fontSize: 22, color: 'var(--accent)', lineHeight: 1 }}>{percent}%</span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }}>
        <div className="h-full rounded-full" style={{ width: `${percent}%`, background: 'var(--accent)', transition: 'width 0.45s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 12px rgba(250,177,32,0.4)' }} />
      </div>
    </div>
  )
}

function StepIndicator({ step }) {
  const steps = FLOW_STEPS
  const current = STEP_INDEX[step] ?? 1
  return (
    <div className="flex items-center gap-1.5 mb-10">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-condensed font-bold text-sm flex-shrink-0"
              style={{ background: i <= current ? 'var(--accent)' : 'var(--dark2)', color: i <= current ? 'var(--black)' : 'var(--gray)' }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className="font-condensed text-xs font-bold tracking-wider uppercase hidden sm:block"
              style={{ color: i <= current ? 'var(--white)' : 'var(--gray)', whiteSpace: 'nowrap' }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-px" style={{ background: i < current ? 'var(--accent)' : 'var(--border)', minWidth: 8 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Qty button ────────────────────────────────────────────────────────────────

function QtyButton({ value, onChange, min = 0, max = 20 }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          background: value > min ? 'var(--dark2)' : 'transparent',
          border: `1px solid ${value > min ? 'var(--border)' : 'var(--dark2)'}`,
          color: value > min ? 'var(--white)' : 'var(--border)',
          cursor: value > min ? 'pointer' : 'not-allowed',
          fontSize: 20, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>−</button>
      <span className="font-display" style={{ fontSize: 28, minWidth: 24, textAlign: 'center', color: 'var(--white)' }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--dark2)', border: '1px solid var(--border)',
          color: 'var(--white)', cursor: 'pointer',
          fontSize: 20, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>+</button>
    </div>
  )
}

// ── STEP 2: Datum + termin (koledar + ure na isti strani) ──────────────────────

function ScheduleStep({ day, slot, visitors, onSelectDay, onSelectSlot, onBack, onConfirm }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const [weekStart, setWeekStart] = useState(() => getMondayOf(day || today))
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  const durationMin = maxDurationFromTickets(visitors.ticketQty)

  // ── Termini za izbrani dan ──
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState('')

  useEffect(() => {
    if (!day) { setSlots([]); setSlotsError(''); return }
    setSlotsLoading(true)
    setSlotsError('')
    const dateStr = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`
    api.get(`/openjump/slots?date=${dateStr}`)
      .then(r => {
        if (!r.data.open) { setSlotsError(r.data.reason || 'Park zaprt'); setSlots([]); return }
        const isToday = isSameDay(day, today)
        const earliestMin = isToday ? getEarliestStartMin() : 0
        const mapped = r.data.slots
          .filter(s => {
            const [sh, sm] = s.start.split(':').map(Number)
            const startM = sh * 60 + sm
            if (startM < earliestMin) return false
            const endM = startM + durationMin
            const dowHours = OPEN_HOURS[day.getDay()]
            if (!dowHours || endM > dowHours.close * 60) return false
            return true
          })
          .map(s => {
            const [sh, sm] = s.start.split(':').map(Number)
            const endM = sh * 60 + sm + durationMin
            const endH = Math.floor(endM / 60), endMm = endM % 60
            const booked = (s.capacity || 50) - s.available
            return { start: s.start, end: fmtTime(endH, endMm), booked, available: s.available }
          })
          .filter(s => {
            const [eh, em] = s.end.split(':').map(Number)
            const dowHours = OPEN_HOURS[day.getDay()]
            return !dowHours || (eh * 60 + em) <= dowHours.close * 60
          })
        setSlots(mapped)
      })
      .catch(() => setSlotsError('Napaka pri nalaganju terminov.'))
      .finally(() => setSlotsLoading(false))
  }, [day, durationMin])

  const weekLabel = (() => {
    const end = addDays(weekStart, 6)
    return `${weekStart.getDate()}. ${MONTHS_SL[weekStart.getMonth()]} – ${end.getDate()}. ${MONTHS_SL[end.getMonth()]} ${end.getFullYear()}`
  })()

  const isCurrentWeek = getMondayOf(today).getTime() === weekStart.getTime()

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <BackBtn onClick={onBack} />
        {day && slot && <NextBtn onClick={onConfirm} />}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <span className="font-condensed text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(250,177,32,0.1)', border: '1px solid rgba(250,177,32,0.25)', color: 'var(--accent)' }}>
          👥 {visitors.adults + visitors.kids + visitors.youngKids} oseb · {totalTickets(visitors.ticketQty)} vstopnic
        </span>
      </div>

      <h2 className="font-condensed font-black text-sm uppercase tracking-widest mb-1" style={{ color: 'var(--gray)' }}>Korak 3</h2>
      <h3 className="font-display leading-none mb-3" style={{ fontSize: 'clamp(32px,5vw,52px)', color: 'var(--white)' }}>
        NAJDI SVOJ TERMIN<span style={{ color: 'var(--accent)' }}>.</span>
      </h3>
      <p className="mb-8" style={{ color: 'var(--gray)', fontSize: '15px' }}>
        Open Jump je na voljo <strong style={{ color: 'var(--white)' }}>Pet 15:00–20:00</strong>,{' '}
        <strong style={{ color: 'var(--white)' }}>Sob 10:00–21:00</strong> in{' '}
        <strong style={{ color: 'var(--white)' }}>Ned 10:00–20:00</strong>.
      </p>

      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setWeekStart(w => addDays(w, -7))} disabled={isCurrentWeek}
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg"
          style={{ background: 'var(--dark2)', border: '1px solid var(--border)', color: isCurrentWeek ? 'var(--border)' : 'var(--white)', cursor: isCurrentWeek ? 'not-allowed' : 'pointer' }}>‹</button>
        <span className="font-condensed font-bold text-sm tracking-wide" style={{ color: 'var(--gray)' }}>{weekLabel}</span>
        <button onClick={() => setWeekStart(w => addDays(w, 7))}
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg"
          style={{ background: 'var(--dark2)', border: '1px solid var(--border)', color: 'var(--white)', cursor: 'pointer' }}>›</button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((d) => {
          const dow = d.getDay()
          const isOpen = !!OPEN_HOURS[dow]
          const isPast = d < today
          const isToday = isSameDay(d, today)
          const isSelected = isSameDay(d, day)
          const todaySlotsAvailable = isToday && isOpen ? generateSlots(d, 60).length > 0 : true
          const clickable = isOpen && !isPast && todaySlotsAvailable

          let dotColor = '#22c55e'
          if (isOpen && !isPast && todaySlotsAvailable) {
            const first = generateSlots(d, 60)[0]
            if (first) dotColor = getOccupancyInfo(first.booked).dot
          }

          const isPastClosed = (isPast && !isToday) || (isToday && !todaySlotsAvailable)
          const isAvailable = isOpen && !isPast && todaySlotsAvailable
          const hi = isToday || isSelected

          return (
            <button key={d.toISOString()} disabled={!clickable} onClick={() => clickable && onSelectDay(d)}
              style={{
                padding: '14px 6px', borderRadius: '14px',
                border: hi ? '2px solid var(--accent)' : isAvailable ? `2px solid ${dotColor}30` : '2px solid transparent',
                background: hi ? 'rgba(250,177,32,0.10)' : isAvailable ? `${dotColor}08` : 'var(--dark2)',
                cursor: clickable ? 'pointer' : 'not-allowed',
                opacity: isPastClosed ? 0.45 : 1,
                transition: 'all 0.15s', textAlign: 'center', position: 'relative',
                filter: isPastClosed ? 'grayscale(0.7)' : 'none',
              }}
              onMouseEnter={e => { if (clickable) { e.currentTarget.style.borderColor = hi ? 'var(--accent)' : dotColor; e.currentTarget.style.background = hi ? 'rgba(250,177,32,0.18)' : `${dotColor}15`; e.currentTarget.style.transform = 'translateY(-2px)' }}}
              onMouseLeave={e => { if (clickable) { e.currentTarget.style.borderColor = hi ? 'var(--accent)' : `${dotColor}30`; e.currentTarget.style.background = hi ? 'rgba(250,177,32,0.10)' : `${dotColor}08`; e.currentTarget.style.transform = 'none' }}}
            >
              {isToday && (
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 font-condensed font-black rounded-full px-1.5"
                  style={{ fontSize: '7px', background: 'var(--accent)', color: '#000', letterSpacing: '0.05em' }}>DANES</div>
              )}
              <div className="font-condensed font-bold mt-1" style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px', color: isPastClosed ? 'var(--border)' : isAvailable ? 'var(--gray)' : 'var(--border)' }}>
                {DAYS_SHORT[dow]}
              </div>
              <div className="font-display" style={{ fontSize: '24px', lineHeight: 1, color: isPastClosed ? '#555' : isAvailable ? 'var(--white)' : 'var(--border)' }}>
                {d.getDate()}
              </div>
              <div className="font-condensed mt-2" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em', color: isPastClosed ? '#444' : isAvailable ? dotColor : 'var(--border)' }}>
                {!isOpen ? 'VADBE' : isToday && !todaySlotsAvailable ? 'ZAPRTO' : fmtTime(OPEN_HOURS[dow].open)}
              </div>
              {isAvailable && <div className="w-1.5 h-1.5 rounded-full mx-auto mt-1.5" style={{ background: dotColor }} />}
            </button>
          )
        })}
      </div>

      <p className="font-condensed text-xs tracking-widest uppercase text-center mb-2" style={{ color: 'var(--border)' }}>
        Pon – Čet so rezervirani za vadbene ure (Odbita Akademija)
      </p>

      {/* ── Termini za izbrani dan ── */}
      {day && (
        <div className="mt-8 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
          <h3 className="font-condensed font-black text-sm uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>
            {DAYS_FULL[day.getDay()]}, {fmtDate(day)}
          </h3>
          <h4 className="font-display leading-none mb-6" style={{ fontSize: 'clamp(26px,4vw,40px)', color: 'var(--white)' }}>
            IZBERI URO<span style={{ color: 'var(--accent)' }}>.</span>
          </h4>

          <div className="flex flex-wrap items-center gap-4 mb-5">
            {[['#22c55e','Prosto'],['#eab308','Se polni'],['#f97316','Skoraj polno'],['#ef4444','Zadnja mesta']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                <span className="font-condensed text-xs font-bold" style={{ color: 'var(--gray)' }}>{l}</span>
              </div>
            ))}
          </div>

          {slotsLoading && (
            <div className="py-12 text-center font-condensed tracking-widest animate-pulse" style={{ color: 'var(--gray)' }}>NALAGAM TERMINE...</div>
          )}
          {!slotsLoading && slotsError && (
            <div className="rounded-xl px-5 py-4 mb-4 font-condensed font-bold text-sm" style={{ background: 'rgba(255,61,0,0.08)', border: '1px solid rgba(255,61,0,0.25)', color: '#FF3D00' }}>{slotsError}</div>
          )}
          {!slotsLoading && !slotsError && slots.length === 0 && (
            <div className="py-8 text-center font-condensed text-sm" style={{ color: 'var(--gray)' }}>Za ta dan ni več prostih terminov.</div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
            {slots.map((s) => {
              const info = getOccupancyInfo(s.booked)
              const isFull = s.available <= 0
              const isSelected = slot?.start === s.start
              return (
                <button key={s.start} disabled={isFull} onClick={() => onSelectSlot(isSelected ? null : s)}
                  style={{
                    padding: '16px 12px', borderRadius: '14px',
                    border: isSelected ? '2px solid var(--accent)' : `1px solid ${info.border}`,
                    background: isSelected ? 'rgba(250,177,32,0.12)' : info.bg,
                    cursor: isFull ? 'not-allowed' : 'pointer', opacity: isFull ? 0.35 : 1,
                    transition: 'all 0.15s', textAlign: 'center', position: 'relative',
                  }}>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                      <span style={{ fontSize: '9px', color: '#000', fontWeight: 900 }}>✓</span>
                    </div>
                  )}
                  <div className="font-display leading-none mb-1"
                    style={{ fontSize: '26px', color: isSelected ? 'var(--accent)' : isFull ? 'var(--gray)' : 'var(--white)', textDecoration: isFull ? 'line-through' : 'none' }}>
                    {s.start}
                  </div>
                  <div className="font-condensed text-xs mb-2" style={{ color: 'var(--gray)' }}>do {s.end}</div>
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: isFull ? 'var(--border)' : info.dot }} />
                    <span className="font-condensed font-bold" style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: isFull ? 'var(--border)' : isSelected ? 'var(--accent)' : info.color }}>
                      {isFull ? 'POLNO' : info.short}
                    </span>
                  </div>
                  {!isFull && (
                    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min((s.booked/CAPACITY)*100,100)}%`, background: info.dot }} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Nadaljuj ── */}
      <button disabled={!day || !slot} onClick={onConfirm}
        className="w-full font-condensed font-black uppercase tracking-widest rounded-xl py-4 mt-8 transition-all"
        style={{
          background: (day && slot) ? 'var(--accent)' : 'var(--dark2)',
          color: (day && slot) ? 'var(--black)' : 'var(--border)',
          border: `1px solid ${(day && slot) ? 'var(--accent)' : 'var(--border)'}`,
          cursor: (day && slot) ? 'pointer' : 'not-allowed', fontSize: '15px', letterSpacing: '0.12em',
          boxShadow: (day && slot) ? '0 4px 20px rgba(250,177,32,0.25)' : 'none',
        }}>
        {!day ? 'IZBERI DAN' : !slot ? 'IZBERI URO' : (
          <span className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1">
            <span>NAPREJ</span>
            <span style={{ opacity: 0.55 }}>→</span>
            <span style={{ color: '#fff' }}>{fmtDate(day)}</span>
            <span style={{ opacity: 0.55 }}>→</span>
            <span>{slot.start} – {slot.end}</span>
          </span>
        )}
      </button>
    </div>
  )
}

// ── STEP 2: Visitors + Tickets ────────────────────────────────────────────────

function VisitorsStep({ onBack, onNext, liveUpdate }) {
  const [adults, setAdults]       = useState(0)
  const [kids, setKids]           = useState(0)
  const [youngKids, setYoungKids] = useState(0)
  const [ticketQty, setTicketQty] = useState({})

  const totalVisitors = adults + kids + youngKids
  const totalT = totalTickets(ticketQty)
  const canContinue = totalVisitors >= 1 && totalT === totalVisitors

  function setQty(idx, val) {
    setTicketQty(q => ({ ...q, [idx]: Math.max(0, val) }))
  }

  useEffect(() => {
    liveUpdate({ adults, kids, youngKids, ticketQty })
  }, [adults, kids, youngKids, ticketQty])

  return (
    <div>
      {onBack && <BackBtn onClick={onBack} />}

      <h2 className="font-condensed font-black text-sm uppercase tracking-widest mb-1" style={{ color: 'var(--gray)' }}>Korak 2</h2>
      <h3 className="font-display leading-none mb-2" style={{ fontSize: 'clamp(32px,5vw,52px)', color: 'var(--white)' }}>
        KDO PRIDE NA OBISK<span style={{ color: 'var(--accent)' }}>?</span>
      </h3>
      <p className="mb-8" style={{ color: 'var(--gray)', fontSize: '14px' }}>Enkratni Odbit obisk — izberi obiskovalce in vstopnice.</p>

      <div className="flex flex-col gap-3 mb-4">
        {[
          { label: 'Odrasli',       sub: 'Starost: 15 ali starejši', val: adults,    set: setAdults },
          { label: 'Otroci',        sub: 'Starost: 6 ali starejši',  val: kids,      set: setKids },
          { label: 'Mlajši otroci', sub: 'Starost: 3 do 5 let',      val: youngKids, set: setYoungKids },
        ].map(({ label, sub, val, set }) => (
          <div key={label} className="rounded-xl px-5 py-4 flex items-center justify-between"
            style={{ background: 'var(--dark2)', border: `1px solid ${val > 0 ? 'rgba(250,177,32,0.3)' : 'var(--border)'}` }}>
            <div>
              <div className="font-condensed font-black text-base" style={{ color: 'var(--white)' }}>{label}</div>
              <div className="font-condensed text-xs mt-0.5" style={{ color: 'var(--gray)' }}>{sub}</div>
            </div>
            <QtyButton value={val} onChange={set} />
          </div>
        ))}
      </div>

      <div className="rounded-xl px-5 py-3 mb-8 flex items-center justify-between"
        style={{ background: totalVisitors > 0 ? 'rgba(250,177,32,0.06)' : 'var(--dark2)', border: `1px solid ${totalVisitors > 0 ? 'rgba(250,177,32,0.25)' : 'var(--border)'}` }}>
        <span className="font-condensed font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--gray)' }}>Pride nas:</span>
        <span className="font-display" style={{ fontSize: '32px', color: totalVisitors > 0 ? 'var(--accent)' : 'var(--border)' }}>{totalVisitors}</span>
      </div>

      {totalVisitors >= 1 && (
        <>
          <h4 className="font-condensed font-black text-sm uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>
            Katere vstopnice želite?
          </h4>
          {totalT > 0 && totalT !== totalVisitors && (
            <div className="rounded-lg px-4 py-2 mb-4 font-condensed text-xs font-bold tracking-wide"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
              ⚠ Skupaj vstopnic: {totalT} — skupaj obiskovalcev: {totalVisitors}. Količini se ne ujemata.
            </div>
          )}
          {totalT === 0 && (
            <p className="font-condensed text-xs mb-4" style={{ color: 'var(--gray)' }}>
              Izberi vstopnico za vsakega obiskovalca ({totalVisitors} {totalVisitors === 1 ? 'oseba' : totalVisitors < 5 ? 'osebe' : 'oseb'})
            </p>
          )}
          {totalT > 0 && totalT === totalVisitors && (
            <div className="rounded-lg px-4 py-2 mb-4 font-condensed text-xs font-bold tracking-wide"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}>
              ✓ Vstopnice se ujemajo ({totalT}/{totalVisitors})
            </div>
          )}

          <div className="flex flex-col gap-3 mb-8">
            {TICKETS.map((t, i) => {
              const qty = ticketQty[i] || 0
              return (
                <div key={t.min} className="rounded-xl px-5 py-4 flex items-center justify-between"
                  style={{ background: qty > 0 ? 'rgba(250,177,32,0.06)' : 'var(--dark2)', border: `1px solid ${qty > 0 ? 'rgba(250,177,32,0.3)' : 'var(--border)'}`, transition: 'all 0.15s' }}>
                  <div>
                    <div className="font-condensed font-black text-base" style={{ color: qty > 0 ? 'var(--accent)' : 'var(--white)' }}>{t.label}</div>
                    <div className="font-display" style={{ fontSize: '22px', color: qty > 0 ? 'var(--accent)' : 'var(--gray)' }}>
                      {t.price.toFixed(2).replace('.', ',')} €
                    </div>
                  </div>
                  <QtyButton value={qty} onChange={v => setQty(i, v)} />
                </div>
              )
            })}
          </div>

        </>
      )}

      <button disabled={!canContinue}
        onClick={() => onNext({ adults, kids, youngKids, ticketQty })}
        className="w-full font-condensed font-black uppercase tracking-widest rounded-xl py-4 transition-all"
        style={{
          background: canContinue ? 'var(--accent)' : 'var(--dark2)',
          color: canContinue ? 'var(--black)' : 'var(--border)',
          border: `1px solid ${canContinue ? 'var(--accent)' : 'var(--border)'}`,
          cursor: canContinue ? 'pointer' : 'not-allowed', fontSize: '15px', letterSpacing: '0.12em',
          boxShadow: canContinue ? '0 4px 20px rgba(250,177,32,0.25)' : 'none',
        }}>
        {totalVisitors < 1 ? 'DODAJ OBISKOVALCE' : totalT === 0 ? 'IZBERI VSTOPNICE' : totalT !== totalVisitors ? `VSTOPNIC: ${totalT} / OBISKOVALCEV: ${totalVisitors} — USKLADI` : `NAPREJ → ${totalT} vstopnic${totalT === 1 ? 'a' : totalT < 5 ? 'e' : ''}`}
      </button>
    </div>
  )
}

// ── STEP 4: Extras ────────────────────────────────────────────────────────────

function ExtrasStep({ day, slot, visitors, onBack, onNext, liveUpdate }) {
  const initExtras = () => Object.fromEntries(EXTRAS.map(e => [e.id, { qty: 0, haveOwn: false }]))
  const [extras, setExtras] = useState(initExtras)

  function setQty(id, val) {
    setExtras(prev => ({ ...prev, [id]: { ...prev[id], qty: Math.max(0, val), haveOwn: false } }))
  }
  function toggleOwn(id) {
    setExtras(prev => ({ ...prev, [id]: { qty: 0, haveOwn: !prev[id].haveOwn } }))
  }

  useEffect(() => { liveUpdate(extras) }, [extras])

  const dow = day.getDay()

  return (
    <div>
      <BackBtn onClick={onBack} />

      <div className="flex flex-wrap gap-2 mb-8">
        <span className="font-condensed text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(250,177,32,0.1)', border: '1px solid rgba(250,177,32,0.25)', color: 'var(--accent)' }}>
          📅 {DAYS_FULL[dow]}, {fmtDate(day)}
        </span>
        <span className="font-condensed text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(250,177,32,0.1)', border: '1px solid rgba(250,177,32,0.25)', color: 'var(--accent)' }}>
          ⏰ {slot.start} – {slot.end}
        </span>
      </div>

      <h2 className="font-condensed font-black text-sm uppercase tracking-widest mb-1" style={{ color: 'var(--gray)' }}>Korak 4</h2>
      <h3 className="font-display leading-none mb-3" style={{ fontSize: 'clamp(32px,5vw,52px)', color: 'var(--white)' }}>
        DODATNO<span style={{ color: 'var(--accent)' }}>.</span>
      </h3>
      <p className="mb-8" style={{ color: 'var(--gray)', fontSize: '14px' }}>
        Kupi opremo ali označi, da jo že imaš.
      </p>

      <div className="flex flex-col gap-4 mb-10">
        {EXTRAS.map(e => {
          const item = extras[e.id]
          return (
            <div key={e.id} className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${item.qty > 0 ? 'rgba(250,177,32,0.35)' : item.haveOwn ? 'rgba(34,197,94,0.35)' : 'var(--border)'}`, background: 'var(--dark2)', transition: 'all 0.15s' }}>

              {/* Top row */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 26 }}>{e.icon}</span>
                  <div>
                    <div className="font-condensed font-black text-base" style={{ color: item.haveOwn ? '#22c55e' : 'var(--white)' }}>
                      {e.label}
                    </div>
                    <div className="font-display" style={{ fontSize: '20px', color: item.haveOwn ? 'var(--gray)' : item.qty > 0 ? 'var(--accent)' : 'var(--gray)' }}>
                      {item.haveOwn ? 'že imam ✓' : `${e.price.toFixed(2).replace('.', ',')} € / kos`}
                    </div>
                  </div>
                </div>
                {!item.haveOwn && <QtyButton value={item.qty} onChange={v => setQty(e.id, v)} />}
              </div>

              {/* Že imam toggle */}
              <button onClick={() => toggleOwn(e.id)}
                className="w-full px-5 py-3 font-condensed font-bold text-xs uppercase tracking-widest text-left flex items-center gap-2"
                style={{
                  borderTop: '1px solid var(--border)', background: item.haveOwn ? 'rgba(34,197,94,0.08)' : 'transparent',
                  color: item.haveOwn ? '#22c55e' : 'var(--gray)', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 4, border: `2px solid ${item.haveOwn ? '#22c55e' : 'var(--border)'}`,
                  background: item.haveOwn ? '#22c55e' : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {item.haveOwn && <span style={{ fontSize: 10, color: '#000', fontWeight: 900 }}>✓</span>}
                </span>
                Že imam
              </button>
            </div>
          )
        })}
      </div>

      <button onClick={() => onNext(extras)}
        className="w-full font-condensed font-black uppercase tracking-widest rounded-xl py-4"
        style={{ background: 'var(--accent)', color: 'var(--black)', border: 'none', cursor: 'pointer', fontSize: '15px', letterSpacing: '0.12em', boxShadow: '0 4px 20px rgba(250,177,32,0.25)' }}>
        NAPREJ → NA NAKUP
      </button>
    </div>
  )
}

// ── Auth Gate ─────────────────────────────────────────────────────────────────

function AuthGate({ visitors, day, slot, extras, onBack, onContinue }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => { if (user) onContinue() }, [user])

  const bookingState = { from: '/rezervacija', bookingData: { visitors, day: day.toISOString(), slot, extras } }

  return (
    <div>
      <BackBtn onClick={onBack} />

      <div className="rounded-xl px-5 py-4 mb-8"
        style={{ background: 'rgba(250,177,32,0.08)', border: '1px solid rgba(250,177,32,0.25)' }}>
        <div className="font-condensed text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>🎯 Tvoj izbrani termin</div>
        <div className="font-condensed font-black text-base" style={{ color: 'var(--white)' }}>{DAYS_FULL[day.getDay()]}, {fmtDate(day)}</div>
        <div className="font-condensed font-bold text-sm mt-1" style={{ color: 'var(--gray)' }}>
          {slot.start} – {slot.end} · {visitors.adults + visitors.kids + visitors.youngKids} oseb · {totalTickets(visitors.ticketQty)} vstopnic
        </div>
        <div className="font-condensed text-xs mt-2" style={{ color: 'var(--gray)' }}>⏳ Termin je shranjen 10 minut med prijavo.</div>
      </div>

      <h3 className="font-display leading-none mb-3" style={{ fontSize: 'clamp(28px,4vw,44px)', color: 'var(--white)' }}>
        ŠE ZADNJI KORAK<span style={{ color: 'var(--accent)' }}>.</span>
      </h3>
      <p className="mb-8" style={{ color: 'var(--gray)', fontSize: '15px', lineHeight: 1.7 }}>
        Prijavi se ali ustvari brezplačen račun za dokončanje rezervacije.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <button onClick={() => navigate('/prijava', { state: bookingState })}
          className="rounded-2xl p-6 text-left"
          style={{ background: 'var(--accent)', border: 'none', cursor: 'pointer', transition: 'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(250,177,32,0.35)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
          <div className="font-condensed font-black text-xl uppercase tracking-wide mb-1" style={{ color: '#080A0E' }}>Prijava</div>
          <div className="font-condensed text-sm mb-4" style={{ color: 'rgba(8,10,14,0.6)' }}>Že imam račun</div>
          <div className="font-condensed font-black text-2xl" style={{ color: '#080A0E' }}>→</div>
        </button>
        <button onClick={() => navigate('/registracija', { state: bookingState })}
          className="rounded-2xl p-6 text-left"
          style={{ background: 'var(--dark2)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(250,177,32,0.4)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}>
          <div className="font-condensed font-black text-xl uppercase tracking-wide mb-1" style={{ color: 'var(--white)' }}>Registracija</div>
          <div className="font-condensed text-sm mb-4" style={{ color: 'var(--gray)' }}>Ustvari brezplačen račun</div>
          <div className="font-condensed font-black text-2xl" style={{ color: 'var(--accent)' }}>→</div>
        </button>
      </div>
    </div>
  )
}

// ── Confirm ───────────────────────────────────────────────────────────────────

function ConfirmStep({ visitors, day, slot, extras, onBack, onReset, onBooked }) {
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [bookingCode, setBookingCode] = useState('')
  const [bookError, setBookError] = useState('')

  // Discount code (popust)
  const [popustKoda, setPopustKoda] = useState('')
  const [discountInfo, setDiscountInfo] = useState(null) // { valid, percent, fixed }
  const [checkingDiscount, setCheckingDiscount] = useState(false)
  const [showPopust, setShowPopust] = useState(false)

  // Voucher (darilni bon)
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherInfo, setVoucherInfo] = useState(null) // { valid, remaining, denomination }
  const [checkingVoucher, setCheckingVoucher] = useState(false)
  const [showVoucher, setShowVoucher] = useState(false)

  // Balance
  const [balance, setBalance] = useState(0)
  const [useBalance, setUseBalance] = useState(false)

  const info = getOccupancyInfo(slot.booked)

  const totalPersons = visitors.adults + visitors.kids + visitors.youngKids
  const totalT = totalTickets(visitors.ticketQty)
  const ticketsTotal = calcTicketsTotal(visitors.ticketQty)
  const extrasTotal = calcExtrasTotal(extras)
  const baseTotal = ticketsTotal + extrasTotal

  // Price calculations
  let discountAmount = 0
  if (discountInfo?.valid) {
    if (discountInfo.percent) discountAmount = +(baseTotal * discountInfo.percent / 100).toFixed(2)
    else if (discountInfo.fixed) discountAmount = +Math.min(discountInfo.fixed, baseTotal).toFixed(2)
  }
  const afterDiscount = +(baseTotal - discountAmount).toFixed(2)

  const voucherUsed = voucherInfo?.valid ? +Math.min(voucherInfo.remaining, afterDiscount).toFixed(2) : 0
  const afterVoucher = +(afterDiscount - voucherUsed).toFixed(2)

  const balanceUsed = useBalance ? +Math.min(balance, afterVoucher).toFixed(2) : 0
  const totalPrice = +Math.max(0, afterVoucher - balanceUsed).toFixed(2)

  useEffect(() => {
    if (user) {
      api.get('/vouchers/balance').then(r => setBalance(r.data.balance || 0)).catch(() => {})
    }
  }, [user])

  // Auto-validate discount code with debounce
  useEffect(() => {
    const code = popustKoda.trim()
    if (!code) { setDiscountInfo(null); return }
    const timer = setTimeout(async () => {
      setCheckingDiscount(true)
      try {
        const { data } = await api.post('/openjump/validate-discount', { code })
        setDiscountInfo({ valid: true, percent: data.percent, fixed: data.fixed, code })
      } catch {
        setDiscountInfo({ valid: false, code })
      }
      setCheckingDiscount(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [popustKoda])

  // Auto-validate voucher code with debounce
  useEffect(() => {
    const code = voucherCode.trim()
    if (!code) { setVoucherInfo(null); return }
    const timer = setTimeout(async () => {
      setCheckingVoucher(true)
      try {
        const { data } = await api.post('/vouchers/validate-code', { code })
        setVoucherInfo({ valid: true, remaining: data.remaining, denomination: data.denomination, code })
      } catch (err) {
        setVoucherInfo({ valid: false, code, error: err.response?.data?.error || 'Koda ni veljavna' })
      }
      setCheckingVoucher(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [voucherCode])

  const handleBook = async () => {
    setSubmitting(true)
    setBookError('')
    try {
      const dateStr = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`
      const durationMin = maxDurationFromTickets(visitors.ticketQty)
      const { data } = await api.post('/openjump/book', {
        date: dateStr,
        start_time: slot.start,
        package_key: durationToPackageKey(durationMin),
        participants: totalT,
        discount_code: popustKoda.trim() || undefined,
        voucher_code: voucherInfo?.valid ? voucherCode.trim() : undefined,
        use_balance: useBalance && balance > 0,
      })
      setBookingCode(data.booking_code)
      setDone(true)
      onBooked?.()
    } catch (err) {
      setBookError(err.response?.data?.error || 'Rezervacija ni uspela. Prosimo poskusite znova.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) return (
    <div className="text-center py-8">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid #22c55e' }}>
        <span style={{ fontSize: '36px' }}>✓</span>
      </div>
      <h2 className="font-display mb-2 leading-none" style={{ fontSize: 'clamp(40px,7vw,64px)', color: 'var(--white)' }}>
        REZERVIRANO<span style={{ color: 'var(--accent)' }}>!</span>
      </h2>
      <p className="mb-8" style={{ color: 'var(--gray)' }}>Vidimo se {fmtDate(day)} ob {slot.start}.</p>
      <div className="rounded-2xl p-6 mb-8 text-left" style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }}>
        <div className="section-label mb-4">Koda rezervacije</div>
        <div className="font-display text-4xl mb-5" style={{ color: 'var(--accent)', letterSpacing: '0.1em' }}>
          {bookingCode ? bookingCode.split('-')[0].toUpperCase() : ''}
        </div>
        {[['Datum', fmtDate(day)],['Čas', `${slot.start} – ${slot.end}`],['Oseb', String(totalPersons)],['Vstopnic', String(totalT)],['Skupaj', `€${totalPrice.toFixed(2).replace('.', ',')}`]].map(([k,v]) => (
          <div key={k} className="flex justify-between py-3" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>{k}</span>
            <span className="font-condensed font-bold text-sm" style={{ color: 'var(--white)' }}>{v}</span>
          </div>
        ))}
      </div>
      <p className="text-sm mb-6" style={{ color: 'var(--gray)', lineHeight: 1.7 }}>📋 Plačilo na blagajni pri prihodu. Rezervacija velja 15 min po dogovorjeni uri.</p>

      {/* Voucher upsell */}
      <div className="rounded-2xl p-5 mb-8 text-left" style={{ background: 'rgba(250,177,32,0.06)', border: '1px solid rgba(250,177,32,0.2)' }}>
        <div className="flex items-start gap-4">
          <span style={{ fontSize: 28 }}>🎁</span>
          <div style={{ flex: 1 }}>
            <div className="font-condensed font-black text-sm uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>Podari izkušnjo prijatelju</div>
            <p className="text-xs mb-3" style={{ color: 'var(--gray)', lineHeight: 1.6 }}>Kupi darilno kartico in jo pošlji nekomu, ki si tudi zasluži skakati!</p>
            <Link to="/darilne-kartice"
              className="font-condensed font-black text-xs uppercase tracking-widest"
              style={{ background: 'var(--accent)', color: 'var(--black)', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', display: 'inline-block' }}>
              KUPI DARILNO KARTICO →
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button className="btn-secondary" onClick={onReset}>NOVA REZERVACIJA</button>
        <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>MOJ PROFIL →</Link>
      </div>
    </div>
  )

  return (
    <div>
      <BackBtn onClick={onBack} />
      <h2 className="font-condensed font-black text-sm uppercase tracking-widest mb-1" style={{ color: 'var(--gray)' }}>Korak 5</h2>
      <h3 className="font-display leading-none mb-8" style={{ fontSize: 'clamp(28px,4vw,44px)', color: 'var(--white)' }}>
        POTRDI<span style={{ color: 'var(--accent)' }}>.</span>
      </h3>

      {/* Voucher + Discount code inputs */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Darilni bon */}
        <div className="rounded-xl overflow-hidden"
          style={{ border: `1px solid ${voucherInfo?.valid ? 'rgba(52,211,153,0.4)' : voucherInfo?.valid === false ? 'rgba(248,113,113,0.4)' : showVoucher && voucherCode ? 'rgba(250,177,32,0.3)' : 'var(--border)'}`, background: 'var(--dark2)', transition: 'border-color 0.2s' }}>
          <div className="flex items-center">
            <button onClick={() => setShowVoucher(v => !v)}
              className="font-condensed font-bold text-sm tracking-wide flex items-center gap-2 px-5 py-3 flex-shrink-0"
              style={{ color: showVoucher ? 'var(--accent)' : 'var(--gray)', cursor: 'pointer', background: 'none', border: 'none', whiteSpace: 'nowrap' }}>
              {showVoucher ? '▾' : '▸'} 🎁 Imam darilni bon
            </button>
            {showVoucher && (
              <>
                <div style={{ width: 1, height: 20, background: 'var(--border)', flexShrink: 0 }} />
                <input
                  autoFocus
                  type="text"
                  value={voucherCode}
                  onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="ODBITO-XXXX-XXXX-XXXX-XXXX"
                  className="font-condensed font-bold text-sm flex-1 px-4 py-3"
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--white)', letterSpacing: '0.05em', minWidth: 0 }}
                />
                {checkingVoucher && <span className="px-4 font-condensed text-xs animate-pulse" style={{ color: 'var(--gray)' }}>…</span>}
                {!checkingVoucher && voucherInfo?.valid && <span className="px-4 font-condensed text-xs font-bold" style={{ color: '#34d399' }}>✓ €{voucherInfo.remaining.toFixed(2)}</span>}
                {!checkingVoucher && voucherInfo?.valid === false && <span className="px-4 font-condensed text-xs font-bold" style={{ color: '#f87171' }}>✗</span>}
              </>
            )}
          </div>
          {showVoucher && voucherInfo?.valid && (
            <div className="px-5 py-2 font-condensed text-xs" style={{ borderTop: '1px solid rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.05)', color: '#34d399' }}>
              Vrednost bona: €{voucherInfo.denomination.toFixed(2)} · Razpoložljivo: €{voucherInfo.remaining.toFixed(2)}
              {voucherInfo.remaining > afterDiscount && ` · Porabimo €${afterDiscount.toFixed(2)}, ostane €${(voucherInfo.remaining - afterDiscount).toFixed(2)} na bonu`}
            </div>
          )}
          {showVoucher && voucherInfo?.valid === false && (
            <div className="px-5 py-2 font-condensed text-xs" style={{ borderTop: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.05)', color: '#f87171' }}>
              {voucherInfo.error || 'Koda ni veljavna'}
            </div>
          )}
        </div>

        {/* Popust koda */}
        <div className="rounded-xl overflow-hidden"
          style={{ border: `1px solid ${discountInfo?.valid ? 'rgba(52,211,153,0.4)' : discountInfo?.valid === false ? 'rgba(248,113,113,0.4)' : showPopust && popustKoda ? 'rgba(250,177,32,0.3)' : 'var(--border)'}`, background: 'var(--dark2)', transition: 'border-color 0.2s' }}>
          <div className="flex items-center">
            <button onClick={() => setShowPopust(v => !v)}
              className="font-condensed font-bold text-sm tracking-wide flex items-center gap-2 px-5 py-3 flex-shrink-0"
              style={{ color: showPopust ? 'var(--accent)' : 'var(--gray)', cursor: 'pointer', background: 'none', border: 'none', whiteSpace: 'nowrap' }}>
              {showPopust ? '▾' : '▸'} 🏷 Imam kodo za popust
            </button>
            {showPopust && (
              <>
                <div style={{ width: 1, height: 20, background: 'var(--border)', flexShrink: 0 }} />
                <input
                  autoFocus
                  type="text"
                  value={popustKoda}
                  onChange={e => setPopustKoda(e.target.value.toUpperCase())}
                  placeholder="npr. POLETJE10"
                  className="font-condensed font-bold text-sm flex-1 px-4 py-3"
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--white)', letterSpacing: '0.08em', minWidth: 0 }}
                />
                {checkingDiscount && <span className="px-4 font-condensed text-xs animate-pulse" style={{ color: 'var(--gray)' }}>…</span>}
                {!checkingDiscount && discountInfo?.valid && (
                  <span className="px-4 font-condensed text-xs font-bold" style={{ color: '#34d399' }}>
                    ✓ {discountInfo.percent ? `-${discountInfo.percent}%` : `-€${discountInfo.fixed}`}
                  </span>
                )}
                {!checkingDiscount && discountInfo?.valid === false && <span className="px-4 font-condensed text-xs font-bold" style={{ color: '#f87171' }}>✗</span>}
              </>
            )}
          </div>
          {showPopust && discountInfo?.valid === false && (
            <div className="px-5 py-2 font-condensed text-xs" style={{ borderTop: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.05)', color: '#f87171' }}>
              Koda ni veljavna ali je potekla
            </div>
          )}
        </div>
      </div>

      {/* Order summary table */}
      <div className="rounded-2xl overflow-hidden mb-6" style={{ border: '1px solid var(--border)' }}>
        {[['Datum', fmtDate(day)],['Dan', DAYS_FULL[day.getDay()]],['Čas', `${slot.start} – ${slot.end}`]].map(([k,v]) => (
          <div key={k} className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--dark2)' }}>
            <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>{k}</span>
            <span className="font-condensed font-bold text-sm" style={{ color: 'var(--white)' }}>{v}</span>
          </div>
        ))}
        {TICKETS.map((t, i) => {
          const qty = visitors.ticketQty[i] || 0
          if (qty === 0) return null
          return (
            <div key={t.min} className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--dark2)' }}>
              <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>{qty}× {t.label}</span>
              <span className="font-condensed font-bold text-sm" style={{ color: 'var(--white)' }}>€{(t.price * qty).toFixed(2).replace('.', ',')}</span>
            </div>
          )
        })}
        {extras && EXTRAS.map(e => {
          const item = extras[e.id]
          if (!item || (item.qty === 0 && !item.haveOwn)) return null
          return (
            <div key={e.id} className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--dark2)' }}>
              <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>
                {e.icon} {item.haveOwn ? `${e.label} (imam)` : `${item.qty}× ${e.label}`}
              </span>
              <span className="font-condensed font-bold text-sm" style={{ color: item.haveOwn ? 'var(--gray)' : 'var(--white)' }}>
                {item.haveOwn ? '—' : `€${(e.price * item.qty).toFixed(2).replace('.', ',')}`}
              </span>
            </div>
          )
        })}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--dark2)' }}>
          <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>Zasedenost</span>
          <span className="flex items-center gap-2 font-condensed font-bold text-sm" style={{ color: info.color }}>
            <span className="w-2 h-2 rounded-full" style={{ background: info.dot }} />{info.label}
          </span>
        </div>
        {/* Discount code row */}
        {discountInfo?.valid && (
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(52,211,153,0.04)' }}>
            <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: '#34d399' }}>
              🏷 Popust {discountInfo.percent ? `(${discountInfo.percent}%)` : `(–€${discountInfo.fixed})`}
            </span>
            <span className="font-condensed font-bold text-sm" style={{ color: '#34d399' }}>
              –€{discountAmount.toFixed(2).replace('.', ',')}
            </span>
          </div>
        )}
        {/* Voucher row */}
        {voucherInfo?.valid && voucherUsed > 0 && (
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(52,211,153,0.04)' }}>
            <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: '#34d399' }}>
              🎁 Darilni bon
              {voucherInfo.remaining > afterDiscount && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> · ostane €{(voucherInfo.remaining - afterDiscount).toFixed(2)}</span>}
            </span>
            <span className="font-condensed font-bold text-sm" style={{ color: '#34d399' }}>
              –€{voucherUsed.toFixed(2).replace('.', ',')}
            </span>
          </div>
        )}
        {/* Balance row */}
        {balance > 0 && (
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--dark2)' }}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={useBalance} onChange={e => setUseBalance(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
              <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>
                Uporabi stanje (€{balance.toFixed(2)})
              </span>
            </label>
            <span className="font-condensed font-bold text-sm" style={{ color: useBalance ? '#34d399' : '#555' }}>
              {useBalance ? `–€${balanceUsed.toFixed(2).replace('.', ',')}` : '—'}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between px-6 py-5" style={{ background: 'rgba(250,177,32,0.06)' }}>
          <span className="font-condensed font-black text-sm tracking-widest uppercase" style={{ color: 'var(--accent)' }}>Skupaj</span>
          <span className="font-display text-4xl" style={{ color: 'var(--accent)' }}>€{totalPrice.toFixed(2).replace('.', ',')}</span>
        </div>
      </div>

      <div className="rounded-xl px-4 py-3 mb-8 text-sm" style={{ background: 'var(--dark2)', border: '1px solid var(--border)', color: 'var(--gray)', lineHeight: 1.65 }}>
        📋 Plačilo na blagajni pri prihodu. Rezervacija velja 15 minut po dogovorjeni uri.
      </div>

      {bookError && (
        <div className="rounded-xl px-4 py-3 mb-4 font-condensed font-bold text-xs" style={{ background: 'rgba(255,61,0,0.08)', border: '1px solid rgba(255,61,0,0.25)', color: '#FF3D00' }}>
          {bookError}
        </div>
      )}

      <button onClick={handleBook} disabled={submitting}
        className="w-full font-condensed font-black uppercase tracking-widest rounded-xl py-4"
        style={{ background: 'var(--accent)', color: 'var(--black)', border: 'none', cursor: submitting ? 'wait' : 'pointer', fontSize: '15px', letterSpacing: '0.12em', opacity: submitting ? 0.7 : 1, boxShadow: '0 4px 24px rgba(250,177,32,0.3)', transition: 'all 0.2s' }}>
        {submitting ? 'POTRJUJEM...' : `REZERVIRAJ ${slot.start} · €${totalPrice.toFixed(2).replace('.', ',')}`}
      </button>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function BookingFlow() {
  const { user } = useAuth()
  const [step, setStep] = useState('visitors')
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedVisitors, setSelectedVisitors] = useState(null)
  const [liveVisitors, setLiveVisitors] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedExtras, setSelectedExtras] = useState(null)
  const [liveExtras, setLiveExtras] = useState(null)
  const [purchased, setPurchased] = useState(false)

  const reset = () => {
    setStep('visitors')
    setSelectedDay(null); setSelectedVisitors(null); setLiveVisitors(null)
    setSelectedSlot(null); setSelectedExtras(null); setLiveExtras(null)
    setPurchased(false)
  }

  useEffect(() => { if (user && step === 'auth') setStep('confirm') }, [user])

  // Ob vsakem koraku skoči na vrh strani (da ni treba scrollati gor)
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [step])

  const showSidebar = step !== 'visitors'
  const percent = progressPercent(step, purchased)

  // For the sidebar, use live state during input, confirmed state otherwise
  const sidebarVisitors = liveVisitors || selectedVisitors
  const sidebarExtras = liveExtras || selectedExtras

  return (
    <div className="min-h-[calc(100vh-64px)] px-[5%] py-16" style={{ background: 'var(--black)' }}>
      <div style={{ maxWidth: showSidebar ? 960 : 640, margin: '0 auto' }}>

        <div className="mb-10">
          <div className="section-label mb-3">Open Jump</div>
          <h1 className="font-display leading-none" style={{ fontSize: 'clamp(48px,8vw,90px)', color: 'var(--white)' }}>
            REZERVACIJA<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
        </div>

        <ProgressMeter percent={percent} />
        <StepIndicator step={step} />

        <div className={showSidebar ? 'flex gap-8 items-start' : ''}>
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {step === 'visitors' && (
              <VisitorsStep
                onNext={(v) => { setSelectedVisitors(v); setLiveVisitors(v); setStep('schedule') }}
                liveUpdate={setLiveVisitors}
              />
            )}

            {step === 'schedule' && selectedVisitors && (
              <ScheduleStep
                day={selectedDay}
                slot={selectedSlot}
                visitors={selectedVisitors}
                onSelectDay={(d) => { setSelectedDay(d); setSelectedSlot(null) }}
                onSelectSlot={setSelectedSlot}
                onBack={() => setStep('visitors')}
                onConfirm={() => setStep('extras')}
              />
            )}

            {step === 'extras' && selectedDay && selectedVisitors && selectedSlot && (
              <ExtrasStep
                day={selectedDay}
                slot={selectedSlot}
                visitors={selectedVisitors}
                onBack={() => setStep('schedule')}
                onNext={(ex) => { setSelectedExtras(ex); setLiveExtras(ex); setStep(user ? 'confirm' : 'auth') }}
                liveUpdate={setLiveExtras}
              />
            )}

            {step === 'auth' && selectedDay && selectedVisitors && selectedSlot && (
              <AuthGate
                visitors={selectedVisitors}
                day={selectedDay}
                slot={selectedSlot}
                extras={selectedExtras}
                onBack={() => setStep('extras')}
                onContinue={() => setStep('confirm')}
              />
            )}

            {step === 'confirm' && selectedDay && selectedVisitors && selectedSlot && (
              <ConfirmStep
                visitors={selectedVisitors}
                day={selectedDay}
                slot={selectedSlot}
                extras={selectedExtras || {}}
                onBack={() => setStep('extras')}
                onReset={reset}
                onBooked={() => setPurchased(true)}
              />
            )}
          </div>

          {/* Sidebar summary */}
          {showSidebar && (
            <div className="w-64 flex-shrink-0 hidden lg:block">
              <OrderSummary
                day={selectedDay}
                slot={selectedSlot}
                visitors={sidebarVisitors}
                extras={['extras','auth','confirm'].includes(step) ? sidebarExtras : null}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
