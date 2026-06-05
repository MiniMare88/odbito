import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import pricing from '../../data/pricing.json'

const OJ_PACKAGES = pricing.openJump.packages
  .filter(p => p.duration >= 60)
  .map(p => ({
    label: `${p.duration} MIN`,
    price: p.price,
    popular: p.popular || false,
    desc: p.label,
  }))

const SUBSCRIPTIONS = pricing.academy.subscriptions
const SUB_TYPES = pricing.academy.subscriptionTypes

function PriceTag({ price, period, original }) {
  return (
    <div>
      {original && (
        <div className="font-condensed text-sm line-through" style={{ color: 'var(--gray)' }}>
          €{original.toFixed(2).replace('.', ',')}
        </div>
      )}
      <div className="font-display leading-none" style={{ fontSize: '44px', color: 'var(--accent)' }}>
        €{price.toFixed(2).replace('.', ',')}
      </div>
      {period && (
        <div className="font-condensed text-xs tracking-widest uppercase mt-1" style={{ color: 'var(--gray)' }}>
          {period}
        </div>
      )}
    </div>
  )
}

export default function Pricing() {
  const [subView, setSubView] = useState('monthly')

  return (
    <div style={{ background: 'var(--black)' }}>

      {/* Hero */}
      <section className="px-[5%] pt-20 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="section-label mb-4">Cenik</div>
          <h1 className="font-display mb-4" style={{ fontSize: 'clamp(56px,10vw,110px)', color: 'var(--white)', lineHeight: 1 }}>
            PREGLEDNO<br /><span style={{ color: 'var(--accent)' }}>IN POŠTENO.</span>
          </h1>
          <p className="max-w-lg" style={{ fontSize: '17px' }}>
            Vse cene so z DDV. Brez skritih stroškov, brez presenečenj.
          </p>
        </div>
      </section>

      {/* ── OPEN JUMP ── */}
      <section className="px-[5%] py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div>
              <div className="section-label mb-1">Pet – Ned</div>
              <h2 className="font-display" style={{ fontSize: 'clamp(36px,5vw,60px)', color: 'var(--white)', lineHeight: 1 }}>
                OPEN JUMP
              </h2>
            </div>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {OJ_PACKAGES.map(pkg => (
              <div key={pkg.label} className={`card flex flex-col gap-3 relative ${pkg.popular ? 'featured' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="font-condensed text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full"
                      style={{ background: 'var(--accent)', color: 'var(--black)' }}>POPULARNO</span>
                  </div>
                )}
                <div className="font-condensed font-black text-xl uppercase tracking-wide" style={{ color: 'var(--white)' }}>
                  {pkg.label}
                </div>
                <PriceTag price={pkg.price} period="na osebo" />
                <p style={{ fontSize: '13px', color: 'rgba(245,245,240,0.5)', lineHeight: 1.5 }}>{pkg.desc}</p>
              </div>
            ))}
          </div>

          {/* Group discount info */}
          <div className="rounded-2xl p-5 flex items-start gap-4"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span style={{ fontSize: '22px' }}>👥</span>
            <div>
              <div className="font-condensed font-black text-base uppercase tracking-wide mb-1" style={{ color: 'var(--green)' }}>
                Skupinski popust — {pricing.openJump.groupDiscount.minPersons} ali več oseb
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(245,245,240,0.65)', lineHeight: 1.6 }}>
                Pridete v skupini {pricing.openJump.groupDiscount.minPersons} ali več? Sistem avtomatično upošteva <strong style={{ color: 'var(--green)' }}>skupinski popust</strong> na pakete.
                Starši rezervirajo za otroke in sebe skupaj v eni rezervaciji.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Link to="/rezervacija" className="btn-primary">REZERVIRAJ TERMIN →</Link>
          </div>
        </div>
      </section>

      {/* ── CLASSES ── */}
      <section className="px-[5%] py-16" style={{ background: 'var(--dark)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <div className="section-label mb-1">Pon – Čet</div>
              <h2 className="font-display" style={{ fontSize: 'clamp(36px,5vw,60px)', color: 'var(--white)', lineHeight: 1 }}>
                VADBENE URE
              </h2>
            </div>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* Plan toggle */}
          <div className="flex gap-1 p-1 rounded-xl mb-8 inline-flex" style={{ background: 'var(--dark2)' }}>
            {Object.entries(SUB_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => setSubView(k)}
                className="px-5 py-2 rounded-lg font-condensed font-bold text-sm tracking-widest uppercase transition-all"
                style={{ background: subView === k ? 'var(--accent)' : 'transparent', color: subView === k ? 'var(--black)' : 'var(--gray)' }}>
                {v.label}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {SUBSCRIPTIONS.map(s => (
              <div key={s.id} className={`card flex flex-col gap-3 relative ${s.popular ? 'featured' : ''}`}>
                {s.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="font-condensed text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full"
                      style={{ background: 'var(--accent)', color: 'var(--black)' }}>POPULARNO</span>
                  </div>
                )}
                <div>
                  <div className="font-condensed font-black text-lg uppercase tracking-wide mb-1" style={{ color: 'var(--white)' }}>
                    {s.label}
                  </div>
                  <div className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                    {s.sessionsPerWeek}× / teden · {s.sessionsPerMonth} vadb / mesec
                  </div>
                </div>
                <PriceTag
                  price={s[subView]}
                  period={SUB_TYPES[subView].label.toLowerCase()}
                />
                {subView !== 'monthly' && (
                  <div className="font-condensed text-xs font-bold" style={{ color: 'var(--green)' }}>
                    = €{(s[subView] / SUB_TYPES[subView].months).toFixed(2).replace('.', ',')} / mesec
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-5" style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }}>
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              {[
                [`Max. ${pricing.academy.groupSize}`, 'udeležencev na razred'],
                ['Čakalna lista', 'avtomatično obveščanje'],
                ['1× premik', 'termina na mesec'],
              ].map(([val, lab]) => (
                <div key={lab}>
                  <div className="font-condensed font-black text-base uppercase tracking-wide mb-1" style={{ color: 'var(--accent)' }}>{val}</div>
                  <div className="font-condensed text-xs tracking-wider" style={{ color: 'var(--gray)' }}>{lab}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Link to="/vadbe" className="btn-primary">OGLEJ SI URNIK →</Link>
          </div>
        </div>
      </section>

      {/* ── VAT NOTE ── */}
      <section className="px-[5%] py-10">
        <div className="max-w-6xl mx-auto text-center">
          <p style={{ fontSize: '13px', color: 'var(--gray)' }}>
            Vse cene vključujejo 22% DDV. · Rezervacij ni mogoče preklicati samostojno.
            · Skupinski popust se avtomatsko upošteva pri {pricing.openJump.groupDiscount.minPersons} ali več udeležencih.
          </p>
        </div>
      </section>

    </div>
  )
}
