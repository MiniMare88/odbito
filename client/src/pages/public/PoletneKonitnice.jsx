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

const HIGHLIGHTS = [
  {
    icon: '⚡',
    title: 'Za vse športne duše',
    sub: '6 – 15 let',
    body: 'Dobrodošli so vsi otroci med 6. in 15. letom. Razdelimo jih v primerne starostne skupine, kjer skozi šport, ekipne aktivnosti in skupne izzive nastanejo nova prijateljstva — in mogoče prve prave tekmovalne ekipe.',
  },
  {
    icon: '🏅',
    title: 'Šport + znanje',
    sub: 'Aktivno in poučno',
    body: 'Program otroke popelje skozi različne športne discipline — od trampolininga in gimnastike do plezanja in ekipnih iger. Vsak dan nova disciplina, vsak dan nova možnost, da odkrijejo šport, ki jim bo ostal v srcu.',
  },
  {
    icon: '🧡',
    title: 'Brez stresa za starše',
    sub: 'Brezskrbno varstvo',
    body: 'Parkirišče pred vhodom, hitra predaja v dobre roke. Otroci so z nami od 08:00 do 16:00 pod vodstvom izkušenih animatorjev in trenerjev — vi pa mirno na delo.',
  },
  {
    icon: '🎒',
    title: 'Vse vključeno',
    sub: 'All-inclusive paket',
    body: 'Vstop na vse atrakcije, oprema, animatorji in celodnevni program — vse je že v ceni. Brez skritih stroškov, brez doplačil na licu mesta.',
  },
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
          <h1 className="font-display mb-6" style={{ fontSize: 'clamp(40px,7vw,96px)', color: 'var(--white)', lineHeight: 0.95, whiteSpace: 'nowrap' }}>
            <span style={{ color: 'var(--white)' }}>ODBITE </span><span style={{ color: 'var(--accent)' }}>POČITNICE</span><span style={{ color: 'var(--white)' }}>.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--gray)', maxWidth: 760, lineHeight: 1.75 }}>
            Teden, ki ga otroci ne bodo pozabili. Julij in avgust, vsak dan nova izkušnja — v enem izmed največjih športno-rekreativnih centrov v Sloveniji se bodo otroci preizkusili v različnih športih in morda našli svojo novo ljubezen do športa. <strong style={{ color: 'var(--white)' }}>Prebujamo iskrice v talentih in bodočih zvezdnikih.</strong>
          </p>
        </div>
      </section>

      {/* ── SLIKA ── */}
      <section className="px-[5%] mb-16">
        <div className="max-w-5xl mx-auto">
          <img
            src="/ODBITO poletje.png"
            alt="Odbite počitnice — Odbito"
            style={{
              width: '100%', borderRadius: 16, display: 'block',
              objectFit: 'cover', maxHeight: 520,
            }}
          />
        </div>
      </section>

      {/* ── INFO STRIP ── */}
      <section className="px-[5%] py-12">
        <div className="max-w-5xl mx-auto">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
          }}>
            {[
              { icon: '📅', label: 'Kdaj', value: 'Julij & Avgust' },
              { icon: '🕗', label: 'Urnik', value: 'Pon – Pet · 08–16' },
              { icon: '🧒', label: 'Starost', value: '6 – 16 let' },
              { icon: '📍', label: 'Lokacija', value: 'Sport City' },
            ].map(item => (
              <div key={item.label} style={{
                background: '#0d0d0d', border: '1px solid var(--border)',
                borderRadius: 14, padding: '24px 20px',
                display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <div>
                  <div className="section-label" style={{ marginBottom: 4 }}>{item.label}</div>
                  <div className="font-display" style={{ fontSize: 20, color: 'var(--white)', lineHeight: 1.1 }}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
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

      {/* ── HIGHLIGHTS ── */}
      <section className="px-[5%] py-16">
        <div className="max-w-5xl mx-auto">
          <div className="section-label mb-6">Zakaj Odbite počitnice?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {HIGHLIGHTS.map((h, i) => (
              <div key={i} style={{
                background: '#0d0d0d', border: '1px solid var(--border)', borderRadius: 14,
                padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ fontSize: 36, lineHeight: 1 }}>{h.icon}</div>
                <div>
                  <div className="section-label" style={{ marginBottom: 4 }}>{h.sub}</div>
                  <div className="font-display" style={{ fontSize: 22, color: 'var(--white)', lineHeight: 1.1 }}>{h.title.toUpperCase()}</div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.75, margin: 0 }}>{h.body}</p>
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
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span className="font-condensed" style={{ fontSize: 14, color: 'var(--gray)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>od</span>
                <span className="font-display" style={{ fontSize: 48, color: 'var(--white)', lineHeight: 1 }}>€45</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 8 }}>na otroka / dan</div>
            </div>
            <div style={{ background: '#111', border: '1px solid var(--accent)', borderRadius: 12, padding: '28px 24px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: 20 }}>
                <span className="font-condensed text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{ background: 'var(--accent)', color: 'var(--black)' }}>PRIPOROČENO</span>
              </div>
              <div className="section-label mb-2">Tedenski paket</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span className="font-condensed" style={{ fontSize: 14, color: 'var(--gray)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>od</span>
                <span className="font-display" style={{ fontSize: 48, color: 'var(--accent)', lineHeight: 1 }}>€225</span>
              </div>
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
