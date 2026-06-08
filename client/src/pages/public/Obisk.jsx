import React from 'react'
import { Link } from 'react-router-dom'

const DAYS = [
  { short: 'PET', sub: 'vsak petek',   time: '15:00 – 20:00', highlight: false },
  { short: 'SOB', sub: 'vsako soboto', time: '10:00 – 21:00', highlight: true, tag: 'NAJVEČ UR' },
  { short: 'NED', sub: 'vsako nedeljo', time: '10:00 – 20:00', highlight: false },
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
      <section className="px-[5%] pt-20 pb-16" style={{ background: 'var(--black)' }}>
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
          <div className="font-condensed font-black text-sm tracking-widest uppercase mb-5"
            style={{ color: 'var(--gray)', letterSpacing: '0.2em' }}>
            VIKENDI SO NAMENJENI ENKRATNI ZABAVI
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl">
            {DAYS.map(d => (
              <div key={d.short} className="rounded-2xl p-5 flex flex-col gap-1 relative"
                style={{
                  background: d.highlight ? 'var(--accent)' : 'var(--dark2)',
                  border: d.highlight ? 'none' : '1px solid var(--border)',
                }}>
                {d.tag && (
                  <div className="absolute top-3 right-3 font-condensed font-black text-xs uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ background: 'rgba(0,0,0,0.2)', color: d.highlight ? '#080A0E' : 'var(--accent)', fontSize: '9px' }}>
                    {d.tag}
                  </div>
                )}
                <div className="font-display text-4xl leading-none"
                  style={{ color: d.highlight ? '#080A0E' : 'var(--accent)' }}>
                  {d.short}
                </div>
                <div className="font-condensed text-sm"
                  style={{ color: d.highlight ? 'rgba(8,10,14,0.7)' : 'var(--gray)' }}>
                  {d.sub}
                </div>
                <div className="font-condensed font-black text-base mt-1"
                  style={{ color: d.highlight ? '#080A0E' : 'var(--white)' }}>
                  {d.time}
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Link to="/rezervacija" className="btn-primary" style={{ textDecoration: 'none' }}>
              Rezerviraj →
            </Link>
            <Link to="/cenik" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Celoten cenik
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
