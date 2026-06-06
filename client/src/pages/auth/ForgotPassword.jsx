import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      setError('Prišlo je do napake. Prosimo, poskusite znova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16" style={{ background: 'var(--black)' }}>
      <div className="w-full max-w-md">

        {sent ? (
          <div className="text-center">
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>✉️</div>
            <div className="section-label mb-4">Email poslan</div>
            <h1 className="font-display mb-4" style={{ fontSize: '42px', color: 'var(--white)' }}>
              PREVERITE<br /><span style={{ color: 'var(--accent)' }}>EMAIL.</span>
            </h1>
            <p style={{ color: 'var(--gray)', lineHeight: 1.7, marginBottom: '32px' }}>
              Če račun obstaja, boste prejeli email z navodili za ponastavitev gesla.
            </p>
            <div className="px-4 py-3 rounded-lg text-sm mb-8" style={{ background: 'rgba(250,177,32,0.08)', border: '1px solid rgba(250,177,32,0.2)', color: 'var(--gray)' }}>
              Povezava velja 1 uro. Preverite tudi mapo z neželeno pošto.
            </div>
            <Link to="/prijava" style={{ color: 'var(--accent)', fontWeight: 700 }}>← Nazaj na prijavo</Link>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <div className="section-label mb-4">Pozabljeno geslo</div>
              <h1 className="font-display mb-2" style={{ fontSize: '48px', color: 'var(--white)' }}>
                POZABILI<br /><span style={{ color: 'var(--accent)' }}>GESLO?</span>
              </h1>
              <p style={{ color: 'var(--gray)' }}>
                Vnesite vaš email in poslali vam bomo navodila za ponastavitev gesla.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-lg font-body text-sm outline-none transition-all"
                  style={{ background: 'var(--dark2)', border: '1px solid var(--border)', color: 'var(--white)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  placeholder="ime@email.com"
                />
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg text-sm font-condensed font-bold tracking-wide" style={{ background: 'rgba(255,61,0,0.12)', border: '1px solid rgba(255,61,0,0.3)', color: '#FF3D00' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full text-center mt-2" style={{ opacity: loading ? 0.6 : 1 }}>
                {loading ? 'POŠILJAM...' : 'POŠLJI NAVODILA'}
              </button>

              <div className="text-center">
                <Link to="/prijava" className="text-sm" style={{ color: 'var(--gray)' }}>← Nazaj na prijavo</Link>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  )
}
