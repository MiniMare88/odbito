import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../services/api.js'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [unverified, setUnverified] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendDone, setResendDone] = useState(false)

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (unverified) setUnverified(false)
    if (error) setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setUnverified(false)
    setLoading(true)
    try {
      const data = await login(form.email, form.password)
      if (data.waiver_required) {
        navigate('/izjava', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      const serverError = err.response?.data?.error
      if (serverError === 'EMAIL_UNVERIFIED') {
        setUnverified(true)
      } else {
        setError(serverError || err.message || 'Napaka pri prijavi')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    try {
      await api.post('/auth/resend-verification', { email: form.email })
      setResendDone(true)
    } catch {
      // fail silently — server always returns success
      setResendDone(true)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16" style={{ background: 'var(--black)' }}>
      <div className="w-full max-w-md">

        <div className="mb-10">
          <div className="section-label mb-4">Prijava</div>
          <h1 className="font-display mb-2" style={{ fontSize: '52px', color: 'var(--white)' }}>
            DOBRODOŠEL<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          <p style={{ color: 'var(--gray)' }}>Nimaš računa? <Link to="/registracija" className="font-bold" style={{ color: 'var(--accent)' }}>Registracija →</Link></p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>E-mail</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-lg font-body text-sm outline-none transition-all"
              style={{ background: 'var(--dark2)', border: '1px solid var(--border)', color: 'var(--white)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              placeholder="ime@email.com"
            />
          </div>

          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>Geslo</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-lg font-body text-sm outline-none transition-all pr-12"
                style={{ background: 'var(--dark2)', border: '1px solid var(--border)', color: 'var(--white)' }}
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

          <div className="flex justify-end">
            <Link to="/pozabljeno-geslo" className="text-xs" style={{ color: 'var(--gray)' }}>Pozabljeno geslo?</Link>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg text-sm font-condensed font-bold tracking-wide" style={{ background: 'rgba(255,61,0,0.12)', border: '1px solid rgba(255,61,0,0.3)', color: '#FF3D00' }}>
              {error}
            </div>
          )}

          {unverified && (
            <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(250,177,32,0.08)', border: '1px solid rgba(250,177,32,0.3)', color: 'var(--white)' }}>
              <p className="font-bold mb-2" style={{ color: '#fab120' }}>Email ni potrjen</p>
              <p style={{ color: 'var(--gray)', marginBottom: '12px' }}>
                Preverite vaš email in kliknite potrditveno povezavo, da aktivirate račun.
              </p>
              {resendDone ? (
                <p className="text-xs font-bold" style={{ color: '#fab120' }}>✓ Email je bil poslan!</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || !form.email}
                  className="text-xs font-bold underline"
                  style={{ color: '#fab120', background: 'none', border: 'none', cursor: 'pointer', opacity: resendLoading ? 0.6 : 1 }}
                >
                  {resendLoading ? 'Pošiljam...' : 'Pošlji potrditveni email znova →'}
                </button>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full text-center mt-2" style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? 'PRIJAVLJAM...' : 'PRIJAVI SE'}
          </button>
        </form>

      </div>
    </div>
  )
}
