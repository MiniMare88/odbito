import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import pricing from '../../data/pricing.json'

function PriceLine({ label, price, note, highlight, accent, indent }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 16,
      padding: '14px 0',
      borderBottom: '1px solid var(--border)',
      paddingLeft: indent ? 16 : 0,
    }}>
      <div style={{ flex: 1 }}>
        <span className="font-condensed font-bold tracking-wide"
          style={{ fontSize: 16, color: highlight ? 'var(--accent)' : 'var(--white)', textTransform: indent ? 'none' : 'uppercase' }}>
          {label}
        </span>
        {note && (
          <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 3, lineHeight: 1.5 }}>{note}</div>
        )}
      </div>
      {price !== undefined && (
        <span className="font-display"
          style={{ fontSize: 24, color: accent ? 'var(--accent)' : 'var(--white)', whiteSpace: 'nowrap', lineHeight: 1 }}>
          {typeof price === 'string' ? price : `€ ${price.toFixed(2).replace('.', ',')}`}
        </span>
      )}
    </div>
  )
}

function FAQ({ items }) {
  const [open, setOpen] = React.useState(null)
  return (
    <div style={{ marginTop: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 16,
              padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}>
            <span className="font-condensed font-bold tracking-wide uppercase"
              style={{ fontSize: 15, color: open === i ? 'var(--accent)' : 'var(--white)' }}>
              {item.q}
            </span>
            <span style={{ color: 'var(--accent)', fontSize: 20, flexShrink: 0, transition: 'transform 0.2s',
              transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
          </button>
          {open === i && (
            <div style={{ padding: '0 0 18px', fontSize: 14, color: 'var(--gray)', lineHeight: 1.7, maxWidth: 600 }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function SectionHeader({ label, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '48px 0 8px' }}>
      <div>
        {sub && <div className="section-label mb-1">{sub}</div>}
        <h2 className="font-display" style={{ fontSize: 'clamp(28px,4vw,44px)', color: 'var(--white)', lineHeight: 1 }}>{label}</h2>
      </div>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

export default function Pricing() {
  const [subView, setSubView] = useState('monthly')
  const SUB_TYPES = pricing.academy.subscriptionTypes

  return (
    <div style={{ background: 'var(--black)' }}>

      {/* Hero */}
      <section className="px-[5%] pt-20 pb-4">
        <div className="max-w-3xl mx-auto">
          <div className="section-label mb-4">Cenik</div>
          <h1 className="font-display mb-4" style={{ fontSize: 'clamp(52px,9vw,100px)', color: 'var(--white)', lineHeight: 1 }}>
            <span style={{ color: 'var(--white)' }}>ODBIT</span><span style={{ color: 'var(--accent)' }}>O CENIK</span><span style={{ color: 'var(--white)' }}>.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--gray)', marginTop: 12 }}>
            Cene vključujejo DDV.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-[5%] pb-24">

        {/* ── OPEN JUMP ── */}
        <SectionHeader label="OPEN JUMP" sub="Pet · Sob · Ned" />

        <PriceLine label="60 minut" price={14.00} />
        <PriceLine label="90 minut" price={19.50} accent highlight note="Najpopularnejše" />
        <PriceLine label="120 minut" price={24.00} />
        <PriceLine label="180 minut" price={30.00} />
        <PriceLine label="Podaljšanje (30 min)" price={6.00} note="Dodaš na licu mesta" indent />

        <div style={{ marginTop: 8 }}>
          <div className="section-label" style={{ marginBottom: 6, marginTop: 24 }}>Skupinski popust — 5+ oseb</div>
          <PriceLine label="60 min / osebo" price={12.50} indent />
          <PriceLine label="90 min / osebo" price={17.00} indent />
          <PriceLine label="120 min / osebo" price={21.00} indent />
        </div>

        <div style={{ marginTop: 8 }}>
          <div className="section-label" style={{ marginBottom: 6, marginTop: 24 }}>Posebne ponudbe</div>
          <PriceLine label="Zgodnje jutro (sob/ned 09–11)" price={11.00} note="60 min" indent />
          <PriceLine label="Friday Night (19–22)" price={14.00} note="Plačaš 60 min, skakaš 90 min" indent />
          <PriceLine label="Družinski popust (ned)" price="–15 %" note="1 odrasel + 1 otrok v isti rezervaciji" indent />
        </div>

        <PriceLine label="Odbito nogavice (obvezne ob prvem obisku)" price={3.00}
          note="Lastništvo — prineseš na vsak naslednji obisk" />

        <div style={{ marginTop: 20 }}>
          <Link to="/rezervacija" className="btn-primary">REZERVIRAJ TERMIN →</Link>
        </div>

        {/* ── VADBENE URE ── */}
        <SectionHeader label="VADBENE URE" sub="Pon · Tor · Sre · Čet" />

        {/* Toggle */}
        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'var(--dark2)', display: 'inline-flex' }}>
          {Object.entries(SUB_TYPES).map(([k, v]) => (
            <button key={k} onClick={() => setSubView(k)}
              className="px-4 py-2 rounded-lg font-condensed font-bold text-sm tracking-widest uppercase transition-all"
              style={{
                background: subView === k ? 'var(--accent)' : 'transparent',
                color: subView === k ? 'var(--black)' : 'var(--gray)',
              }}>
              {v.label.split(' ')[0]}
            </button>
          ))}
        </div>

        {pricing.academy.subscriptions.map(s => (
          <PriceLine
            key={s.id}
            label={s.label}
            price={s[subView]}
            note={`${s.sessionsPerWeek}× / teden · ${s.sessionsPerMonth} vadb / mesec${subView !== 'monthly' ? ` · = €${(s[subView] / SUB_TYPES[subView].months).toFixed(0)}/mes` : ''}`}
            accent={s.popular}
            highlight={s.popular}
          />
        ))}

        <div style={{ marginTop: 20 }}>
          <Link to="/vadbe" className="btn-primary">OGLEJ SI URNIK →</Link>
        </div>

        {/* ── ROJSTNI DNEVI ── */}
        <SectionHeader label="ROJSTNI DNEVI" />

        {pricing.birthdayParties.packages.map(p => (
          <PriceLine
            key={p.id}
            label={`Paket ${p.label}`}
            price={p.basePrice}
            accent={p.popular}
            highlight={p.popular}
            note={`Do ${p.maxChildren} otrok · ${p.jumping} min skakanje · ${p.partyRoom} min party soba${p.animation ? ` · Animacija: ${p.animation}` : ''}${p.catering ? ' · Catering' : ''}${p.decoration ? ' · Dekoracija' : ''} · +€${p.extraChildPrice}/dodatni otrok`}
          />
        ))}
        <PriceLine label="Spremljevalci (starši)" price="brezplačno" note="Med trajanjem zabave" indent />

        {/* ── DARILNE KARTICE ── */}
        <SectionHeader label="DARILNE KARTICE" />

        {pricing.giftCards.options.map(g => (
          <PriceLine key={g.id} label={`Darilna kartica €${g.value.toFixed(0)}`} price={g.value} />
        ))}
        <div style={{ fontSize: 13, color: 'var(--gray)', padding: '10px 0' }}>
          {pricing.giftCards.note}
        </div>

        {/* ── ŠOLE IN SKUPINE ── */}
        <SectionHeader label="ŠOLE IN SKUPINE" />
        <PriceLine
          label={`Skupinski popust (${pricing.groups.minPersons}+ oseb)`}
          price={`–${pricing.groups.discountPercent} %`}
          note={pricing.groups.note}
        />

        {/* ── POLETNI TABOR ── */}
        <SectionHeader label="POLETNI TABOR" sub="Julij · Avgust" />
        <PriceLine
          label="Teden tabora / otrok"
          price={pricing.summerCamp.pricePerChildPerWeek}
          note={`Pon–Pet · Max ${pricing.summerCamp.capacityPerWeek} otrok na teden`}
        />

        {/* ── FAQ ── */}
        <SectionHeader label="POGOSTA VPRAŠANJA" />
        <FAQ items={[
          {
            q: 'Ali moram nogavice kupiti ob vsakem obisku?',
            a: 'Ne. Nogavice kupiš enkrat (€3,00) in so tvoje za vedno. Prineseš jih na vsak naslednji obisk. Brez nogavic vstop ni dovoljen.',
          },
          {
            q: 'Ali lahko rezervacijo prekličem ali prestavim?',
            a: 'Rezervacij ni mogoče preklicati samostojno. V primeru višje sile nas kontaktiraj vsaj 24 ur pred terminom na info@odbito.fun in skupaj najdemo rešitev.',
          },
          {
            q: 'Koliko vnaprej moram rezervirati?',
            a: 'Rezervacijo je možno narediti do 30 minut pred začetkom termina, dokler so mesta na voljo. Priporočamo rezervacijo vsaj dan vnaprej, posebej za vikende.',
          },
          {
            q: 'Kaj je skupinski popust in kako se upošteva?',
            a: 'Pri 5 ali več osebah v eni rezervaciji sistem avtomatično upošteva nižje cene (skupinski popust). Ni potrebno ničesar posebej aktivirati.',
          },
          {
            q: 'Ali so starši, ki spremljajo otroke, brezplačno?',
            a: 'Starši, ki le opazujejo in ne skačejo, so brezplačno. Kdor skoči na trampolinski park, potrebuje veljavno vstopnico in podpisano izjavo o odgovornosti.',
          },
          {
            q: 'Kako deluje program zvestobe?',
            a: 'Po 10 obiskih dobiš 1 uro skakanja brezplačno. Obiski se avtomatično beležijo prek tvojega profila. Ob rojstnem dnevu prav tako prejmete 10 % popust (velja 30 dni).',
          },
          {
            q: 'Kako kupim ali unovčim darilno kartico?',
            a: 'Darilne kartice (€25, €50, €100) kupiš prek spletne strani. Pošljemo jih po e-pošti z osebnim sporočilom. Unovčiš jih v svojem profilu pod "Boni" — kredit se odšteje pri naslednji rezervaciji.',
          },
          {
            q: 'Kakšna je razlika med Open Jump in Vadbenimi urami?',
            a: 'Open Jump je prosto skakanje brez vodje — prideš, skakaš, greš. Poteka ob petkih, sobotah in nedeljah. Vadbene ure so vodene skupinske vadbe s trenerjem (akrobatika, freestyle, fitnes na trampolinu) in potekajo od ponedeljka do četrtka.',
          },
        ]} />

        {/* Note */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.8 }}>
            Vse cene vključujejo 22 % DDV. ·
            Rezervacij ni mogoče preklicati samostojno. ·
            Skupinski popust se avtomatsko upošteva pri 5 ali več udeležencih. ·
            Nogavice so obvezne in last kupca.
          </p>
        </div>

      </div>
    </div>
  )
}
