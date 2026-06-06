import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../../services/api.js'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState('loading') // loading | success | expired | invalid
  const [resendEmail, setResendEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendDone, setResendDone] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      return
    }
    api.post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(err => {
        const code = err.response?.data?.error
        if (code === 'EXPIRED_TOKEN') setStatus('expired')
        else setStatus('invalid')
      })
  }, [token])

  const handleResend = async e => {
    e.preventDefault()
    setResendLoading(true)
    try {
      await api.post('/auth/resend-verification', { email: resendEmail })
      setResendDone(true)
    } catch {
      setResendDone(true)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16" style={{ background: 'var(--black)' }}>
      <div className="w-full max-w-md text-center">

        {status === 'loading' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>⏳</div>
            <h1 className="font-display mb-4" style={{ fontSize: '36px', color: 'var(--white)' }}>PREVERJAM...</h1>
            <p style={{ color: 'var(--gray)' }}>Potrjujemo vaš email naslov.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
            <div className="section-label mb-4">Uspešno</div>
            <h1 className="font-display mb-4" style={{ fontSize: '42px', color: 'var(--white)' }}>
              EMAIL<br /><span style={{ color: 'var(--accent)' }}>POTRJEN!</span>
            </h1>
            <p style={{ color: 'var(--gray)', marginBottom: '32px', lineHeight: 1.7 }}>
              Vaš račun je aktiviran. Zdaj se lahko prijavite in začnete z rezervacijami.
            </p>
            <Link to="/prijava" className="btn-primary">PRIJAVI SE →</Link>
          </>
        )}

        {status === 'expired' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>⏰</div>
            <div className="section-label mb-4">Povezava je potekla</div>
            <h1 className="font-display mb-4" style={{ fontSize: '36px', color: 'var(--white)' }}>
              LINK JE<br /><span style={{ color: 'var(--accent)' }}>POTEKEL.</span>
            </h1>
            <p style={{ color: 'var(--gray)', marginBottom: '32px', lineHeight: 1.7 }}>
              Potrditvena povezava je potekla. Zahtevajte novega.
            </p>
            {resendDone ? (
              <div className="px-4 py-3 rounded-lg text-sm font-bold" style={{ background: 'rgba(250,177,32,0.08)', border: '1px solid rgba(250,177,32,0.2)', color: '#fab120' }}>
                ✓ Nov potrditveni email je bil poslan!
              </div>
            ) : (
              <form onSubmit={handleResend} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={e => setResendEmail(e.target.value)}
                  required
                  placeholder="Vnesite vaš email"
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--dark2)', border: '1px solid var(--border)', color: 'var(--white)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="submit" disabled={resendLoading} className="btn-primary w-full" style={{ opacity: resendLoading ? 0.6 : 1 }}>
                  {resendLoading ? 'POŠILJAM...' : 'POŠLJI NOVEGA →'}
                </button>
              </form>
            )}
          </>
        )}

        {status === 'invalid' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>❌</div>
            <div className="section-label mb-4">Napaka</div>
            <h1 className="font-display mb-4" style={{ fontSize: '36px', color: 'var(--white)' }}>
              NEVELJAVEN<br /><span style={{ color: 'var(--accent)' }}>LINK.</span>
            </h1>
            <p style={{ color: 'var(--gray)', marginBottom: '32px', lineHeight: 1.7 }}>
              Ta potrditvena povezava ni veljavna. Preverite, ali ste kopirali celotno povezavo iz emaila.
            </p>
            <Link to="/prijava" style={{ color: 'var(--accent)', fontWeight: 700 }}>← Nazaj na prijavo</Link>
          </>
        )}

      </div>
    </div>
  )
}
