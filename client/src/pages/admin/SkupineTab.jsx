import React, { useState, useEffect } from 'react'
import api from '../../services/api.js'

const DAYS_OPTIONS = [
  { key: 'pon', label: 'PON' },
  { key: 'tor', label: 'TOR' },
  { key: 'sre', label: 'SRE' },
  { key: 'cet', label: 'ČET' },
  { key: 'pet', label: 'PET' },
]

const LEVEL_OPTIONS = [
  { key: 'zacetni',      label: 'Začetni' },
  { key: 'nadaljevalni', label: 'Nadaljevalni' },
  { key: 'pro',          label: 'Pro' },
]

const PRESET_COLORS = [
  '#A8C8E8','#6B9FD4','#5A8FCA','#7BBFB8','#88C47C',
  '#E8A87B','#D47878','#E07878','#C87B7B','#909AAA','#7EC87E',
  '#fab120','#4a9eff','#a78bfa','#34d399',
]

const EMPTY_FORM = {
  name: '', program: '',
  age_from: '', age_to: '',
  level: 'zacetni',
  color_hex: '#A8C8E8',
  day_schedules: [],    // [{day:'pon', start:'15:00', end:'16:00'}]
  trainer_id: '', assistant_trainer_id: '',
  sort_order: 0, notes: '', is_active: true,
}

// Convert old-format group to new form shape
function groupToForm(g) {
  let day_schedules = g.day_schedules
  // backward compat: if day_schedules null, build from legacy days+time
  if (!day_schedules && g.days?.length) {
    day_schedules = g.days.map(d => ({ day: d, start: g.time_start || '15:00', end: g.time_end || '16:00' }))
  }
  return {
    name: g.name || '',
    program: g.program || '',
    age_from: g.age_from ?? (g.age_range ? g.age_range.match(/\d+/)?.[0] || '' : ''),
    age_to:   g.age_to   ?? (g.age_range ? g.age_range.match(/\d+/g)?.[1] || '' : ''),
    level: g.level || 'zacetni',
    color_hex: g.color_hex || '#A8C8E8',
    day_schedules: day_schedules || [],
    trainer_id: g.trainer_id || '',
    assistant_trainer_id: g.assistant_trainer_id || '',
    sort_order: g.sort_order || 0,
    notes: g.notes || '',
    is_active: g.is_active !== false,
  }
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

function GroupForm({ initial, onSave, onCancel, loading, staffUsers }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  // Per-day schedule helpers
  const toggleDay = (key) => {
    const exists = form.day_schedules.find(d => d.day === key)
    if (exists) {
      set('day_schedules', form.day_schedules.filter(d => d.day !== key))
    } else {
      // add with default times
      const ordered = [...form.day_schedules, { day: key, start: '15:00', end: '16:00' }]
        .sort((a, b) => DAYS_OPTIONS.findIndex(d => d.key === a.day) - DAYS_OPTIONS.findIndex(d => d.key === b.day))
      set('day_schedules', ordered)
    }
  }
  const updateDayTime = (key, field, val) => {
    set('day_schedules', form.day_schedules.map(d => d.day === key ? { ...d, [field]: val } : d))
  }

  const IS = {
    background: 'var(--dark3)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--white)', padding: '9px 12px',
    fontSize: 14, outline: 'none', width: '100%',
    fontFamily: 'Barlow, sans-serif', transition: 'border-color 0.18s',
  }
  const onFocus = e => e.target.style.borderColor = 'var(--accent)'
  const onBlur  = e => e.target.style.borderColor = 'var(--border)'
  const lbl = (txt) => (
    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 5 }}>
      {txt}
    </div>
  )

  const ageOptions = ['', ...Array.from({length: 18}, (_, i) => i + 1)]

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }}
      style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Row 1: name + program */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
        <div>
          {lbl('Ime skupine')}
          <input value={form.name} onChange={e => set('name', e.target.value)} required
            placeholder="5.1" style={IS} onFocus={onFocus} onBlur={onBlur} />
        </div>
        <div>
          {lbl('Program')}
          <input value={form.program} onChange={e => set('program', e.target.value)} required
            placeholder="Gimnastika" style={IS} onFocus={onFocus} onBlur={onBlur} />
        </div>
      </div>

      {/* Row 2: age from / age to / level / sort_order */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 0.8fr', gap: 12 }}>
        <div>
          {lbl('Starost — od (let)')}
          <select value={form.age_from} onChange={e => set('age_from', e.target.value ? Number(e.target.value) : '')}
            style={{ ...IS, cursor: 'pointer' }} onFocus={onFocus} onBlur={onBlur}>
            <option value="">–</option>
            {ageOptions.slice(1).map(n => <option key={n} value={n}>{n} let</option>)}
          </select>
        </div>
        <div>
          {lbl('Starost — do (let)')}
          <select value={form.age_to} onChange={e => set('age_to', e.target.value ? Number(e.target.value) : '')}
            style={{ ...IS, cursor: 'pointer' }} onFocus={onFocus} onBlur={onBlur}>
            <option value="">–</option>
            {ageOptions.slice(1).map(n => <option key={n} value={n}>{n} let</option>)}
          </select>
        </div>
        <div>
          {lbl('Nivo')}
          <select value={form.level || 'zacetni'} onChange={e => set('level', e.target.value)}
            style={{ ...IS, cursor: 'pointer' }} onFocus={onFocus} onBlur={onBlur}>
            {LEVEL_OPTIONS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
          </select>
        </div>
        <div>
          {lbl('Vrstni red')}
          <input type="number" value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value) || 0)}
            style={IS} onFocus={onFocus} onBlur={onBlur} />
        </div>
      </div>

      {/* Row 3: Dnevi vadbe — per-day time picker */}
      <div>
        {lbl('Dnevi vadbe')}
        {/* Day selector chips */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {DAYS_OPTIONS.map(d => {
            const active = form.day_schedules.some(s => s.day === d.key)
            return (
              <button key={d.key} type="button" onClick={() => toggleDay(d.key)} style={{
                padding: '5px 14px', borderRadius: 6,
                border: active ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                background: active ? 'rgba(250,177,32,0.12)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--gray)',
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900,
                fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {d.label}
              </button>
            )
          })}
        </div>

        {/* Per-day time rows */}
        {form.day_schedules.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {form.day_schedules.map(s => (
              <div key={s.day} style={{
                display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 10, alignItems: 'center',
                background: 'rgba(250,177,32,0.05)', border: '1px solid rgba(250,177,32,0.15)',
                borderRadius: 8, padding: '8px 12px',
              }}>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 13, color: 'var(--accent)', letterSpacing: '0.1em' }}>
                  {DAYS_OPTIONS.find(d => d.key === s.day)?.label}
                </div>
                <div>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, color: 'var(--gray)', marginBottom: 3, letterSpacing: '0.08em' }}>ZAČETEK</div>
                  <input type="time" value={s.start} onChange={e => updateDayTime(s.day, 'start', e.target.value)}
                    style={{ ...IS, padding: '6px 10px', fontSize: 13 }} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, color: 'var(--gray)', marginBottom: 3, letterSpacing: '0.08em' }}>KONEC</div>
                  <input type="time" value={s.end} onChange={e => updateDayTime(s.day, 'end', e.target.value)}
                    style={{ ...IS, padding: '6px 10px', fontSize: 13 }} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
            ))}
          </div>
        )}
        {form.day_schedules.length === 0 && (
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, color: '#e07878' }}>
            Izberite vsaj en dan
          </div>
        )}
      </div>

      {/* Row 4: Trenerji */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          {lbl('Glavni trener')}
          <select value={form.trainer_id} onChange={e => set('trainer_id', e.target.value ? Number(e.target.value) : '')}
            style={{ ...IS, cursor: 'pointer' }} onFocus={onFocus} onBlur={onBlur}>
            <option value="">— Ni določen —</option>
            {staffUsers.map(u => (
              <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
            ))}
          </select>
        </div>
        <div>
          {lbl('Pomočnik trenerja')}
          <select value={form.assistant_trainer_id} onChange={e => set('assistant_trainer_id', e.target.value ? Number(e.target.value) : '')}
            style={{ ...IS, cursor: 'pointer' }} onFocus={onFocus} onBlur={onBlur}>
            <option value="">— Ni določen —</option>
            {staffUsers.map(u => (
              <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 5: color */}
      <div>
        {lbl('Barva')}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
            <input type="color" value={form.color_hex} onChange={e => set('color_hex', e.target.value)}
              style={{ width: 32, height: 32, padding: 0, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
            <input value={form.color_hex} onChange={e => set('color_hex', e.target.value)}
              style={{ ...IS, width: 90 }} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <Badge color={form.color_hex} label={form.name || 'Skupina'} />
        </div>
      </div>

      {/* Row 6: notes */}
      <div>
        {lbl('Opombe (neobvezno)')}
        <textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={2}
          placeholder="Interne opombe o skupini…"
          style={{ ...IS, resize: 'vertical' }} onFocus={onFocus} onBlur={onBlur} />
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
        <button type="submit" disabled={loading || form.day_schedules.length === 0}
          style={{
            flex: 1, padding: '10px 20px', borderRadius: 9,
            background: 'var(--accent)', border: 'none', cursor: 'pointer',
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900,
            fontSize: 14, letterSpacing: '0.1em', color: '#080A0E',
            opacity: loading || form.day_schedules.length === 0 ? 0.6 : 1,
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
  const [staffUsers, setStaffUsers] = useState([])
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
      const [groupsRes, staffRes] = await Promise.all([
        api.get('/admin/akademija-groups'),
        api.get('/admin/staff-users'),
      ])
      setGroups(groupsRes.data)
      setStaffUsers(staffRes.data)
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

  // group by program for display
  const byProgram = {}
  displayed.forEach(g => {
    const key = g.program || '–'
    if (!byProgram[key]) byProgram[key] = []
    byProgram[key].push(g)
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
            initial={mode === 'new' ? EMPTY_FORM : groupToForm(mode.edit)}
            onSave={handleSave}
            onCancel={() => { setMode(null); setSaveError(null) }}
            loading={saving}
            staffUsers={staffUsers}
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
      {!loading && Object.keys(byProgram).length === 0 && (
        <div style={{
          textAlign: 'center', padding: 40, border: '1px dashed var(--border)', borderRadius: 16,
          fontFamily: 'Barlow Condensed, sans-serif', color: 'var(--gray)',
        }}>
          Ni skupin. Dodajte prvo skupino ↑
        </div>
      )}

      {!loading && Object.entries(byProgram).sort().map(([programKey, gs]) => (
        <div key={programKey} style={{ marginBottom: 20 }}>
          {/* Program header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
          }}>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 11,
              letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)',
            }}>{programKey}</div>
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
                    <span style={{
                      marginLeft: 8, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
                      fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                      padding: '1px 7px', borderRadius: 5,
                      background: 'rgba(250,177,32,0.12)', border: '1px solid rgba(250,177,32,0.3)',
                      color: 'var(--accent)',
                    }}>
                      {LEVEL_OPTIONS.find(l => l.key === (g.level || 'zacetni'))?.label}
                    </span>
                  </div>
                  {g.notes && (
                    <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: 11, color: 'rgba(245,245,240,0.35)', marginTop: 1 }}>
                      {g.notes}
                    </div>
                  )}
                </div>

                {/* Days chips with time */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 260 }}>
                  {(g.day_schedules?.length
                    ? g.day_schedules
                    : (g.days || []).map(d => ({ day: d, start: g.time_start, end: g.time_end }))
                  ).map(s => (
                    <span key={s.day} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 10,
                      letterSpacing: '0.06em', padding: '2px 7px', borderRadius: 5,
                      background: `${g.color_hex}25`, color: g.color_hex,
                      border: `1px solid ${g.color_hex}50`,
                    }}>
                      <span style={{ fontWeight: 900 }}>{DAYS_OPTIONS.find(d => d.key === s.day)?.label}</span>
                      <span style={{ opacity: 0.7 }}>{s.start}–{s.end}</span>
                    </span>
                  ))}
                </div>

                {/* Trainer */}
                {(g.trainer_id || g.assistant_trainer_id) && (() => {
                  const trainer = staffUsers.find(u => u.id === g.trainer_id)
                  const asst    = staffUsers.find(u => u.id === g.assistant_trainer_id)
                  return (
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, color: 'var(--gray)', whiteSpace: 'nowrap' }}>
                      {trainer && <span>👤 {trainer.first_name} {trainer.last_name}</span>}
                      {trainer && asst && <span style={{ opacity: 0.4 }}> · </span>}
                      {asst && <span style={{ opacity: 0.6 }}>+ {asst.first_name} {asst.last_name}</span>}
                    </div>
                  )
                })()}

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
