import React from 'react'
import { Link } from 'react-router-dom'

export function Sec({ num, title }) {
  return (
    <h2 className="font-condensed font-black uppercase tracking-wide mt-10 mb-3"
      style={{ fontSize: '18px', color: 'var(--accent)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
      {num}. {title}
    </h2>
  )
}

export function Sub({ label, title }) {
  return (
    <h3 className="font-condensed font-black uppercase tracking-wide mt-6 mb-2"
      style={{ fontSize: '14px', color: 'var(--white)' }}>
      {label} {title}
    </h3>
  )
}

export function P({ children }) {
  return (
    <p className="font-condensed text-sm leading-relaxed mb-3"
      style={{ color: 'rgba(245,245,240,0.75)', lineHeight: 1.75 }}>
      {children}
    </p>
  )
}

export function Ul({ items }) {
  return (
    <ul className="mb-4 flex flex-col gap-1.5" style={{ paddingLeft: '4px' }}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 font-condensed text-sm"
          style={{ color: 'rgba(245,245,240,0.75)', lineHeight: 1.7 }}>
          <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }}>–</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function Info({ rows }) {
  return (
    <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid var(--border)' }}>
      {rows.map(([label, value], i) => (
        <div key={i} className="flex gap-4 px-4 py-2.5"
          style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 === 0 ? 'var(--dark2)' : 'var(--dark3)' }}>
          <span className="font-condensed font-black text-xs uppercase tracking-widest w-36 flex-shrink-0 pt-0.5"
            style={{ color: 'var(--accent)' }}>{label}</span>
          <span className="font-condensed text-sm" style={{ color: 'rgba(245,245,240,0.8)' }}>{value}</span>
        </div>
      ))}
    </div>
  )
}

export default function LegalLayout({ title, subtitle, date, children }) {
  return (
    <div style={{ background: 'var(--black)', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* Back */}
        <Link to="/"
          className="inline-flex items-center gap-2 font-condensed font-black text-xs uppercase tracking-widest mb-10"
          style={{ color: 'var(--gray)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--gray)'}>
          ← Nazaj na odbito.si
        </Link>

        {/* Header */}
        <div className="mb-10 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="section-label mb-3">Odbito 360 d.o.o.</div>
          <h1 className="font-display leading-none mb-4"
            style={{ fontSize: 'clamp(32px,5vw,52px)', color: 'var(--white)' }}>
            {title}<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          {subtitle && (
            <p className="font-condensed text-sm mb-3" style={{ color: 'var(--gray)' }}>{subtitle}</p>
          )}
          <span className="font-condensed text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(250,177,32,0.1)', border: '1px solid rgba(250,177,32,0.25)', color: 'var(--accent)' }}>
            Veljavno od: {date}
          </span>
        </div>

        {/* Content */}
        <div>{children}</div>

        {/* Footer stamp */}
        <div className="mt-16 pt-8 flex items-center justify-between flex-wrap gap-4"
          style={{ borderTop: '1px solid var(--border)' }}>
          <div>
            <div className="font-display text-2xl leading-none" style={{ color: 'var(--accent)' }}>ODBITO</div>
            <div className="font-condensed text-xs mt-1" style={{ color: 'var(--gray)' }}>Ljubljana, september 2026</div>
          </div>
          <div className="font-condensed text-xs text-right" style={{ color: 'var(--gray)' }}>
            <div className="font-bold" style={{ color: 'var(--white)' }}>Odbito 360 d.o.o.</div>
            <div>Videm 9b, 1262 Dol pri Ljubljani</div>
            <div>info@odbito.si · 040 566 926</div>
          </div>
        </div>

      </div>
    </div>
  )
}
