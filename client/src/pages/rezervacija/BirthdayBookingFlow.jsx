import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../services/api.js'
import pricing from '../../data/pricing.json'

// ── Constants from pricing.json ───────────────────────────────────────

const PACKAGES = pricing.birthdayParties.packages
const PKG_COLORS = { bd_basic: '#7BB3E8', bd_standard: 'var(--accent)', bd_premium: '#a78bfa' }
const TIME_SLOTS = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00']

// ── Helpers ───────────────────────────────────────────────────────────

const fmt = (n) => new Intl.NumberFormat('sl-SI', { style: 'currency', currency: 'EUR' }).format(n || 0)

function calcTotal(pkg, count) {
  const extra = Math.max(0, count - pkg.maxChildren)
  return +(pkg.basePrice + extra * pkg.extraChildPrice).toFixed(2)
}

// ── Shared components ─────────────────────────────────────────────────

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="font-condensed font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
      style={{ color: 'var(--white)', background: 'var(--dark2)', border: '1px solid var(--border)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--white)' }}>
      ← Nazaj
    </button>
  )
}

function StepIndicator({ step }) {
  const steps = ['Paket', 'Termin', 'Podatki', 'Potrditev']
  const idx = { package: 0, datetime: 1, contact: 2, confirm: 3 }
  const current = idx[step] ?? 0
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
              style={{ color: i <= current ? 'var(--white)' : 'var(--gray)', whiteSpace: 'nowrap' }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-px" style={{ background: i < current ? 'var(--accent)' : 'var(--border)', minWidth: 8 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Step 1: Package selection ─────────────────────────────────────────

function PackageStep({ onSelect }) {
  return (
    <div>
      <h2 className="font-condensed font-black text-sm uppercase tracking-widest mb-1" style={{ color: 'var(--gray)' }}>Korak 1</h2>
      <h3 className="font-display leading-none mb-3" style={{ fontSize: 'clamp(32px,5vw,52px)', color: 'var(--white)' }}>
        IZBERI PAKET<span style={{ color: 'var(--accent)' }}>.</span>
      </h3>
      <p className="mb-8" style={{ color: 'var(--gray)', fontSize: '15px' }}>
        Vsi paketi vključujejo zasebno party sobo — neodvisno od open jump kapacitete.
      </p>
      <div className="grid sm:grid-cols-3 gap-4">
        {PACKAGES.map(pkg => {
          const color = PKG_COLORS[pkg.id] || 'var(--accent)'
          return (
            <button key={pkg.id} onClick={() => onSelect(pkg)}
              className="card flex flex-col text-left transition-all relative"
              style={{ borderTop: `3px solid ${color}`, cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'none' }}>
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-condensed text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{ background: 'var(--accent)', color: 'var(--black)', whiteSpace: 'nowrap' }}>PRILJUBLJEN</span>
              )}
              <div className="font-display text-4xl leading-none mb-4" style={{ color }}>{pkg.label.toUpperCase()}</div>

              <div className="font-display leading-none mb-1" style={{ fontSize: '38px', color }}>
                {fmt(pkg.basePrice)}
              </div>
              <div className="font-condensed text-xs mb-4" style={{ color: 'var(--gray)' }}>
                do {pkg.maxChildren} otrok · +{fmt(pkg.extraChildPrice)}/dodatni otrok
              </div>

              <ul className="flex flex-col gap-2 flex-grow mb-4">
                {[
                  `${pkg.jumping} min skakanja`,
                  `Party soba ${pkg.partyRoom} min`,
                  pkg.animation ? `Animacija: ${pkg.animation}` : null,
                  pkg.drinks ? 'Pijača vključena' : null,
                  pkg.catering ? 'Catering vključen' : null,
                  pkg.decoration ? 'Dekoracija vključena' : null,
                  `Torta: ${pkg.cake}`,
                ].filter(Boolean).map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color, flexShrink: 0, marginTop: '2px' }}>✓</span>
                    <span className="font-condensed text-sm font-bold" style={{ color: 'var(--white)' }}>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="font-condensed font-black text-sm uppercase tracking-widest text-center py-2.5 rounded-lg mt-auto"
                style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
                IZBERI →
              </div>
            </button>
          )
        })}
      </div>
      <p className="mt-6 font-condensed text-xs text-center" style={{ color: 'var(--gray)' }}>
        {pricing.birthdayParties.note_parents}
      </p>
    </div>
  )
}

// ── Step 2: Date, Time, Children count ───────────────────────────────

function DateTimeStep({ pkg, onBack, onNext }) {
  const [date, setDate]     = useState('')
  const [time, setTime]     = useState('')
  const [count, setCount]   = useState(pkg.maxChildren)
  const color = PKG_COLORS[pkg.id] || 'var(--accent)'

  const total = calcTotal(pkg, count)
  const extra = Math.max(0, count - pkg.maxChildren)

  // Min date: tomorrow
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const canContinue = date && time

  return (
    <div>
      <BackBtn onClick={onBack} />

      {/* Selected package reminder */}
      <div className="rounded-xl px-4 py-3 mb-6 flex items-center gap-3"
        style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="font-condensed font-black text-sm uppercase tracking-wide" style={{ color }}>
          {pkg.label} — {fmt(pkg.basePrice)}
        </span>
      </div>

      <h2 className="font-condensed font-black text-sm uppercase tracking-widest mb-1" style={{ color: 'var(--gray)' }}>Korak 2</h2>
      <h3 className="font-display leading-none mb-8" style={{ fontSize: 'clamp(32px,5vw,52px)', color: 'var(--white)' }}>
        DATUM & ČAS<span style={{ color: 'var(--accent)' }}>.</span>
      </h3>

      <div className="flex flex-col gap-5">
        {/* Date */}
        <div>
          <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>
            Datum zabave
          </label>
          <input type="date" value={date} min={minDate}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-3 rounded-xl text-sm outline-none font-condensed"
            style={{ background: 'var(--dark2)', border: `1px solid ${date ? 'var(--accent)' : 'var(--border)'}`, color: 'var(--white)', maxWidth: '300px' }} />
        </div>

        {/* Time */}
        <div>
          <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>
            Želeni začetni čas
          </label>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map(t => (
              <button key={t} onClick={() => setTime(t)}
                className="font-condensed font-black text-sm px-4 py-2 rounded-lg transition-all"
                style={{
                  background: time === t ? 'var(--accent)' : 'var(--dark2)',
                  color: time === t ? 'var(--black)' : 'var(--gray)',
                  border: `1px solid ${time === t ? 'var(--accent)' : 'var(--border)'}`,
                }}>
                {t}
              </button>
            ))}
          </div>
          <p className="font-condensed text-xs mt-2" style={{ color: 'var(--gray)' }}>
            Razpoložljivost potrdi naša ekipa pri potrditvi rezervacije.
          </p>
        </div>

        {/* Children count */}
        <div>
          <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>
            Število otrok
          </label>
          <div className="flex items-center gap-4">
            <button onClick={() => setCount(c => Math.max(1, c-1))}
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl"
              style={{ background: 'var(--dark2)', border: '1px solid var(--border)', color: 'var(--white)' }}>−</button>
            <span className="font-display text-4xl w-12 text-center" style={{ color: 'var(--white)' }}>{count}</span>
            <button onClick={() => setCount(c => Math.min(30, c+1))}
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl"
              style={{ background: 'var(--dark2)', border: '1px solid var(--border)', color: 'var(--white)' }}>+</button>
            <span className="font-condensed text-sm" style={{ color: 'var(--gray)' }}>
              {count > pkg.maxChildren
                ? <span style={{ color: color }}>{extra} extra (+{fmt(extra * pkg.extraChildPrice)})</span>
                : `vključenih do ${pkg.maxChildren}`}
            </span>
          </div>
        </div>

        {/* Price preview */}
        <div className="rounded-xl px-4 py-3 flex items-center justify-between"
          style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }}>
          <span className="font-condensed font-bold tracking-widest uppercase text-xs" style={{ color: 'var(--gray)' }}>
            Ocena cene
          </span>
          <span className="font-display" style={{ fontSize: '28px', color }}>
            {fmt(total)}
          </span>
        </div>
      </div>

      <button onClick={() => onNext({ date, time, count, total })} disabled={!canContinue}
        className="w-full mt-8 font-condensed font-black uppercase tracking-widest rounded-xl py-4"
        style={{
          background: canContinue ? 'var(--accent)' : 'var(--dark2)',
          color: canContinue ? 'var(--black)' : 'var(--border)',
          border: `1px solid ${canContinue ? 'var(--accent)' : 'var(--border)'}`,
          cursor: canContinue ? 'pointer' : 'not-allowed',
          fontSize: '15px',
          boxShadow: canContinue ? '0 4px 20px rgba(250,177,32,0.25)' : 'none',
        }}>
        {!date ? 'IZBERI DATUM' : !time ? 'IZBERI URA' : 'NAPREJ →'}
      </button>
    </div>
  )
}

// ── Step 3: Contact + child details ───────────────────────────────────

function ContactStep({ pkg, dateTime, onBack, onNext }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    contact_first_name: user?.first_name || '',
    contact_last_name:  user?.last_name  || '',
    contact_email:      user?.email      || '',
    contact_phone:      user?.phone      || '',
    child_name: '',
    child_age:  '',
    notes: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const canContinue = form.contact_first_name && form.contact_last_name &&
    form.contact_email && form.contact_phone && form.child_name && form.child_age

  const FieldLabel = ({ children }) => (
    <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1.5 block" style={{ color: 'var(--gray)' }}>
      {children}
    </label>
  )
  const Field = ({ k, ...props }) => (
    <div>
      <FieldLabel>{props.label}</FieldLabel>
      <input value={form[k]} onChange={e => set(k, e.target.value)} {...props}
        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-condensed transition-all"
        style={{ background: 'var(--dark3)', border: `1px solid ${form[k] ? 'rgba(250,177,32,0.4)' : 'var(--border)'}`, color: 'var(--white)' }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = form[k] ? 'rgba(250,177,32,0.4)' : 'var(--border)'} />
    </div>
  )

  return (
    <div>
      <BackBtn onClick={onBack} />
      <h2 className="font-condensed font-black text-sm uppercase tracking-widest mb-1" style={{ color: 'var(--gray)' }}>Korak 3</h2>
      <h3 className="font-display leading-none mb-8" style={{ fontSize: 'clamp(32px,5vw,52px)', color: 'var(--white)' }}>
        VAŠI PODATKI<span style={{ color: 'var(--accent)' }}>.</span>
      </h3>

      <div className="flex flex-col gap-5">
        <div>
          <div className="section-label mb-4">Kontaktna oseba</div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field k="contact_first_name" label="Ime *" placeholder="Ana" required />
            <Field k="contact_last_name"  label="Priimek *" placeholder="Novak" required />
            <Field k="contact_email" label="E-mail *" type="email" placeholder="ana@primer.si" required />
            <Field k="contact_phone" label="Telefon *" type="tel" placeholder="041 123 456" required />
          </div>
        </div>

        <div>
          <div className="section-label mb-4">Jubilejnik</div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field k="child_name" label="Ime otroka *" placeholder="Lara" required />
            <div>
              <FieldLabel>Starost (leta) *</FieldLabel>
              <select value={form.child_age} onChange={e => set('child_age', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-condensed"
                style={{ background: 'var(--dark3)', border: `1px solid ${form.child_age ? 'rgba(250,177,32,0.4)' : 'var(--border)'}`, color: 'var(--white)' }}>
                <option value="">Izberi starost...</option>
                {Array.from({ length: 18 }, (_, i) => i + 1).map(a => (
                  <option key={a} value={a}>{a} let</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <FieldLabel>Posebne želje ali opombe (neobvezno)</FieldLabel>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
            placeholder="Alergije, prehranske omejitve, tematika, posebne zahteve..."
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-condensed resize-none"
            style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--white)', lineHeight: 1.6 }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
      </div>

      <button onClick={() => onNext(form)} disabled={!canContinue}
        className="w-full mt-8 font-condensed font-black uppercase tracking-widest rounded-xl py-4"
        style={{
          background: canContinue ? 'var(--accent)' : 'var(--dark2)',
          color: canContinue ? 'var(--black)' : 'var(--border)',
          border: `1px solid ${canContinue ? 'var(--accent)' : 'var(--border)'}`,
          cursor: canContinue ? 'pointer' : 'not-allowed',
          fontSize: '15px',
          boxShadow: canContinue ? '0 4px 20px rgba(250,177,32,0.25)' : 'none',
        }}>
        NAPREJ → PREGLED
      </button>
    </div>
  )
}

// ── Step 4: Confirm ───────────────────────────────────────────────────

function ConfirmStep({ pkg, dateTime, contact, onBack, onReset }) {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]             = useState(false)
  const [bookingCode, setBookingCode] = useState('')
  const [error, setError]           = useState('')
  const color = PKG_COLORS[pkg.id] || 'var(--accent)'

  const handleSubmit = async () => {
    setSubmitting(true); setError('')
    try {
      const { data } = await api.post('/birthday/book', {
        package_id:         pkg.id,
        event_date:         dateTime.date,
        event_time:         dateTime.time,
        children_count:     dateTime.count,
        child_name:         contact.child_name,
        child_age:          contact.child_age,
        contact_first_name: contact.contact_first_name,
        contact_last_name:  contact.contact_last_name,
        contact_email:      contact.contact_email,
        contact_phone:      contact.contact_phone,
        notes:              contact.notes || '',
      })
      setBookingCode(data.booking_code)
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Napaka pri oddaji. Prosimo poskusite znova.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) return (
    <div className="text-center py-8">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid #22c55e' }}>
        <span style={{ fontSize: '36px' }}>🎉</span>
      </div>
      <h2 className="font-display mb-2 leading-none" style={{ fontSize: 'clamp(36px,6vw,58px)', color: 'var(--white)' }}>
        POVPRAŠEVANJE<br /><span style={{ color: 'var(--accent)' }}>ODDANO!</span>
      </h2>
      <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--gray)', lineHeight: 1.7 }}>
        Vaše povpraševanje smo prejeli. Potrditev boste prejeli na <strong style={{ color: 'var(--white)' }}>{contact.contact_email}</strong> v 24 urah.
      </p>
      <div className="rounded-2xl p-6 mb-8 text-left max-w-md mx-auto" style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }}>
        <div className="section-label mb-3">Referenčna koda</div>
        <div className="font-display text-4xl mb-4" style={{ color, letterSpacing: '0.1em' }}>
          {bookingCode?.split('-')[0].toUpperCase()}
        </div>
        {[
          ['Paket', pkg.label],
          ['Datum', new Date(dateTime.date + 'T12:00:00').toLocaleDateString('sl-SI')],
          ['Ura', dateTime.time],
          ['Otrok', `${dateTime.count}`],
          ['Jubilejnik', `${contact.child_name}, ${contact.child_age} let`],
          ['Okvirna cena', fmt(dateTime.total)],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>{k}</span>
            <span className="font-condensed font-bold text-sm" style={{ color: 'var(--white)' }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={onReset} className="btn-secondary">NOVO POVPRAŠEVANJE</button>
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>DOMOV →</Link>
      </div>
    </div>
  )

  return (
    <div>
      <BackBtn onClick={onBack} />
      <h2 className="font-condensed font-black text-sm uppercase tracking-widest mb-1" style={{ color: 'var(--gray)' }}>Korak 4</h2>
      <h3 className="font-display leading-none mb-8" style={{ fontSize: 'clamp(28px,4vw,44px)', color: 'var(--white)' }}>
        POTRDI<span style={{ color: 'var(--accent)' }}>.</span>
      </h3>

      <div className="rounded-2xl overflow-hidden mb-6" style={{ border: '1px solid var(--border)' }}>
        {[
          ['Paket', <span style={{ color }}>{pkg.label}</span>],
          ['Datum', new Date(dateTime.date + 'T12:00:00').toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
          ['Ura', dateTime.time],
          ['Število otrok', dateTime.count],
          ['Jubilejnik', `${contact.child_name}, ${contact.child_age} let`],
          ['Kontakt', `${contact.contact_first_name} ${contact.contact_last_name} · ${contact.contact_phone}`],
          ['E-mail', contact.contact_email],
          contact.notes ? ['Opombe', contact.notes] : null,
        ].filter(Boolean).map(([k, v], i, arr) => (
          <div key={k} className="flex items-start justify-between px-6 py-4"
            style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', background: 'var(--dark2)' }}>
            <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)', flexShrink: 0, marginRight: '16px' }}>{k}</span>
            <span className="font-condensed font-bold text-sm text-right" style={{ color: 'var(--white)' }}>{v}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-6 py-5" style={{ background: `${color}08` }}>
          <span className="font-condensed font-black text-sm tracking-widest uppercase" style={{ color }}>Okvirna cena</span>
          <span className="font-display text-4xl" style={{ color }}>{fmt(dateTime.total)}</span>
        </div>
      </div>

      <div className="rounded-xl px-4 py-3 mb-6 font-condensed text-sm"
        style={{ background: 'var(--dark2)', border: '1px solid var(--border)', color: 'var(--gray)', lineHeight: 1.65 }}>
        🎂 Vaše povpraševanje bo pregledano v 24 urah. Po potrditvi boste prejeli e-mail z navodili za plačilo in podrobnostmi o dnevu.
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 mb-4 font-condensed font-bold text-xs"
          style={{ background: 'rgba(255,61,0,0.08)', border: '1px solid rgba(255,61,0,0.25)', color: '#FF3D00' }}>
          {error}
        </div>
      )}

      <button onClick={handleSubmit} disabled={submitting}
        className="w-full font-condensed font-black uppercase tracking-widest rounded-xl py-4"
        style={{
          background: 'var(--accent)', color: 'var(--black)', border: 'none',
          cursor: submitting ? 'wait' : 'pointer', fontSize: '15px',
          opacity: submitting ? 0.7 : 1,
          boxShadow: '0 4px 24px rgba(250,177,32,0.3)',
        }}>
        {submitting ? 'POŠILJAM...' : '🎉 ODDAJ POVPRAŠEVANJE'}
      </button>
    </div>
  )
}

// ── Main flow ─────────────────────────────────────────────────────────

export default function BirthdayBookingFlow() {
  const [step, setStep] = useState('package')
  const [selectedPkg, setPkg]         = useState(null)
  const [dateTime, setDateTime]       = useState(null)
  const [contactData, setContactData] = useState(null)

  const reset = () => {
    setStep('package'); setPkg(null); setDateTime(null); setContactData(null)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] px-[5%] py-16" style={{ background: 'var(--black)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        <div className="mb-10">
          <div className="section-label mb-3">Rojstni dnevi</div>
          <h1 className="font-display leading-none" style={{ fontSize: 'clamp(48px,8vw,90px)', color: 'var(--white)' }}>
            REZERVACIJA<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
        </div>

        <StepIndicator step={step} />

        {step === 'package' && (
          <PackageStep onSelect={pkg => { setPkg(pkg); setStep('datetime') }} />
        )}
        {step === 'datetime' && selectedPkg && (
          <DateTimeStep pkg={selectedPkg} onBack={() => setStep('package')}
            onNext={dt => { setDateTime(dt); setStep('contact') }} />
        )}
        {step === 'contact' && selectedPkg && dateTime && (
          <ContactStep pkg={selectedPkg} dateTime={dateTime}
            onBack={() => setStep('datetime')}
            onNext={cd => { setContactData(cd); setStep('confirm') }} />
        )}
        {step === 'confirm' && selectedPkg && dateTime && contactData && (
          <ConfirmStep
            pkg={selectedPkg} dateTime={dateTime} contact={contactData}
            onBack={() => setStep('contact')}
            onReset={reset} />
        )}

      </div>
    </div>
  )
}
