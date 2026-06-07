import React, { useState } from 'react'
import { Link } from 'react-router-dom'

// ── Data ─────────────────────────────────────────────────────────────

const DAYS = [
  { key: 'pon', label: 'PON', full: 'Ponedeljek' },
  { key: 'tor', label: 'TOR', full: 'Torek' },
  { key: 'sre', label: 'SRE', full: 'Sreda' },
  { key: 'cet', label: 'ČET', full: 'Četrtek' },
  { key: 'pet', label: 'PET', full: 'Petek' },
  { key: 'sob', label: 'SOB', full: 'Sobota' },
  { key: 'ned', label: 'NED', full: 'Nedelja' },
]

// ── Barve po programih ────────────────────────────────────────────────
const C = {
  motorika:   '#A8C8E8', // svetlo modra  — Osnovna motorika 3–4
  osnove:     '#6B9FD4', // modra         — Osnove gimnastike 4–6
  junior:     '#5A8FCA', // temnejša modra — Gimnastika Junior 6–8
  cicibani:   '#7BBFB8', // teal          — Gimnastika Cicibani 8–10
  g1113:      '#88C47C', // zelena        — Gimnastika 11–13
  advance:    '#E8A87B', // lososova      — Gimnastika advance 13–16
  advanceB:   '#6B9FD4', // modra         — Gimnastika advance 13–16 (B skupina)
  pro:        '#D47878', // rdeča-losos   — Gimnastika PRO 16+
  proB:       '#5A8FCA', // modra         — Gimnastika PRO 16+ (B skupina)
  akr:        '#E07878', // koralna       — AKR
  zab:        '#C87B7B', // rdeče-rjava   — ZAB
  wall:       '#909AAA', // siva          — WALL
  wallB:      '#7EC87E', // zelena        — WALL (B skupina)
}

const PON_GROUPS = [
  { name: 'Skupina 0.1', time: '15:00 – 15:30', color: C.motorika,  program: 'Osnovna motorika', age: '3–4 let' },
  { name: 'Skupina 0.2', time: '15:00 – 15:30', color: C.motorika,  program: 'Osnovna motorika', age: '3–4 let' },
  { name: 'Skupina 1.1', time: '17:00 – 17:30', color: C.osnove,    program: 'Osnove gimnastike', age: '4–6 let' },
  { name: 'Skupina 1.2', time: '17:00 – 17:30', color: C.osnove,    program: 'Osnove gimnastike', age: '4–6 let' },
  { name: 'Skupina 3.1', time: '17:30 – 18:00', color: C.cicibani,  program: 'Gimnastika Cicibani', age: '8–10 let' },
  { name: 'Skupina 3.2', time: '17:30 – 18:00', color: C.cicibani,  program: 'Gimnastika Cicibani', age: '8–10 let' },
  { name: 'Skupina 5.1', time: '19:00 – 19:30', color: C.g1113,     program: 'Gimnastika', age: '11–13 let' },
  { name: 'Skupina 5.2', time: '19:00 – 19:30', color: C.advance,   program: 'Gimnastika advance', age: '13–16 let' },
  { name: 'Skupina 5.3', time: '19:00 – 19:30', color: C.advanceB,  program: 'Gimnastika advance', age: '13–16 let' },
  { name: 'Skupina 7.1', time: '20:30 – 21:00', color: C.akr,       program: 'AKR', age: '' },
  { name: 'Skupina 7.2', time: '20:30 – 21:00', color: C.zab,       program: 'ZAB', age: '' },
  { name: 'Skupina 7.3', time: '20:30 – 21:00', color: C.wall,      program: 'WALL', age: '' },
]

const TOR_GROUPS = [
  { name: 'Skupina 2.1', time: '17:00 – 17:30', color: C.junior,    program: 'Gimnastika Junior', age: '6–8 let' },
  { name: 'Skupina 2.2', time: '17:00 – 17:30', color: C.junior,    program: 'Gimnastika Junior', age: '6–8 let' },
  { name: 'Skupina 4.1', time: '17:30 – 18:00', color: C.cicibani,  program: 'Gimnastika Cicibani', age: '8–10 let' },
  { name: 'Skupina 4.2', time: '17:30 – 18:00', color: C.g1113,     program: 'Gimnastika', age: '11–13 let' },
  { name: 'Skupina 6.1', time: '19:00 – 19:30', color: C.advance,   program: 'Gimnastika advance', age: '13–16 let' },
  { name: 'Skupina 6.2', time: '19:00 – 19:30', color: C.pro,       program: 'Gimnastika PRO', age: '16+' },
  { name: 'Skupina 6.3', time: '19:00 – 19:30', color: C.proB,      program: 'Gimnastika PRO', age: '16+' },
  { name: 'Skupina 8.1', time: '20:30 – 21:00', color: C.akr,       program: 'AKR', age: '' },
  { name: 'Skupina 8.2', time: '20:30 – 21:00', color: C.zab,       program: 'ZAB', age: '' },
  { name: 'Skupina 8.3', time: '20:30 – 21:00', color: C.wallB,     program: 'WALL', age: '' },
]

const PET_GROUPS = [
  { name: 'Skupina 6.3', time: '19:00 – 19:30', color: C.proB,   program: 'Gimnastika PRO', age: '16+' },
  { name: 'Skupina 7.1', time: '20:30 – 21:00', color: C.akr,    program: 'AKR', age: '' },
  { name: 'Skupina 7.2', time: '20:30 – 21:00', color: C.zab,    program: 'ZAB', age: '' },
]

const CLASS_GROUPS = {
  pon: PON_GROUPS,
  tor: TOR_GROUPS,
  sre: PON_GROUPS, // enako kot ponedeljek
  cet: TOR_GROUPS, // enako kot torek
  pet: PET_GROUPS,
}

const BLOCKS = [
  {
    type: 'akademija',
    label: 'ODBITA AKADEMIJA',
    sublabel: 'Vodene vadbe',
    color: '#fab120',
    textColor: '#080A0E',
    days: ['pon', 'tor', 'sre', 'cet'],
    startH: 15, startM: 0,
    endH: 21,   endM: 0,
    clickable: true,
  },
  {
    type: 'openjump',
    label: 'OPEN JUMP',
    sublabel: 'Prosto skakanje',
    color: '#2563a8',
    textColor: '#F5F5F0',
    link: '/rezervacija',
    days: ['pet'],
    startH: 10, startM: 0,
    endH: 20,   endM: 0,
    clickable: false,
  },
  {
    type: 'akademija',
    label: 'ODBITA AKADEMIJA',
    sublabel: 'Vodene vadbe',
    color: '#fab120',
    textColor: '#080A0E',
    days: ['pet'],
    startH: 19, startM: 0,
    endH: 21,   endM: 0,
    clickable: true,
  },
  {
    type: 'openjump',
    label: 'OPEN JUMP',
    sublabel: 'Prosto skakanje',
    color: '#2563a8',
    textColor: '#F5F5F0',
    link: '/rezervacija',
    days: ['sob'],
    startH: 10, startM: 0,
    endH: 21,   endM: 0,
    clickable: false,
  },
  {
    type: 'openjump',
    label: 'OPEN JUMP',
    sublabel: 'Prosto skakanje',
    color: '#2563a8',
    textColor: '#F5F5F0',
    link: '/rezervacija',
    days: ['ned'],
    startH: 10, startM: 0,
    endH: 20,   endM: 0,
    clickable: false,
  },
]

const DAY_START = 10
const DAY_END   = 21
const TOTAL_H   = DAY_END - DAY_START

function toPercent(h, m = 0) {
  return ((h - DAY_START + m / 60) / TOTAL_H) * 100
}

const HOUR_MARKS = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i)

// ── Detail Panel ──────────────────────────────────────────────────────

function DetailPanel({ dayKey, onClose }) {
  const day = DAYS.find(d => d.key === dayKey)
  const groups = CLASS_GROUPS[dayKey] || []

  return (
    <div
      className="mt-4 rounded-2xl overflow-hidden"
      style={{
        background: 'var(--dark2)',
        border: '2px solid rgba(250,177,32,0.4)',
        animation: 'slideDown 0.25s ease',
      }}
    >
      <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:none } }`}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(250,177,32,0.1)', borderBottom: '1px solid rgba(250,177,32,0.2)' }}>
        <div>
          <div className="section-label mb-0.5" style={{ marginBottom: 0 }}>Odbita Akademija</div>
          <h3 className="font-display text-2xl leading-none" style={{ color: 'var(--white)' }}>
            {day?.full?.toUpperCase()} — <span style={{ color: 'var(--accent)' }}>PROGRAMI</span>
          </h3>
        </div>
        <button onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center font-condensed font-black text-lg transition-all hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--gray)' }}>
          ✕
        </button>
      </div>

      {/* Groups grid — grouped by time slot */}
      <div className="p-5">
        {(() => {
          // group by time slot
          const slots = []
          const seen = {}
          groups.forEach(g => {
            if (!seen[g.time]) { seen[g.time] = []; slots.push(g.time) }
            seen[g.time].push(g)
          })
          return slots.map(time => (
            <div key={time} className="mb-4">
              <div className="font-condensed font-bold text-xs tracking-widest uppercase mb-2 flex items-center gap-2"
                style={{ color: 'var(--gray)' }}>
                <span style={{ color: 'var(--accent)' }}>⏱</span> {time}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {seen[time].map((g, i) => (
                  <div key={i} className="rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${g.color}50` }}>
                    <div className="px-3 py-2 flex items-center gap-2"
                      style={{ background: `${g.color}25` }}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: g.color }} />
                      <span className="font-condensed font-black text-xs uppercase tracking-wider" style={{ color: g.color }}>
                        {g.name}
                      </span>
                    </div>
                    <div className="px-3 py-2" style={{ background: 'var(--dark3)' }}>
                      <div className="font-condensed font-black text-xs uppercase tracking-wide mb-0.5" style={{ color: 'var(--white)' }}>
                        {g.program}
                      </div>
                      {g.age && (
                        <div className="badge" style={{ '--badge-dot': g.color, fontSize: '11px' }}>
                          {g.age}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        })()}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 flex gap-3">
        <Link to="/vadbe/prijava"
          className="btn-primary flex-1 text-center block"
          style={{ textDecoration: 'none' }}>
          PRIJAVI SE NA VADBO →
        </Link>
        <button onClick={onClose}
          className="btn-secondary px-5"
          style={{ flexShrink: 0 }}>
          ZAPRI
        </button>
      </div>
    </div>
  )
}

// ── Desktop Grid ──────────────────────────────────────────────────────

function DesktopSchedule({ selectedDay, onSelectDay }) {
  return (
    <div className="hidden lg:block">
      {/* Day headers */}
      <div className="grid mb-2" style={{ gridTemplateColumns: '52px repeat(7, 1fr)', gap: '4px' }}>
        <div />
        {DAYS.map(d => (
          <div key={d.key} className="text-center py-2 font-condensed font-black text-sm tracking-widest uppercase"
            style={{ color: selectedDay === d.key ? 'var(--accent)' : 'var(--gray)' }}>
            {d.label}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="grid" style={{ gridTemplateColumns: '52px repeat(7, 1fr)', gap: '4px' }}>
        {/* Hour axis */}
        <div className="relative" style={{ height: '520px' }}>
          {HOUR_MARKS.map(h => (
            <div key={h} className="absolute font-condensed font-bold"
              style={{ top: `${toPercent(h)}%`, right: '8px', color: 'var(--gray)', transform: 'translateY(-50%)', fontSize: '11px' }}>
              {h}:00
            </div>
          ))}
        </div>

        {/* Columns */}
        {DAYS.map(day => {
          const dayBlocks = BLOCKS.filter(b => b.days.includes(day.key))
          const isSelected = selectedDay === day.key
          const isAkademija = dayBlocks.some(b => b.type === 'akademija')

          return (
            <div key={day.key} className="relative rounded-xl overflow-hidden"
              style={{
                height: '520px',
                background: isSelected ? 'rgba(250,177,32,0.05)' : 'var(--dark2)',
                border: isSelected ? '1px solid rgba(250,177,32,0.4)' : '1px solid var(--border)',
                transition: 'all 0.2s',
              }}>

              {/* Hour lines */}
              {HOUR_MARKS.map(h => (
                <div key={h} className="absolute w-full" style={{
                  top: `${toPercent(h)}%`, height: '1px',
                  background: h % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)',
                }} />
              ))}

              {dayBlocks.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span style={{ color: 'rgba(255,255,255,0.08)', fontSize: '22px' }}>—</span>
                </div>
              )}

              {dayBlocks.map((block, i) => {
                const top = toPercent(block.startH, block.startM)
                const h = toPercent(block.endH, block.endM) - top
                const isClickable = block.clickable

                const inner = (
                  <div className="absolute left-1 right-1 rounded-lg flex flex-col justify-between p-2.5 group"
                    style={{
                      top: `${top}%`, height: `${h}%`,
                      background: isClickable && isSelected ? `${block.color}dd` : block.color,
                      cursor: isClickable ? 'pointer' : 'pointer',
                      boxShadow: isClickable && isSelected ? `0 0 0 3px rgba(255,255,255,0.3), 0 4px 20px ${block.color}60` : 'none',
                      zIndex: 1,
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.04)'
                      e.currentTarget.style.boxShadow = `0 6px 20px ${block.color}80`
                      e.currentTarget.style.zIndex = '3'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = isClickable && isSelected ? `0 0 0 3px rgba(255,255,255,0.3), 0 4px 20px ${block.color}60` : 'none'
                      e.currentTarget.style.zIndex = '1'
                    }}
                    onClick={isClickable ? () => onSelectDay(isSelected ? null : day.key) : undefined}
                  >
                    <div>
                      <div className="font-condensed font-black leading-tight"
                        style={{ color: block.textColor, fontSize: '11px', letterSpacing: '0.08em' }}>
                        {block.label}
                        {isClickable && (
                          <span className="ml-1 opacity-60" style={{ fontSize: '9px' }}>
                            {isSelected ? '▲' : '▼'}
                          </span>
                        )}
                      </div>
                      <div style={{ color: block.textColor, opacity: 0.7, fontSize: '9px', marginTop: '2px', fontFamily: 'Barlow Condensed, sans-serif' }}>
                        {block.sublabel}
                      </div>
                    </div>
                    <div className="font-condensed font-bold"
                      style={{ color: block.textColor, opacity: 0.85, fontSize: '10px' }}>
                      {String(block.startH).padStart(2,'0')}:{String(block.startM).padStart(2,'0')} – {String(block.endH).padStart(2,'0')}:{String(block.endM).padStart(2,'0')}
                    </div>

                    {/* Sub-group preview dots when akademija */}
                    {isClickable && CLASS_GROUPS[day.key]?.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {/* show unique colors only */}
                        {[...new Map(CLASS_GROUPS[day.key].map(g => [g.color, g])).values()].map((g, gi) => (
                          <div key={gi} className="w-1.5 h-1.5 rounded-full" style={{ background: g.color, opacity: 0.9 }} />
                        ))}
                      </div>
                    )}
                  </div>
                )

                return isClickable ? (
                  <div key={i}>{inner}</div>
                ) : (
                  <Link key={i} to={block.link || '/rezervacija'} style={{ textDecoration: 'none' }}>
                    {inner}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 justify-center flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: '#fab120' }} />
          <span className="font-condensed text-xs">
            <span className="font-black uppercase tracking-wide" style={{ color: '#fab120' }}>Odbita Akademija —</span>{' '}
            <span className="font-black uppercase tracking-wide" style={{ color: 'var(--gray)' }}>Pon–Čet</span>{' '}
            <span className="font-normal" style={{ color: 'var(--gray)', textTransform: 'none', letterSpacing: 0 }}>(klikni na blok za programe)</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: '#2563a8' }} />
          <span className="font-condensed text-xs">
            <span className="font-black uppercase tracking-wide" style={{ color: '#4a9eff' }}>Open Jump —</span>{' '}
            <span className="font-black uppercase tracking-wide" style={{ color: 'var(--gray)' }}>Pet–Ned</span>{' '}
            <span className="font-normal" style={{ color: 'var(--gray)', textTransform: 'none', letterSpacing: 0 }}>(klikni na blok za rezervacijo)</span>
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Mobile ────────────────────────────────────────────────────────────

function MobileSchedule({ selectedDay, onSelectDay }) {
  const MOBILE_ROWS = [
    { days: 'Pon – Čet', keys: ['pon', 'tor', 'sre', 'cet'], type: 'akademija',
      color: '#fab120', textColor: '#080A0E', time: '15:00 – 21:00', label: 'Odbita Akademija', sub: 'Vodene vadbe' },
    { days: 'Petek', keys: ['pet'], type: 'mixed',
      color: '#2563a8', textColor: '#F5F5F0', time: '10:00 – 21:00', label: 'Open Jump + Akademija', sub: 'Prosto skakanje & vodene vadbe', link: '/rezervacija' },
    { days: 'Sobota', keys: ['sob'], type: 'openjump',
      color: '#2563a8', textColor: '#F5F5F0', time: '10:00 – 21:00', label: 'Open Jump', sub: 'Prosto skakanje', link: '/rezervacija' },
    { days: 'Nedelja', keys: ['ned'], type: 'openjump',
      color: '#2563a8', textColor: '#F5F5F0', time: '10:00 – 20:00', label: 'Open Jump', sub: 'Prosto skakanje', link: '/rezervacija' },
  ]

  return (
    <div className="lg:hidden flex flex-col gap-3">
      {MOBILE_ROWS.map(row => (
        <div key={row.days} className="rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${row.type === 'akademija' && selectedDay ? 'rgba(250,177,32,0.4)' : 'var(--border)'}` }}>
          <div className="px-4 py-2.5" style={{ background: 'var(--dark3)' }}>
            <span className="font-condensed font-black text-sm tracking-widest uppercase" style={{ color: 'var(--white)' }}>
              {row.days}
            </span>
          </div>

          {(row.type === 'akademija' || row.type === 'mixed') ? (
            <button
              className="w-full flex items-center gap-4 px-4 py-4 transition-opacity text-left"
              style={{ background: row.color, border: 'none', cursor: 'pointer' }}
              onClick={() => onSelectDay(selectedDay === row.keys[0] ? null : row.keys[0])}>
              <div className="flex-1">
                <div className="font-condensed font-black text-base tracking-wider uppercase" style={{ color: row.textColor }}>
                  {row.label}
                </div>
                <div className="font-condensed text-sm opacity-75" style={{ color: row.textColor }}>{row.sub}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-condensed font-bold text-sm" style={{ color: row.textColor }}>{row.time}</div>
                <span className="font-condensed font-black" style={{ color: row.textColor, fontSize: '16px' }}>
                  {selectedDay === row.keys[0] ? '▲' : '▼'}
                </span>
              </div>
            </button>
          ) : (
            <Link to={row.link} className="flex items-center gap-4 px-4 py-4 hover:opacity-80 transition-opacity"
              style={{ background: row.color, textDecoration: 'none' }}>
              <div className="flex-1">
                <div className="font-condensed font-black text-base tracking-wider uppercase" style={{ color: row.textColor }}>
                  {row.label}
                </div>
                <div className="font-condensed text-sm opacity-75" style={{ color: row.textColor }}>{row.sub}</div>
              </div>
              <div className="font-condensed font-bold text-sm" style={{ color: row.textColor }}>{row.time}</div>
            </Link>
          )}
        </div>
      ))}

      {/* Mobile group detail */}
      {selectedDay && CLASS_GROUPS[selectedDay] && CLASS_GROUPS[selectedDay].length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '2px solid rgba(250,177,32,0.3)', animation: 'slideDown 0.25s ease' }}>
          <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:none } }`}</style>
          <div className="px-4 py-3 flex items-center justify-between"
            style={{ background: 'rgba(250,177,32,0.1)', borderBottom: '1px solid rgba(250,177,32,0.2)' }}>
            <span className="font-condensed font-black text-sm uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
              Programi — Pon & Sre
            </span>
            <button onClick={() => onSelectDay(null)}
              className="font-condensed font-black text-sm" style={{ color: 'var(--gray)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
          <div className="flex flex-col gap-2 p-3">
            {CLASS_GROUPS[selectedDay].map((g, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{ background: `${g.color}18`, border: `1px solid ${g.color}40` }}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: g.color }} />
                <div className="flex-1">
                  <div className="font-condensed font-black text-sm uppercase tracking-wide" style={{ color: g.color }}>
                    {g.name} · {g.time}
                  </div>
                  <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                    {g.program}{g.age ? ` · ${g.age}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-3 pb-3">
            <Link to="/vadbe" onClick={() => onSelectDay(null)}
              className="btn-primary w-full text-center block" style={{ textDecoration: 'none', fontSize: '13px' }}>
              CELOTEN URNIK →
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-xl px-4 py-3 text-center" style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }}>
        <span className="font-condensed text-xs tracking-widest uppercase" style={{ color: 'var(--gray)' }}>
          Redna sezona: September – Junij
        </span>
      </div>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────

export default function WeeklySchedule() {
  const [selectedDay, setSelectedDay] = useState(null)

  const handleSelect = (dayKey) => setSelectedDay(dayKey)

  return (
    <div>
      <DesktopSchedule selectedDay={selectedDay} onSelectDay={handleSelect} />
      <MobileSchedule selectedDay={selectedDay} onSelectDay={handleSelect} />

      {/* Detail panel — desktop only, below grid */}
      {selectedDay && CLASS_GROUPS[selectedDay] && (
        <div className="hidden lg:block">
          <DetailPanel dayKey={selectedDay} onClose={() => setSelectedDay(null)} />
        </div>
      )}
    </div>
  )
}
