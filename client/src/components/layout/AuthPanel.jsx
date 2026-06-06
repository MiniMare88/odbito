import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../services/api.js'

const COUNTRIES = [
  { code: 'SI', flag: '🇸🇮', dial: '+386', name: 'Slovenija' },
  { code: 'HR', flag: '🇭🇷', dial: '+385', name: 'Hrvaška' },
  { code: 'AT', flag: '🇦🇹', dial: '+43',  name: 'Avstrija' },
  { code: 'IT', flag: '🇮🇹', dial: '+39',  name: 'Italija' },
  { code: 'HU', flag: '🇭🇺', dial: '+36',  name: 'Madžarska' },
  { code: 'DE', flag: '🇩🇪', dial: '+49',  name: 'Nemčija' },
  { code: 'CH', flag: '🇨🇭', dial: '+41',  name: 'Švica' },
  { code: 'RS', flag: '🇷🇸', dial: '+381', name: 'Srbija' },
  { code: 'BA', flag: '🇧🇦', dial: '+387', name: 'BiH' },
  { code: 'GB', flag: '🇬🇧', dial: '+44',  name: 'Velika Britanija' },
  { code: 'US', flag: '🇺🇸', dial: '+1',   name: 'ZDA' },
]

// ── Login form ─────────────────────────────────────────────────
function LoginForm({ onClose }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
      onClose()
      if (data.waiver_required) navigate('/izjava')
      else navigate('/dashboard')
    } catch (err) {
      const code = err.response?.data?.error
      if (code === 'EMAIL_UNVERIFIED') setUnverified(true)
      else setError(code || 'Napaka pri prijavi')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    try { await api.post('/auth/resend-verification', { email: form.email }) } catch {}
    setResendDone(true)
    setResendLoading(false)
  }

  const inp = { background: 'var(--dark2)', border: '1px solid var(--border)', color: 'var(--white)' }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>E-mail</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email"
          className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
          style={inp} placeholder="ime@email.com"
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
      </div>

      <div>
        <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Geslo</label>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
            required autoComplete="current-password"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all pr-12"
            style={inp} placeholder="••••••••"
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          <button type="button" onClick={() => setShowPassword(v => !v)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--gray)' }}>
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <div className="flex justify-end mt-1">
          <Link to="/pozabljeno-geslo" onClick={onClose} className="text-xs" style={{ color: 'var(--gray)' }}>Pozabljeno geslo?</Link>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg text-xs font-bold" style={{ background: 'rgba(255,61,0,0.12)', border: '1px solid rgba(255,61,0,0.3)', color: '#FF3D00' }}>
          {error}
        </div>
      )}

      {unverified && (
        <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(250,177,32,0.08)', border: '1px solid rgba(250,177,32,0.3)', color: 'var(--white)' }}>
          <p className="font-bold mb-1" style={{ color: '#fab120' }}>Email ni potrjen</p>
          <p style={{ color: 'var(--gray)', marginBottom: '8px' }}>Preverite email in kliknite potrditveno povezavo.</p>
          {resendDone
            ? <p className="font-bold" style={{ color: '#fab120' }}>✓ Email poslan!</p>
            : <button type="button" onClick={handleResend} disabled={resendLoading || !form.email}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fab120', fontWeight: 700, fontSize: '12px', textDecoration: 'underline', opacity: resendLoading ? 0.6 : 1 }}>
                {resendLoading ? 'Pošiljam...' : 'Pošlji znova →'}
              </button>
          }
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full mt-1" style={{ opacity: loading ? 0.6 : 1 }}>
        {loading ? 'PRIJAVLJAM...' : 'PRIJAVI SE'}
      </button>
    </form>
  )
}

// ── Register form ──────────────────────────────────────────────
function RegisterForm({ onClose, onSuccess }) {
  const { register } = useAuth()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', confirmPassword: '', date_of_birth: '', phoneNumber: '' })
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [showCountryDD, setShowCountryDD] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [checks, setChecks] = useState({ terms: false, privacy: false, noMarketing: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return setError('Gesli se ne ujemata')
    if (form.password.length < 8) return setError('Geslo mora imeti vsaj 8 znakov')
    if (!checks.terms) return setError('Sprejetje splošnih pogojev in izjave je obvezno')
    if (!checks.privacy) return setError('Strinjanje s politiko zasebnosti je obvezno')
    setError('')
    setLoading(true)
    try {
      await register({
        first_name: form.first_name, last_name: form.last_name,
        email: form.email, password: form.password,
        phone: selectedCountry.dial + form.phoneNumber.replace(/[\s\-]/g, ''),
        date_of_birth: form.date_of_birth, preferred_language: 'sl',
        marketing_consent: !checks.noMarketing,
      })
      onSuccess(form.email)
    } catch (err) {
      setError(err.response?.data?.error || 'Napaka pri registraciji')
    } finally {
      setLoading(false)
    }
  }

  const inp = { background: 'var(--dark2)', border: '1px solid var(--border)', color: 'var(--white)' }
  const pwMatch = form.confirmPassword && form.password === form.confirmPassword
  const pwMismatch = form.confirmPassword && form.password !== form.confirmPassword

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Ime</label>
          <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required
            className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inp} placeholder="Janez"
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
        <div>
          <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Priimek</label>
          <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required
            className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inp} placeholder="Novak"
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
      </div>

      <div>
        <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>E-mail</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required
          className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inp} placeholder="ime@email.com"
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Geslo</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
              required minLength={8} autoComplete="new-password"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none pr-9" style={inp} placeholder="min. 8 znakov"
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <button type="button" onClick={() => setShowPw(v => !v)}
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: 'var(--gray)' }}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <div>
          <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Potrdi geslo</label>
          <div className="relative">
            <input type={showPw2 ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
              required autoComplete="new-password"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none pr-9"
              style={{ ...inp, borderColor: pwMatch ? '#22c55e' : pwMismatch ? '#ef4444' : 'var(--border)' }}
              placeholder="••••••••"
              onFocus={e => e.target.style.borderColor = pwMismatch ? '#ef4444' : pwMatch ? '#22c55e' : 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = pwMatch ? '#22c55e' : pwMismatch ? '#ef4444' : 'var(--border)'} />
            <button type="button" onClick={() => setShowPw2(v => !v)}
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: 'var(--gray)' }}>
              {showPw2 ? '🙈' : '👁️'}
            </button>
          </div>
          {pwMatch && <p className="text-xs mt-0.5" style={{ color: '#22c55e' }}>✓ Ujemata se</p>}
          {pwMismatch && <p className="text-xs mt-0.5" style={{ color: '#ef4444' }}>✗ Ne ujemata se</p>}
        </div>
      </div>

      {/* Telefon */}
      <div>
        <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Telefon</label>
        <div className="flex gap-2 relative">
          <div className="relative">
            <button type="button" onClick={() => setShowCountryDD(v => !v)}
              className="flex items-center gap-1 px-2 py-2 rounded-lg text-sm outline-none"
              style={{ ...inp, whiteSpace: 'nowrap', minWidth: '90px', cursor: 'pointer' }}>
              <span style={{ fontSize: '18px' }}>{selectedCountry.flag}</span>
              <span style={{ fontSize: '12px' }}>{selectedCountry.dial}</span>
              <span style={{ color: 'var(--gray)', fontSize: '10px' }}>▾</span>
            </button>
            {showCountryDD && (
              <div className="absolute top-full left-0 mt-1 rounded-lg overflow-y-auto z-50"
                style={{ background: '#1a2030', border: '1px solid var(--border)', minWidth: '200px', maxHeight: '220px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                {COUNTRIES.map(c => (
                  <button key={c.code} type="button"
                    onClick={() => { setSelectedCountry(c); setShowCountryDD(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left"
                    style={{ background: selectedCountry.code === c.code ? 'rgba(250,177,32,0.12)' : 'transparent', color: 'var(--white)', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = selectedCountry.code === c.code ? 'rgba(250,177,32,0.12)' : 'transparent'}>
                    <span style={{ fontSize: '16px' }}>{c.flag}</span>
                    <span style={{ flex: 1 }}>{c.name}</span>
                    <span style={{ color: 'var(--gray)' }}>{c.dial}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={inp} placeholder="040-123-456"
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
      </div>

      {/* Datum rojstva */}
      <div>
        <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-1 block" style={{ color: 'var(--gray)' }}>Datum rojstva</label>
        <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} required
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{ ...inp, colorScheme: 'dark' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
      </div>

      {/* Checkboxes */}
      <div className="flex flex-col gap-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <label className="flex gap-2 cursor-pointer items-start">
          <input type="checkbox" checked={checks.terms}
            onChange={e => setChecks(c => ({ ...c, terms: e.target.checked }))}
            className="mt-0.5 flex-shrink-0" style={{ accentColor: 'var(--accent)', width: '14px', height: '14px' }} />
          <span className="text-xs" style={{ color: 'var(--gray)', lineHeight: 1.6 }}>
            Sprejemam splošne pogoje ODBITO, ki so navedeni v{' '}
            <Link to="/izjava" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>izjavi o odgovornosti</Link>
            {' '}in potrjujem, da imam več kot 15 let. <span style={{ color: '#FF3D00' }}>*</span>
          </span>
        </label>

        <label className="flex gap-2 cursor-pointer items-start">
          <input type="checkbox" checked={checks.privacy}
            onChange={e => setChecks(c => ({ ...c, privacy: e.target.checked }))}
            className="mt-0.5 flex-shrink-0" style={{ accentColor: 'var(--accent)', width: '14px', height: '14px' }} />
          <span className="text-xs" style={{ color: 'var(--gray)', lineHeight: 1.6 }}>
            Strinjam se s{' '}
            <Link to="/zasebnost" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Politiko varovanja zasebnosti</Link>
            {' '}ODBITO 360 d.o.o. <span style={{ color: '#FF3D00' }}>*</span>
          </span>
        </label>

        <p className="text-xs" style={{ color: 'var(--gray)', lineHeight: 1.6, paddingLeft: '20px' }}>
          Ker želimo naše stranke obveščati o storitvah ODBITO 360 d.o.o., bomo na vaš e-naslov
          občasno pošiljali odbite ponudbe in obvestila. V kolikor tega ne želite, označite spodaj.
        </p>

        <label className="flex gap-2 cursor-pointer items-start">
          <input type="checkbox" checked={checks.noMarketing}
            onChange={e => setChecks(c => ({ ...c, noMarketing: e.target.checked }))}
            className="mt-0.5 flex-shrink-0" style={{ accentColor: 'var(--accent)', width: '14px', height: '14px' }} />
          <span className="text-xs" style={{ color: 'var(--gray)', lineHeight: 1.6 }}>
            Ne dovolim neposrednega trženja na e-mail.
          </span>
        </label>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg text-xs font-bold" style={{ background: 'rgba(255,61,0,0.12)', border: '1px solid rgba(255,61,0,0.3)', color: '#FF3D00' }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full mt-1" style={{ opacity: loading ? 0.6 : 1 }}>
        {loading ? 'USTVARJAM RAČUN...' : 'USTVARI RAČUN'}
      </button>
    </form>
  )
}

// ── Main AuthPanel component ───────────────────────────────────
export default function AuthPanel({ onClose }) {
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [registerSuccess, setRegisterSuccess] = useState(null)
  const panelRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div ref={panelRef}
      className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden"
      style={{
        background: '#0d1117',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
        width: '420px',
        zIndex: 1000,
      }}>

      {registerSuccess ? (
        /* Success state */
        <div className="p-8 text-center">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
          <h2 className="font-display mb-3" style={{ fontSize: '28px', color: 'var(--white)' }}>
            PREVERITE <span style={{ color: 'var(--accent)' }}>EMAIL.</span>
          </h2>
          <p style={{ color: 'var(--gray)', lineHeight: 1.7, marginBottom: '20px', fontSize: '14px' }}>
            Poslali smo potrditveni email na <strong style={{ color: 'var(--white)' }}>{registerSuccess}</strong>.
            Kliknite na povezavo za aktivacijo računa.
          </p>
          <div className="px-3 py-2 rounded-lg text-xs mb-4" style={{ background: 'rgba(250,177,32,0.08)', border: '1px solid rgba(250,177,32,0.2)', color: 'var(--gray)' }}>
            Preverite tudi mapo z neželeno pošto.
          </div>
          <button onClick={onClose} className="btn-primary w-full">ZAPRI</button>
        </div>
      ) : (
        <>
          {/* Tab buttons */}
          <div className="grid grid-cols-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setTab('login')}
              className="py-5 font-display text-lg tracking-wider transition-all"
              style={{
                background: tab === 'login' ? 'rgba(250,177,32,0.08)' : 'transparent',
                color: tab === 'login' ? 'var(--accent)' : 'var(--gray)',
                border: 'none',
                borderBottom: tab === 'login' ? '2px solid var(--accent)' : '2px solid transparent',
                cursor: 'pointer',
              }}>
              PRIJAVI SE
            </button>
            <button
              onClick={() => setTab('register')}
              className="py-5 font-display text-lg tracking-wider transition-all"
              style={{
                background: tab === 'register' ? 'rgba(250,177,32,0.08)' : 'transparent',
                color: tab === 'register' ? 'var(--accent)' : 'var(--gray)',
                border: 'none',
                borderBottom: tab === 'register' ? '2px solid var(--accent)' : '2px solid transparent',
                cursor: 'pointer',
              }}>
              REGISTRIRAJ SE
            </button>
          </div>

          {/* Form content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: '75vh' }}>
            {tab === 'login'
              ? <LoginForm onClose={onClose} />
              : <RegisterForm onClose={onClose} onSuccess={email => setRegisterSuccess(email)} />
            }
          </div>
        </>
      )}
    </div>
  )
}
