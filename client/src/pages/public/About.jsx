import React from 'react'
import { Link } from 'react-router-dom'

const EQUIPMENT = [
  { icon: '🏃', name: 'Trampolinsko polje', desc: 'Večja površina za prosto skakanje in akrobatiko' },
  { icon: '🧱', name: 'Trampolinski zid', desc: 'Za wall tricks, odboje in napredne kombinacije' },
  { icon: '🏀', name: 'Košarkarski koši', desc: 'Koši nad trampolinom — slam dunki kot pravi NBA' },
  { icon: '🛬', name: 'Pristajalne blazine', desc: 'Varne blazine za treniranje skokov in saltov' },
  { icon: '🟡', name: 'Odbojne blazine', desc: 'Trampolin stene za ustvarjalne kombinacije' },
  { icon: '🤸', name: 'Akrobatska oprema', desc: 'Za gimnastične in cirkuške programe' },
]

const TEAM = [
  'Dunking Devils je slovensko akrobatsko moštvo z mednarodno prepoznavnostjo.',
  'Nastopali so na svetovnih tekmovanjih, v reklamah globalnih blagovnih znamk in na prizorih po vsem svetu.',
  'Odbito je njihov odgovor na vprašanje: "Kaj, ko nisi Dunking Devil — ampak bi rad bil?"',
]

export default function About() {
  return (
    <div style={{ background: 'var(--black)' }}>

      {/* Hero */}
      <section className="px-[5%] pt-10 lg:pt-20 pb-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="section-label mb-4">O nas</div>
            <h1 className="font-display mb-6" style={{ fontSize: 'clamp(56px,10vw,100px)', color: 'var(--white)', lineHeight: 1 }}>
              GIBANJE<br />
              <span style={{ color: 'var(--accent)' }}>DRUGAČE.</span>
            </h1>
            <p style={{ fontSize: '17px', lineHeight: 1.7, marginBottom: '24px' }}>
              Odbito (Odbito 360 d.o.o.) je trampolinski in gibalni center, ki se odpira <strong style={{ color: 'var(--white)' }}>jesen 2026</strong> na Dolgem mostu v Ljubljani.
            </p>
            <p style={{ lineHeight: 1.7, marginBottom: '32px' }}>
              Namenjen je otrokom, mladim, družinam in odraslim, ki iščejo kakovosten, varen in drugačen način gibanja, zabave in športnega razvoja.
            </p>
            <Link to="/rezervacija" className="btn-primary">REZERVIRAJ TERMIN →</Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              ['50', 'max. obiskovalcev hkrati'],
              ['6', 'vadbenih programov'],
              ['7×', 'dni v tednu'],
              ['2026', 'odprtje — Dolgi most'],
            ].map(([val, lab]) => (
              <div key={lab} className="card text-center py-8">
                <div className="font-display mb-2" style={{ fontSize: '56px', color: 'var(--accent)', lineHeight: 1 }}>{val}</div>
                <div className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>{lab}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="ticker-wrap my-8">
        <div className="ticker-track">
          {['ODBITO', 'DUNKING DEVILS', 'TRAMPOLIN', 'DOLGI MOST', 'JESEN 2026', 'AKROBATIKA', 'GIBANJE', 'ZABAVA', 'ODBITO', 'DUNKING DEVILS', 'TRAMPOLIN', 'DOLGI MOST', 'JESEN 2026', 'AKROBATIKA', 'GIBANJE', 'ZABAVA'].map((t, i) => (
            <span key={i} className="ticker-item">{t}</span>
          ))}
        </div>
      </div>

      {/* Dunking Devils */}
      <section className="px-[5%] py-20" style={{ background: 'var(--dark)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="section-label mb-4">Za projektom stoji</div>
          <h2 className="font-display mb-10" style={{ fontSize: 'clamp(36px,6vw,70px)', color: 'var(--white)', lineHeight: 1 }}>
            DUNKING<br /><span style={{ color: 'var(--accent)' }}>DEVILS.</span>
          </h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {TEAM.map((text, i) => (
              <div key={i} className="card">
                <div className="font-display text-4xl mb-4" style={{ color: 'var(--accent)', lineHeight: 1 }}>0{i + 1}</div>
                <p style={{ lineHeight: 1.7, fontSize: '15px' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Oprema */}
      <section className="px-[5%] py-20">
        <div className="max-w-6xl mx-auto">
          <div className="section-label mb-4">Dvorana</div>
          <h2 className="font-display mb-10" style={{ fontSize: 'clamp(36px,6vw,70px)', color: 'var(--white)', lineHeight: 1 }}>
            OPREMA &<br /><span style={{ color: 'var(--accent)' }}>POVRŠINE.</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EQUIPMENT.map(eq => (
              <div key={eq.name} className="card flex gap-4 items-start">
                <div style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>{eq.icon}</div>
                <div>
                  <div className="font-condensed font-black text-base uppercase tracking-wide mb-1" style={{ color: 'var(--white)' }}>
                    {eq.name}
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(245,245,240,0.55)', lineHeight: 1.5 }}>{eq.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pravila */}
      <section className="px-[5%] py-16" style={{ background: 'var(--dark)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="section-label mb-4">Varnost</div>
          <h2 className="font-display mb-8" style={{ fontSize: 'clamp(32px,5vw,60px)', color: 'var(--white)', lineHeight: 1 }}>
            STAROSTNA<br /><span style={{ color: 'var(--accent)' }}>PRAVILA.</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { age: '0–3', rule: 'Vstop ni dovoljen', color: '#FF3D00', bg: 'rgba(255,61,0,0.1)' },
              { age: '3–6', rule: 'Samo s starši ali polnoletno osebo', color: 'var(--accent)', bg: 'rgba(250,177,32,0.1)' },
              { age: '6–8', rule: 'Prisotnost odraslega priporočena', color: 'var(--accent)', bg: 'rgba(250,177,32,0.08)' },
              { age: '9+', rule: 'Samostojen vstop dovoljen', color: 'var(--green)', bg: 'rgba(34,197,94,0.1)' },
            ].map(r => (
              <div key={r.age} className="rounded-2xl p-5 text-center" style={{ background: r.bg, border: `1px solid ${r.color}30` }}>
                <div className="font-display text-5xl mb-2" style={{ color: r.color, lineHeight: 1 }}>{r.age}</div>
                <div className="font-condensed text-xs font-bold tracking-wide uppercase mb-1" style={{ color: r.color }}>let</div>
                <p style={{ fontSize: '13px', color: 'rgba(245,245,240,0.65)', lineHeight: 1.5 }}>{r.rule}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-[5%] py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="section-label justify-center mb-4">Pripravljeni?</div>
          <h2 className="font-display mb-6" style={{ fontSize: 'clamp(36px,6vw,70px)', color: 'var(--white)', lineHeight: 1 }}>
            VIDIMO SE<br /><span style={{ color: 'var(--accent)' }}>V DVORANI.</span>
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/rezervacija" className="btn-primary">REZERVIRAJ →</Link>
            <Link to="/vadbe" className="btn-secondary">VADBENE URE →</Link>
          </div>
        </div>
      </section>

    </div>
  )
}
