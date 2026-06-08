import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwrx4zJ6tFtyrtzPn0PpxB6CoW9sMZ_6FrNMN0L6DjWzLHJ3NR2RuAOdNtLv8LLpFZL/exec'

const SPORTS = [
  { icon: '🤸', label: 'Gimnastika' },
  { icon: '🏀', label: 'Košarka' },
  { icon: '🧗', label: 'Plezanje' },
  { icon: '🤾', label: 'Igre z žogo' },
  { icon: '⛹️', label: 'Trampolining' },
  { icon: '🎯', label: 'Atletika' },
]

function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      await fetch(SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ime: name, vir: 'poletne-pocitnice' }),
      })
      setStatus('ok')
      setEmail('')
      setName('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'ok') {
    return (
      <div style={{
        background: 'rgba(212,255,0,0.08)', border: '1px solid rgba(212,255,0,0.3)',
        borderRadius: 12, padding: '24px 28px',
      }}>
        <div className="font-display" style={{ fontSize: 28, color: 'var(--accent)', marginBottom: 8 }}>
          PRIJAVA USPEŠNA. ✓
        </div>
        <p style={{ color: 'var(--gray)', fontSize: 14, lineHeight: 1.7 }}>
          Ste na čakalnem seznamu za Odbite počitnice 2027. Obvestili vas bomo med prvimi, ko bodo prijave odprte — in to z prednostjo pred splošno objavo.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        type="text"
        placeholder="Ime in priimek (neobvezno)"
        value={name}
        onChange={e => setName(e.target.value)}
        disabled={status === 'loading'}
        style={{
          background: '#111', border: '1px solid #333', borderRadius: 8,
          color: '#fff', padding: '12px 16px', fontSize: 14, outline: 'none',
          fontFamily: 'inherit',
        }}
      />
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="email"
          placeholder="tvoj@email.si"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={status === 'loading'}
          style={{
            flex: 1, background: '#111', border: '1px solid #333', borderRadius: 8,
            color: '#fff', padding: '12px 16px', fontSize: 14, outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email}
          className="font-condensed font-bold tracking-widest uppercase"
          style={{
            background: 'var(--accent)', border: 'none', borderRadius: 8,
            color: '#000', padding: '12px 24px', fontSize: 13,
            cursor: status === 'loading' || !email ? 'not-allowed' : 'pointer',
            opacity: !email ? 0.6 : 1,
            whiteSpace: 'nowrap',
          }}>
          {status === 'loading' ? '...' : 'PRIJAVI SE →'}
        </button>
      </div>
      {status === 'error' && (
        <p style={{ fontSize: 13, color: '#f87171' }}>Prišlo je do napake. Poskusi znova.</p>
      )}
    </form>
  )
}

export default function PoletneKonitnice() {
  return (
    <div style={{ background: 'var(--black)' }}>

      {/* ── HERO ── */}
      <section className="px-[5%] pt-20 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="section-label mb-4">Poletje 2027 · Sport City</div>
          <h1 className="font-display mb-6" style={{ fontSize: 'clamp(52px,10vw,110px)', color: 'var(--white)', lineHeight: 0.95 }}>
            ODBITE<br />
            <span style={{ color: 'var(--accent)' }}>POČITNICE.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--gray)', maxWidth: 560, lineHeight: 1.7 }}>
            Teden, ki ga otroci ne bodo pozabili. Julij in avgust, vsak dan nova avantura — v enem izmed največjih športno-rekreativnih centrov v Sloveniji.
          </p>
        </div>
      </section>

      {/* ── SLIKA ── */}
      <section className="px-[5%] mb-16">
        <div className="max-w-5xl mx-auto">
          <div style={{
            width: '100%', aspectRatio: '16/7', background: '#111',
            border: '1px solid var(--border)', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 12,
          }}>
            <span style={{ fontSize: 48 }}>🏟️</span>
            <span className="font-condensed text-xs tracking-widest uppercase" style={{ color: '#444' }}>
              Fotografija — Sport City / Odbito
            </span>
          </div>
        </div>
      </section>

      {/* ── PROGRAM ── */}
      <section className="px-[5%] py-16" style={{ background: 'var(--dark)' }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'start' }}>

            <div>
              <div className="section-label mb-3">Program</div>
              <h2 className="font-display mb-6" style={{ fontSize: 'clamp(32px,5vw,52px)', color: 'var(--white)', lineHeight: 1 }}>
                ŠPORT JE<br /><span style={{ color: 'var(--accent)' }}>TUKAJ DOMA.</span>
              </h2>
              <p style={{ fontSize: 15, color: 'var(--gray)', lineHeight: 1.8, marginBottom: 20 }}>
                Odbite počitnice potekajo v <strong style={{ color: 'var(--white)' }}>Športno-rekreativnem centru Sport City</strong> — prostoru z več kot 4.000 m² atrakcij, kjer je vsak šport dobrodošel in vsak talent pride do izraza.
              </p>
              <p style={{ fontSize: 15, color: 'var(--gray)', lineHeight: 1.8 }}>
                Vsak teden je sestavljen iz <strong style={{ color: 'var(--white)' }}>zabavnih treningov, spoznavanja različnih športov in tematskih dni</strong> pod vodstvom animatorjev. Otroci odkrijejo nove talente, navežejo nova prijateljstva in se vsak dan vrnejo domov utrujeni — na najboljši možni način.
              </p>
            </div>

            <div>
              <div className="section-label mb-4">Kaj nas čaka</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {SPORTS.map(s => (
                  <div key={s.label} style={{
                    background: '#111', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <span style={{ fontSize: 22 }}>{s.icon}</span>
                    <span className="font-condensed font-bold tracking-wide uppercase"
                      style={{ fontSize: 13, color: 'var(--white)' }}>{s.label}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: '#444', marginTop: 12, lineHeight: 1.6 }}>
                In še veliko več — program se oblikuje za vsako sezono posebej.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── INFO STRIP ── */}
      <section className="px-[5%] py-10">
        <div className="max-w-5xl mx-auto">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 1, background: 'var(--border)', borderRadius: 12, overflow: 'hidden',
          }}>
            {[
              { label: 'Kdaj', value: 'Julij & Avgust' },
              { label: 'Urnik', value: 'Pon – Pet · 08–16' },
              { label: 'Starost', value: '6 – 14 let' },
              { label: 'Lokacija', value: 'Sport City' },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--dark2)', padding: '20px 24px', textAlign: 'center' }}>
                <div className="section-label" style={{ marginBottom: 6 }}>{item.label}</div>
                <div className="font-condensed font-black uppercase tracking-wide"
                  style={{ fontSize: 16, color: 'var(--white)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CENE ── */}
      <section className="px-[5%] py-10" style={{ background: 'var(--dark)' }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div style={{ background: '#111', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 24px' }}>
              <div className="section-label mb-2">Dnevna vstopnina</div>
              <div className="font-display" style={{ fontSize: 48, color: 'var(--white)', lineHeight: 1 }}>€45</div>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 8 }}>na otroka / dan</div>
            </div>
            <div style={{ background: '#111', border: '1px solid var(--accent)', borderRadius: 12, padding: '28px 24px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: 20 }}>
                <span className="font-condensed text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{ background: 'var(--accent)', color: 'var(--black)' }}>PRIPOROČENO</span>
              </div>
              <div className="section-label mb-2">Tedenski paket</div>
              <div className="font-display" style={{ fontSize: 48, color: 'var(--accent)', lineHeight: 1 }}>€225</div>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 8 }}>na otroka / teden (pon–pet)</div>
            </div>
            <div style={{ background: '#111', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 24px' }}>
              <div className="section-label mb-2">Popust za 2. otroka</div>
              <div className="font-display" style={{ fontSize: 48, color: 'var(--white)', lineHeight: 1 }}>–15%</div>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 8 }}>velja za oba paketa</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ČAKALNI SEZNAM ── */}
      <section className="px-[5%] py-20">
        <div className="max-w-2xl mx-auto">
          <div className="section-label mb-4">Mesta so omejena</div>
          <h2 className="font-display mb-4" style={{ fontSize: 'clamp(36px,6vw,64px)', color: 'var(--white)', lineHeight: 1 }}>
            PRIJAVI SE<br /><span style={{ color: 'var(--accent)' }}>NA SEZNAM.</span>
          </h2>
          <p style={{ fontSize: 15, color: 'var(--gray)', lineHeight: 1.8, marginBottom: 32 }}>
            Program za poletje 2027 je v pripravi. Prijava na čakalni seznam ti zagotovi <strong style={{ color: 'var(--white)' }}>prednost pri vpisu</strong> in obvestilo takoj, ko bo program odprt za prijave — preden objavimo splošno.
            <br /><br />
            Zanimam se za Odbite počitnice. Bodi med prvimi.
          </p>

          <WaitlistForm />

          <p style={{ fontSize: 12, color: '#444', marginTop: 16, lineHeight: 1.6 }}>
            S prijavo se strinjaš z obdelavo e-naslova za namen obveščanja o Odbitih počitnicah. Odjavitev je možna kadarkoli.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-[5%] py-10" style={{ background: 'var(--dark)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-6">
          <div>
            <div className="font-condensed font-bold tracking-wide uppercase" style={{ color: 'var(--gray)', fontSize: 13 }}>
              Imaš vprašanje?
            </div>
            <div className="font-display" style={{ fontSize: 24, color: 'var(--white)' }}>Piši nam.</div>
          </div>
          <Link to="/kontakt" className="btn-primary">KONTAKTIRAJ NAS →</Link>
        </div>
      </section>

    </div>
  )
}
