import React, { useState } from 'react'

const HOURS = [
  { short: 'PON', full: 'Ponedeljek', time: '15:00 – 21:30', tags: ['akademija'] },
  { short: 'TOR', full: 'Torek',      time: '15:00 – 21:30', tags: ['akademija'] },
  { short: 'SRE', full: 'Sreda',      time: '15:00 – 21:30', tags: ['akademija'] },
  { short: 'ČET', full: 'Četrtek',    time: '15:00 – 21:30', tags: ['akademija'] },
  { short: 'PET', full: 'Petek',      time: '15:00 – 21:30', tags: ['akademija', 'openjump'] },
  { short: 'SOB', full: 'Sobota',     time: '10:00 – 21:00', tags: ['openjump'] },
  { short: 'NED', full: 'Nedelja',    time: '10:00 – 20:00', tags: ['openjump'] },
]

const TAG_STYLE = {
  akademija: { label: 'Akademija', bg: 'rgba(250,177,32,0.15)', color: '#fab120' },
  openjump:  { label: 'Open Jump', bg: 'rgba(74,159,255,0.15)', color: '#4a9eff' },
}

const SHORT_COLOR = {
  PON: '#fab120', TOR: '#fab120', SRE: '#fab120', ČET: '#fab120',
  PET: '#fab120', SOB: '#4a9eff', NED: '#4a9eff',
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSending(true)
    // TODO: connect to backend contact endpoint
    await new Promise(r => setTimeout(r, 800))
    setSent(true)
    setSending(false)
  }

  const inputBase = {
    background: 'var(--dark2)',
    border: '1px solid var(--border)',
    color: 'var(--white)',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    fontFamily: 'Barlow, sans-serif',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{ background: 'var(--black)' }}>

      {/* Hero */}
      <section className="px-[5%] pt-20 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="section-label mb-4">Kontakt</div>
          <h1 className="font-display mb-5" style={{ fontSize: 'clamp(56px,10vw,110px)', color: 'var(--white)', lineHeight: 1 }}>
            PIŠITE <span style={{ color: 'var(--accent)' }}>NAM.</span>
          </h1>
          <p className="max-w-lg" style={{ fontSize: '17px' }}>
            Vprašanja o rezervacijah, vadbenih programih ali rojstnih dnevih? Tu smo.
          </p>
        </div>
      </section>

      <section className="px-[5%] pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">

          {/* Info */}
          <div>

            {/* Delovni čas */}
            <div className="section-label mb-4">Delovni čas</div>
            <div className="rounded-2xl overflow-hidden mb-8" style={{ border: '1px solid var(--border)' }}>
              {HOURS.map((row, i) => (
                <div key={row.short}
                  className="flex items-center gap-4 px-5 py-3"
                  style={{
                    borderBottom: i < HOURS.length - 1 ? '1px solid var(--border)' : 'none',
                    background: i % 2 === 0 ? 'var(--dark2)' : 'rgba(255,255,255,0.015)',
                  }}>
                  <span className="font-condensed font-black text-sm w-10 flex-shrink-0"
                    style={{ color: SHORT_COLOR[row.short], letterSpacing: '0.1em' }}>
                    {row.short}
                  </span>
                  <span className="font-condensed text-sm flex-1" style={{ color: 'var(--gray)' }}>
                    {row.full}
                  </span>
                  <span className="font-condensed font-black text-sm" style={{ color: 'var(--white)' }}>
                    {row.time}
                  </span>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {row.tags.map(t => (
                      <span key={t} className="font-condensed font-bold text-xs uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{ background: TAG_STYLE[t].bg, color: TAG_STYLE[t].color, letterSpacing: '0.08em' }}>
                        {TAG_STYLE[t].label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Map image */}
            <div className="section-label mb-4">Kje nas najdete</div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Dolgi+most+6a+1000+Ljubljana"
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="relative rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <img
                  src="/ODBITO_MAP_3.webp"
                  alt="Odbito lokacija — Dolgi most 6a, Ljubljana"
                  style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: 'rgba(250,177,32,0.18)', backdropFilter: 'blur(2px)' }}>
                  <div className="font-condensed font-black text-sm tracking-widest uppercase px-4 py-2 rounded-lg"
                    style={{ background: 'var(--accent)', color: 'var(--black)' }}>
                    ODPRI V GOOGLE MAPS →
                  </div>
                </div>
              </div>
            </a>

            {/* Naslov pod zemljevidom */}
            <div className="flex items-center gap-3 mt-4 px-1">
              <span style={{ fontSize: '18px' }}>📍</span>
              <div>
                <div className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>Naslov</div>
                <div className="font-condensed font-black text-base uppercase tracking-wide" style={{ color: 'var(--white)' }}>Dolgi most 6a, 1000 Ljubljana</div>
              </div>
            </div>

          </div>

          {/* Form */}
          <div>
            {sent ? (
              <div className="card text-center py-16">
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
                <h2 className="font-display mb-3" style={{ fontSize: '40px', color: 'var(--white)', lineHeight: 1 }}>
                  SPOROČILO<br /><span style={{ color: 'var(--accent)' }}>POSLANO!</span>
                </h2>
                <p style={{ color: 'var(--gray)' }}>Odgovorili vam bomo v 24 urah.</p>
              </div>
            ) : (
              <div className="card">
                <div className="section-label mb-6">Kontaktni obrazec</div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>Ime in priimek</label>
                      <input name="name" value={form.name} onChange={handleChange} required
                        placeholder="Janez Novak" style={inputBase}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                    <div>
                      <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>Telefon</label>
                      <input name="phone" value={form.phone} onChange={handleChange}
                        placeholder="+386 40 000 000" style={inputBase}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  </div>

                  <div>
                    <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>E-mail</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required
                      placeholder="ime@email.com" style={inputBase}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>

                  <div>
                    <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>Zadeva</label>
                    <select name="subject" value={form.subject} onChange={handleChange} required style={inputBase}>
                      <option value="">Izberite temo...</option>
                      <option value="openjump">Open Jump — rezervacija</option>
                      <option value="classes">Vadbeni programi</option>
                      <option value="birthday">Rojstni dan</option>
                      <option value="events">Posebni dogodki</option>
                      <option value="other">Splošno vprašanje</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>Sporočilo</label>
                    <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                      placeholder="Vaše vprašanje ali sporočilo..."
                      style={{ ...inputBase, resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>

                  <button type="submit" disabled={sending} className="btn-primary w-full text-center"
                    style={{ opacity: sending ? 0.6 : 1 }}>
                    {sending ? 'POŠILJAM...' : 'POŠLJI SPOROČILO →'}
                  </button>

                  <p style={{ fontSize: '12px', color: 'var(--gray)', textAlign: 'center' }}>
                    Odgovorimo v 24 urah. Za nujne zadeve pišite direktno na info@odbito.si
                  </p>
                </form>
              </div>
            )}

            {/* Kontakt — telefon + email */}
            <div className="mt-6">
              <div className="section-label mb-4">Kontakt</div>
              <div className="flex flex-col gap-3">
                <a href="tel:+38640123456" className="card flex items-center gap-4 py-3"
                  style={{ textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(250,177,32,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <span style={{ fontSize: '22px', flexShrink: 0 }}>📞</span>
                  <div>
                    <div className="font-condensed text-xs font-bold tracking-widest uppercase mb-0.5" style={{ color: 'var(--gray)' }}>Telefon</div>
                    <div className="font-condensed font-black text-base uppercase tracking-wide" style={{ color: 'var(--white)' }}>040 123 456</div>
                  </div>
                </a>
                <a href="mailto:info@odbito.fun" className="card flex items-center gap-4 py-3"
                  style={{ textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(250,177,32,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <span style={{ fontSize: '22px', flexShrink: 0 }}>✉️</span>
                  <div>
                    <div className="font-condensed text-xs font-bold tracking-widest uppercase mb-0.5" style={{ color: 'var(--gray)' }}>E-mail</div>
                    <div className="font-condensed font-black text-base tracking-wide" style={{ color: 'var(--white)' }}>info@odbito.fun</div>
                  </div>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
