import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    password: '', phone: '', date_of_birth: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ ...form, preferred_language: 'sl' })
      navigate('/izjava', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Napaka pri registraciji')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { background: 'var(--dark2)', border: '1px solid var(--border)', color: 'var(--white)' }

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

          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>E-mail</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all" style={inputStyle}
              placeholder="ime@email.com"
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>Geslo <span style={{ fontWeight: 400 }}>(min. 8 znakov)</span></label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all" style={inputStyle}
              placeholder="••••••••"
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          <div>
            <label className="font-condensed text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--gray)' }}>Telefon</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all" style={inputStyle}
              placeholder="+386 40 000 000"
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

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
