import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwrx4zJ6tFtyrtzPn0PpxB6CoW9sMZ_6FrNMN0L6DjWzLHJ3NR2RuAOdNtLv8LLpFZL/exec'

const SportIcons = {
  Gimnastika: () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
      {/* head */}
      <circle cx="24" cy="7" r="4" fill="currentColor"/>
      {/* body arched back */}
      <path d="M24 11 C18 14 14 20 16 27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* legs split */}
      <path d="M16 27 L10 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M16 27 L26 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* arms wide */}
      <path d="M20 17 L10 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M21 16 L32 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  Košarka: () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
      {/* head */}
      <circle cx="20" cy="7" r="4" fill="currentColor"/>
      {/* body */}
      <path d="M20 11 L20 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* legs */}
      <path d="M20 26 L15 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M20 26 L25 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* arm shooting up */}
      <path d="M20 18 L30 12 L36 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* other arm */}
      <path d="M20 20 L13 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* ball */}
      <circle cx="37" cy="6" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M33 6 Q37 3 41 6" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M37 2 Q40 6 37 10" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>
  ),
  Plezanje: () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
      {/* wall */}
      <line x1="36" y1="2" x2="36" y2="46" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
      {/* holds */}
      <rect x="30" y="8" width="6" height="3" rx="1.5" fill="currentColor" fillOpacity="0.4"/>
      <rect x="30" y="20" width="6" height="3" rx="1.5" fill="currentColor" fillOpacity="0.4"/>
      <rect x="30" y="33" width="6" height="3" rx="1.5" fill="currentColor" fillOpacity="0.4"/>
      {/* head */}
      <circle cx="22" cy="10" r="4" fill="currentColor"/>
      {/* body */}
      <path d="M22 14 L22 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* arm up to hold */}
      <path d="M22 16 L30 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* arm lower */}
      <path d="M22 20 L30 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* legs on wall */}
      <path d="M22 26 L28 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M22 26 L18 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  'Igre z žogo': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
      {/* head */}
      <circle cx="24" cy="7" r="4" fill="currentColor"/>
      {/* body leaning */}
      <path d="M24 11 L22 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* legs running */}
      <path d="M22 26 L16 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M22 26 L30 34 L28 42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* arm kicking-style back */}
      <path d="M22 18 L14 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* arm forward */}
      <path d="M22 16 L32 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* ball on ground */}
      <circle cx="13" cy="40" r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M10 37 Q13 35 16 37" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M8 40 Q13 45 18 40" stroke="currentColor" strokeWidth="1.2" fill="none" strokeOpacity="0.5"/>
    </svg>
  ),
  Trampolining: () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
      {/* trampoline bed */}
      <path d="M4 38 Q24 34 44 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* legs of trampoline */}
      <path d="M8 38 L4 46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5"/>
      <path d="M40 38 L44 46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5"/>
      {/* figure in air, tucked */}
      <circle cx="24" cy="10" r="4" fill="currentColor"/>
      {/* body tucked */}
      <path d="M24 14 C22 18 20 20 20 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* knees up */}
      <path d="M20 22 L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M20 22 L24 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* arms out */}
      <path d="M22 16 L14 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M23 16 L32 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  Atletika: () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
      {/* head */}
      <circle cx="18" cy="7" r="4" fill="currentColor"/>
      {/* body sprinting forward */}
      <path d="M18 11 L20 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* front leg forward */}
      <path d="M20 24 L28 32 L32 42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* back leg back */}
      <path d="M20 24 L14 34 L10 42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* front arm back */}
      <path d="M19 18 L12 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* back arm forward */}
      <path d="M20 16 L30 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* motion lines */}
      <line x1="4" y1="24" x2="10" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4"/>
      <line x1="2" y1="29" x2="9" y2="29" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.3"/>
      <line x1="5" y1="34" x2="10" y2="34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.2"/>
    </svg>
  ),
}

const SPORTS = [
  { label: 'Gimnastika' },
  { label: 'Košarka' },
  { label: 'Plezanje' },
  { label: 'Igre z žogo' },
  { label: 'Trampolining' },
  { label: 'Atletika' },
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

const TABOR_FAQ = [
  {
    q: 'Kdaj se začnejo prijave za Odbite počitnice 2027?',
    a: 'Prijave bodo odprte spomladi 2027. Vsi, ki se prijavijo na čakalni seznam, bodo obveščeni pred splošno objavo in bodo imeli prednost pri vpisu. Priporočamo zgodnjo prijavo, saj so mesta omejena.',
  },
  {
    q: 'Kaj vse je vključeno v ceno tabora?',
    a: 'V ceni je vključeno vse: vstop na vse atrakcije v Sport City, vodeni program z animatorji in trenerji, oprema za uporabo atrakcij ter celodnevno varstvo od 08:00 do 16:00. Morebitne dodatke (malica, prevoz) bomo objavili ob odprtju prijav.',
  },
  {
    q: 'Kakšne starosti so primerne za Odbite počitnice?',
    a: 'Program je namenjen otrokom med 6. in 16. letom. Otroke razdelimo v starostne skupine, da je program prilagojen njihovim zmožnostim in interesom. Mlajši odkrivajo šport skozi igro, starejši pa se lotijo bolj zahtevnih disciplin.',
  },
  {
    q: 'Ali je potrebna kakršna koli predhodna športna izkušnja?',
    a: 'Sploh ne. Odbite počitnice so odprte za vse — od popolnih začetnikov do tistih, ki šport že trenirajo. Animatorji in trenerji prilagodijo program vsakemu otroku posebej. Cilj je zabava, odkrivanje in napredek — ne tekmovalnost.',
  },
  {
    q: 'Kako poteka oddaja in prevzem otroka?',
    a: 'Otroke sprejemate pri vhodu v Sport City od 08:00 naprej. Prevzem je do 16:00. Parkirišče je pred objektom, predaja je hitra in organizirana. Podrobnejša navodila glede oddaje in varnostnih postopkov bomo posredovali ob vpisu.',
  },
  {
    q: 'Kaj pa, če otrok ne more priti določen dan?',
    a: 'Razumemo, da se plani kdaj spremenijo. Podrobna pravila o odpovedih in morebitnih nadomestitvah bomo objavili skupaj s pogoji vpisa. V primeru bolezni ali višje sile nas prosimo čim prej obvestite na info@odbito.si.',
  },
]

function TaborFAQ() {
  const [open, setOpen] = React.useState(null)
  return (
    <div>
      {TABOR_FAQ.map((item, i) => (
        <div key={i} style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 16,
              padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}>
            <span className="font-condensed font-bold tracking-wide uppercase"
              style={{ fontSize: 15, color: open === i ? 'var(--accent)' : 'var(--white)' }}>
              {item.q}
            </span>
            <span style={{
              color: 'var(--accent)', fontSize: 22, flexShrink: 0,
              transition: 'transform 0.2s', transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
              display: 'inline-block',
            }}>+</span>
          </button>
          {open === i && (
            <div style={{ padding: '0 0 20px', fontSize: 14, color: 'var(--gray)', lineHeight: 1.8, maxWidth: 620 }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function PoletneKonitnice() {
  return (
    <div style={{ background: 'var(--black)' }}>

      {/* ── HERO ── */}
      <section className="px-[5%] pt-10 lg:pt-20 pb-6">
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
      <section className="px-[5%] mb-6">
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
                {SPORTS.map(s => {
                  const Icon = SportIcons[s.label]
                  return (
                    <div key={s.label} style={{
                      background: '#111', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '16px',
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
                    }}>
                      <span style={{ color: 'var(--accent)' }}><Icon /></span>
                      <span className="font-condensed font-bold tracking-wide uppercase"
                        style={{ fontSize: 13, color: 'var(--white)' }}>{s.label}</span>
                    </div>
                  )
                })}
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
            Program za poletje 2027 je v pripravi. Prijava na čakalni seznam ti zagotovi <strong style={{ color: 'var(--white)' }}>prednost pri vpisu</strong> in obvestilo takoj, ko bo program odprt za prijave — preden objavimo splošno. Prijava na čakalni seznam je neobvezujoča in ni prijava v program. Bomo pa upoštevali — prej kot se prijaviš, večja je tvoja prednost.
            <br /><br />
            Zanimam se za Odbite počitnice. Sporočite mi takoj, ko bo kakšna nova informacija.
          </p>

          <WaitlistForm />

          <p style={{ fontSize: 12, color: '#444', marginTop: 16, lineHeight: 1.6 }}>
            S prijavo se strinjaš z obdelavo e-naslova za namen obveščanja o Odbitih počitnicah. Odjavitev je možna kadarkoli.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-[5%] py-20" style={{ background: 'var(--dark)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="section-label mb-4">Pogosta vprašanja</div>
          <h2 className="font-display mb-10" style={{ fontSize: 'clamp(32px,5vw,56px)', color: 'var(--white)', lineHeight: 1 }}>
            IMAŠ VPRAŠANJA<span style={{ color: 'var(--accent)' }}>?</span>
          </h2>
          <TaborFAQ />
        </div>
      </section>

      {/* ── KONTAKT CTA ── */}
      <section className="px-[5%] py-16" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div className="section-label mb-2">Dodatna vprašanja?</div>
            <div className="font-display" style={{ fontSize: 'clamp(28px,4vw,44px)', color: 'var(--white)', lineHeight: 1 }}>
              PIŠI NAM.<span style={{ color: 'var(--accent)' }}> Z VESELJEM</span><br />ODGOVORIMO.
            </div>
          </div>
          <Link to="/kontakt" className="btn-primary" style={{ flexShrink: 0 }}>KONTAKTIRAJ NAS →</Link>
        </div>
      </section>

    </div>
  )
}
