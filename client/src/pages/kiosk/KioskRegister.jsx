import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : '/api'
const KIOSK_SECRET = import.meta.env.VITE_KIOSK_SECRET || ''
const INACTIVITY_MS = 5 * 60 * 1000   // 5 min
const WARNING_AT_MS  = 60 * 1000       // show warning 60 s before timeout

// ── Translations ──────────────────────────────────────────────
const T = {
  sl: {
    welcome: 'DOBRODOŠEL / A',
    welcomeSub: 'Registracija na recepciji',
    start: 'ZAČNI REGISTRACIJO →',
    chooseLanguage: 'Izberi jezik / Choose language',
    step1Title: 'Osebni podatki',
    firstName: 'Ime',
    lastName: 'Priimek',
    email: 'E-mail naslov',
    phone: 'Telefonska številka',
    dob: 'Datum rojstva',
    dobHint: 'DD.MM.LLLL',
    next: 'NAPREJ →',
    back: '← NAZAJ',
    step2Title: 'Izjava o odgovornosti',
    scrollHint: '↓ Pomaknite se do konca besedila',
    acceptWaiver: 'Prebral/a sem in v celoti sprejemam Izjavo o odgovornosti',
    acceptAge: 'Potrjujem, da razumem starostne pogoje',
    ageRulesTitle: 'Starostna pravila vstopa',
    ageRule0: 'Mlajši od 3 let: vstop ni dovoljen',
    ageRule1: 'Od 3 do 6 let: samo v spremstvu starša / skrbnika',
    ageRule2: 'Od 6 do 15 let: samostojno',
    ageRule3: 'Nad 15 let: samostojno',
    register: 'SPREJMI IN SE REGISTRIRAJ',
    registering: 'REGISTRIRAM...',
    step3Title: 'Registracija uspešna!',
    step3Sub: 'Vaš račun je ustvarjen.',
    step3Staff: 'Povejte osebju svoje ime in priimek, da nadaljujete z rezervacijo.',
    newReg: 'NOVA REGISTRACIJA',
    emailExistsTitle: 'Račun že obstaja',
    emailExistsSub: 'Ta e-mail naslov je že registriran.',
    emailExistsStaff: 'Povejte osebju svoje ime in priimek za nadaljevanje.',
    errRequired: 'Prosimo, izpolnite vsa polja.',
    errEmail: 'Vnesite veljaven e-mail naslov.',
    errDob: 'Vnesite veljaven datum rojstva.',
    errTooYoung: 'Vstop ni dovoljen za otroke, mlajše od 3 let.',
    errGeneral: 'Napaka pri registraciji. Poskusite znova.',
    errWaiver: 'Napaka pri nalaganju izjave. Poskusite znova.',
    waiverLoading: 'Nalagam izjavo...',
    timeoutWarning: 'Seja se bo zaprla čez',
    timeoutSeconds: 'sekund',
    timeoutContinue: 'NADALJUJ SEJO',
  },
  en: {
    welcome: 'WELCOME',
    welcomeSub: 'On-site registration',
    start: 'START REGISTRATION →',
    chooseLanguage: 'Choose language / Izberi jezik',
    step1Title: 'Personal Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    phone: 'Phone Number',
    dob: 'Date of Birth',
    dobHint: 'DD.MM.YYYY',
    next: 'NEXT →',
    back: '← BACK',
    step2Title: 'Waiver of Liability',
    scrollHint: '↓ Scroll to the bottom of the text',
    acceptWaiver: 'I have read and fully accept the Waiver of Liability',
    acceptAge: 'I confirm I understand the age requirements',
    ageRulesTitle: 'Age Requirements',
    ageRule0: 'Under 3 years: entry not permitted',
    ageRule1: 'Ages 3–6: with parent/guardian only',
    ageRule2: 'Ages 6–15: independently',
    ageRule3: 'Age 15+: independently',
    register: 'ACCEPT & REGISTER',
    registering: 'REGISTERING...',
    step3Title: 'Registration Successful!',
    step3Sub: 'Your account has been created.',
    step3Staff: 'Tell staff your name and surname to proceed with your booking.',
    newReg: 'NEW REGISTRATION',
    emailExistsTitle: 'Account Already Exists',
    emailExistsSub: 'This email address is already registered.',
    emailExistsStaff: 'Tell staff your name to proceed.',
    errRequired: 'Please fill in all fields.',
    errEmail: 'Please enter a valid email address.',
    errDob: 'Please enter a valid date of birth.',
    errTooYoung: 'Entry is not permitted for children under 3 years old.',
    errGeneral: 'Registration error. Please try again.',
    errWaiver: 'Error loading waiver. Please try again.',
    waiverLoading: 'Loading waiver...',
    timeoutWarning: 'Session closes in',
    timeoutSeconds: 'seconds',
    timeoutContinue: 'CONTINUE SESSION',
  },
}

// ── Helpers ───────────────────────────────────────────────────
function parseDob(str) {
  // Accept DD.MM.YYYY or YYYY-MM-DD
  if (!str) return null
  let d, m, y
  if (str.includes('.')) {
    [d, m, y] = str.split('.').map(Number)
  } else if (str.includes('-')) {
    [y, m, d] = str.split('-').map(Number)
  } else return null
  if (!d || !m || !y || y < 1900 || y > new Date().getFullYear()) return null
  const date = new Date(y, m - 1, d)
  if (isNaN(date.getTime())) return null
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

function isAtLeast3YearsOld(isoDate) {
  const dob = new Date(isoDate)
  const limit = new Date()
  limit.setFullYear(limit.getFullYear() - 3)
  return dob <= limit
}

// ── Big input component ───────────────────────────────────────
function BigInput({ label, value, onChange, type = 'text', hint, autoFocus }) {
  return (
    <div className="flex flex-col gap-2">
      <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontFamily: 'var(--font-condensed, sans-serif)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {label}
        {hint && <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{hint}</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '2px solid rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '22px 28px',
          fontSize: '22px',
          fontWeight: 700,
          color: '#fff',
          outline: 'none',
          width: '100%',
          fontFamily: 'var(--font-condensed, sans-serif)',
          letterSpacing: '0.04em',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = '#FAB120'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
      />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
export default function KioskRegister() {
  const [lang, setLang] = useState('sl')
  const t = T[lang]

  // Steps: 'lang' | 'info' | 'waiver' | 'success' | 'exists'
  const [step, setStep] = useState('lang')

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', dob: '' })
  const [error, setError] = useState('')

  const [waiver, setWaiver] = useState(null)
  const [waiverError, setWaiverError] = useState(false)
  const [waiverLoading, setWaiverLoading] = useState(false)
  const [scrolledToEnd, setScrolledToEnd] = useState(false)
  const [checkWaiver, setCheckWaiver] = useState(false)
  const [checkAge, setCheckAge] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [existingUser, setExistingUser] = useState(null)
  const [successUser, setSuccessUser] = useState(null)

  // Inactivity timeout
  const timerRef = useRef(null)
  const [timeoutWarning, setTimeoutWarning] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const countdownRef = useRef(null)

  const waiverScrollRef = useRef(null)

  const resetToStart = useCallback(() => {
    setStep('lang')
    setForm({ firstName: '', lastName: '', email: '', phone: '', dob: '' })
    setError('')
    setCheckWaiver(false)
    setCheckAge(false)
    setScrolledToEnd(false)
    setSuccessUser(null)
    setExistingUser(null)
    setTimeoutWarning(false)
    setCountdown(60)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }, [])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (timeoutWarning) return // don't reset if warning is showing
    timerRef.current = setTimeout(() => {
      setTimeoutWarning(true)
      setCountdown(60)
      countdownRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(countdownRef.current)
            resetToStart()
            return 60
          }
          return c - 1
        })
      }, 1000)
    }, INACTIVITY_MS - WARNING_AT_MS)
  }, [timeoutWarning, resetToStart])

  // Activity listeners
  useEffect(() => {
    const events = ['touchstart', 'touchmove', 'mousedown', 'mousemove', 'keydown']
    const handler = () => { if (!timeoutWarning) resetTimer() }
    events.forEach(e => window.addEventListener(e, handler, { passive: true }))
    resetTimer()
    return () => {
      events.forEach(e => window.removeEventListener(e, handler))
      if (timerRef.current) clearTimeout(timerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [resetTimer, timeoutWarning])

  // Lock scroll on body (fullscreen kiosk)
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Load waiver when entering step
  useEffect(() => {
    if (step !== 'waiver') return
    if (waiver) return
    setWaiverLoading(true)
    setWaiverError(false)
    axios.get(`${API_BASE}/kiosk/waiver`)
      .then(r => setWaiver(r.data))
      .catch(() => setWaiverError(true))
      .finally(() => setWaiverLoading(false))
  }, [step])

  // Check if waiver text is short enough to not need scroll
  useEffect(() => {
    if (!waiver || !waiverScrollRef.current) return
    const el = waiverScrollRef.current
    if (el.scrollHeight <= el.clientHeight + 60) setScrolledToEnd(true)
  }, [waiver])

  const handleWaiverScroll = e => {
    const el = e.target
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) setScrolledToEnd(true)
  }

  // ── Step: info → validate ─────────────────────────────────
  const goToWaiver = () => {
    setError('')
    const { firstName, lastName, email, phone, dob } = form
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !dob.trim()) {
      return setError(t.errRequired)
    }
    if (!isValidEmail(email)) return setError(t.errEmail)
    const iso = parseDob(dob)
    if (!iso) return setError(t.errDob)
    if (!isAtLeast3YearsOld(iso)) return setError(t.errTooYoung)
    setStep('waiver')
  }

  // ── Step: waiver → submit ─────────────────────────────────
  const handleRegister = async () => {
    setError('')
    setSubmitting(true)
    const iso = parseDob(form.dob)
    try {
      const { data } = await axios.post(`${API_BASE}/kiosk/register`, {
        secret: KIOSK_SECRET,
        email: form.email.trim().toLowerCase(),
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        phone: form.phone.trim(),
        date_of_birth: iso,
        preferred_language: lang,
        waiver_accepted: checkWaiver,
      })
      setSuccessUser(data.user)
      setStep('success')
    } catch (err) {
      const code = err.response?.data?.error
      if (code === 'EMAIL_EXISTS') {
        setExistingUser(err.response.data.user)
        setStep('exists')
      } else {
        setError(t.errGeneral)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const continuSession = () => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    setTimeoutWarning(false)
    setCountdown(60)
    resetTimer()
  }

  const canSubmit = checkWaiver && checkAge && scrolledToEnd && !submitting

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0a0a0a',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: 'var(--font-condensed, "Arial Narrow", Arial, sans-serif)',
      userSelect: 'none',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '0.08em', color: '#fff' }}>
          ODBIT<span style={{ color: '#FAB120' }}>O.</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {['sl', 'en'].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: '10px 22px',
              borderRadius: 10,
              border: lang === l ? '2px solid #FAB120' : '2px solid rgba(255,255,255,0.15)',
              background: lang === l ? 'rgba(250,177,32,0.12)' : 'transparent',
              color: lang === l ? '#FAB120' : 'rgba(255,255,255,0.4)',
              fontWeight: 700, fontSize: '15px',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}>{l === 'sl' ? 'SLO' : 'ENG'}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* ── LANG / WELCOME ── */}
        {step === 'lang' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: 40 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.25em', color: '#FAB120', textTransform: 'uppercase', marginBottom: 16 }}>
                Gibalni center
              </div>
              <div style={{ fontSize: '72px', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '0.03em', marginBottom: 16 }}>
                {t.welcome}
              </div>
              <div style={{ fontSize: '22px', color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.06em' }}>
                {t.welcomeSub}
              </div>
            </div>

            <button onClick={() => setStep('info')} style={{
              background: '#FAB120', color: '#000',
              fontSize: '24px', fontWeight: 900,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '28px 64px', borderRadius: '20px',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(250,177,32,0.35)',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
              onPointerDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onPointerUp={e => e.currentTarget.style.transform = ''}
            >
              {t.start}
            </button>
          </div>
        )}

        {/* ── STEP 1: INFO ── */}
        {step === 'info' && (
          <div style={{ maxWidth: 680, width: '100%', margin: '0 auto', padding: '40px 40px 120px' }}>
            <StepHeader label={`1 / 2 — ${t.step1Title}`} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <BigInput label={t.firstName} value={form.firstName} onChange={v => setForm(f => ({ ...f, firstName: v }))} autoFocus />
                <BigInput label={t.lastName} value={form.lastName} onChange={v => setForm(f => ({ ...f, lastName: v }))} />
              </div>
              <BigInput label={t.email} value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" />
              <BigInput label={t.phone} value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} type="tel" />
              <BigInput label={t.dob} hint={t.dobHint} value={form.dob} onChange={v => setForm(f => ({ ...f, dob: v }))} />
            </div>

            {error && <ErrorBox msg={error} />}

            <BottomNav
              onBack={resetToStart}
              backLabel={t.back}
              onNext={goToWaiver}
              nextLabel={t.next}
            />
          </div>
        )}

        {/* ── STEP 2: WAIVER ── */}
        {step === 'waiver' && (
          <div style={{ maxWidth: 760, width: '100%', margin: '0 auto', padding: '40px 40px 140px' }}>
            <StepHeader label={`2 / 2 — ${t.step2Title}`} />

            {waiverLoading && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.4)', fontSize: '18px', letterSpacing: '0.1em' }}>
                {t.waiverLoading}
              </div>
            )}

            {waiverError && (
              <ErrorBox msg={t.errWaiver} />
            )}

            {waiver && (
              <>
                {/* Scrollable waiver text */}
                <div
                  ref={waiverScrollRef}
                  onScroll={handleWaiverScroll}
                  style={{
                    height: '340px',
                    overflowY: 'auto',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '28px',
                    marginBottom: 16,
                    fontSize: '14px',
                    lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.7)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {lang === 'en' && waiver.content_en ? waiver.content_en : waiver.content_sl}
                </div>

                {!scrolledToEnd && (
                  <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 700, letterSpacing: '0.12em', color: '#FAB120', marginBottom: 16, animation: 'pulse 2s infinite' }}>
                    {t.scrollHint}
                  </div>
                )}

                {/* Age rules box */}
                <div style={{
                  background: 'rgba(250,177,32,0.07)',
                  border: '1px solid rgba(250,177,32,0.25)',
                  borderRadius: '14px',
                  padding: '20px 24px',
                  marginBottom: 20,
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', color: '#FAB120', textTransform: 'uppercase', marginBottom: 12 }}>
                    {t.ageRulesTitle}
                  </div>
                  {[t.ageRule0, t.ageRule1, t.ageRule2, t.ageRule3].map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: '16px', color: i === 0 ? '#FF3D00' : 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                      <span style={{ fontSize: '18px' }}>{i === 0 ? '🚫' : i === 1 ? '👨‍👧' : i === 2 ? '✅' : '✅'}</span>
                      {r}
                    </div>
                  ))}
                </div>

                {/* Checkboxes */}
                <KioskCheckbox
                  checked={checkWaiver}
                  disabled={!scrolledToEnd}
                  onChange={setCheckWaiver}
                  label={t.acceptWaiver}
                />
                <KioskCheckbox
                  checked={checkAge}
                  onChange={setCheckAge}
                  label={t.acceptAge}
                />

                {error && <ErrorBox msg={error} />}
              </>
            )}

            <BottomNav
              onBack={() => setStep('info')}
              backLabel={t.back}
              onNext={handleRegister}
              nextLabel={submitting ? t.registering : t.register}
              nextDisabled={!canSubmit || waiverLoading || waiverError}
              nextAccent
            />
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === 'success' && successUser && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: 32, textAlign: 'center' }}>
            <div style={{ fontSize: '72px' }}>🎉</div>
            <div>
              <div style={{ fontSize: '48px', fontWeight: 900, color: '#fff', letterSpacing: '0.04em', marginBottom: 8 }}>
                {t.step3Title}
              </div>
              <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{t.step3Sub}</div>
            </div>

            <div style={{
              background: 'rgba(250,177,32,0.08)',
              border: '1px solid rgba(250,177,32,0.3)',
              borderRadius: 20, padding: '28px 48px',
              maxWidth: 540,
            }}>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#FAB120', letterSpacing: '0.04em', marginBottom: 4 }}>
                {successUser.first_name} {successUser.last_name}
              </div>
              <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.45)' }}>{successUser.email}</div>
            </div>

            <div style={{
              maxWidth: 480,
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 16, padding: '20px 32px',
              fontSize: '18px', fontWeight: 600,
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.6,
            }}>
              {t.step3Staff}
            </div>

            <button onClick={resetToStart} style={{
              marginTop: 8,
              background: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: 14, padding: '18px 48px',
              color: '#fff', fontSize: '18px', fontWeight: 700,
              letterSpacing: '0.1em', cursor: 'pointer',
            }}>
              {t.newReg}
            </button>
          </div>
        )}

        {/* ── EMAIL EXISTS ── */}
        {step === 'exists' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: 32, textAlign: 'center' }}>
            <div style={{ fontSize: '64px' }}>👤</div>
            <div>
              <div style={{ fontSize: '42px', fontWeight: 900, color: '#fff', letterSpacing: '0.04em', marginBottom: 8 }}>
                {t.emailExistsTitle}
              </div>
              <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{t.emailExistsSub}</div>
            </div>

            {existingUser && (
              <div style={{
                background: 'rgba(250,177,32,0.08)',
                border: '1px solid rgba(250,177,32,0.3)',
                borderRadius: 20, padding: '28px 48px',
              }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#FAB120', letterSpacing: '0.04em', marginBottom: 4 }}>
                  {existingUser.first_name} {existingUser.last_name}
                </div>
                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.45)' }}>{existingUser.email}</div>
              </div>
            )}

            <div style={{
              maxWidth: 480,
              background: 'rgba(250,177,32,0.06)',
              border: '1px solid rgba(250,177,32,0.2)',
              borderRadius: 16, padding: '20px 32px',
              fontSize: '18px', fontWeight: 600,
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.6,
            }}>
              {t.emailExistsStaff}
            </div>

            <button onClick={resetToStart} style={{
              background: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: 14, padding: '18px 48px',
              color: '#fff', fontSize: '18px', fontWeight: 700,
              letterSpacing: '0.1em', cursor: 'pointer',
            }}>
              {t.newReg}
            </button>
          </div>
        )}
      </div>

      {/* ── INACTIVITY WARNING OVERLAY ── */}
      {timeoutWarning && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.88)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 28, zIndex: 100,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ fontSize: '64px' }}>⏱️</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: 8 }}>
              {t.timeoutWarning} {countdown} {t.timeoutSeconds}
            </div>
            <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)' }}>
              {lang === 'sl' ? 'Nedejavnost zaznana' : 'Inactivity detected'}
            </div>
          </div>
          <button onClick={continuSession} style={{
            background: '#FAB120', color: '#000',
            fontSize: '22px', fontWeight: 900,
            letterSpacing: '0.1em',
            padding: '22px 56px', borderRadius: '16px',
            border: 'none', cursor: 'pointer',
          }}>
            {t.timeoutContinue}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────
function StepHeader({ label }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', color: '#FAB120', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </div>
    </div>
  )
}

function KioskCheckbox({ checked, onChange, label, disabled }) {
  return (
    <label onClick={() => !disabled && onChange(!checked)} style={{
      display: 'flex', alignItems: 'flex-start', gap: 16,
      background: checked ? 'rgba(250,177,32,0.08)' : 'rgba(255,255,255,0.04)',
      border: checked ? '2px solid rgba(250,177,32,0.4)' : '2px solid rgba(255,255,255,0.1)',
      borderRadius: 14, padding: '20px 24px',
      cursor: disabled ? 'default' : 'pointer',
      marginBottom: 12,
      opacity: disabled ? 0.4 : 1,
      transition: 'all 0.2s',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0, marginTop: 2,
        background: checked ? '#FAB120' : 'transparent',
        border: checked ? '2px solid #FAB120' : '2px solid rgba(255,255,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', transition: 'all 0.15s',
      }}>
        {checked && '✓'}
      </div>
      <span style={{ fontSize: '18px', fontWeight: 600, color: checked ? '#fff' : 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
        {label}
      </span>
    </label>
  )
}

function BottomNav({ onBack, backLabel, onNext, nextLabel, nextDisabled, nextAccent }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      display: 'flex', gap: 16, padding: '20px 40px',
      background: 'linear-gradient(to top, #0a0a0a 70%, transparent)',
      zIndex: 10,
    }}>
      <button onClick={onBack} style={{
        flex: 1,
        background: 'rgba(255,255,255,0.07)',
        border: '2px solid rgba(255,255,255,0.15)',
        borderRadius: 16, padding: '22px',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '20px', fontWeight: 700,
        letterSpacing: '0.08em', cursor: 'pointer',
      }}>
        {backLabel}
      </button>
      <button onClick={onNext} disabled={nextDisabled} style={{
        flex: 2,
        background: nextDisabled ? 'rgba(255,255,255,0.06)' : (nextAccent ? '#FAB120' : '#FAB120'),
        border: 'none',
        borderRadius: 16, padding: '22px',
        color: nextDisabled ? 'rgba(255,255,255,0.25)' : '#000',
        fontSize: '20px', fontWeight: 900,
        letterSpacing: '0.08em', cursor: nextDisabled ? 'default' : 'pointer',
        transition: 'all 0.2s',
        boxShadow: nextDisabled ? 'none' : '0 6px 24px rgba(250,177,32,0.3)',
      }}>
        {nextLabel}
      </button>
    </div>
  )
}

function ErrorBox({ msg }) {
  return (
    <div style={{
      marginTop: 16, padding: '16px 20px',
      background: 'rgba(255,61,0,0.12)',
      border: '1px solid rgba(255,61,0,0.3)',
      borderRadius: 12,
      color: '#FF3D00',
      fontSize: '16px', fontWeight: 700,
      letterSpacing: '0.04em',
    }}>
      {msg}
    </div>
  )
}
