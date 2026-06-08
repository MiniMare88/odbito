import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import WeeklySchedule from '../../components/WeeklySchedule.jsx'
import pricing from '../../data/pricing.json'

const CHARS = 'ABCDEFGHIJKLMNOPRSTUVZX0123456789#@!%&'

function ScrambleText({ text, className, style, delay = 0, duration = 1400 }) {
  const [displayed, setDisplayed] = useState(() =>
    text.split('').map(() => CHARS[Math.floor(Math.random() * CHARS.length)])
  )
  const started = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (started.current) return
      started.current = true

      const letters = text.split('')
      const locked = new Array(letters.length).fill(false)
      let rafId

      const start = performance.now()
      const step = (now) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)

        // Lock each letter progressively left to right
        setDisplayed(letters.map((char, i) => {
          const lockThreshold = (i / letters.length) * 0.85
          if (progress >= lockThreshold || locked[i]) {
            locked[i] = true
            return char
          }
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        }))

        if (progress < 1) {
          rafId = requestAnimationFrame(step)
        } else {
          setDisplayed(letters) // ensure clean final state
        }
      }

      rafId = requestAnimationFrame(step)
      return () => cancelAnimationFrame(rafId)
    }, delay)

    return () => clearTimeout(timer)
  }, [text, delay, duration])

  return (
    <span className={className} style={style}>
      {displayed.map((char, i) => (
        <span key={i} style={{ display: 'inline-block' }}>{char}</span>
      ))}
    </span>
  )
}

const PACKAGES = pricing.openJump.packages
  .filter(p => p.duration >= 60)
  .map(p => ({
    label: `Prosto skakanje\n${p.duration} min`,
    price: p.price.toFixed(2).replace('.', ',') + ' €',
    desc: p.label,
    featured: p.popular || false,
  }))

const ALL_GROUPS = [
  { id: 1, program: 'Osnove gimnastike', age: '5–7 let',   days: 'Pon & Sre', time: '16:00 – 17:00', color: '#7BB3E8' },
  { id: 2, program: 'Osnove gimnastike', age: '5–7 let',   days: 'Tor & Čet', time: '16:00 – 17:00', color: '#7BB3E8' },
  { id: 3, program: 'Osnove gimnastike', age: '8–10 let',  days: 'Pon & Sre', time: '17:00 – 18:00', color: '#7EC87E' },
  { id: 4, program: 'Osnove gimnastike', age: '8–10 let',  days: 'Tor & Čet', time: '17:00 – 18:00', color: '#7EC87E' },
  { id: 5, program: 'Osnove gimnastike', age: '8–10 let',  days: 'Pon & Sre', time: '18:00 – 19:30', color: '#E8A87B' },
  { id: 6, program: 'Napredna gimnastika', age: '10–12 let', days: 'Tor & Čet', time: '18:00 – 19:30', color: '#E0B84E' },
  { id: 7, program: 'Napredna gimnastika', age: '10–12 let', days: 'Pon & Sre', time: '19:30 – 21:00', color: '#9B8FE0' },
  { id: 8, program: 'Napredna gimnastika', age: '12–15 let', days: 'Tor & Čet', time: '19:30 – 21:00', color: '#C87B7B' },
]

const OJ_PACKAGES = pricing.openJump.packages
  .filter(p => p.duration >= 60)
  .map(p => ({
    label: `${p.duration} MIN`,
    price: '€' + p.price.toFixed(2).replace('.', ','),
    note: p.label,
    featured: p.popular || false,
  }))

const BD_COLORS = { bd_basic: '#7BB3E8', bd_standard: '#fab120', bd_premium: '#9B8FE0' }
const BD_PACKAGES = pricing.birthdayParties.packages.map(p => ({
  name: p.label.toUpperCase(),
  color: BD_COLORS[p.id] || '#fab120',
  basePrice: p.basePrice,
  extraChildPrice: p.extraChildPrice,
  maxChildren: p.maxChildren,
  featured: p.popular || false,
  includes: [
    `${p.jumping} min skakanja`,
    `Party soba ${p.partyRoom} min`,
    ...(p.animation ? [`Animacija: ${p.animation}`] : []),
    ...(p.drinks ? ['Pijača vključena'] : []),
    ...(p.catering ? ['Catering vključen'] : []),
    ...(p.decoration ? ['Dekoracija vključena'] : []),
    `Torta: ${p.cake}`,
  ],
}))

// ── Comic Bubbles ─────────────────────────────────────────────────────

const BUBBLES = [
  { title: 'PRIMERNO ZA VSE',        body: 'Ne rabiš izkušenj — le voljo.',                 top: '5%',  left: '4%'  },
  { title: 'VARNOST NA PRVEM MESTU', body: 'Profesionalni trenerji, certificirana oprema.', top: '5%',  left: '44%' },
  { title: 'VEČ KOT TRENING',        body: 'Rojstni dnevi, telovadi, skupnost.',             top: '5%',  left: '22%' },
  { title: 'DOM DUNKING DEVILS',      body: 'Uradni dom akrobatov.',                          top: '5%',  left: '60%' },
]

function ComicBubbles() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setActive(i => (i + 1) % BUBBLES.length)
        setVisible(true)
      }, 300)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const b = BUBBLES[active]

  return (
    <div
      className="absolute z-20 max-w-[220px]"
      style={{
        top: b.top,
        left: b.left,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(-6px)',
        transition: 'opacity 0.28s ease, transform 0.28s ease',
      }}
    >
      {/* Bubble shape */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '12px 16px',
        boxShadow: '3px 3px 0px #000',
        border: '2.5px solid #000',
        position: 'relative',
      }}>
        <div className="font-condensed font-black text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--accent)' }}>
          {b.title}
        </div>
        <div className="font-condensed font-bold text-sm" style={{ color: '#080A0E', lineHeight: 1.4 }}>
          {b.body}
        </div>
        {/* Tail */}
        <div style={{
          position: 'absolute',
          bottom: '-14px',
          left: '24px',
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: '14px solid #000',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-11px',
          left: '25px',
          width: 0,
          height: 0,
          borderLeft: '9px solid transparent',
          borderRight: '3px solid transparent',
          borderTop: '12px solid #fff',
        }} />
      </div>
    </div>
  )
}

// ── Odbita Akademija Section ──────────────────────────────────────────

function AkademijaSection() {
  return (
    <section className="px-[5%] py-20" style={{ background: 'var(--dark)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-14">
          <div>
            <div className="section-label mb-3">Sezona 2026/2027 · Sep – Jun</div>
            <h2 className="font-display mb-5 leading-none" style={{ fontSize: 'clamp(40px,7vw,80px)', color: 'var(--white)' }}>
              ODBITA<br /><span style={{ color: 'var(--accent)' }}>AKADEMIJA.</span>
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.7, marginBottom: '20px' }}>
              Strukturirani vadbeni program pod vodstvom izkušenih inštruktorjev.
              Vsaka skupina je prilagojena starosti in nivoju — od prvih saltov do napredne gimnastike.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Max. 15 otrok / skupino', 'Mesečna & letna naročnina', 'Čakalna lista'].map(t => (
                <span key={t} className="font-condensed text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(250,177,32,0.1)', border: '1px solid rgba(250,177,32,0.25)', color: 'var(--accent)' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:pt-4">
            <p className="font-condensed text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--gray)' }}>
              Programi
            </p>
            {/* Program legend */}
            {[
              { label: 'Osnove gimnastike', age: '5–7 let & 8–10 let', color: '#7BB3E8' },
              { label: 'Napredna gimnastika', age: '10–12 let & 12–15 let', color: '#9B8FE0' },
            ].map(p => (
              <div key={p.label} className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: p.color }} />
                <span className="font-condensed font-bold text-sm" style={{ color: 'var(--white)' }}>{p.label}</span>
                <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>{p.age}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Groups grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {ALL_GROUPS.map(g => (
            <div key={g.id} className="rounded-xl overflow-hidden"
              style={{ border: `1px solid ${g.color}35`, background: 'var(--dark2)' }}>
              {/* Top color bar */}
              <div className="h-1" style={{ background: g.color }} />
              <div className="p-4">
                {/* Skupina number + days */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="font-display text-3xl leading-none" style={{ color: g.color }}>{g.id}</div>
                    <span className="font-condensed text-xs font-black uppercase tracking-wide" style={{ color: 'var(--gray)' }}>
                      SKUPINA
                    </span>
                  </div>
                  <span className="font-condensed text-xs font-bold px-2 py-1 rounded"
                    style={{ background: `${g.color}18`, color: g.color }}>
                    {g.days}
                  </span>
                </div>

                {/* Program */}
                <div className="font-condensed font-black text-sm uppercase tracking-wide mb-1" style={{ color: 'var(--white)' }}>
                  {g.program}
                </div>

                {/* Age + time */}
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="badge text-xs" style={{ '--badge-dot': g.color, fontSize: '11px' }}>{g.age}</div>
                  <span className="font-condensed font-bold text-xs" style={{ color: 'var(--gray)' }}>{g.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link to="/vadbe" className="btn-primary">NAROČI SE NA VADBO →</Link>
      </div>
    </section>
  )
}

// ── Birthday Section ──────────────────────────────────────────────────

function BirthdaySection() {
  const carouselRef = useRef(null)

  useEffect(() => {
    // Na mobilnem se pozicioniramo na sredinski (featured) kartico
    const el = carouselRef.current
    if (!el) return
    const isMobile = window.innerWidth < 640
    if (!isMobile) return
    const featuredIndex = BD_PACKAGES.findIndex(p => p.featured)
    if (featuredIndex < 0) return
    const card = el.children[featuredIndex]
    if (!card) return
    const offset = card.offsetLeft - (el.offsetWidth / 2) + (card.offsetWidth / 2)
    el.scrollLeft = offset
  }, [])

  return (
    <section className="px-[5%] py-20" style={{ background: 'var(--dark)' }}>
      <div className="max-w-6xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-12 items-start mb-12">
          <div>
            <div className="section-label mb-3">Rojstni dnevi</div>
            <h2 className="font-display mb-5 leading-none" style={{ fontSize: 'clamp(32px,5vw,64px)', color: 'var(--white)' }}>
              ODBITO<br /><span style={{ color: 'var(--accent)' }}>ROJSTNODNEVNO</span><br />PRAZNOVANJE<span style={{ color: 'var(--accent)' }}>.</span>
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.7, marginBottom: '20px' }}>
              Praznuj rojstni dan na edinstven način — s skakanjem, animacijo in vodenim programom.
              Na voljo je prostor za pogostitev, vse pa rezerviraš enostavno online. Nekaj novega v Ljubljani.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {['Prostor za pogostitev', 'Rezervacija online', 'Animacija in voden program', 'Nekaj novega v Ljubljani'].map(t => (
                <span key={t} className="font-condensed text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(250,177,32,0.1)', border: '1px solid rgba(250,177,32,0.25)', color: 'var(--accent)' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Slika rojstni dan */}
          <div className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border)', background: 'var(--dark2)', minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Zamenjaj src z dejansko sliko, npr. /birthday.jpg */}
            <img
              src="/birthday_odbito_1280.webp"
              alt="Rojstni dan pri Odbitu"
              className="w-full h-full object-cover"
              style={{ minHeight: 360 }}
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        </div>

        {/* BD Packages — desktop: grid, mobile: horizontal snap carousel */}
        {/* Desktop */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4 mb-8 items-stretch">
          {BD_PACKAGES.map(pkg => (
            <div key={pkg.name} className={`card flex flex-col ${pkg.featured ? 'featured' : ''}`}
              style={{ borderTop: `3px solid ${pkg.color}`, position: 'relative' }}>
              {pkg.featured && (
                <span className="font-condensed text-xs font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
                  style={{ position: 'absolute', top: 14, right: 14, background: 'var(--accent)', color: 'var(--black)', fontSize: '10px' }}>
                  PRILJUBLJEN
                </span>
              )}
              <div className="font-display text-4xl leading-none mb-4" style={{ color: pkg.color }}>{pkg.name}</div>
              <ul className="flex flex-col gap-2 flex-grow mb-6">
                {pkg.includes.map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color: pkg.color, flexShrink: 0, marginTop: '2px' }}>✓</span>
                    <span className="font-condensed text-sm font-bold" style={{ color: 'var(--white)' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <div className="font-display leading-none mb-0.5" style={{ fontSize: '32px', color: pkg.color }}>
                  od €{pkg.basePrice.toFixed(2).replace('.', ',')}
                </div>
                <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                  max. {pkg.maxChildren} otrok · +€{pkg.extraChildPrice.toFixed(2).replace('.', ',')} / dodatni otrok
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="sm:hidden mb-8 -mx-[5%]">
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-4"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingLeft: '10%',
              paddingRight: '10%',
            }}
          >
            {BD_PACKAGES.map(pkg => (
              <div key={pkg.name}
                className={`card flex flex-col flex-shrink-0 ${pkg.featured ? 'featured' : ''}`}
                style={{
                  borderTop: `3px solid ${pkg.color}`,
                  position: 'relative',
                  width: '78vw',
                  scrollSnapAlign: 'center',
                }}>
                {pkg.featured && (
                  <span className="font-condensed text-xs font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
                    style={{ position: 'absolute', top: 14, right: 14, background: 'var(--accent)', color: 'var(--black)', fontSize: '10px' }}>
                    PRILJUBLJEN
                  </span>
                )}
                <div className="font-display text-4xl leading-none mb-4" style={{ color: pkg.color }}>{pkg.name}</div>
                <ul className="flex flex-col gap-2 flex-grow mb-6">
                  {pkg.includes.map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <span style={{ color: pkg.color, flexShrink: 0, marginTop: '2px' }}>✓</span>
                      <span className="font-condensed text-sm font-bold" style={{ color: 'var(--white)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <div className="font-display leading-none mb-0.5" style={{ fontSize: '32px', color: pkg.color }}>
                    od €{pkg.basePrice.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                    max. {pkg.maxChildren} otrok · +€{pkg.extraChildPrice.toFixed(2).replace('.', ',')} / dodatni otrok
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="/kontakt" className="btn-primary">REZERVIRAJ ROJSTNI DAN →</Link>
          <p className="mt-4 font-condensed text-xs tracking-widest" style={{ color: 'var(--gray)' }}>
            Za vsak paket pošljite povpraševanje — ponudbo pripravimo v 24 urah
          </p>
        </div>
      </div>
    </section>
  )
}

// ── Open Jump Section ─────────────────────────────────────────────────────────

function OpenJumpSection() {
  const navigate = useNavigate()
  const toBooking = () => navigate('/rezervacija')

  const DAYS = [
    { day: 'Petek',   short: 'PET', sub: 'vsak petek',   from: '15:00', to: '20:00' },
    { day: 'Sobota',  short: 'SOB', sub: 'vsako soboto', from: '10:00', to: '21:00', main: true },
    { day: 'Nedelja', short: 'NED', sub: 'vsako nedeljo',from: '10:00', to: '20:00' },
  ]

  return (
    <section className="px-[5%] py-16" style={{ background: '#D8D8D4' }}>
      <div className="max-w-6xl mx-auto">
        <div className="section-label mb-4" style={{ color: '#7A8499' }}>Open Jump</div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">

          {/* ── LEVA STRAN — vse vsebine ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Naslov + opis */}
            <div>
              <h2 className="font-display leading-none mb-3" style={{ fontSize: 'clamp(32px,4.5vw,58px)' }}>
                <span style={{ color: '#c68a00' }}>ENKRATNI</span>{' '}
                <span style={{ color: '#080A0E' }}>OBISK</span>
                <span style={{ color: '#c68a00' }}>.</span>
              </h2>
              <p className="mb-2" style={{ fontSize: '15px', lineHeight: 1.75, color: '#1a1a1a' }}>
                Rezerviraj termin online in pridi na Odbito izkušnjo.{' '}
                <strong style={{ color: '#080A0E' }}>Brez čakanja, brez stresa.</strong>
              </p>
              <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#2a2a2a' }}>
                Vikendi so tvoji. Vsak <strong style={{ color: '#080A0E' }}>petek</strong>, <strong style={{ color: '#080A0E' }}>soboto</strong> in <strong style={{ color: '#080A0E' }}>nedeljo</strong> so Odbita vrata odprta za vse — enaka oprema, enaki trampolini, enaki rekviziti, ki jih med tednom uporabljajo med treningi Odbite Akademije in akademije Dunking Devils. Izberi časovni slot, rezerviraj online in pridi na odbito izkušnjo.
              </p>
            </div>

            {/* 3 dnevne kartice */}
            <div className="flex flex-col gap-2">
              <div className="font-condensed font-black uppercase" style={{ color: '#3A3A3A', fontSize: '20px', letterSpacing: '0.06em', lineHeight: 1.1 }}>
                VIKENDI SO NAMENJENI ENKRATNI ZABAVI
              </div>
              <div className="grid grid-cols-3 gap-2">
                  {DAYS.map(d => (
                <div key={d.day} onClick={toBooking} className="rounded-xl p-3 flex flex-col gap-1.5 cursor-pointer"
                  style={{ background: d.main ? '#080A0E' : '#1a1c20', border: `1px solid ${d.main ? '#c68a00' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#c68a00'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = d.main ? '#c68a00' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none' }}
                >
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="font-condensed font-black text-xs uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(198,138,0,0.18)', color: '#c68a00', fontSize: '10px' }}>{d.short}</span>
                    {d.main && <span className="font-condensed font-black uppercase rounded-full px-1.5 py-0.5" style={{ background: '#c68a00', color: '#000', fontSize: '8px' }}>NAJVEČ UR</span>}
                  </div>
                  <div className="font-condensed font-black text-xs uppercase tracking-wide" style={{ color: '#fff' }}>{d.sub}</div>
                  <div className="font-display leading-none" style={{ fontSize: '18px', color: '#c68a00' }}>{d.from} – {d.to}</div>
                </div>
              ))}
              </div>
            </div>

            {/* Info pills + gumb v isti vrstici */}
            <div className="flex flex-wrap items-center gap-2">
              {[['⏱','30 min sloti'],['👥','Max 60 oseb'],['💳','Online']].map(([icon, val]) => (
                <div key={val} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background: '#1a1c20', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: 13 }}>{icon}</span>
                  <span className="font-condensed font-black text-xs" style={{ color: '#fff' }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Cenik — en kompakten kvadratek */}
            <div className="rounded-xl overflow-hidden" style={{ background: '#1a1c20', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={toBooking}>
              <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#080A0E', cursor: 'pointer' }}>
                <span className="font-condensed font-black text-xs uppercase tracking-widest" style={{ color: '#c68a00' }}>Cenik · Prosto skakanje</span>
                <span className="font-condensed text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Rezerviraj →</span>
              </div>
              {PACKAGES.map((pkg, i) => (
                <div key={pkg.label} className="flex items-center justify-between px-4 py-2"
                  style={{ borderBottom: i < PACKAGES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer' }}>
                  <div className="flex items-center gap-2">
                    <span className="font-condensed font-bold text-xs" style={{ color: pkg.featured ? '#fff' : 'rgba(255,255,255,0.7)', whiteSpace: 'pre-line' }}>{pkg.label.replace('\n', ' · ')}</span>
                    {pkg.featured && <span style={{ color: '#c68a00', fontSize: '14px', lineHeight: 1 }}>★</span>}
                  </div>
                  <span className="font-display" style={{ fontSize: '18px', color: '#c68a00' }}>{pkg.price}</span>
                </div>
              ))}
            </div>

            {/* CTA gumb */}
            <button onClick={toBooking}
              className="font-condensed font-black uppercase tracking-widest rounded-xl px-8 py-3 w-fit"
              style={{ background: '#080A0E', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', letterSpacing: '0.12em', transition: 'all 0.18s', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#c68a00'; e.currentTarget.style.color = '#080A0E' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#080A0E'; e.currentTarget.style.color = '#fff' }}>
              REZERVIRAJ TERMIN →
            </button>
          </div>

          {/* ── DESNA STRAN — SLIKA ── */}
          <div className="w-full lg:w-[45%] flex-shrink-0">
            <div className="rounded-2xl overflow-hidden h-full"
              style={{ background: '#c4c4c0', minHeight: 420, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.10)' }}>
              <img src="/odbito_izven_okvirjev_3.webp" alt="Open Jump" className="w-full h-full object-cover" style={{ objectPosition: '85% center', position: 'absolute', inset: 0 }}
                onError={e => { e.currentTarget.style.display = 'none' }} />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwrx4zJ6tFtyrtzPn0PpxB6CoW9sMZ_6FrNMN0L6DjWzLHJ3NR2RuAOdNtLv8LLpFZL/exec'

function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null) // null | 'loading' | 'ok' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      await fetch(SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, vir: 'spletna stran' }),
      })
      setStatus('ok')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'ok') {
    return (
      <div className="flex flex-col gap-1 px-5 py-3 rounded-lg"
        style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.2)', maxWidth: '340px' }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '16px' }}>✓</span>
          <span className="font-condensed font-black text-sm uppercase tracking-wide" style={{ color: '#080A0E' }}>
            Hvala za oddano prijavo.
          </span>
        </div>
        <span className="font-condensed text-sm" style={{ color: '#080A0E', opacity: 0.75, lineHeight: 1.4 }}>
          Uspešno ste bili dodani na seznam in boste med prvimi obveščeni o Odbitih novičkah.
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full sm:w-auto">
      <input
        type="email"
        placeholder="tvoj@email.si"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={status === 'loading'}
        className="newsletter-input font-condensed text-sm px-4 py-2 rounded-lg outline-none flex-1 sm:w-56"
        style={{ background: 'rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.2)', color: '#080A0E', opacity: status === 'loading' ? 0.6 : 1 }}
        onFocus={e => e.currentTarget.style.background = 'rgba(0,0,0,0.18)'}
        onBlur={e => e.currentTarget.style.background = 'rgba(0,0,0,0.12)'}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="font-condensed font-black text-sm uppercase tracking-widest px-5 py-2 rounded-lg"
        style={{ background: '#080A0E', color: '#fab120', whiteSpace: 'nowrap', transition: 'opacity 0.18s', opacity: status === 'loading' ? 0.6 : 1 }}
        onMouseEnter={e => { if (status !== 'loading') e.currentTarget.style.opacity = '0.85' }}
        onMouseLeave={e => e.currentTarget.style.opacity = status === 'loading' ? '0.6' : '1'}
      >
        {status === 'loading' ? '...' : 'Prijavi se'}
      </button>
      {status === 'error' && (
        <span className="font-condensed text-xs" style={{ color: '#080A0E', opacity: 0.7 }}>Napaka, poskusi znova.</span>
      )}
    </form>
  )
}

export default function Home() {
  return (
    <div style={{ background: 'var(--black)' }}>

      {/* ── HERO ── */}
      <section className="relative flex items-center min-h-[92vh] px-[5%] overflow-hidden" style={{ background: '#000000' }}>
        {/* bg grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(250,177,32,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(250,177,32,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Hero image — desna stran */}
        <div className="absolute inset-y-0 right-0 w-[75%] pointer-events-none hidden lg:block">
          <img
            src="/Odbito-360-HERO.png"
            alt="Odbito karakterji"
            className="w-full h-full object-contain"
            style={{ objectPosition: 'right center', maskImage: 'linear-gradient(to right, transparent 0%, black 15%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%)' }}
          />
        </div>

        {/* Leva stran — tekst */}
        <div className="relative max-w-6xl mx-auto w-full">
          <div className="max-w-[55%] lg:max-w-[48%]">
            <div className="section-label mb-6">Trampolin park · Ljubljana</div>

            <h1 className="font-display mb-3 leading-none" style={{ fontSize: 'clamp(64px, 10vw, 140px)', lineHeight: 0.88 }}>
              <span className="highlight">
                <span className="wave-letter">O</span>
                <span className="wave-letter">D</span>
                <span className="wave-letter">B</span>
                <span className="wave-letter">I</span>
                <span className="wave-letter">T</span>
              </span>
              <span style={{ color: 'var(--white)', display: 'block' }}>
                SVET ZABAVE<span style={{ color: 'var(--accent)' }}>.</span>
              </span>
            </h1>

            <p className="mb-10 max-w-lg" style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: 'rgba(245,245,240,0.65)', lineHeight: 1.65 }}>
              Odbito je športno-rekreacijski center z olimpijsko opremo — trampolini, pristajalne jame, blazine in košarkaški koši. Med tednom vodeni treningi akrobatike in skokov, ob vikendih pa odprti za vse.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/rezervacija" className="btn-primary">REZERVIRAJ TERMIN</Link>
              <Link to="/vadbe" className="btn-secondary">VADBENE URE →</Link>
            </div>
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="font-condensed text-xs tracking-widest" style={{ color: 'var(--white)' }}>SCROLL</span>
          <div className="w-px h-10 bg-white/40" />
        </div>
      </section>

      {/* ── TICKER ── */}
      {(() => {
        const items = ['ODBITO', 'TRAMPOLIN', 'OPEN JUMP', 'AKROBATIKA', 'DOLGI MOST', 'LJUBLJANA', 'FUN PARK', 'DUNKING DEVILS']
        const doubled = [...items, ...items]
        return (
          <div className="ticker-wrap" aria-hidden="true">
            <div className="ticker-track">
              {doubled.map((t, i) => <span key={i} className="ticker-item">{t}</span>)}
            </div>
          </div>
        )
      })()}

      {/* ── IZBERI SVOJO POT ── */}
      <section className="py-16" style={{ background: '#0d0f12' }}>
        <div className="max-w-6xl mx-auto px-[5%]">
          <div className="text-center mb-10">
            <div className="section-label mb-3" style={{ justifyContent: 'center' }}>Kakšne so želje?</div>
            <h2 className="font-display leading-none" style={{ fontSize: 'clamp(28px,4vw,52px)', color: '#fff' }}>
              IZBERI SVOJO <span style={{ color: 'var(--accent)' }}>IZKUŠNJO</span><span style={{ color: '#fff' }}>.</span>
            </h2>
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-4 max-w-6xl mx-auto px-[5%]">
            {[
              {
                icon: (
                  <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
                    <circle cx="24" cy="12" r="6" stroke="#fab120" strokeWidth="2.5"/>
                    <path d="M12 40c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#fab120" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M8 28l4-8M40 28l-4-8M24 28v-8" stroke="#fab120" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ),
                tag: 'Organizirana vadba in treningi',
                title: 'ODBITA\nAKADEMIJA',
                titleColor: 'var(--accent)',
                desc: 'Strukturirani vadbeni programi za vse starosti in nivoje. Pon–čet z izkušenimi trenerji.',
                btn: 'Več o programih →',
                to: '/vadbe',
                accent: 'var(--accent)',
                accentBg: 'rgba(250,177,32,0.08)',
                accentBorder: 'rgba(250,177,32,0.2)',
              },
              {
                icon: (
                  <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
                    <ellipse cx="24" cy="40" rx="14" ry="3" stroke="#1e6fd4" strokeWidth="2"/>
                    <path d="M24 37V20" stroke="#1e6fd4" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M16 26l8-14 8 14" stroke="#1e6fd4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="24" cy="10" r="4" stroke="#1e6fd4" strokeWidth="2.5"/>
                  </svg>
                ),
                tag: 'Enkratni obisk',
                title: 'OPEN\nJUMP',
                titleColor: '#4a9eff',
                desc: 'Rezerviraj termin online in pridi skakat. Brez mesečnih obveznosti, brez čakanja.',
                btn: 'Rezerviraj termin →',
                to: '/rezervacija',
                accent: '#1e6fd4',
                accentBg: 'rgba(30,111,212,0.08)',
                accentBorder: 'rgba(30,111,212,0.2)',
              },
              {
                icon: (
                  <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
                    <path d="M24 8l2.5 7.5H34l-6.5 4.5 2.5 7.5L24 23l-6 4.5 2.5-7.5L14 15.5h7.5z" stroke="#c084fc" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M12 38c0-1.5 2-3 4-3h16c2 0 4 1.5 4 3" stroke="#c084fc" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="14" r="3" stroke="#c084fc" strokeWidth="2"/>
                    <circle cx="36" cy="14" r="3" stroke="#c084fc" strokeWidth="2"/>
                  </svg>
                ),
                tag: 'Rojstni dan pri nas',
                title: 'ODBITO\nPRAZNOVANJE',
                titleColor: '#c084fc',
                desc: 'Praznuj rojstni dan z ekipo v ločeni party sobi. Paketi vključujejo vse — od animacije do dekoracije.',
                btn: 'Praznuj z nami →',
                to: '/#rojstni-dan',
                accent: '#c084fc',
                accentBg: 'rgba(192,132,252,0.08)',
                accentBorder: 'rgba(192,132,252,0.2)',
              },
            ].map((card, i) => (
              <Link
                key={i}
                to={card.to}
                className="flex flex-col rounded-2xl p-7 group"
                style={{
                  background: '#13161a',
                  border: `1px solid ${card.accentBorder}`,
                  transition: 'all 0.22s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = card.accentBg; e.currentTarget.style.borderColor = card.accent }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = '#13161a'; e.currentTarget.style.borderColor = card.accentBorder }}
              >
                {/* Ikona */}
                <div className="mb-5 w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: card.accentBg }}>
                  {card.icon}
                </div>

                {/* Tag */}
                <div className="font-condensed font-black text-xs uppercase tracking-widest mb-2" style={{ color: card.accent }}>
                  {card.tag}
                </div>

                {/* Naslov */}
                <h3 className="font-display leading-none mb-3" style={{ fontSize: 'clamp(24px,2.5vw,34px)', color: '#fff', whiteSpace: 'pre-line' }}>
                  {card.title}
                </h3>

                {/* Opis */}
                <p className="font-condensed text-sm flex-1 mb-6" style={{ color: 'rgba(245,245,240,0.55)', lineHeight: 1.65 }}>
                  {card.desc}
                </p>

                {/* Gumb */}
                <div className="font-condensed font-black text-sm uppercase tracking-widest px-5 py-2.5 rounded-lg text-center"
                  style={{ background: card.accent, color: card.accent === 'var(--accent)' ? '#000' : '#fff' }}>
                  {card.btn}
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile carousel */}
          <div className="md:hidden -mx-0">
            <div
              className="flex gap-4 overflow-x-auto pb-4"
              style={{
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                paddingLeft: '10%',
                paddingRight: '10%',
              }}
            >
              {[
                { icon: <svg viewBox="0 0 48 48" fill="none" width="36" height="36"><circle cx="24" cy="12" r="6" stroke="#fab120" strokeWidth="2.5"/><path d="M12 40c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#fab120" strokeWidth="2.5" strokeLinecap="round"/><path d="M8 28l4-8M40 28l-4-8M24 28v-8" stroke="#fab120" strokeWidth="2" strokeLinecap="round"/></svg>, tag: 'Organizirana vadba in treningi', title: 'ODBITA\nAKADEMIJA', desc: 'Strukturirani vadbeni programi za vse starosti in nivoje. Pon–čet z izkušenimi trenerji.', btn: 'Več o programih →', to: '/vadbe', accent: 'var(--accent)', accentBg: 'rgba(250,177,32,0.08)', accentBorder: 'rgba(250,177,32,0.2)' },
                { icon: <svg viewBox="0 0 48 48" fill="none" width="36" height="36"><ellipse cx="24" cy="40" rx="14" ry="3" stroke="#1e6fd4" strokeWidth="2"/><path d="M24 37V20" stroke="#1e6fd4" strokeWidth="2.5" strokeLinecap="round"/><path d="M16 26l8-14 8 14" stroke="#1e6fd4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="24" cy="10" r="4" stroke="#1e6fd4" strokeWidth="2.5"/></svg>, tag: 'Enkratni obisk', title: 'OPEN\nJUMP', desc: 'Rezerviraj termin online in pridi skakat. Brez mesečnih obveznosti, brez čakanja.', btn: 'Rezerviraj termin →', to: '/rezervacija', accent: '#1e6fd4', accentBg: 'rgba(30,111,212,0.08)', accentBorder: 'rgba(30,111,212,0.2)' },
                { icon: <svg viewBox="0 0 48 48" fill="none" width="36" height="36"><path d="M24 8l2.5 7.5H34l-6.5 4.5 2.5 7.5L24 23l-6 4.5 2.5-7.5L14 15.5h7.5z" stroke="#c084fc" strokeWidth="2" strokeLinejoin="round"/><path d="M12 38c0-1.5 2-3 4-3h16c2 0 4 1.5 4 3" stroke="#c084fc" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="14" r="3" stroke="#c084fc" strokeWidth="2"/><circle cx="36" cy="14" r="3" stroke="#c084fc" strokeWidth="2"/></svg>, tag: 'Rojstni dan pri nas', title: 'ODBITO\nPRAZNOVANJE', desc: 'Praznuj rojstni dan z ekipo v ločeni party sobi. Paketi vključujejo vse — od animacije do dekoracije.', btn: 'Praznuj z nami →', to: '/#rojstni-dan', accent: '#c084fc', accentBg: 'rgba(192,132,252,0.08)', accentBorder: 'rgba(192,132,252,0.2)' },
              ].map((card, i) => (
                <Link key={i} to={card.to}
                  className="flex flex-col rounded-2xl p-6 flex-shrink-0"
                  style={{ background: '#13161a', border: `1px solid ${card.accentBorder}`, textDecoration: 'none', width: '78vw', scrollSnapAlign: 'center' }}
                >
                  <div className="mb-4 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: card.accentBg }}>
                    {card.icon}
                  </div>
                  <div className="font-condensed font-black text-xs uppercase tracking-widest mb-2" style={{ color: card.accent }}>
                    {card.tag}
                  </div>
                  <h3 className="font-display leading-none mb-3" style={{ fontSize: '28px', color: '#fff', whiteSpace: 'pre-line' }}>
                    {card.title}
                  </h3>
                  <p className="font-condensed text-sm flex-1 mb-5" style={{ color: 'rgba(245,245,240,0.55)', lineHeight: 1.65 }}>
                    {card.desc}
                  </p>
                  <div className="font-condensed font-black text-sm uppercase tracking-widest px-5 py-2.5 rounded-lg text-center"
                    style={{ background: card.accent, color: card.accent === 'var(--accent)' ? '#000' : '#fff' }}>
                    {card.btn}
                  </div>
                </Link>
              ))}
            </div>
          </div>
      </section>

      {/* ── O ODBITO ── */}
      <section style={{ background: '#000', overflow: 'hidden' }}>

        {/* Zgornji del: levo rumeno + desno črno s sliko, diagonalni razdelek */}
        <div className="relative min-h-[480px] flex">

          {/* Rumeno ozadje leve strani */}
          <div className="absolute inset-0" style={{ background: 'var(--accent)' }} />

          {/* Črno ozadje desne strani — z clip-path diagonal */}
          <div className="absolute inset-0" style={{
            background: '#000',
            clipPath: 'polygon(38% 0%, 100% 0%, 100% 100%, 38% 100%)',
          }} />

          {/* Slika — desna stran, nad črnim ozadjem, rezana z isto diagonalo */}
          <div className="absolute inset-y-0 right-0 hidden lg:block" style={{ left: '38%' }}>
            <img src="/Dunking Devils Team.png" alt="Odbito ekipa"
              className="w-full h-full object-cover object-center"
            />
            {/* Comic bubbles */}
            <ComicBubbles />
          </div>

          {/* Tekst — leva stran, nad vsem */}
          <div className="relative z-10 flex items-center px-[5%] py-16 lg:w-[52%]">
            <div>
              <div className="font-condensed font-black text-xs uppercase tracking-widest mb-5"
                style={{ color: '#080A0E', opacity: 0.55, letterSpacing: '0.2em' }}>
                O Odbito
              </div>
              <h2 className="font-display leading-none" style={{ fontSize: 'clamp(52px,7vw,100px)', color: '#080A0E' }}>
                ZABAVA<span style={{ color: '#000' }}>.</span><br />
                <span style={{ color: '#fff' }}>TRENING</span><span style={{ color: '#000' }}>.</span><br />
                SKUPNOST<span style={{ color: '#000' }}>.</span>
              </h2>
            </div>
          </div>

          {/* Mobilna slika */}
          <div className="lg:hidden absolute inset-0">
            <img src="/Dunking Devils Team.png" alt="Odbito ekipa" className="w-full h-full object-cover" style={{ opacity: 0.15 }} />
          </div>
        </div>


      </section>

      {/* ── TEDENSKI URNIK ── */}
      <section className="px-[5%] py-16" style={{ background: 'var(--dark)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display leading-none" style={{ fontSize: 'clamp(24px,4vw,52px)', color: 'var(--white)', whiteSpace: 'nowrap' }}>
                <span style={{ color: 'var(--accent)' }}>TEDENSKI</span>{' '}
                <span style={{ color: 'var(--white)' }}>URNIK</span>
                <span style={{ color: 'var(--accent)' }}>.</span>
              </h2>
            </div>
            <div className="flex flex-row gap-3 items-center">
              {[
                { to: '/vadbe',      bg: '#fab120', color: '#080A0E', shadow: 'rgba(250,177,32,0.35)', line1: 'TRENIRAJ ODBITO',         line2: 'Odbita Akademija', line2color: 'rgba(8,10,14,0.55)' },
                { to: '/rezervacija', bg: '#1e50a0', color: '#ffffff', shadow: 'rgba(30,80,160,0.35)',  line1: 'REZERVIRAJ ENKRATNI OBISK', line2: 'Open-Jump',        line2color: 'rgba(255,255,255,0.55)' },
              ].map(btn => (
                <Link key={btn.to} to={btn.to}
                  className="font-condensed font-black uppercase tracking-widest rounded-xl flex flex-col items-center justify-center"
                  style={{ fontSize: '13px', padding: '11px 22px', textAlign: 'center', whiteSpace: 'nowrap', background: btn.bg, color: btn.color, textDecoration: 'none', lineHeight: 1.25, transition: 'all 0.18s', minWidth: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 20px ${btn.shadow}`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
                  {btn.line1}
                  <span style={{ fontSize: '10px', color: btn.line2color, letterSpacing: '0.1em', fontWeight: 600, marginTop: 2, textTransform: 'none' }}>{btn.line2}</span>
                </Link>
              ))}
            </div>
          </div>

          <WeeklySchedule />

        </div>
      </section>

      {/* ── ODBITA AKADEMIJA ── */}
      <AkademijaSection />

      {/* ── OPEN JUMP INFO ── */}
      <OpenJumpSection />

      {/* ── ROJSTNI DNEVI ── */}
      <BirthdaySection />

      {/* ── POLETNE POČITNICE PROMO ── */}
      <section style={{ position: 'relative', minHeight: 460, display: 'flex', alignItems: 'center', background: 'var(--black)' }}>
        {/* slika čez celo širino */}
        <img
          src="/ODBITO poletje.png"
          alt="Odbite počitnice"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 60%',
          }}
        />
        {/* overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(0,0,0,0.90) 35%, rgba(0,0,0,0.25) 100%)',
        }} />
        {/* vsebina */}
        <div style={{ position: 'relative', padding: '56px 5%', maxWidth: 600 }}>
          <div className="section-label mb-3" style={{ color: 'var(--accent)' }}>Poletje 2027 · Sport City</div>
          <h2 className="font-display mb-4 leading-none" style={{ fontSize: 'clamp(32px,5vw,60px)', color: 'var(--white)' }}>
            ODBITE <span style={{ color: 'var(--accent)' }}>POČITNICE.</span>
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 28, maxWidth: 420 }}>
            Teden šport, zabave in novih prijateljev. Za otroke od 6 do 16 let — julij in avgust, vsak dan nov šport, nova izkušnja.
          </p>
          <Link
            to="/poletne-pocitnice"
            className="font-condensed font-black tracking-widest uppercase"
            style={{
              display: 'inline-block',
              background: 'var(--accent)', color: 'var(--black)',
              padding: '13px 28px', fontSize: 13, letterSpacing: '2px',
              textDecoration: 'none', borderRadius: 4,
            }}>
            VEČ O POLETNIH POČITNICAH →
          </Link>
        </div>
      </section>

      {/* ── LOKACIJA + KONTAKT ── */}
      <section className="px-[5%] py-16" style={{ background: '#E6E6E1' }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">

          {/* ── LEVA: ZEMLJEVID ── */}
          <div>
            <div className="section-label section-label-dark mb-4" style={{ color: '#080A0E' }}>Kje nas najdeš</div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Sport+City+Dolgi+most+6a+Ljubljana"
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="relative rounded-2xl overflow-hidden mb-4"
                style={{ border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <iframe
                  title="Odbito lokacija"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2763.3!2d14.4897!3d46.0266!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x477acd5b1b1b1b1b%3A0x0!2sDolgi+most+6a%2C+Ljubljana!5e0!3m2!1ssl!2ssi!4v1"
                  width="100%"
                  height="300"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
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

            <div className="flex flex-col gap-3">

              {/* Naslov */}
              <div className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '22px', lineHeight: 1, marginTop: '2px' }}>📍</span>
                <div>
                  <div className="font-condensed font-black text-base uppercase tracking-wide" style={{ color: '#080A0E' }}>
                    Sport City, Dolgi most 6a
                  </div>
                  <div className="font-condensed text-sm mt-0.5" style={{ color: '#7A8499' }}>
                    1000 Ljubljana, Slovenija
                  </div>
                </div>
              </div>

              {/* Dostop */}
              <div className="flex flex-col gap-2">
                {[
                  { icon: '🅿️', text: 'Parkirna mesta zagotovljena' },
                  { icon: '🚌', text: <span>LPP P+R Dolgi most — 300m <span style={{ fontSize: '15px' }}>🚶</span></span> },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                    style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)' }}>
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                    <span className="font-condensed font-bold text-sm" style={{ color: '#080A0E' }}>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Sport City opis */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(250,177,32,0.1)', border: '1px solid rgba(250,177,32,0.3)' }}>
                <div className="font-condensed font-black text-xs uppercase tracking-widest mb-2" style={{ color: '#c68a00' }}>
                  O Sport City
                </div>
                <p style={{ fontSize: '13px', color: '#3A3A3A', lineHeight: 1.6 }}>
                  Nov športno-rekreacijski center v Ljubljani — eden največjih pokritih v Sloveniji.
                  Pod eno streho: igre z loparji (pickleball, padel, namizni tenis), večnamenska dvorana,
                  plezalne stene 10a in <strong style={{ color: '#080A0E' }}>Odbito dvorana</strong>.
                </p>
              </div>

            </div>
          </div>

          {/* ── DESNA: DELOVNI ČAS + KONTAKT ── */}
          <div className="flex flex-col gap-6">

            {/* Delovni čas */}
            <div>
              <div className="section-label section-label-dark mb-4" style={{ color: '#080A0E' }}>Delovni čas</div>
              <div className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                {[
                  { day: 'Ponedeljek', short: 'PON', hours: '15:00 – 21:30', type: 'akademija' },
                  { day: 'Torek',      short: 'TOR', hours: '15:00 – 21:30', type: 'akademija' },
                  { day: 'Sreda',      short: 'SRE', hours: '15:00 – 21:30', type: 'akademija' },
                  { day: 'Četrtek',    short: 'ČET', hours: '15:00 – 21:30', type: 'akademija' },
                  { day: 'Petek',      short: 'PET', hours: '15:00 – 21:30', type: 'oba' },
                  { day: 'Sobota',     short: 'SOB', hours: '10:00 – 21:00', type: 'openjump' },
                  { day: 'Nedelja',    short: 'NED', hours: '10:00 – 20:00', type: 'openjump' },
                ].map((row, i, arr) => (
                  <div key={row.day}
                    className="grid items-center px-5 py-3"
                    style={{
                      gridTemplateColumns: '2.5rem 1fr auto auto',
                      borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                      background: i % 2 === 0 ? '#fff' : '#F8F8F4',
                      gap: '0.75rem',
                    }}>
                    <span className="font-condensed font-black text-xs tracking-widest"
                      style={{ color: row.type === 'openjump' ? '#1e50a0' : '#c68a00' }}>
                      {row.short}
                    </span>
                    <span className="font-condensed font-bold text-sm hidden sm:block" style={{ color: '#555' }}>
                      {row.day}
                    </span>
                    <span className="font-condensed font-black text-sm" style={{ color: '#080A0E' }}>
                      {row.hours}
                    </span>
                    <div className="flex gap-1">
                      {(row.type === 'oba' || row.type === 'akademija') && (
                        <span className="font-condensed font-bold px-2 py-0.5 rounded"
                          style={{ background: 'rgba(250,177,32,0.15)', color: '#c68a00', fontSize: '10px' }}>
                          AKADEMIJA
                        </span>
                      )}
                      {(row.type === 'oba' || row.type === 'openjump') && (
                        <span className="font-condensed font-bold px-2 py-0.5 rounded"
                          style={{ background: 'rgba(30,80,160,0.1)', color: '#1e50a0', fontSize: '10px' }}>
                          OPEN JUMP
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kontakt */}
            <div>
              <div className="section-label section-label-dark mb-4" style={{ color: '#080A0E' }}>Kontakt</div>
              <div className="flex flex-col gap-3">
                {[
                  { icon: '📞', label: 'Telefon', value: '040 123 456', href: 'tel:+38640123456', sub: null },
                  { icon: '✉️', label: 'E-mail',  value: 'info@odbito.fun', href: 'mailto:info@odbito.fun', sub: null },
                ].map(c => (
                  <a key={c.label} href={c.href}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all"
                    style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(250,177,32,0.5)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'}>
                    <span style={{ fontSize: '22px' }}>{c.icon}</span>
                    <div>
                      <div className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: '#7A8499' }}>
                        {c.label}
                      </div>
                      <div className="font-condensed font-black text-base" style={{ color: '#080A0E' }}>
                        {c.value}
                      </div>
                    </div>
                  </a>
                ))}

                {/* Chat */}
                <Link to="/kontakt"
                  className="flex items-center gap-4 p-4 rounded-xl transition-all"
                  style={{ background: '#fab120', border: '1px solid rgba(250,177,32,0.3)', textDecoration: 'none', boxShadow: '0 2px 12px rgba(250,177,32,0.2)' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(250,177,32,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(250,177,32,0.2)'; e.currentTarget.style.transform = 'none' }}>
                  <span style={{ fontSize: '22px' }}>💬</span>
                  <div className="flex-1">
                    <div className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(8,10,14,0.6)' }}>
                      Chat
                    </div>
                    <div className="font-condensed font-black text-base" style={{ color: '#080A0E' }}>
                      Hitra pomoč
                    </div>
                  </div>
                  <div className="font-condensed text-xs font-black tracking-widest uppercase px-2 py-1 rounded-full"
                    style={{ background: 'rgba(8,10,14,0.12)', color: '#080A0E' }}>
                    ONLINE
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── NOVIČKE PASICA ── */}
      <section style={{ background: '#fab120' }}>
        <div className="max-w-6xl mx-auto px-[5%] py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span className="font-display leading-none" style={{ fontSize: 'clamp(18px,2.5vw,24px)' }}>
              <span style={{ color: '#080A0E' }}>ODBIT</span><span style={{ color: '#fff' }}>E</span>
              {' '}<span style={{ color: '#080A0E' }}>NOVIČKE</span><span style={{ color: '#fff' }}>.</span>
            </span>
            <span className="font-condensed text-sm" style={{ color: '#080A0E', opacity: 0.75 }}>
              Bodi prvi obveščen o novostih, popustih in dogodkih odbite ekipe.
            </span>
          </div>
          <NewsletterForm />
        </div>
      </section>

    </div>
  )
}
