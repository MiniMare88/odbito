import { useState } from 'react'

const CORRECT_PASSWORD = 'odbit321'
const STORAGE_KEY = 'odbito_access'

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === 'true'
  )
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return children

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input === CORRECT_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setUnlocked(true)
    } else {
      setError(true)
      setInput('')
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '380px',
        textAlign: 'center',
      }}>
        <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '8px', letterSpacing: '2px' }}>
          ODBITO
        </h1>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '32px' }}>
          Stran je v pripravi. Vpiši geslo za dostop.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Geslo"
            autoFocus
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: error ? '1px solid #e53e3e' : '1px solid #444',
              background: '#111',
              color: '#fff',
              fontSize: '16px',
              marginBottom: '12px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border 0.2s',
            }}
          />
          {error && (
            <p style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '12px' }}>
              Napačno geslo. Poskusi znova.
            </p>
          )}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: '#fff',
              color: '#000',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            VSTOPI
          </button>
        </form>
      </div>
    </div>
  )
}
