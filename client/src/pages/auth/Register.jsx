import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

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
  { code: 'MK', flag: '🇲🇰', dial: '+389', name: 'Severna Makedonija' },
  { code: 'GB', flag: '🇬🇧', dial: '+44',  name: 'Velika Britanija' },
  { code: 'US', flag: '🇺🇸', dial: '+1',   name: 'ZDA' },
]

export default function Register() {
  const { register } = useAuth()

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    password: '', confirmPassword: '', date_of_birth: '',
    phoneNumber: '',
  })
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]) // Slovenija
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Gesli se ne ujemata')
      return
    }
    if (form.password.length < 8) {
      setError('Geslo mora imeti vsaj 8 znakov')
      return
    }

    const fullPhone = selectedCountry.dial + form.phoneNumber.replace(/[\s\-]/g, '')

    setLoading(true)
    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        phone: fullPhone,
        date_of_birth: form.date_of_birth,
        preferred_language: 'sl',
      })
      setRegisteredEmail(form.email)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Napaka pri registraciji')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'var(--dark2)',
    border: '1px solid var(--border)',
    color: 'var(--white)',
  }

  const passwordMatch = form.confirmPassword && form.password === form.confirmPassword
  const passwordMismatch = form.confirmPassword && form.password !== form.confirmPassword

  if (success) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16" style={{ background: 'var(--black)' }}>
        <div className="w-full max-w-md text-center">
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>✉️</div>
          <div className="section-label mb-4">Registracija uspešna</div>
          <h1 className="font-display mb-4" style={{ fontSize: '42px', color: 'var(--white)' }}>
            PREVERITE<br /><span style={{ color: 'var(--accent)' }}>EMAIL.</span>
          </h1>
          <p style={{ color: 'var(--gray)', lineHeight: 1.7, marginBottom: '32px' }}>
            Poslali smo potrditveni email na <strong style={{ color: 'var(--white)' }}>{registeredEmail}</strong>.
            Kliknite na povezavo v emailu, da aktivirate vaš račun.
          </p>
          <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(250,177,32,0.08)', border: '1px solid rgba(250,177,32,0.2)', color: 'var(--gray)', marginBottom: '24px' }}>
            Povezava velja 24 ur. Preverite tudi mapo z neželeno pošto.
          </div>
          <p style={{ color: 'var(--gray)', fontSize: '14px' }}>
            Niste prejeli emaila?{' '}
            <Link to="/prijava" className="font-bold" style={{ color: 'var(--accent)' }}>
              Pošljite ga znova →
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16" style={{ background: 'var(--black)' }}>
      <div className="w-full max-w-lg">
        <div className="mb-10">
          <div className="section-label mb-4">Registracija</div>
          <h1 className="font-display mb-2" style={{ fontSize: '52px', color: 'var(--white)' }}>
            PRIDRUŽI<br /><span style={{ color: 'var(--accent)' }}>SE NAM.</span>
          </h1>
          <p style={{ color: 'var(--gray)' }}>Že imaš račun? <Link to="/prijava" className="font-bold" style={{ color: 'var(--accent)' }}>Prijavi se →</Link></p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Ime + Priimek */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>Ime</label>
              <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all" style={inputStyle}
                placeholder="Janez"
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>Priimek</label>
              <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all" style={inputStyle}
                placeholder="Novak"
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>E-mail</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all" style={inputStyle}
              placeholder="ime@email.com"
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          {/* Geslo */}
          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>
              Geslo <span style={{ fontWeight: 400 }}>(min. 8 znakov)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all pr-12"
                style={inputStyle}
                placeholder="••••••••"
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', lineHeight: 1, color: 'var(--gray)' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Potrdi geslo */}
          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>
              Potrdi geslo
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all pr-12"
                style={{
                  ...inputStyle,
                  borderColor: passwordMatch ? '#22c55e' : passwordMismatch ? '#ef4444' : 'var(--border)',
                }}
                placeholder="••••••••"
                onFocus={e => e.target.style.borderColor = passwordMismatch ? '#ef4444' : passwordMatch ? '#22c55e' : 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = passwordMatch ? '#22c55e' : passwordMismatch ? '#ef4444' : 'var(--border)'}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', lineHeight: 1, color: 'var(--gray)' }}>
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
            {passwordMatch && (
              <p className="text-xs mt-1" style={{ color: '#22c55e' }}>✓ Gesli se ujemata</p>
            )}
            {passwordMismatch && (
              <p className="text-xs mt-1" style={{ color: '#ef4444' }}>✗ Gesli se ne ujemata</p>
            )}
          </div>

          {/* Telefon z izbiro države */}
          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>Telefon</label>
            <div className="flex gap-2 relative">
              {/* Country selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(v => !v)}
                  className="flex items-center gap-2 px-3 py-3 rounded-lg text-sm outline-none transition-all h-full"
                  style={{
                    ...inputStyle,
                    whiteSpace: 'nowrap',
                    minWidth: '100px',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{selectedCountry.flag}</span>
                  <span style={{ color: 'var(--white)', fontSize: '13px' }}>{selectedCountry.dial}</span>
                  <span style={{ color: 'var(--gray)', fontSize: '11px' }}>▾</span>
                </button>

                {showCountryDropdown && (
                  <div className="absolute top-full left-0 mt-1 rounded-lg overflow-y-auto z-50"
                    style={{
                      background: '#1a2030',
                      border: '1px solid var(--border)',
                      minWidth: '220px',
                      maxHeight: '260px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    }}>
                    {COUNTRIES.map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => { setSelectedCountry(c); setShowCountryDropdown(false) }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-all"
                        style={{
                          background: selectedCountry.code === c.code ? 'rgba(250,177,32,0.12)' : 'transparent',
                          color: 'var(--white)',
                          cursor: 'pointer',
                          border: 'none',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = selectedCountry.code === c.code ? 'rgba(250,177,32,0.12)' : 'transparent'}
                      >
                        <span style={{ fontSize: '20px' }}>{c.flag}</span>
                        <span style={{ flex: 1 }}>{c.name}</span>
                        <span style={{ color: 'var(--gray)', fontSize: '12px' }}>{c.dial}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Številka */}
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                required
                className="flex-1 px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={inputStyle}
                placeholder="040-123-456"
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Datum rojstva */}
          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>Datum rojstva</label>
            <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
              style={{ ...inputStyle, colorScheme: 'dark' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg text-sm font-condensed font-bold tracking-wide"
              style={{ background: 'rgba(255,61,0,0.12)', border: '1px solid rgba(255,61,0,0.3)', color: '#FF3D00' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full text-center mt-2"
            style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? 'USTVARJAM RAČUN...' : 'USTVARI RAČUN'}
          </button>

          <p className="text-center text-xs" style={{ color: 'var(--gray)' }}>
            Z registracijo se strinjaš s pogoji uporabe Odbito.
          </p>
        </form>
      </div>
    </div>
  )
}
