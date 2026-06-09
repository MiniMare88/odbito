import React, { useState, useEffect } from 'react'
import api from '../../services/api.js'

const DAYS_OPTIONS = [
  { key: 'pon', label: 'PON' },
  { key: 'tor', label: 'TOR' },
  { key: 'sre', label: 'SRE' },
  { key: 'cet', label: 'ČET' },
  { key: 'pet', label: 'PET' },
]

const PRESET_COLORS = [
  '#A8C8E8','#6B9FD4','#5A8FCA','#7BBFB8','#88C47C',
  '#E8A87B','#D47878','#E07878','#C87B7B','#909AAA','#7EC87E',
  '#fab120','#4a9eff','#a78bfa','#34d399',
]

const EMPTY_FORM = {
  name: '', program: '', age_range: '', color_hex: '#A8C8E8',
  days: [], time_start: '15:00', time_end: '15:30',
  sort_order: 0, notes: '', is_active: true,
}

function Badge({ color, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: `${color}22`, border: `1px solid ${color}55`,
      borderRadius: 6, padding: '2px 8px',
      fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
      fontSize: 11, color, letterSpacing: '0.08em', textTransform: 'uppercase',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </span>
  )
}

function DayChip({ day, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '4px 12px', borderRadius: 6,
      border: selected ? '1.5px solid var(--accent)' : '1px solid var(--border)',
      background: selected ? 'rgba(250,177,32,0.12)' : 'transparent',
      color: selected ? 'var(--accent)' : 'var(--gray)',
      fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900,
      fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.15s',
    }}>
      {day.label}
    </button>
  )
}

// ── Group Form ────────────────────────────────────────────────────────

function GroupForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const toggleDay = (key) => set('days', form.days.includes(key)
    ? form.days.filter(d => d !== key)
    : [...form.days, key]
  )

  const inputStyle = {
    background: 'var(--dark3)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--white)', padding: '9px 12px',
    fontSize: 14, outline: 'none', width: '100%',
    fontFamily: 'Barlow, sans-serif', transition: 'border-color 0.18s',
  }
  const label = (txt) => (
    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 5 }}>
      {txt}
    </div>
  )

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Row 1: name + program + age */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 12 }}>
        <div>
          {label('Ime skupine')}
          <input value={form.name} onChange={e => set('name', e.target.value)} required
            placeholder="5.1" style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
        <div>
          {label('Program')}
          <input value={form.program} onChange={e => set('program', e.target.value)} required
            placeholder="Gimnastika" style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
        <div>
          {label('Starost')}
          <input value={form.age_range} onChange={e => set('age_range', e.target.value)}
            placeholder="11–13 let" style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
      </div>

      {/* Row 2: time + sort_order */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          {label('Začetek')}
          <input type="time" value={form.time_start} onChange={e => set('time_start', e.target.value)} required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
        <div>
          {label('Konec')}
          <input type="time" value={form.time_end} onChange={e => set('time_end', e.target.value)} required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
        <div>
          {label('Vrstni red')}
          <input type="number" value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value) || 0)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
      </div>

      {/* Row 3: days */}
      <div>
        {label('Dnevi vadbe')}
        <div style={{ display: 'flex', gap: 6 }}>
          {DAYS_OPTIONS.map(d => (
            <DayChip key={d.key} day={d} selected={form.days.includes(d.key)} onClick={() => toggleDay(d.key)} />
          ))}
        </div>
        {form.days.length === 0 && (
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, color: '#e07878', marginTop: 4 }}>
            Izberite vsaj en dan
          </div>
        )}
      </div>

      {/* Row 4: color */}
      <div>
        {label('Barva')}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {PRESET_COLORS.map(c => (
            <button key={c} type="button" onClick={() => set('color_hex', c)} style={{
              width: 28, height: 28, borderRadius: 6, background: c, border: 'none',
              cursor: 'pointer', flexShrink: 0,
              boxShadow: form.color_hex === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none',
              transform: form.color_hex === c ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.15s',
            }} />
          ))}
          {/* custom hex */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
            <input type="color" value={form.color_hex} onChange={e => set('color_hex', e.target.value)}
              style={{ width: 32, height: 32, padding: 0, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
            <input value={form.color_hex} onChange={e => set('color_hex', e.target.value)}
              style={{ ...inputStyle, width: 90 }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          {/* preview */}
          <Badge color={form.color_hex} label={form.name || 'Skupina'} />
        </div>
      </div>

      {/* Row 5: notes */}
      <div>
        {label('Opombe (neobvezno)')}
        <textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={2}
          placeholder="Interne opombe o skupini…"
          style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
      </div>

      {/* Active toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" onClick={() => set('is_active', !form.is_active)} style={{
          width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: form.is_active ? 'var(--accent)' : 'var(--border)',
          position: 'relative', transition: 'background 0.2s',
        }}>
          <span style={{
            position: 'absolute', top: 3, left: form.is_active ? 20 : 3,
            width: 18, height: 18, borderRadius: '50%', background: form.is_active ? '#080A0E' : 'var(--gray)',
            transition: 'left 0.2s',
          }} />
        </button>
        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 13, color: form.is_active ? 'var(--accent)' : 'var(--gray)' }}>
          {form.is_active ? 'Aktivna' : 'Neaktivna (skrita na urniku)'}
        </span>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
        <button type="submit" disabled={loading || form.days.length === 0}
          style={{
            flex: 1, padding: '10px 20px', borderRadius: 9,
            background: 'var(--accent)', border: 'none', cursor: 'pointer',
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900,
            fontSize: 14, letterSpacing: '0.1em', color: '#080A0E',
            opacity: loading || form.days.length === 0 ? 0.6 : 1,
          }}>
          {loading ? 'SHRANJUJEM…' : 'SHRANI SKUPINO'}
        </button>
        <button type="button" onClick={onCancel} style={{
          padding: '10px 20px', borderRadius: 9,
          background: 'transparent', border: '1px solid var(--border)',
          cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
          fontSize: 14, color: 'var(--gray)',
        }}>
          PREKLIČI
        </button>
      </div>
    </form>
  )
}

// ── Main Tab ──────────────────────────────────────────────────────────

export default function SkupineTab() {
  const [groups, setGroups]   = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [mode, setMode]       = useState(null)   // null | 'new' | { edit: group }
  const [deleting, setDeleting] = useState(null)
  const [filterDay, setFilterDay] = useState(null)
  const [filterProgram, setFilterProgram] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/akademija-groups')
      setGroups(data)
    } catch (e) {
      console.error('Load error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSave = async (form) => {
    setSaving(true)
    setSaveError(null)
    try {
      if (mode === 'new') {
        await api.post('/admin/akademija-groups', form)
      } else {
        await api.patch(`/admin/akademija-groups/${mode.edit.id}`, form)
      }
      await load()
      setMode(null)
    } catch (e) {
      const msg = e.response?.data?.error || e.message || 'Napaka pri shranjevanju'
      setSaveError(msg)
      console.error('Save error:', e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await api.delete(`/admin/akademija-groups/${id}`)
      setGroups(g => g.filter(x => x.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  const toggleActive = async (g) => {
    await api.patch(`/admin/akademija-groups/${g.id}`, { is_active: !g.is_active })
    setGroups(gs => gs.map(x => x.id === g.id ? { ...x, is_active: !x.is_active } : x))
  }

  // filter
  const displayed = groups.filter(g => {
    if (filterDay && !g.days.includes(filterDay)) return false
    if (filterProgram && !g.program.toLowerCase().includes(filterProgram.toLowerCase()) && !g.name.toLowerCase().includes(filterProgram.toLowerCase())) return false
    return true
  })

  // group by time slot for display
  const byTime = {}
  displayed.forEach(g => {
    const key = `${g.time_start}–${g.time_end}`
    if (!byTime[key]) byTime[key] = []
    byTime[key].push(g)
  })

  const uniquePrograms = [...new Set(groups.map(g => g.program))].sort()

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 4 }}>
            Odbita Akademija
          </div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'var(--white)', letterSpacing: '0.05em', margin: 0 }}>
            VADBENE SKUPINE
          </h2>
        </div>
        {mode === null && (
          <button onClick={() => setMode('new')} style={{
            background: 'var(--accent)', border: 'none', borderRadius: 10,
            padding: '10px 20px', cursor: 'pointer',
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900,
            fontSize: 14, letterSpacing: '0.1em', color: '#080A0E',
          }}>
            + NOVA SKUPINA
          </button>
        )}
      </div>

      {/* Form — new / edit */}
      {mode !== null && (
        <div style={{
          background: 'var(--dark2)', border: '1px solid rgba(250,177,32,0.3)',
          borderRadius: 16, padding: 20, marginBottom: 24,
        }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 16 }}>
            {mode === 'new' ? '+ NOVA SKUPINA' : `UREDI — Skupina ${mode.edit.name}`}
          </div>
          <GroupForm
            initial={mode === 'new' ? EMPTY_FORM : { ...mode.edit }}
            onSave={handleSave}
            onCancel={() => { setMode(null); setSaveError(null) }}
            loading={saving}
          />
          {saveError && (
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 8,
              background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.4)',
              fontFamily: 'Barlow Condensed, sans-serif', fontSize: 13, color: '#fc8181',
            }}>
              ⚠ {saveError}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Day filter */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setFilterDay(null)} style={{
            padding: '4px 12px', borderRadius: 6,
            border: !filterDay ? '1.5px solid var(--accent)' : '1px solid var(--border)',
            background: !filterDay ? 'rgba(250,177,32,0.1)' : 'transparent',
            color: !filterDay ? 'var(--accent)' : 'var(--gray)',
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900,
            fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer',
          }}>VSE</button>
          {DAYS_OPTIONS.map(d => (
            <button key={d.key} onClick={() => setFilterDay(filterDay === d.key ? null : d.key)} style={{
              padding: '4px 12px', borderRadius: 6,
              border: filterDay === d.key ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              background: filterDay === d.key ? 'rgba(250,177,32,0.1)' : 'transparent',
              color: filterDay === d.key ? 'var(--accent)' : 'var(--gray)',
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900,
              fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer',
            }}>{d.label}</button>
          ))}
        </div>
        {/* Program filter */}
        <input
          value={filterProgram}
          onChange={e => setFilterProgram(e.target.value)}
          placeholder="Filtriraj po programu…"
          style={{
            background: 'var(--dark2)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--white)', padding: '6px 12px',
            fontSize: 13, outline: 'none', fontFamily: 'Barlow, sans-serif',
            minWidth: 180,
          }}
        />
        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, color: 'var(--gray)', marginLeft: 'auto' }}>
          {displayed.length} skupin
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40, fontFamily: 'Barlow Condensed, sans-serif', color: 'var(--gray)' }}>
          Nalagam…
        </div>
      )}

      {/* Groups table by time */}
      {!loading && Object.keys(byTime).length === 0 && (
        <div style={{
          textAlign: 'center', padding: 40, border: '1px dashed var(--border)', borderRadius: 16,
          fontFamily: 'Barlow Condensed, sans-serif', color: 'var(--gray)',
        }}>
          Ni skupin. Dodajte prvo skupino ↑
        </div>
      )}

      {!loading && Object.entries(byTime).sort().map(([timeKey, gs]) => (
        <div key={timeKey} style={{ marginBottom: 20 }}>
          {/* Time slot header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
          }}>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 11,
              letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)',
            }}>⏱ {timeKey.replace('–', ' – ')}</div>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Group rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {gs.map(g => (
              <div key={g.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: mode?.edit?.id === g.id ? `${g.color_hex}10` : 'var(--dark2)',
                border: mode?.edit?.id === g.id ? `1px solid ${g.color_hex}60` : '1px solid var(--border)',
                borderRadius: 12, padding: '10px 16px',
                opacity: g.is_active ? 1 : 0.5,
                transition: 'all 0.2s',
              }}>
                {/* Color dot */}
                <div style={{ width: 14, height: 14, borderRadius: 4, background: g.color_hex, flexShrink: 0 }} />

                {/* Name */}
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: g.color_hex, letterSpacing: '0.06em', minWidth: 45 }}>
                  {g.name}
                </div>

                {/* Program + age */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--white)' }}>
                    {g.program}
                    {g.age_range && (
                      <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--gray)', marginLeft: 6 }}>· {g.age_range}</span>
                    )}
                  </div>
                  {g.notes && (
                    <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: 11, color: 'rgba(245,245,240,0.35)', marginTop: 1 }}>
                      {g.notes}
                    </div>
                  )}
                </div>

                {/* Days chips */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {DAYS_OPTIONS.map(d => (
                    <span key={d.key} style={{
                      fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 10,
                      letterSpacing: '0.1em', padding: '2px 7px', borderRadius: 5,
                      background: g.days.includes(d.key) ? `${g.color_hex}25` : 'transparent',
                      color: g.days.includes(d.key) ? g.color_hex : 'rgba(255,255,255,0.1)',
                      border: g.days.includes(d.key) ? `1px solid ${g.color_hex}50` : '1px solid rgba(255,255,255,0.05)',
                    }}>{d.label}</span>
                  ))}
                </div>

                {/* Active toggle */}
                <button onClick={() => toggleActive(g)} title={g.is_active ? 'Deaktiviraj' : 'Aktiviraj'} style={{
                  width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: g.is_active ? 'var(--accent)' : 'var(--border)',
                  position: 'relative', flexShrink: 0, transition: 'background 0.2s',
                }}>
                  <span style={{
                    position: 'absolute', top: 2, left: g.is_active ? 17 : 2,
                    width: 16, height: 16, borderRadius: '50%',
                    background: g.is_active ? '#080A0E' : 'var(--gray)',
                    transition: 'left 0.2s',
                  }} />
                </button>

                {/* Edit */}
                <button onClick={() => setMode({ edit: g })} style={{
                  background: 'var(--dark3)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                  fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
                  fontSize: 12, letterSpacing: '0.08em', color: 'var(--gray)',
                  transition: 'all 0.15s', flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--gray)' }}>
                  UREDI
                </button>

                {/* Delete */}
                <button
                  onClick={() => {
                    if (window.confirm(`Zbrisati skupino ${g.name} — ${g.program}?`)) handleDelete(g.id)
                  }}
                  disabled={deleting === g.id}
                  style={{
                    background: 'transparent', border: '1px solid rgba(229,62,62,0.3)',
                    borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
                    fontSize: 12, color: 'rgba(229,62,62,0.5)',
                    transition: 'all 0.15s', flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#e53e3e'; e.currentTarget.style.color = '#e53e3e' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(229,62,62,0.3)'; e.currentTarget.style.color = 'rgba(229,62,62,0.5)' }}>
                  {deleting === g.id ? '…' : '✕'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
