import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Waiver() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const scrollRef = useRef(null)

  const [waiver, setWaiver] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')
  const [scrolledToEnd, setScrolledToEnd] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    api.get('/auth/waiver')
      .then(r => setWaiver(r.data))
      .catch(() => setError('Napaka pri nalaganju izjave.'))
      .finally(() => setLoading(false))
  }, [])

  // Če vsebina ne zahteva scrollanja, takoj odkleni
  useEffect(() => {
    if (!waiver || !scrollRef.current) return
    const el = scrollRef.current
    if (el.scrollHeight <= el.clientHeight + 40) setScrolledToEnd(true)
  }, [waiver])

  const handleScroll = (e) => {
    const el = e.target
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40
    if (nearBottom) setScrolledToEnd(true)
  }

  const handleAccept = async () => {
    if (!checked || !scrolledToEnd) return
    setAccepting(true)
    setError('')
    try {
      await api.post('/auth/accept-waiver')
      await refreshUser()
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Napaka pri sprejemu izjave. Poskusi znova.')
    } finally {
      setAccepting(false)
    }
  }

  // If user already accepted current version, redirect
  useEffect(() => {
    if (user && waiver && user.waiver_version === waiver.version) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, waiver, navigate])

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-12" style={{ background: 'var(--black)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          {user && waiver && user.waiver_version !== waiver.version && user.waiver_version && (
            <div className="mb-6 px-5 py-4 rounded-xl font-condensed text-sm font-bold tracking-wide"
              style={{ background: 'rgba(250,177,32,0.1)', border: '1px solid rgba(250,177,32,0.3)', color: 'var(--accent)' }}>
              ⚠️ Izjava o odgovornosti je bila posodobljena. Pred nadaljevanjem jo morate ponovno sprejeti.
            </div>
          )}
          <div className="section-label mb-4">Pravni dokument</div>
          <h1 className="font-display mb-2" style={{ fontSize: '52px', color: 'var(--white)', lineHeight: 1 }}>
            IZJAVA O<br /><span style={{ color: 'var(--accent)' }}>ODGOVORNOSTI.</span>
          </h1>
          {waiver && (
            <p className="text-sm mt-4" style={{ color: 'var(--gray)' }}>
              Različica: <span style={{ color: 'var(--white)' }}>{waiver.version}</span>
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <span className="font-condensed text-sm tracking-widest animate-pulse" style={{ color: 'var(--gray)' }}>NALAGAM...</span>
          </div>
        ) : error && !waiver ? (
          <div className="px-5 py-4 rounded-xl font-condensed font-bold tracking-wide"
            style={{ background: 'rgba(255,61,0,0.12)', border: '1px solid rgba(255,61,0,0.3)', color: '#FF3D00' }}>
            {error}
          </div>
        ) : waiver ? (
          <>
            {/* Scrollable content */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="rounded-2xl p-6 mb-6 overflow-y-auto"
              style={{
                background: 'var(--dark2)',
                border: '1px solid var(--border)',
                maxHeight: '400px',
                lineHeight: 1.8,
                color: 'rgba(245,245,240,0.75)',
                fontSize: '14px',
              }}
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>{waiver.content_sl}</div>
            </div>

            {!scrolledToEnd && (
              <p className="text-center text-xs mb-4 font-condensed font-bold tracking-widest"
                style={{ color: 'var(--gray)' }}>
                ↓ POMAKNITE SE DO KONCA ZA SPREJEM
              </p>
            )}

            {/* Accept checkbox */}
            <label className="flex items-start gap-4 cursor-pointer mb-6 p-4 rounded-xl"
              style={{ background: 'var(--dark2)', border: '1px solid var(--border)' }}>
              <input
                type="checkbox"
                checked={checked}
                onChange={e => setChecked(e.target.checked)}
                disabled={!scrolledToEnd}
                className="mt-1 w-5 h-5 cursor-pointer"
                style={{ accentColor: 'var(--accent)', opacity: scrolledToEnd ? 1 : 0.4 }}
              />
              <span className="font-condensed text-sm font-bold tracking-wide" style={{ color: scrolledToEnd ? 'var(--white)' : 'var(--gray)', lineHeight: 1.5 }}>
                Prebral/a sem in se strinjam z Izjavo o odgovornosti Odbito 360 d.o.o. ter potrjujem, da se zavedam tveganj, povezanih z dejavnostmi v trampolinskem parku.
              </span>
            </label>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg font-condensed font-bold tracking-wide"
                style={{ background: 'rgba(255,61,0,0.12)', border: '1px solid rgba(255,61,0,0.3)', color: '#FF3D00' }}>
                {error}
              </div>
            )}

            {!user ? (
              <div className="text-center py-4 px-5 rounded-xl font-condensed font-bold tracking-wide"
                style={{ background: 'rgba(250,177,32,0.08)', border: '1px solid rgba(250,177,32,0.25)', color: 'var(--accent)' }}>
                Za sprejem izjave se moraš najprej{' '}
                <a href="/prijava" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>prijaviti</a>.
              </div>
            ) : (
              <button
                onClick={handleAccept}
                disabled={!checked || !scrolledToEnd || accepting}
                className="btn-primary w-full text-center"
                style={{ opacity: (checked && scrolledToEnd && !accepting) ? 1 : 0.4 }}
              >
                {accepting ? 'SPREJEMAM...' : 'SPREJMI IN NADALJUJ →'}
              </button>
            )}
          </>
        ) : null}

      </div>
    </div>
  )
}
