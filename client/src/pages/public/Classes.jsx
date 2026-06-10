import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import WeeklySchedule from '../../components/WeeklySchedule.jsx'

const DAYS = ['', 'Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota', 'Nedelja']

function groupByDay(sessions) {
  const groups = {}
  for (const s of sessions) {
    const d = new Date(s.session_date + 'T12:00:00')
    const dow = d.getDay() === 0 ? 7 : d.getDay()
    if (!groups[s.session_date]) groups[s.session_date] = { date: s.session_date, dow, sessions: [] }
    groups[s.session_date].sessions.push(s)
  }
  return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date))
}

export default function Classes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [classTypes, setClassTypes] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('schedule')

  useEffect(() => {
    Promise.all([
      api.get('/classes/types'),
      api.get('/classes/schedule?from=2026-09-01&weeks=8'),
    ]).then(([t, s]) => {
      setClassTypes(t.data)
      setSchedule(s.data)
    }).finally(() => setLoading(false))
  }, [])

  const days = groupByDay(schedule)

  const handleSubscribe = (classTypeId) => {
    if (!user) return navigate('/prijava', { state: { from: '/vadbe' } })
    navigate(`/vadbe/prijava/${classTypeId}`)
  }

  return (
    <div style={{ background: 'var(--black)' }}>

      {/* Hero */}
      <section className="px-[5%] pt-10 lg:pt-20 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="section-label mb-4">
            <span style={{ color: 'var(--accent)' }}>Sezona 2026/2027</span>
            <span style={{ color: 'rgba(245,245,240,0.3)', margin: '0 8px' }}>|</span>
            <span style={{ color: 'var(--white)' }}>Sep 2026 – Jun 2027</span>
          </div>
          <h1 className="font-display mb-5" style={{ fontSize: 'clamp(56px, 10vw, 110px)', color: 'var(--white)', lineHeight: 1 }}>
            ODBIT <span style={{ color: 'var(--accent)' }}>TRENING.</span>
          </h1>
          <p className="max-w-xl mb-8" style={{ fontSize: '17px' }}>
            Organizirane vadbe vsak teden pod vodstvom inštruktorjev. Naroči se na mesečno ali letno naročnino in treniraš pon–čet. Prvi termini se začnejo september 2026.
          </p>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--dark2)', display: 'inline-flex' }}>
            {[['schedule', 'Urnik'], ['types', 'Vadbe']].map(([k, l]) => (
              <button key={k} onClick={() => setView(k)}
                className="px-5 py-2 rounded-lg font-condensed font-bold text-sm tracking-widest uppercase transition-all"
                style={{ background: view === k ? 'var(--accent)' : 'transparent', color: view === k ? 'var(--black)' : 'var(--gray)' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="font-condensed text-sm tracking-widest animate-pulse" style={{ color: 'var(--gray)' }}>NALAGAM...</span>
        </div>
      ) : view === 'schedule' ? (

        /* ── SCHEDULE VIEW ── */
        <section className="px-[5%] pb-20">
          <div className="max-w-6xl mx-auto">
            <WeeklySchedule />
          </div>
        </section>

      ) : (

        /* ── TYPES VIEW ── */
        <section className="px-[5%] pb-20">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {classTypes.map(ct => (
              <div key={ct.id} className="card flex flex-col" style={{ borderTop: `3px solid ${ct.color_hex}` }}>
                <div className="font-condensed font-black text-xl uppercase tracking-wide mb-2" style={{ color: 'var(--white)' }}>
                  {ct.name_sl}
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(245,245,240,0.55)', lineHeight: 1.6, flexGrow: 1, marginBottom: '16px' }}>
                  {ct.description_sl}
                </p>
                {ct.schedules?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {ct.schedules.map(s => (
                      <span key={s.id} className="font-condensed text-xs font-bold tracking-wider px-2 py-1 rounded"
                        style={{ background: 'var(--dark3)', color: 'var(--gray)' }}>
                        {DAYS[s.day_of_week]} {s.start_time?.slice(0, 5)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 mb-5">
                  {[['price_monthly', 'mesec'], ['price_yearly', 'leto']].map(([field, label]) => ct[field] && (
                    <div key={field} className="flex-1 rounded-lg p-3 text-center" style={{ background: 'var(--dark2)' }}>
                      <div className="font-display text-2xl" style={{ color: ct.color_hex, lineHeight: 1 }}>
                        €{Number(ct[field]).toFixed(0)}
                      </div>
                      <div className="font-condensed text-xs tracking-widest uppercase mt-1" style={{ color: 'var(--gray)' }}>
                        / {label}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleSubscribe(ct.id)}
                  className="font-condensed font-black text-sm tracking-widest uppercase py-3 rounded-lg w-full transition-all"
                  style={{ background: ct.color_hex, color: '#080A0E' }}>
                  NAROČI SE →
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
