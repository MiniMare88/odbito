import React from 'react'
import { Link } from 'react-router-dom'

const DAYS = [
  { short: 'PETEK',   time: '15:00 – 22:00', highlight: false },
  { short: 'SOBOTA',  time: '10:00 – 21:00', highlight: true, tag: 'NAJVEČ UR' },
  { short: 'NEDELJA', time: '10:00 – 20:00', highlight: false },
]

const INFO_BADGES = [
  { icon: '⏱', label: '30 min sloti' },
  { icon: '👥', label: 'Max 60 oseb' },
  { icon: '💳', label: 'Online' },
]

const PRICES = [
  { label: 'Prosto skakanje · 60 min',  price: '14,00 €', featured: false },
  { label: 'Prosto skakanje · 90 min',  price: '19,50 €', featured: true  },
  { label: 'Prosto skakanje · 120 min', price: '24,00 €', featured: false },
  { label: 'Prosto skakanje · 180 min', price: '30,00 €', featured: false },
]

export default function Obisk() {
  return (
    <div style={{ background: 'var(--black)' }}>

      {/* ── Hero ── */}
      <section className="px-[5%] pt-10 lg:pt-20 pb-16" style={{ background: 'var(--black)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="section-label mb-4">Open Jump</div>
          <h1 className="font-display mb-6"
            style={{ fontSize: 'clamp(56px,10vw,110px)', color: 'var(--white)', lineHeight: 0.9 }}>
            ENKRATNI<br /><span style={{ color: 'var(--accent)' }}>OBISK.</span>
          </h1>
          <p className="max-w-2xl mb-10" style={{ fontSize: '17px' }}>
            Rezerviraj termin online in pridi na Odbito izkušnjo. Brez čakanja, brez stresa.
          </p>

          {/* Opis */}
          <div className="max-w-3xl rounded-2xl p-7 mb-12"
            style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'rgba(245,245,240,0.75)' }}>
              Vikendi so tvoji. Vsak petek, soboto in nedeljo so Odbita vrata odprta za vse — enaka oprema, enaki trampolini, enaki rekviziti, ki jih med tednom uporabljajo med treningi Odbite Akademije in akademije Dunking Devils. Izberi časovni slot, rezerviraj online in pridi na odbito izkušnjo.
            </p>
          </div>

          {/* ── Urnik dni ── */}
          <div className="flex items-baseline gap-3 mb-5 flex-wrap">
            <div className="font-condensed font-black text-sm tracking-widest uppercase"
              style={{ color: 'var(--gray)', letterSpacing: '0.2em' }}>
              VIKENDI SO NAMENJENI ODBITI IZKUŠNJI
            </div>
            <Link to="/rezervacija" className="font-condensed font-bold text-xs uppercase tracking-widest"
              style={{ color: 'var(--accent)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              rezerviraj svoj termin →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-10">
            {DAYS.map(d => (
              <div key={d.short} className="rounded-2xl flex flex-col items-center justify-center relative"
                style={{
                  padding: 'clamp(12px,4vw,20px) 8px',
                  background: '#111215',
                  border: d.highlight ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                }}>
                {d.tag && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-condensed font-black uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ background: 'var(--accent)', color: '#080A0E', fontSize: 8, letterSpacing: '0.1em' }}>
                    {d.tag}
                  </div>
                )}
                <div className="font-display leading-none text-center"
                  style={{ fontSize: 'clamp(18px,5.5vw,28px)', color: 'var(--white)', marginBottom: 6 }}>
                  {d.short}
                </div>
                <div className="font-condensed font-black text-center"
                  style={{ fontSize: 'clamp(12px,3.5vw,16px)', color: 'var(--accent)', lineHeight: 1.2 }}>
                  {d.time.replace(' – ', '\n–\n').split('\n').map((t, i) => (
                    <span key={i}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap gap-3 mb-12">
            {INFO_BADGES.map(b => (
              <div key={b.label} className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '16px' }}>{b.icon}</span>
                <span className="font-condensed font-bold text-sm"
                  style={{ color: 'var(--gray)', letterSpacing: '0.05em' }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cenik ── */}
      <section className="px-[5%] pb-24" style={{ background: 'var(--dark)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="section-label mb-6 pt-16">Cenik · Prosto skakanje</div>

          {/* Mobile: kompaktna tabela / Desktop: vse 4 kartice */}
          <div className="sm:hidden mb-8" style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, overflow: 'hidden' }}>
            {/* Header row */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ background: 'rgba(250,177,32,0.08)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="font-condensed font-black text-xs tracking-widest uppercase" style={{ color: 'var(--accent)', letterSpacing: '0.14em' }}>
                CENIK · PROSTO SKAKANJE
              </span>
              <Link to="/rezervacija" className="font-condensed font-bold text-xs" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
                Rezerviraj →
              </Link>
            </div>
            {/* Price row */}
            <div className="flex items-center justify-between px-4 py-4" style={{ background: '#111215' }}>
              <span className="font-condensed font-bold text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Prosto skakanje - enkraten obisk
              </span>
              <span className="font-condensed font-black" style={{ color: 'var(--accent)', fontSize: 18, whiteSpace: 'nowrap', marginLeft: 8 }}>
                od 14,00 €
              </span>
            </div>
          </div>

          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {PRICES.map(p => (
              <div key={p.label}
                className="rounded-2xl p-6 flex flex-col gap-3 relative"
                style={{
                  background: p.featured ? 'var(--accent)' : 'var(--dark2)',
                  border: p.featured ? 'none' : '1px solid var(--border)',
                  boxShadow: p.featured ? '0 8px 32px rgba(250,177,32,0.25)' : 'none',
                }}>
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 font-condensed font-black text-xs uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ background: '#080A0E', color: 'var(--accent)', letterSpacing: '0.15em' }}>
                    ★ POPULARNO
                  </div>
                )}
                <div className="font-condensed font-bold text-sm uppercase tracking-wide"
                  style={{ color: p.featured ? 'rgba(8,10,14,0.65)' : 'var(--gray)' }}>
                  {p.label}
                </div>
                <div className="font-display text-4xl leading-none"
                  style={{ color: p.featured ? '#080A0E' : 'var(--accent)' }}>
                  {p.price}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex gap-3 sm:flex-row">
            <Link to="/rezervacija" className="btn-primary flex-1 text-center sm:flex-none" style={{ textDecoration: 'none' }}>
              REZERVIRAJ TERMIN
            </Link>
            <Link to="/cenik" className="btn-secondary flex-1 text-center sm:flex-none" style={{ textDecoration: 'none' }}>
              POGLEJ CEL CENIK
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
