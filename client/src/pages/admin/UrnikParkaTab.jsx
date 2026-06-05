import React, { useEffect, useState } from 'react'
import api from '../../services/api.js'

const DOW_LABELS = ['Ned', 'Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob']
const DOW_ORDER  = [1, 2, 3, 4, 5, 6, 0]  // Mon–Sun display order

const CAP_PER_HOUR = 50  // kapaciteta parka na uro

function dateToStr(d) {
  return d.toISOString().split('T')[0]
}

function dowOf(dateStr) {
  return new Date(dateStr + 'T12:00:00').getDay()
}

function getWeekDates(offset) {
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const dow = today.getDay()
  const diffToMon = dow === 0 ? -6 : 1 - dow
  const mon = new Date(today)
  mon.setDate(today.getDate() + diffToMon + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return dateToStr(d)
  })
}

function TimeInput({ value, onChange, disabled }) {
  return (
    <input type="time" value={value || ''} onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="px-2 py-1.5 rounded-lg text-sm outline-none font-condensed font-bold transition-all"
      style={{
        background: disabled ? 'var(--dark3)' : 'var(--dark2)',
        border: `1px solid ${disabled ? 'var(--border)' : 'rgba(250,177,32,0.3)'}`,
        color: disabled ? 'var(--gray)' : 'var(--white)',
        width: '90px', opacity: disabled ? 0.4 : 1,
      }} />
  )
}

function calcCap(openTime, closeTime) {
  if (!openTime || !closeTime) return null
  const [oh, om] = openTime.split(':').map(Number)
  const [ch, cm] = closeTime.split(':').map(Number)
  const hrs = ((ch * 60 + cm) - (oh * 60 + om)) / 60
  if (hrs <= 0) return null
  return { hrs, cap: Math.round(hrs) * CAP_PER_HOUR }
}

// ── Tedenski urnik z navigacijo ───────────────────────────────────────

function WeeklyScheduleSection() {
  const [weekOffset, setWeekOffset]     = useState(0)
  const [template, setTemplate]         = useState([])   // ParkSchedule rows
  const [weekOverrides, setWeekOverrides] = useState({}) // date → override (with id)
  const [edits, setEdits]               = useState({})   // date → {is_open, open_time, close_time, useTemplate}
  const [saving, setSaving]             = useState(false)
  const [saved, setSaved]               = useState(false)
  const [loading, setLoading]           = useState(false)

  const weekDates = getWeekDates(weekOffset)
  const todayStr  = dateToStr(new Date())

  const tmplMap = Object.fromEntries(template.map(t => [t.day_of_week, t]))

  const loadWeek = async (dates) => {
    setLoading(true)
    setEdits({})
    try {
      const [tmplRes, ovRes] = await Promise.all([
        api.get('/park-schedule/weekly'),
        api.get(`/park-schedule/overrides?from=${dates[0]}&to=${dates[6]}`),
      ])
      setTemplate(tmplRes.data)
      const map = {}
      ovRes.data.forEach(ov => { map[ov.date] = ov })
      setWeekOverrides(map)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { loadWeek(weekDates) }, [weekOffset])

  // Effective displayed state for a day
  const getState = (dateStr) => {
    if (edits[dateStr]) return edits[dateStr]
    const ov = weekOverrides[dateStr]
    if (ov) return { is_open: ov.is_open, open_time: ov.open_time, close_time: ov.close_time, useTemplate: false }
    const tmpl = tmplMap[dowOf(dateStr)]
    return {
      is_open: tmpl?.is_open ?? false,
      open_time: tmpl?.open_time ?? null,
      close_time: tmpl?.close_time ?? null,
      useTemplate: true,
    }
  }

  const updateDay = (dateStr, field, value) => {
    setSaved(false)
    setEdits(prev => {
      const base = prev[dateStr] ?? getState(dateStr)
      return { ...prev, [dateStr]: { ...base, [field]: value } }
    })
  }

  const hasEdits = Object.keys(edits).some(d => d >= todayStr)

  const save = async () => {
    setSaving(true)
    try {
      const tmplDays = []       // days to upsert in ParkSchedule
      const ovUpserts = []      // date-specific overrides
      const ovDeletes = []      // override IDs to delete

      for (const [dateStr, edit] of Object.entries(edits)) {
        if (dateStr < todayStr) continue
        const dow = dowOf(dateStr)
        if (edit.useTemplate) {
          tmplDays.push({
            day_of_week: dow,
            is_open:     edit.is_open,
            open_time:   edit.is_open ? (edit.open_time  || null) : null,
            close_time:  edit.is_open ? (edit.close_time || null) : null,
          })
          if (weekOverrides[dateStr]) ovDeletes.push(weekOverrides[dateStr].id)
        } else {
          ovUpserts.push({
            date_from: dateStr, date_to: dateStr,
            is_open:   edit.is_open,
            open_time:  edit.is_open ? (edit.open_time  || null) : null,
            close_time: edit.is_open ? (edit.close_time || null) : null,
          })
        }
      }

      const ops = []
      if (tmplDays.length) ops.push(api.put('/park-schedule/weekly', { days: tmplDays }))
      ovUpserts.forEach(ov => ops.push(api.post('/park-schedule/overrides', ov)))
      ovDeletes.forEach(id => ops.push(api.delete(`/park-schedule/overrides/${id}`)))

      await Promise.all(ops)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      await loadWeek(weekDates)
    } finally { setSaving(false) }
  }

  const fmtWeekLabel = () => {
    const opts = { day: 'numeric', month: 'short' }
    const d0 = new Date(weekDates[0] + 'T12:00:00').toLocaleDateString('sl-SI', opts)
    const d6 = new Date(weekDates[6] + 'T12:00:00').toLocaleDateString('sl-SI', opts)
    return `${d0} – ${d6}`
  }

  const weekSummary = () => {
    const openDays = weekDates.filter(d => getState(d).is_open).length
    const totalCap = weekDates.reduce((sum, d) => {
      const s = getState(d)
      const c = s.is_open ? calcCap(s.open_time, s.close_time) : null
      return sum + (c?.cap ?? 0)
    }, 0)
    return { openDays, totalCap }
  }

  const { openDays, totalCap } = weekSummary()

  return (
    <div className="card mb-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <div className="section-label mb-1">Tedenska shema Open Jump</div>
          <p className="font-condensed text-sm" style={{ color: 'var(--gray)' }}>
            Vsak dan privzeto sledi vzorcu "do nadaljnjega". Ročno spremenite posamezen teden ali posodobite privzeti vzorec.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="font-condensed text-xs font-bold" style={{ color: 'var(--green)' }}>✓ SHRANJENO</span>}
          {hasEdits && (
            <button onClick={save} disabled={saving}
              className="font-condensed font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg transition-all"
              style={{ background: 'var(--accent)', color: 'var(--black)', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'SHRANJUJEM...' : 'SHRANI URNIK'}
            </button>
          )}
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => setWeekOffset(w => w - 1)}
          className="font-condensed font-black text-base px-4 py-2 rounded-lg transition-all"
          style={{ background: 'var(--dark3)', color: 'var(--gray)', border: '1px solid var(--border)' }}>
          ←
        </button>

        <div className="flex-1 flex items-center justify-center gap-3 flex-wrap">
          <span className="font-condensed font-black text-base" style={{ color: 'var(--white)' }}>
            {fmtWeekLabel()}
          </span>
          {weekOffset === 0 ? (
            <span className="font-condensed text-xs font-bold px-2 py-0.5 rounded"
              style={{ background: 'rgba(250,177,32,0.15)', color: 'var(--accent)' }}>
              TA TEDEN
            </span>
          ) : weekOffset > 0 ? (
            <span className="font-condensed text-xs px-2 py-0.5 rounded"
              style={{ background: 'var(--dark3)', color: 'var(--gray)', border: '1px solid var(--border)' }}>
              +{weekOffset} {weekOffset === 1 ? 'teden' : 'tedna'}
            </span>
          ) : (
            <span className="font-condensed text-xs px-2 py-0.5 rounded"
              style={{ background: 'var(--dark3)', color: 'var(--gray)', border: '1px solid var(--border)' }}>
              {Math.abs(weekOffset)} {Math.abs(weekOffset) === 1 ? 'teden' : 'tedna'} nazaj
            </span>
          )}
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)}
              className="font-condensed text-xs font-bold px-2 py-0.5 rounded transition-all"
              style={{ background: 'var(--dark3)', color: 'var(--gray)', border: '1px solid var(--border)' }}>
              ↩ danes
            </button>
          )}
        </div>

        <button onClick={() => setWeekOffset(w => w + 1)}
          className="font-condensed font-black text-base px-4 py-2 rounded-lg transition-all"
          style={{ background: 'var(--dark3)', color: 'var(--gray)', border: '1px solid var(--border)' }}>
          →
        </button>
      </div>

      {/* Day cards */}
      {loading ? (
        <div className="font-condensed text-sm text-center py-10" style={{ color: 'var(--gray)' }}>Nalagam...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {weekDates.map(dateStr => {
            const isPast    = dateStr < todayStr
            const isToday   = dateStr === todayStr
            const dow       = dowOf(dateStr)
            const state     = getState(dateStr)
            const open      = !!state.is_open
            const hasOv     = !!weekOverrides[dateStr]
            const hasEdit   = !!edits[dateStr]
            const capInfo   = open ? calcCap(state.open_time, state.close_time) : null

            const dateLabel = new Date(dateStr + 'T12:00:00')
              .toLocaleDateString('sl-SI', { day: 'numeric', month: 'numeric' })

            let borderColor = 'var(--border)'
            if (isToday)      borderColor = 'var(--accent)'
            else if (isPast)  borderColor = 'rgba(255,255,255,0.05)'
            else if (open)    borderColor = 'rgba(250,177,32,0.4)'

            return (
              <div key={dateStr}
                className="rounded-xl flex flex-col gap-2 p-3 transition-all"
                style={{
                  background: isPast ? 'rgba(255,255,255,0.02)' : open ? 'rgba(250,177,32,0.07)' : 'var(--dark3)',
                  border: `2px solid ${borderColor}`,
                  opacity: isPast ? 0.55 : 1,
                }}>

                {/* Day name + date + toggle */}
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <div className="font-condensed font-black text-sm uppercase tracking-wide"
                      style={{ color: isPast ? 'var(--gray)' : open ? 'var(--accent)' : 'var(--gray)' }}>
                      {DOW_LABELS[dow]}
                    </div>
                    <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>{dateLabel}</div>
                  </div>
                  <button onClick={() => !isPast && updateDay(dateStr, 'is_open', !open)}
                    disabled={isPast}
                    className="relative rounded-full transition-all flex-shrink-0 mt-0.5"
                    style={{
                      width: 36, height: 20,
                      background: open ? 'var(--accent)' : 'var(--dark2)',
                      border: '2px solid ' + (open ? 'var(--accent)' : 'var(--border)'),
                      cursor: isPast ? 'default' : 'pointer',
                    }}>
                    <span className="absolute top-0.5 rounded-full transition-all"
                      style={{ width: 12, height: 12, background: open ? 'var(--black)' : 'var(--gray)', left: open ? 18 : 2 }} />
                  </button>
                </div>

                {/* Status */}
                <div className="font-condensed text-xs font-bold uppercase tracking-wide"
                  style={{ color: open ? 'var(--green)' : '#FF3D00' }}>
                  {open ? 'ODPRT' : 'ZAPRTO'}
                </div>

                {/* Time inputs */}
                <div className="flex flex-col gap-1.5">
                  <div>
                    <div className="font-condensed text-xs mb-1" style={{ color: 'var(--gray)' }}>Od</div>
                    <TimeInput value={state.open_time} disabled={!open || isPast}
                      onChange={v => updateDay(dateStr, 'open_time', v)} />
                  </div>
                  <div>
                    <div className="font-condensed text-xs mb-1" style={{ color: 'var(--gray)' }}>Do</div>
                    <TimeInput value={state.close_time} disabled={!open || isPast}
                      onChange={v => updateDay(dateStr, 'close_time', v)} />
                  </div>
                </div>

                {/* Capacity summary */}
                {capInfo && (
                  <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                    {capInfo.hrs} ur · kap. {capInfo.cap}
                  </div>
                )}

                {/* Do nadaljnjega checkbox */}
                {!isPast && (
                  <label className="flex items-center gap-1.5 mt-auto pt-2 cursor-pointer select-none"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <input type="checkbox"
                      checked={!!state.useTemplate}
                      onChange={e => updateDay(dateStr, 'useTemplate', e.target.checked)}
                      style={{ accentColor: 'var(--accent)', width: 13, height: 13, flexShrink: 0 }} />
                    <span className="font-condensed text-xs leading-tight"
                      style={{ color: state.useTemplate ? 'var(--gray)' : 'var(--accent)' }}>
                      do nadaljnjega
                    </span>
                  </label>
                )}

                {/* State badges */}
                {!isPast && hasOv && !hasEdit && (
                  <div className="font-condensed text-xs font-bold" style={{ color: 'var(--accent)' }}>
                    ↳ izjema za ta dan
                  </div>
                )}
                {!isPast && hasEdit && (
                  <div className="font-condensed text-xs font-bold" style={{ color: '#FAB120', opacity: 0.8 }}>
                    ● neshranjeno
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      {!loading && (
        <div className="mt-4 font-condensed text-xs" style={{ color: 'var(--gray)' }}>
          Odprtih {openDays} od 7 dni · Skupna tedenska kapaciteta:{' '}
          <strong style={{ color: 'var(--accent)' }}>{totalCap} obiskovalcev</strong>
          {' '}
          <span style={{ opacity: 0.5 }}>({CAP_PER_HOUR}/uro × ure)</span>
        </div>
      )}
    </div>
  )
}

// ── Izjeme ────────────────────────────────────────────────────────────

function OverridesSection() {
  const [overrides, setOverrides] = useState([])
  const [form, setForm] = useState({
    date_from: '', date_to: '', is_open: false,
    open_time: '09:00', close_time: '21:00', reason: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const load = () => {
    const today = new Date().toISOString().split('T')[0]
    const future = new Date(); future.setFullYear(future.getFullYear() + 2)
    api.get(`/park-schedule/overrides?from=${today}&to=${future.toISOString().split('T')[0]}`)
      .then(r => setOverrides(r.data))
      .catch(() => {})
  }

  useEffect(() => { load() }, [])

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.date_from) return setError('Vnesi datum')
    setSubmitting(true); setError('')
    try {
      await api.post('/park-schedule/overrides', {
        date_from: form.date_from,
        date_to:   form.date_to || form.date_from,
        is_open:   form.is_open,
        open_time:  form.is_open ? form.open_time  : null,
        close_time: form.is_open ? form.close_time : null,
        reason: form.reason || null,
      })
      setForm({ date_from: '', date_to: '', is_open: false, open_time: '09:00', close_time: '21:00', reason: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Napaka')
    } finally { setSubmitting(false) }
  }

  const remove = async (id) => {
    if (!confirm('Odstrani izjemo?')) return
    await api.delete(`/park-schedule/overrides/${id}`).catch(() => {})
    load()
  }

  const LabelStyle = { color: 'var(--gray)', display: 'block', marginBottom: '6px' }
  const Label = ({ children }) => (
    <label className="font-condensed text-xs font-bold tracking-widest uppercase" style={LabelStyle}>{children}</label>
  )
  const inputStyle = {
    background: 'var(--dark3)', border: '1px solid var(--border)',
    color: 'var(--white)', borderRadius: '8px',
  }

  const fmtDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('sl-SI') : '—'

  return (
    <div>
      <div className="card mb-6">
        <div className="section-label mb-4">Dodaj izjemo / posebni termin</div>
        <p className="font-condensed text-sm mb-5" style={{ color: 'var(--gray)' }}>
          Izjeme zamenjajo tedensko shemo za označene datume — npr. šolske počitnice, državni prazniki.
        </p>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Datum od *</Label>
              <input type="date" value={form.date_from} min={minDate}
                onChange={e => setF('date_from', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} required />
            </div>
            <div>
              <Label>Datum do (za razpon)</Label>
              <input type="date" value={form.date_to} min={form.date_from || minDate}
                onChange={e => setF('date_to', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <Label>Razlog</Label>
              <input type="text" value={form.reason}
                onChange={e => setF('reason', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
                placeholder="Šolske počitnice, praznik..." />
            </div>
            <div className="flex flex-col justify-end">
              <div className="flex items-center gap-3 h-10">
                <button type="button" onClick={() => setF('is_open', !form.is_open)}
                  className="relative rounded-full transition-all flex-shrink-0"
                  style={{ width: 44, height: 24, background: form.is_open ? 'var(--accent)' : '#FF3D00', border: 'none', cursor: 'pointer' }}>
                  <span className="absolute top-1 rounded-full transition-all"
                    style={{ width: 16, height: 16, background: 'var(--black)', left: form.is_open ? 24 : 4 }} />
                </button>
                <span className="font-condensed font-black text-sm uppercase tracking-widest"
                  style={{ color: form.is_open ? 'var(--accent)' : '#FF3D00' }}>
                  {form.is_open ? 'ODPRT' : 'ZAPRT'}
                </span>
              </div>
            </div>
          </div>

          {form.is_open && (
            <div className="flex flex-wrap gap-4 items-end p-4 rounded-xl"
              style={{ background: 'rgba(250,177,32,0.05)', border: '1px solid rgba(250,177,32,0.2)' }}>
              <div>
                <Label>Ura odprtja</Label>
                <input type="time" value={form.open_time} onChange={e => setF('open_time', e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm outline-none" style={{ ...inputStyle, width: '120px' }} />
              </div>
              <div>
                <Label>Ura zaprtja</Label>
                <input type="time" value={form.close_time} onChange={e => setF('close_time', e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm outline-none" style={{ ...inputStyle, width: '120px' }} />
              </div>
              <div className="font-condensed text-xs self-end pb-2.5" style={{ color: 'var(--gray)' }}>
                {(() => {
                  const c = calcCap(form.open_time, form.close_time)
                  return c ? `${c.hrs} ur · kap. ${c.cap} obisk.` : ''
                })()}
              </div>
            </div>
          )}

          {error && <div className="font-condensed text-xs font-bold" style={{ color: '#FF3D00' }}>{error}</div>}

          <button type="submit" disabled={submitting || !form.date_from}
            className="font-condensed font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg self-start"
            style={{ background: form.date_from ? 'var(--accent)' : 'var(--dark3)', color: form.date_from ? 'var(--black)' : 'var(--border)', opacity: submitting ? 0.6 : 1 }}>
            {submitting ? 'DODAJAM...' : '+ DODAJ IZJEMO'}
          </button>
        </form>
      </div>

      <div className="section-label mb-4">Prihajajoče izjeme ({overrides.length})</div>
      {overrides.length === 0 ? (
        <div className="card text-center py-10 font-condensed" style={{ color: 'var(--gray)' }}>
          Ni izjem. Tedenska shema velja za vse prihajajoče datume.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {overrides.map(ov => (
            <div key={ov.id} className="card py-3 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="font-condensed font-black text-base" style={{ color: ov.is_open ? 'var(--accent)' : '#FF3D00' }}>
                  {fmtDate(ov.date)}
                </div>
                <span className="font-condensed text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
                  style={{
                    background: ov.is_open ? 'rgba(250,177,32,0.12)' : 'rgba(255,61,0,0.1)',
                    color: ov.is_open ? 'var(--accent)' : '#FF3D00',
                  }}>
                  {ov.is_open ? `ODPRT ${ov.open_time}–${ov.close_time}` : 'ZAPRTO'}
                </span>
                {ov.reason && <span className="font-condensed text-sm" style={{ color: 'var(--gray)' }}>{ov.reason}</span>}
              </div>
              <button onClick={() => remove(ov.id)}
                className="font-condensed text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded transition-all"
                style={{ background: 'rgba(255,61,0,0.08)', color: '#FF3D00', border: '1px solid rgba(255,61,0,0.2)' }}>
                ODSTRANI
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────

export default function UrnikParkaTab() {
  return (
    <div>
      <div className="mb-8">
        <div className="section-label mb-2">Open Jump — urnik odprtosti</div>
        <p className="font-condensed text-sm" style={{ color: 'var(--gray)', lineHeight: 1.7 }}>
          Tukaj določiš kdaj je park odprt za Open Jump rezervacije. Urnik neposredno vpliva na razpoložljive termine v booking sistemu, prikaz zasedenosti in izračun kapacitete.
        </p>
      </div>

      <WeeklyScheduleSection />
      <OverridesSection />
    </div>
  )
}
