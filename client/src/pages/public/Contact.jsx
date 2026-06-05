import React, { useState } from 'react'

const INFO = [
  { icon: '📍', label: 'Naslov', value: 'Dolgi most, Ljubljana', sub: 'Odprtje jesen 2026' },
  { icon: '✉️', label: 'E-mail', value: 'info@odbito.si', sub: 'Odgovorimo v 24 urah' },
  { icon: '🕐', label: 'Open Jump', value: 'Pet – Ned, 09:00–21:00', sub: 'Rezervacija online' },
  { icon: '📅', label: 'Vadbe', value: 'Pon – Čet po urniku', sub: 'Mesečna/letna naročnina' },
]

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
            <div className="flex flex-col gap-4 mb-10">
              {INFO.map(i => (
                <div key={i.label} className="card flex items-start gap-4 py-4">
                  <span style={{ fontSize: '24px', flexShrink: 0 }}>{i.icon}</span>
                  <div>
                    <div className="font-condensed text-xs font-bold tracking-widest uppercase mb-0.5" style={{ color: 'var(--gray)' }}>
                      {i.label}
                    </div>
                    <div className="font-condensed font-black text-base uppercase tracking-wide" style={{ color: 'var(--white)' }}>
                      {i.value}
                    </div>
                    <div className="font-condensed text-xs mt-0.5" style={{ color: 'var(--gray)' }}>{i.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden flex items-center justify-center"
              style={{ height: '200px', background: 'var(--dark2)', border: '1px solid var(--border)' }}>
              <div className="text-center">
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🗺️</div>
                <div className="font-condensed text-sm font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>
                  Dolgi most, Ljubljana
                </div>
                <div className="font-condensed text-xs mt-1" style={{ color: 'var(--gray)' }}>
                  Karta bo na voljo ob odprtju
                </div>
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
          </div>
        </div>
      </section>

    </div>
  )
}
