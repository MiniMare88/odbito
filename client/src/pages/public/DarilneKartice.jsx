import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../services/api.js'

const DENOMINATIONS = [
  { value: 15, label: '€15', desc: 'Vstopnica za 1 uro skakanja' },
  { value: 25, label: '€25', desc: 'Vstopnica za 1,5 ure + oprema' },
  { value: 50, label: '€50', desc: 'Skupinska izkušnja za 2–3 osebe' },
]

function StepIndicator({ step }) {
  const steps = ['Izberi vrednost', 'Plačilo', 'Potrjeno']
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 48 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13,
              background: i < step ? '#fab120' : i === step ? '#fab120' : '#1a1a1a',
              color: i <= step ? '#000' : '#555',
              border: i <= step ? 'none' : '1px solid #333',
            }}>{i < step ? '✓' : i + 1}</div>
            <span style={{ fontSize: 11, color: i === step ? '#fab120' : '#555', letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: 60, height: 1, background: i < step ? '#fab120' : '#222', margin: '0 8px', marginBottom: 20 }} />
          )}
        </div>
      ))}
    </div>
  )
}

function SuccessScreen({ vouchers, denomination, quantity }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>✓</div>
      <h2 style={{ fontFamily: 'var(--font-display, "Bebas Neue")', fontSize: 52, color: '#fff', letterSpacing: 4, marginBottom: 8 }}>
        HVALA<span style={{ color: '#fab120' }}>!</span>
      </h2>
      <p style={{ color: '#888', marginBottom: 36 }}>Vaše darilne kartice so bile poslane na email. Spodaj so vaše kode.</p>

      {(vouchers || []).map((v, i) => (
        <div key={i} style={{ background: '#141820', border: '1px solid rgba(250,177,32,0.3)', borderRadius: 14, padding: '24px', marginBottom: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#fab120', marginBottom: 8 }}>Darilna kartica #{i + 1}</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: '#fab120', marginBottom: 10 }}>€{denomination}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 16, letterSpacing: 4, color: '#fff', background: '#0d0d0d', padding: '10px 16px', borderRadius: 8, display: 'inline-block', marginBottom: 8 }}>{v.code}</div>
          <div style={{ fontSize: 12, color: '#555' }}>
            Veljavno do: {new Date(v.expires_at).toLocaleDateString('sl-SI', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      ))}

      <p style={{ color: '#666', fontSize: 13, margin: '24px 0', lineHeight: 1.7 }}>
        Kodo delite z osebo, ki jo podarjate. Unovčiti jo je mogoče v profilu na <strong style={{ color: '#fab120' }}>odbito.fun</strong> pod "Boni".
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/dashboard" style={{ background: '#fab120', color: '#000', padding: '12px 28px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>MOJ PROFIL →</Link>
        <button onClick={() => window.location.reload()} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#aaa', padding: '12px 28px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>KUPI NOVO</button>
      </div>
    </div>
  )
}

export default function DarilneKartice() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [denomination, setDenomination] = useState(25)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vouchers, setVouchers] = useState(null)

  // Stripe card element state
  const [stripe, setStripe] = useState(null)
  const [cardReady, setCardReady] = useState(false)
  const [cardElement, setCardElement] = useState(null)
  const [stripeInitialized, setStripeInitialized] = useState(false)

  const totalPrice = denomination * quantity

  const initStripe = async () => {
    if (stripeInitialized) return
    setStripeInitialized(true)
    const { loadStripe } = await import('@stripe/stripe-js')
    const stripeInstance = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
    setStripe(stripeInstance)

    // Mount card element
    setTimeout(() => {
      const elements = stripeInstance.elements()
      const card = elements.create('card', {
        style: {
          base: {
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: '16px',
            '::placeholder': { color: '#555' },
          },
          invalid: { color: '#f87171' },
        },
      })
      card.mount('#stripe-card-element')
      card.on('change', (e) => setCardReady(e.complete))
      setCardElement(card)
    }, 100)
  }

  const handleGoToPayment = async () => {
    if (!user) {
      navigate('/prijava?redirect=/darilne-kartice')
      return
    }
    setStep(1)
    await initStripe()
  }

  const handlePay = async () => {
    if (!stripe || !cardElement) return
    setLoading(true)
    setError('')
    try {
      // 1. Create payment intent
      const { data } = await api.post('/vouchers/purchase/intent', { denomination, quantity })

      // 2. Confirm with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: { card: cardElement },
      })
      if (stripeError) throw new Error(stripeError.message)

      // 3. Confirm on our server → generate codes
      const { data: result } = await api.post('/vouchers/purchase/confirm', {
        payment_intent_id: paymentIntent.id,
      })
      setVouchers(result.vouchers)
      setStep(2)
    } catch (err) {
      setError(err.message || 'Plačilo ni uspelo. Prosimo poskusite znova.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#0d0d0d', padding: '60px 20px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#fab120', marginBottom: 12 }}>Darilo brez napak</div>
          <h1 style={{ fontFamily: 'var(--font-display, "Bebas Neue")', fontSize: 'clamp(48px,8vw,80px)', color: '#fff', letterSpacing: 4, lineHeight: 1, marginBottom: 16 }}>
            DARILNE<br />KARTICE<span style={{ color: '#fab120' }}>.</span>
          </h1>
          <p style={{ color: '#666', fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            Podari izkušnjo skakanja. Kartica se pošlje po emailu in jo prejemnik unovči v svojem profilu.
          </p>
        </div>

        <StepIndicator step={step} />

        {/* STEP 0 — choose */}
        {step === 0 && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 16 }}>1. Izberi vrednost kartice</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {DENOMINATIONS.map(d => (
                  <button key={d.value} onClick={() => setDenomination(d.value)}
                    style={{
                      background: denomination === d.value ? 'rgba(250,177,32,0.12)' : '#111',
                      border: `2px solid ${denomination === d.value ? '#fab120' : '#222'}`,
                      borderRadius: 14, padding: '20px 12px', cursor: 'pointer',
                      textAlign: 'center', transition: 'all 0.15s',
                    }}>
                    <div style={{ fontSize: 36, fontWeight: 900, color: denomination === d.value ? '#fab120' : '#fff', marginBottom: 6 }}>{d.label}</div>
                    <div style={{ fontSize: 12, color: '#666', lineHeight: 1.4 }}>{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 16 }}>2. Količina</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ width: 40, height: 40, borderRadius: 8, background: '#1a1a1a', border: '1px solid #333', color: '#fff', fontSize: 20, cursor: 'pointer' }}>−</button>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', minWidth: 40, textAlign: 'center' }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(20, q + 1))}
                  style={{ width: 40, height: 40, borderRadius: 8, background: '#1a1a1a', border: '1px solid #333', color: '#fff', fontSize: 20, cursor: 'pointer' }}>+</button>
                <span style={{ color: '#666', fontSize: 14 }}>
                  {quantity > 1 && `= ${quantity} ločenih kod`}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: '20px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>{quantity}× darilna kartica €{denomination}</div>
                <div style={{ fontSize: 11, color: '#444' }}>Veljavnost: 3 leta od datuma nakupa</div>
              </div>
              <div style={{ fontSize: 40, fontWeight: 900, color: '#fab120' }}>€{totalPrice}</div>
            </div>

            {/* Info boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 32 }}>
              {[
                { icon: '📧', text: 'Pošljemo po emailu takoj po plačilu' },
                { icon: '🎁', text: 'Kodo delite z darilnim prejemnikom' },
                { icon: '♾️', text: 'Veljavno 3 leta, enkratna uporaba' },
              ].map(i => (
                <div key={i.text} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{i.icon}</div>
                  <div style={{ fontSize: 11, color: '#666', lineHeight: 1.5 }}>{i.text}</div>
                </div>
              ))}
            </div>

            <button onClick={handleGoToPayment}
              style={{ width: '100%', background: '#fab120', border: 'none', borderRadius: 12, color: '#000', padding: '16px', fontWeight: 900, fontSize: 16, cursor: 'pointer', letterSpacing: 2, textTransform: 'uppercase' }}>
              {user ? `NADALJUJ NA PLAČILO · €${totalPrice}` : 'PRIJAVI SE IN KUPI →'}
            </button>
          </div>
        )}

        {/* STEP 1 — payment */}
        {step === 1 && (
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>Povzetek naročila</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#888' }}>{quantity}× darilna kartica €{denomination}</span>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#fab120' }}>€{totalPrice}</span>
              </div>
            </div>

            <div style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 16 }}>Plačilni podatki</div>
              <div id="stripe-card-element" style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, padding: '14px 16px', minHeight: 44 }} />
              <div style={{ fontSize: 11, color: '#444', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                🔒 Varno plačilo prek Stripe. Podatkov kartice ne shranjujemo.
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '12px 16px', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button onClick={handlePay} disabled={loading || !cardReady}
              style={{ width: '100%', background: loading || !cardReady ? '#333' : '#fab120', border: 'none', borderRadius: 12, color: loading || !cardReady ? '#666' : '#000', padding: '16px', fontWeight: 900, fontSize: 16, cursor: loading || !cardReady ? 'not-allowed' : 'pointer', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
              {loading ? 'PLAČUJEM…' : `PLAČAJ €${totalPrice}`}
            </button>
            <button onClick={() => setStep(0)} style={{ width: '100%', background: 'transparent', border: '1px solid #333', borderRadius: 12, color: '#666', padding: '12px', cursor: 'pointer', fontSize: 14 }}>
              ← Nazaj
            </button>
          </div>
        )}

        {/* STEP 2 — success */}
        {step === 2 && <SuccessScreen vouchers={vouchers} denomination={denomination} quantity={quantity} />}
      </div>
    </div>
  )
}
