import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api.js'

// ── Static day config ─────────────────────────────────────────────────

const AK_DAYS = [
  { key: 'pon', label: 'PON', full: 'Ponedeljek' },
  { key: 'tor', label: 'TOR', full: 'Torek' },
  { key: 'sre', label: 'SRE', full: 'Sreda' },
  { key: 'cet', label: 'ČET', full: 'Četrtek' },
  { key: 'pet', label: 'PET', full: 'Petek' },
]

// Convert API group → internal shape used by grid
function apiToGrid(g) {
  return {
    name:    g.name,
    time:    `${g.time_start}–${g.time_end}`,
    color:   g.color_hex,
    program: g.program,
    age:     g.age_range || '',
    days:    g.days || [],
  }
}

// Build CLASS_GROUPS map from flat API array
function buildClassGroups(groups) {
  const map = {}
  AK_DAYS.forEach(d => { map[d.key] = [] })
  groups.forEach(g => {
    ;(g.days || []).forEach(dayKey => {
      if (map[dayKey]) map[dayKey].push(g)
    })
  })
  // sort each day by time
  AK_DAYS.forEach(d => {
    map[d.key].sort((a, b) => a.time.localeCompare(b.time))
  })
  return map
}

// ── Helpers ───────────────────────────────────────────────────────────

const VIEW_START = 15
const VIEW_END   = 21
const VIEW_H     = VIEW_END - VIEW_START
const GRID_HEIGHT = 500

function parseTime(str) {
  const clean = str.replace(/\s/g, '')
  const [s, e] = clean.split('–')
  const [sh, sm] = s.split(':').map(Number)
  const [eh, em] = e.split(':').map(Number)
  return { sh, sm, eh, em }
}

function toTopPct(h, m = 0) {
  return ((h - VIEW_START + m / 60) / VIEW_H) * 100
}

function getTimeSlots(dayKey, classGroups) {
  const groups = classGroups[dayKey] || []
  const map = {}
  groups.forEach(g => {
    if (!map[g.time]) map[g.time] = []
    map[g.time].push(g)
  })
  return Object.entries(map)
}

const HOUR_LABELS = [15, 16, 17, 18, 19, 20, 21]

// ── GroupFilter ───────────────────────────────────────────────────────

function GroupFilter({ selected, onSelect, onClear, allGroups }) {
  const [query, setQuery]       = useState('')
  const [open, setOpen]         = useState(false)
  const inputRef = useRef(null)
  const boxRef   = useRef(null)

  const results = useMemo(() => {
    if (!query.trim()) return allGroups
    const q = query.toLowerCase()
    return allGroups.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.program.toLowerCase().includes(q) ||
      (g.age || '').toLowerCase().includes(q)
    )
  }, [query, allGroups])

  // close on outside click
  useEffect(() => {
    const handler = e => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const pick = (g) => {
    onSelect(g)
    setQuery(`Skupina ${g.name} · ${g.program}`)
    setOpen(false)
  }

  const clear = () => {
    onClear()
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={boxRef} style={{ position: 'relative', maxWidth: 380 }}>
      {/* Label */}
      <div className="font-condensed text-xs font-bold tracking-widest uppercase mb-2"
        style={{ color: 'var(--gray)' }}>
        Iskanje skupine
      </div>

      {/* Input row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        background: 'var(--dark2)', border: selected ? `1.5px solid ${selected.color}` : '1.5px solid var(--border)',
        borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.2s',
      }}>
        {/* search icon */}
        <div style={{ padding: '0 12px', color: selected ? selected.color : 'rgba(245,245,240,0.25)', fontSize: 14, flexShrink: 0 }}>
          ⌕
        </div>
        <input
          ref={inputRef}
          value={query}
          placeholder="Išči skupino ali program…"
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true); if (!e.target.value) onClear() }}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'Barlow Condensed, sans-serif', fontSize: 15, fontWeight: 600,
            color: 'var(--white)', padding: '10px 0',
          }}
        />
        {/* selected color dot */}
        {selected && (
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: selected.color, marginRight: 10, flexShrink: 0 }} />
        )}
        {/* clear */}
        {(selected || query) && (
          <button onClick={clear} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(245,245,240,0.35)', fontSize: 18, padding: '0 12px',
            fontFamily: 'Barlow Condensed', fontWeight: 900, lineHeight: 1,
            flexShrink: 0,
          }}>
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: '#1a1d24', border: '1px solid var(--border)',
          borderRadius: 12, zIndex: 50, maxHeight: 280, overflowY: 'auto',
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
        }}>
          {results.length === 0 && (
            <div style={{ padding: '14px 16px', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 13, color: 'rgba(245,245,240,0.35)' }}>
              Ni rezultatov
            </div>
          )}
          {results.map(g => {
            const dayLabels = g.days.map(dk => AK_DAYS.find(d => d.key === dk)?.label).join(', ')
            const isSel = selected?.name === g.name
            return (
              <button
                key={g.name}
                onClick={() => pick(g)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: '10px 14px', background: isSel ? `${g.color}15` : 'transparent',
                  border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
                }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent' }}
              >
                {/* color dot */}
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                {/* text */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 15, color: isSel ? g.color : 'var(--white)', letterSpacing: '0.06em' }}>
                    Skupina {g.name}
                  </div>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, color: 'rgba(245,245,240,0.45)', fontWeight: 600 }}>
                    {g.program}{g.age ? ` · ${g.age}` : ''}
                  </div>
                </div>
                {/* days */}
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, color: 'rgba(245,245,240,0.3)', letterSpacing: '0.08em', flexShrink: 0 }}>
                  {dayLabels}
                </div>
                {isSel && (
                  <div style={{ fontSize: 12, color: g.color, flexShrink: 0 }}>✓</div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Selected info strip */}
      {selected && (
        <div className="mt-2 rounded-xl px-4 py-2.5 flex items-center gap-3"
          style={{ background: `${selected.color}15`, border: `1px solid ${selected.color}40` }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: selected.color, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 15, color: selected.color, letterSpacing: '0.06em', marginRight: 8 }}>
              Skupina {selected.name}
            </span>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, color: 'var(--white)', fontWeight: 700 }}>
              {selected.program}
            </span>
            {selected.age && (
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, color: 'rgba(245,245,240,0.45)', marginLeft: 6 }}>
                · {selected.age}
              </span>
            )}
          </div>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, color: 'rgba(245,245,240,0.4)', letterSpacing: '0.1em' }}>
            {selected.days.map(dk => AK_DAYS.find(d => d.key === dk)?.label).join(' · ')}
          </div>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, color: 'rgba(245,245,240,0.4)' }}>
            {selected.time.replace('–', ' – ')}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Akademija Grid (Desktop) ──────────────────────────────────────────

function AkademijaGrid({ allGroups, classGroups }) {
  const [startIdx, setStartIdx]     = useState(0)
  const [hovered, setHovered]       = useState(null)
  const [filteredGroup, setFiltered] = useState(null)
  const MAX_START = AK_DAYS.length - 3 // = 2

  // when filter selected, jump to first day where group appears
  const handleSelect = (g) => {
    setFiltered(g)
    if (g.days.length > 0) {
      const firstDayIdx = AK_DAYS.findIndex(d => g.days.includes(d.key))
      if (firstDayIdx !== -1) {
        setStartIdx(Math.min(MAX_START, Math.max(0, firstDayIdx)))
      }
    }
  }

  const visibleDays = AK_DAYS.slice(startIdx, startIdx + 3)

  return (
    <div className="hidden lg:block select-none">

      {/* ── Filter bar ── */}
      <div className="mb-5 flex items-end gap-4 flex-wrap">
        <GroupFilter
          selected={filteredGroup}
          onSelect={handleSelect}
          onClear={() => setFiltered(null)}
          allGroups={allGroups}
        />

        {/* Day range nav inline on same line */}
        <div className="flex items-center gap-2 pb-0.5 ml-auto">
          <span className="font-condensed text-xs tracking-widest uppercase" style={{ color: 'rgba(245,245,240,0.25)' }}>
            Dnevi:
          </span>
          {AK_DAYS.map((d, i) => {
            const isVisible = i >= startIdx && i < startIdx + 3
            const hasGroup  = filteredGroup ? filteredGroup.days.includes(d.key) : true
            return (
              <button
                key={d.key}
                onClick={() => setStartIdx(Math.min(MAX_START, Math.max(0, i > MAX_START ? MAX_START : i === 0 ? 0 : i - 1)))}
                style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 900,
                  fontSize: 12,
                  letterSpacing: '0.12em',
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: isVisible ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  background: isVisible ? 'rgba(250,177,32,0.1)' : 'transparent',
                  color: isVisible ? 'var(--accent)' : hasGroup ? 'rgba(245,245,240,0.4)' : 'rgba(245,245,240,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textDecoration: filteredGroup && !hasGroup ? 'line-through' : 'none',
                }}
              >
                {d.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Header + arrows ── */}
      <div className="flex items-center gap-4 mb-3">
        <button
          onClick={() => setStartIdx(i => Math.max(0, i - 1))}
          disabled={startIdx === 0}
          style={{
            width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--border)',
            background: startIdx === 0 ? 'transparent' : 'var(--dark2)',
            color: startIdx === 0 ? 'rgba(255,255,255,0.12)' : 'var(--white)',
            cursor: startIdx === 0 ? 'default' : 'pointer',
            fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900,
            flexShrink: 0, transition: 'all 0.15s',
          }}
        >‹</button>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {visibleDays.map(d => {
            const groupHere = filteredGroup ? filteredGroup.days.includes(d.key) : true
            return (
              <div key={d.key} className="text-center py-2 rounded-xl"
                style={{
                  fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, letterSpacing: '0.12em',
                  color: groupHere ? 'var(--accent)' : 'rgba(245,245,240,0.2)',
                  background: groupHere ? 'rgba(250,177,32,0.07)' : 'rgba(255,255,255,0.02)',
                  border: groupHere ? '1px solid rgba(250,177,32,0.15)' : '1px solid rgba(255,255,255,0.04)',
                  transition: 'all 0.2s',
                }}>
                {d.full.toUpperCase()}
                {filteredGroup && groupHere && (
                  <span style={{ fontSize: 11, marginLeft: 6, opacity: 0.7 }}>●</span>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={() => setStartIdx(i => Math.min(MAX_START, i + 1))}
          disabled={startIdx === MAX_START}
          style={{
            width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--border)',
            background: startIdx === MAX_START ? 'transparent' : 'var(--dark2)',
            color: startIdx === MAX_START ? 'rgba(255,255,255,0.12)' : 'var(--white)',
            cursor: startIdx === MAX_START ? 'default' : 'pointer',
            fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900,
            flexShrink: 0, transition: 'all 0.15s',
          }}
        >›</button>
      </div>

      {/* ── Timeline grid ── */}
      <div style={{ display: 'flex', gap: '6px' }}>

        {/* Hour axis */}
        <div style={{ position: 'relative', width: '46px', flexShrink: 0, height: GRID_HEIGHT }}>
          {HOUR_LABELS.map(h => (
            <div key={h} style={{
              position: 'absolute', top: `${toTopPct(h)}%`, right: '6px',
              transform: 'translateY(-50%)',
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 11,
              color: 'rgba(245,245,240,0.3)', letterSpacing: '0.04em',
            }}>
              {h}:00
            </div>
          ))}
        </div>

        {/* 3 Day columns */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {visibleDays.map(day => {
            const slots = getTimeSlots(day.key, classGroups)
            const dayHasGroup = filteredGroup ? filteredGroup.days.includes(day.key) : true

            return (
              <div key={day.key} style={{
                position: 'relative', height: GRID_HEIGHT,
                background: dayHasGroup ? 'var(--dark2)' : 'rgba(255,255,255,0.015)',
                border: dayHasGroup ? '1px solid var(--border)' : '1px solid rgba(255,255,255,0.04)',
                borderRadius: 14, overflow: 'visible',
                transition: 'all 0.25s',
                opacity: filteredGroup && !dayHasGroup ? 0.4 : 1,
              }}>

                {/* Grid lines */}
                {HOUR_LABELS.map(h => (
                  <div key={h} style={{
                    position: 'absolute', top: `${toTopPct(h)}%`,
                    left: 0, right: 0, height: 1,
                    background: h % 2 === 0 ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                    zIndex: 0,
                  }} />
                ))}
                {HOUR_LABELS.slice(0, -1).map(h => (
                  <div key={`${h}.5`} style={{
                    position: 'absolute', top: `${toTopPct(h, 30)}%`,
                    left: 0, right: 0, height: 1,
                    background: 'rgba(255,255,255,0.02)', zIndex: 0,
                  }} />
                ))}

                {slots.length === 0 && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.08)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                      Ni vadbe
                    </span>
                  </div>
                )}

                {/* Time slot blocks */}
                {slots.map(([timeStr, groups]) => {
                  const { sh, sm, eh, em } = parseTime(timeStr)
                  if (sh >= VIEW_END || eh <= VIEW_START) return null
                  const topPct = Math.max(0, toTopPct(sh, sm))
                  const botPct = Math.min(100, toTopPct(eh, em))
                  const hPct   = botPct - topPct

                  return (
                    <div key={timeStr} style={{
                      position: 'absolute',
                      top: `${topPct}%`, height: `${hPct}%`,
                      left: 5, right: 5,
                      display: 'flex', gap: 3, zIndex: 1,
                    }}>
                      {groups.map((g, gi) => {
                        const isHov     = hovered?.dayKey === day.key && hovered?.timeStr === timeStr && hovered?.gi === gi
                        const isMatch   = filteredGroup ? filteredGroup.name === g.name : false
                        const isDimmed  = filteredGroup ? !isMatch : false

                        return (
                          <div
                            key={gi}
                            onMouseEnter={() => setHovered({ dayKey: day.key, timeStr, gi })}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                              flex: 1,
                              background: isDimmed ? `${g.color}30` : g.color,
                              borderRadius: 7,
                              padding: '4px 5px',
                              display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
                              overflow: 'hidden', cursor: 'default',
                              position: 'relative',
                              opacity: isDimmed ? 0.35 : 1,
                              boxShadow: isMatch
                                ? `0 0 0 2px ${g.color}, 0 4px 20px ${g.color}80`
                                : isHov
                                  ? `0 4px 14px ${g.color}70`
                                  : `0 1px 4px rgba(0,0,0,0.3)`,
                              transform: (isHov || isMatch) && !isDimmed ? 'scale(1.05)' : 'scale(1)',
                              transition: 'transform 0.15s, box-shadow 0.15s, opacity 0.2s',
                              zIndex: isMatch || isHov ? 10 : 1,
                            }}
                          >
                            <div style={{
                              fontFamily: 'Bebas Neue, sans-serif', fontSize: 15, lineHeight: 1,
                              color: isDimmed ? `${g.color}80` : 'rgba(8,10,14,0.9)',
                              letterSpacing: '0.04em',
                            }}>
                              {g.name}
                            </div>
                            <div style={{
                              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 9,
                              color: isDimmed ? `${g.color}60` : 'rgba(8,10,14,0.65)',
                              textTransform: 'uppercase', letterSpacing: '0.04em',
                              lineHeight: 1.1, overflow: 'hidden',
                              whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                            }}>
                              {g.program}
                            </div>
                            {/* Hover tooltip (only when not dimmed) */}
                            {isHov && !isDimmed && (
                              <div style={{
                                position: 'absolute', zIndex: 20,
                                bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
                                background: '#1a1d24', border: `1px solid ${g.color}`,
                                borderRadius: 10, padding: '10px 14px', minWidth: 140,
                                boxShadow: `0 8px 24px rgba(0,0,0,0.6)`, pointerEvents: 'none',
                                whiteSpace: 'nowrap',
                              }}>
                                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 13, color: g.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                                  Skupina {g.name}
                                </div>
                                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, color: '#F5F5F0', fontWeight: 700, marginBottom: 2 }}>
                                  {g.program}
                                </div>
                                {g.age && (
                                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, color: 'rgba(245,245,240,0.5)' }}>
                                    {g.age}
                                  </div>
                                )}
                                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, color: 'rgba(245,245,240,0.4)', marginTop: 3 }}>
                                  {timeStr.replace('–', ' – ')}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="mt-5 rounded-2xl px-5 py-4" style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }}>
        <div className="font-condensed text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--gray)' }}>
          Legenda programov
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {[...new Map(allGroups.map(g => [g.program, g])).values()].map(g => (
            <div key={g.program} className="flex items-center gap-2">
              <div style={{ width: 10, height: 10, borderRadius: 3, background: g.color, flexShrink: 0 }} />
              <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                {g.program}{g.age ? ` · ${g.age}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Mobile ────────────────────────────────────────────────────────────

function MobileSchedule({ classGroups }) {
  const [openDay, setOpenDay] = useState(null)

  const MOBILE_ROWS = [
    { days: 'Pon – Čet', keys: ['pon', 'tor', 'sre', 'cet'], sampleKey: 'pon' },
    { days: 'Petek',     keys: ['pet'],                       sampleKey: 'pet'  },
  ]

  return (
    <div className="lg:hidden flex flex-col gap-3">
      {MOBILE_ROWS.map(row => (
        <div key={row.days} className="rounded-2xl overflow-hidden"
          style={{ border: openDay === row.sampleKey ? '1px solid rgba(250,177,32,0.4)' : '1px solid var(--border)' }}>
          <button
            className="w-full flex items-center gap-4 px-4 py-4 text-left"
            style={{ background: '#fab120', border: 'none', cursor: 'pointer' }}
            onClick={() => setOpenDay(openDay === row.sampleKey ? null : row.sampleKey)}
          >
            <div className="flex-1">
              <div className="font-condensed font-black text-base tracking-wider uppercase" style={{ color: '#080A0E' }}>
                Odbita Akademija · {row.days}
              </div>
              <div className="font-condensed text-sm opacity-70" style={{ color: '#080A0E' }}>15:00 – 21:00</div>
            </div>
            <span className="font-condensed font-black text-lg" style={{ color: '#080A0E' }}>
              {openDay === row.sampleKey ? '▲' : '▼'}
            </span>
          </button>

          {openDay === row.sampleKey && (
            <div className="p-3 flex flex-col gap-2" style={{ background: 'var(--dark2)', animation: 'slideDown 0.2s ease' }}>
              <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:none } }`}</style>
              {getTimeSlots(row.sampleKey, classGroups).map(([timeStr, groups]) => (
                <div key={timeStr}>
                  <div className="font-condensed text-xs font-bold tracking-widest uppercase mb-1.5 flex items-center gap-1.5"
                    style={{ color: 'var(--gray)' }}>
                    <span style={{ color: 'var(--accent)' }}>⏱</span>
                    {timeStr.replace('–', ' – ')}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {groups.map((g, i) => (
                      <div key={i} className="rounded-xl px-3 py-2 flex items-center gap-2"
                        style={{ background: `${g.color}20`, border: `1px solid ${g.color}50` }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                        <div>
                          <div className="font-condensed font-black text-xs uppercase tracking-wide" style={{ color: g.color }}>
                            Skupina {g.name}
                          </div>
                          <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                            {g.program}{g.age ? ` · ${g.age}` : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Link to="/vadbe/prijava"
                className="btn-primary w-full text-center block mt-1" style={{ textDecoration: 'none', fontSize: '13px' }}>
                PRIJAVI SE NA VADBO →
              </Link>
            </div>
          )}
        </div>
      ))}

      <div className="rounded-xl px-4 py-3 text-center" style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }}>
        <span className="font-condensed text-xs tracking-widest uppercase" style={{ color: 'var(--gray)' }}>
          Sezona Sep 2026 – Jun 2027
        </span>
      </div>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────

export default function WeeklySchedule() {
  const [rawGroups, setRawGroups] = useState([])
  const [loadState, setLoadState] = useState('loading') // 'loading' | 'ok' | 'error'

  useEffect(() => {
    api.get('/classes/akademija-groups')
      .then(({ data }) => {
        setRawGroups(data.map(apiToGrid))
        setLoadState('ok')
      })
      .catch(() => setLoadState('error'))
  }, [])

  if (loadState === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, letterSpacing: '0.1em', color: 'rgba(250,177,32,0.4)' }}>
        NALAGAM URNIK…
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'Barlow Condensed, sans-serif', color: 'rgba(245,245,240,0.3)', fontSize: 14 }}>
        Urnika ni bilo mogoče naložiti.
      </div>
    )
  }

  const classGroups = buildClassGroups(rawGroups)
  const allGroups   = rawGroups.sort((a, b) => {
    const [amaj, amin] = a.name.split('.').map(Number)
    const [bmaj, bmin] = b.name.split('.').map(Number)
    return amaj !== bmaj ? amaj - bmaj : amin - bmin
  })

  return (
    <div>
      <AkademijaGrid allGroups={allGroups} classGroups={classGroups} />
      <MobileSchedule classGroups={classGroups} />
    </div>
  )
}
