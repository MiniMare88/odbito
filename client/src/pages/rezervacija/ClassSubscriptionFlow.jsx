import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api.js'

const PLANS = [
  { key: 'monthly', label: 'Mesečna', duration: '30 dni', field: 'price_monthly' },
  { key: 'yearly',  label: 'Letna',   duration: '365 dni', field: 'price_yearly', tag: 'PRIHRANI ~22%' },
]

const DAYS = ['', 'Pon', 'Tor', 'Sre', 'Čet']

export default function ClassSubscriptionFlow() {
  const { classTypeId } = useParams()
  const navigate = useNavigate()

  const [classType, setClassType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  useEffect(() => {
    api.get('/classes/types')
      .then(r => {
        const ct = r.data.find(t => t.id === parseInt(classTypeId))
        setClassType(ct || null)
      })
      .finally(() => setLoading(false))
  }, [classTypeId])

  const handleSubscribe = async () => {
    setSubmitting(true)
    setError('')
    try {
      const { data } = await api.post('/classes/subscribe', {
        class_type_id: parseInt(classTypeId),
        plan_type: selectedPlan,
      })
      setDone(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Napaka pri naročnini')
    } finally {
      setSubmitting(false)
    }
  }

  const plan = PLANS.find(p => p.key === selectedPlan)
  const price = classType ? Number(classType[plan?.field]) : 0
  const yearlyPrice = classType ? Number(classType.price_yearly) : 0
  const monthlyPrice = classType ? Number(classType.price_monthly) : 0
  const yearlySaving = monthlyPrice ? ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12) * 100).toFixed(0) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="font-condensed text-sm tracking-widest animate-pulse" style={{ color: 'var(--gray)' }}>NALAGAM...</span>
      </div>
    )
  }

  if (!classType) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p style={{ color: 'var(--gray)' }}>Vadba ne obstaja.</p>
        <button onClick={() => navigate('/vadbe')} className="btn-secondary">← NAZAJ NA VADBE</button>
      </div>
    )
  }

  /* ── SUCCESS ── */
  if (done) {
    const endDate = new Date(done.end_date + 'T12:00:00').toLocaleDateString('sl-SI', { day: 'numeric', month: 'long', year: 'numeric' })
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16" style={{ background: 'var(--black)' }}>
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid var(--green)' }}>
            <span style={{ fontSize: '36px', color: 'var(--green)' }}>✓</span>
          </div>
          <h1 className="font-display mb-3" style={{ fontSize: '52px', color: 'var(--white)', lineHeight: 1 }}>
            NAROČNINA<br /><span style={{ color: 'var(--accent)' }}>AKTIVNA!</span>
          </h1>
          <p className="mb-8" style={{ color: 'var(--gray)' }}>
            Uspešno si se naročil na <strong style={{ color: 'var(--white)' }}>{classType.name_sl}</strong>. Naročnina velja do <strong style={{ color: 'var(--accent)' }}>{endDate}</strong>.
          </p>
          <div className="card mb-8 text-left">
            {[
              ['Vadba', classType.name_sl],
              ['Plan', plan?.label],
              ['Velja od', new Date().toLocaleDateString('sl-SI')],
              ['Velja do', endDate],
              ['Status plačila', 'Plačilo na blagajni'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>{k}</span>
                <span className="font-condensed font-bold text-sm" style={{ color: 'var(--white)' }}>{v}</span>
              </div>
            ))}
            <div className="flex justify-between py-3">
              <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>Znesek</span>
              <span className="font-display text-2xl" style={{ color: 'var(--accent)' }}>€{price.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/vadbe')} className="btn-secondary flex-1">URNIK →</button>
            <button onClick={() => navigate('/dashboard')} className="btn-primary flex-1">MOJ DASHBOARD →</button>
          </div>
        </div>
      </div>
    )
  }

  /* ── FLOW ── */
  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-12" style={{ background: 'var(--black)' }}>
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <button onClick={() => navigate('/vadbe')} className="font-condensed text-xs font-bold tracking-widest uppercase mb-6 flex items-center gap-2 transition-colors"
            style={{ color: 'var(--gray)' }}>
            ← NAZAJ NA VADBE
          </button>
          <div className="section-label mb-3">Naročnina</div>
          <h1 className="font-display mb-2" style={{ fontSize: '52px', color: 'var(--white)', lineHeight: 1 }}>
            {classType.name_sl.toUpperCase()}
            <span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          <p style={{ color: 'var(--gray)' }}>{classType.description_sl}</p>
        </div>

        {/* Schedule pills */}
        {classType.schedules?.length > 0 && (
          <div className="mb-8">
            <div className="section-label mb-3">Urnik vadb</div>
            <div className="flex flex-wrap gap-2">
              {classType.schedules.map(s => (
                <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }}>
                  <span className="font-condensed font-black text-sm" style={{ color: classType.color_hex }}>
                    {DAYS[s.day_of_week]}
                  </span>
                  <span className="font-condensed font-bold text-sm" style={{ color: 'var(--white)' }}>
                    {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plan selector */}
        <div className="mb-8">
          <div className="section-label mb-4">Izberi plan</div>
          <div className="grid grid-cols-2 gap-3">
            {PLANS.map(p => {
              const pPrice = Number(classType[p.field])
              const active = selectedPlan === p.key
              return (
                <button key={p.key} onClick={() => setSelectedPlan(p.key)}
                  className="relative text-left rounded-2xl p-5 transition-all"
                  style={{
                    background: active ? 'rgba(250,177,32,0.1)' : 'var(--card-bg)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  }}>
                  {p.tag && (
                    <span className="absolute top-3 right-3 font-condensed text-xs font-black tracking-wider px-2 py-0.5 rounded"
                      style={{ background: 'var(--accent)', color: 'var(--black)' }}>
                      {p.tag.replace('~', `~${yearlySaving}%`)}
                    </span>
                  )}
                  <div className="font-condensed font-black text-base uppercase tracking-wide mb-1"
                    style={{ color: active ? 'var(--accent)' : 'var(--white)' }}>
                    {p.label}
                  </div>
                  <div className="font-display text-4xl mb-1" style={{ color: active ? 'var(--accent)' : 'var(--white)', lineHeight: 1 }}>
                    €{pPrice.toFixed(0)}
                  </div>
                  <div className="font-condensed text-xs tracking-wide" style={{ color: 'var(--gray)' }}>
                    {p.duration}
                  </div>
                  {p.key === 'yearly' && monthlyPrice > 0 && (
                    <div className="font-condensed text-xs mt-1" style={{ color: 'var(--gray)' }}>
                      = €{(yearlyPrice / 12).toFixed(2).replace('.', ',')} / mesec
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{ border: '1px solid var(--border)' }}>
          {[
            ['Vadba', classType.name_sl],
            ['Plan', plan?.label],
            ['Trajanje', plan?.duration],
            ['Kapaciteta', `${classType.capacity} mest`],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="font-condensed text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gray)' }}>{k}</span>
              <span className="font-condensed font-bold text-sm" style={{ color: 'var(--white)' }}>{v}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-5" style={{ background: 'rgba(250,177,32,0.06)' }}>
            <span className="font-condensed font-black text-sm tracking-widest uppercase" style={{ color: 'var(--accent)' }}>SKUPAJ</span>
            <span className="font-display text-4xl" style={{ color: 'var(--accent)' }}>€{price.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        <div className="mb-5 px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--dark2)', border: '1px solid var(--border)', color: 'var(--gray)', lineHeight: 1.6 }}>
          ⚠️ Plačilo naročnine na blagajni ob prvem obisku. Naročnina je aktivna takoj po potrditvi.
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg font-condensed font-bold tracking-wide"
            style={{ background: 'rgba(255,61,0,0.12)', border: '1px solid rgba(255,61,0,0.3)', color: '#FF3D00' }}>
            {error}
          </div>
        )}

        <button onClick={handleSubscribe} disabled={submitting} className="btn-primary w-full text-center"
          style={{ opacity: submitting ? 0.6 : 1 }}>
          {submitting ? 'AKTIVIRAM...' : 'AKTIVIRAJ NAROČNINO →'}
        </button>

      </div>
    </div>
  )
}
