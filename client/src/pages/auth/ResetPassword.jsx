import React, { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import api from '../../services/api.js'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [status, setStatus] = useState('form') // form | loading | success | expired | invalid
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) setStatus('invalid')
  }, [token])

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      setError('Gesli se ne ujemata')
      return
    }
    if (form.newPassword.length < 8) {
      setError('Geslo mora imeti vsaj 8 znakov')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      })
      setStatus('success')
      setTimeout(() => navigate('/prijava', { state: { message: 'Geslo je bilo uspešno spremenjeno.' } }), 3000)
    } catch (err) {
      const code = err.response?.data?.error
      if (code === 'EXPIRED_TOKEN') setStatus('expired')
      else if (code === 'INVALID_TOKEN') setStatus('invalid')
      else setError(err.response?.data?.error || 'Napaka pri ponastavitvi gesla')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = { background: 'var(--dark2)', border: '1px solid var(--border)', color: 'var(--white)' }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16" style={{ background: 'var(--black)' }}>
      <div className="w-full max-w-md">

        {status === 'success' && (
          <div className="text-center">
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
            <div className="section-label mb-4">Uspešno</div>
            <h1 className="font-display mb-4" style={{ fontSize: '42px', color: 'var(--white)' }}>
              GESLO<br /><span style={{ color: 'var(--accent)' }}>SPREMENJENO!</span>
            </h1>
            <p style={{ color: 'var(--gray)', marginBottom: '32px', lineHeight: 1.7 }}>
              Geslo je bilo uspešno spremenjeno. Preusmerjamo vas na prijavo...
            </p>
            <Link to="/prijava" className="btn-primary">PRIJAVI SE →</Link>
          </div>
        )}

        {status === 'expired' && (
          <div className="text-center">
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>⏰</div>
            <div className="section-label mb-4">Povezava je potekla</div>
            <h1 className="font-display mb-4" style={{ fontSize: '36px', color: 'var(--white)' }}>
              LINK JE<br /><span style={{ color: 'var(--accent)' }}>POTEKEL.</span>
            </h1>
            <p style={{ color: 'var(--gray)', marginBottom: '32px', lineHeight: 1.7 }}>
              Zahtevajte novo ponastavitev gesla.
            </p>
            <Link to="/pozabljeno-geslo" className="btn-primary">ZAHTEVAJ NOVEGA →</Link>
          </div>
        )}

        {status === 'invalid' && (
          <div className="text-center">
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>❌</div>
            <div className="section-label mb-4">Napaka</div>
            <h1 className="font-display mb-4" style={{ fontSize: '36px', color: 'var(--white)' }}>
              NEVELJAVEN<br /><span style={{ color: 'var(--accent)' }}>LINK.</span>
            </h1>
            <p style={{ color: 'var(--gray)', marginBottom: '32px' }}>
              Ta povezava ni veljavna.
            </p>
            <Link to="/pozabljeno-geslo" style={{ color: 'var(--accent)', fontWeight: 700 }}>← Zahtevaj ponastavitev gesla</Link>
          </div>
        )}

        {status === 'form' && (
          <>
            <div className="mb-10">
              <div className="section-label mb-4">Novo geslo</div>
              <h1 className="font-display mb-2" style={{ fontSize: '48px', color: 'var(--white)' }}>
                NASTAVI<br /><span style={{ color: 'var(--accent)' }}>GESLO.</span>
              </h1>
              <p style={{ color: 'var(--gray)' }}>Izberite novo geslo za vaš račun.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>
                  Novo geslo <span style={{ fontWeight: 400 }}>(min. 8 znakov)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all pr-12"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--gray)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>
                  Potrdi geslo
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg text-sm font-condensed font-bold tracking-wide" style={{ background: 'rgba(255,61,0,0.12)', border: '1px solid rgba(255,61,0,0.3)', color: '#FF3D00' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-primary w-full text-center mt-2" style={{ opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'SHRANJUJEM...' : 'NASTAVI GESLO'}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  )
}
