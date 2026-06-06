import crypto from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import WaiverVersion from '../models/WaiverVersion.js'
import EmailVerificationToken from '../models/EmailVerificationToken.js'
import PasswordResetToken from '../models/PasswordResetToken.js'
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/emailService.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// ── Helpers ───────────────────────────────────────────────────

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

function signAccess(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  )
}

function signRefresh(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
}

function setRefreshCookie(res, token) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh',
  })
}

function safeUser(user) {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone,
    date_of_birth: user.date_of_birth,
    role: user.role,
    preferred_language: user.preferred_language,
    waiver_accepted_at: user.waiver_accepted_at,
    waiver_version: user.waiver_version,
    status: user.status,
  }
}

async function getCurrentWaiver() {
  return WaiverVersion.findOne({ where: { is_current: true } })
}

// In-memory rate limit for forgot-password (3 req/hour/email)
const resetRateMap = new Map()
function checkResetRateLimit(email) {
  const now = Date.now()
  const hourAgo = now - 60 * 60 * 1000
  const timestamps = (resetRateMap.get(email) || []).filter(t => t > hourAgo)
  if (timestamps.length >= 3) return false
  timestamps.push(now)
  resetRateMap.set(email, timestamps)
  return true
}

// ── Auth endpoints ────────────────────────────────────────────

// POST /api/auth/register
export async function register(req, res) {
  const { email, password, first_name, last_name, phone, date_of_birth, preferred_language } = req.body

  const existing = await User.findOne({ where: { email } })
  if (existing) return res.status(409).json({ error: 'Email že obstaja' })

  const password_hash = await bcrypt.hash(password, 12)

  const user = await User.create({
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    date_of_birth,
    preferred_language: preferred_language || 'sl',
    role: 'customer',
    status: 'unverified',
  })

  // Send verification email
  const rawToken = generateToken()
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await EmailVerificationToken.create({ user_id: user.id, token_hash: tokenHash, expires_at: expiresAt })

  try {
    await sendVerificationEmail(user, rawToken)
    console.log(`[AUTH] Verification email sent → ${user.email}`)
  } catch (err) {
    console.error(`[AUTH] Failed to send verification email → ${user.email}:`, err.message)
  }

  res.status(201).json({ message: 'CHECK_EMAIL' })
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body

  const user = await User.findOne({ where: { email } })
  if (!user || !user.password_hash) return res.status(401).json({ error: 'Napačni podatki' })

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return res.status(401).json({ error: 'Napačni podatki' })

  if (user.is_blocked) return res.status(403).json({ error: 'Vaš račun je bil blokiran. Kontaktirajte nas na info@odbito.si' })

  if (user.status === 'unverified') {
    return res.status(403).json({ error: 'EMAIL_UNVERIFIED' })
  }

  const access = signAccess(user)
  const refresh = signRefresh(user)
  user.refresh_token_hash = await bcrypt.hash(refresh, 10)
  await user.save()

  const currentWaiver = await getCurrentWaiver()
  const waiverRequired = currentWaiver && user.waiver_version !== currentWaiver.version

  setRefreshCookie(res, refresh)
  res.json({ access_token: access, user: safeUser(user), waiver_required: waiverRequired })
}

// POST /api/auth/refresh
export async function refresh(req, res) {
  const token = req.cookies?.refresh_token
  if (!token) return res.status(401).json({ error: 'No refresh token' })

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  } catch {
    return res.status(401).json({ error: 'Refresh token invalid or expired' })
  }

  const user = await User.findByPk(payload.id)
  if (!user || !user.refresh_token_hash) return res.status(401).json({ error: 'User not found' })

  const valid = await bcrypt.compare(token, user.refresh_token_hash)
  if (!valid) return res.status(401).json({ error: 'Refresh token mismatch' })

  const newAccess = signAccess(user)
  const newRefresh = signRefresh(user)
  user.refresh_token_hash = await bcrypt.hash(newRefresh, 10)
  await user.save()

  setRefreshCookie(res, newRefresh)
  res.json({ access_token: newAccess })
}

// POST /api/auth/logout
export async function logout(req, res) {
  const token = req.cookies?.refresh_token
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
      const user = await User.findByPk(payload.id)
      if (user) {
        user.refresh_token_hash = null
        await user.save()
      }
    } catch {
      // token already invalid, still clear cookie
    }
  }
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' })
  res.json({ message: 'Logged out' })
}

// POST /api/auth/google
export async function googleAuth(req, res) {
  const { id_token } = req.body
  if (!id_token) return res.status(400).json({ error: 'Missing id_token' })

  let ticket
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
  } catch {
    return res.status(401).json({ error: 'Invalid Google token' })
  }

  const { sub: google_id, email, given_name, family_name } = ticket.getPayload()

  let user = await User.findOne({ where: { google_id } })
    || await User.findOne({ where: { email } })

  if (!user) {
    user = await User.create({
      email,
      google_id,
      first_name: given_name || '',
      last_name: family_name || '',
      phone: '',
      date_of_birth: '2000-01-01',
      role: 'customer',
      preferred_language: 'sl',
      status: 'verified', // Google accounts are pre-verified
    })
  } else if (!user.google_id) {
    user.google_id = google_id
    if (user.status === 'unverified') user.status = 'verified'
    await user.save()
  }

  const access = signAccess(user)
  const refresh = signRefresh(user)
  user.refresh_token_hash = await bcrypt.hash(refresh, 10)
  await user.save()

  const currentWaiver = await getCurrentWaiver()
  const waiverRequired = currentWaiver && user.waiver_version !== currentWaiver.version

  const profileIncomplete = !user.phone || user.phone === '' || user.date_of_birth === '2000-01-01'

  setRefreshCookie(res, refresh)
  res.json({ access_token: access, user: safeUser(user), waiver_required: waiverRequired, profile_incomplete: profileIncomplete })
}

// POST /api/auth/accept-waiver
export async function acceptWaiver(req, res) {
  const user = await User.findByPk(req.user.id)
  const currentWaiver = await getCurrentWaiver()
  if (!currentWaiver) return res.status(404).json({ error: 'No active waiver' })

  user.waiver_accepted_at = new Date()
  user.waiver_version = currentWaiver.version
  await user.save()

  res.json({ message: 'Waiver accepted', waiver_version: currentWaiver.version })
}

// GET /api/auth/waiver
export async function getWaiver(req, res) {
  const waiver = await getCurrentWaiver()
  if (!waiver) return res.status(404).json({ error: 'No active waiver' })
  res.json(waiver)
}

// GET /api/auth/me
export async function me(req, res) {
  const user = await User.findByPk(req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(safeUser(user))
}

// PATCH /api/auth/me
export async function updateMe(req, res) {
  const user = await User.findByPk(req.user.id)
  const { first_name, last_name, phone, date_of_birth, preferred_language } = req.body

  if (first_name !== undefined) user.first_name = first_name
  if (last_name !== undefined) user.last_name = last_name
  if (phone !== undefined) user.phone = phone
  if (date_of_birth !== undefined) user.date_of_birth = date_of_birth
  if (preferred_language !== undefined) user.preferred_language = preferred_language

  await user.save()
  res.json(safeUser(user))
}

// POST /api/auth/verify-email
export async function verifyEmail(req, res) {
  const { token } = req.body
  if (!token) return res.status(400).json({ error: 'Manjka žeton' })

  const tokenHash = hashToken(token)
  const record = await EmailVerificationToken.findOne({ where: { token_hash: tokenHash } })

  if (!record) return res.status(400).json({ error: 'INVALID_TOKEN' })

  if (new Date() > record.expires_at) {
    await record.destroy()
    return res.status(400).json({ error: 'EXPIRED_TOKEN' })
  }

  const user = await User.findByPk(record.user_id)
  if (!user) return res.status(400).json({ error: 'INVALID_TOKEN' })

  user.status = 'verified'
  await user.save()
  await record.destroy()

  console.log(`[AUTH] Email verified → ${user.email}`)
  res.json({ message: 'EMAIL_VERIFIED' })
}

// POST /api/auth/resend-verification
export async function resendVerification(req, res) {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Manjka email' })

  // Always return success to avoid user enumeration
  const user = await User.findOne({ where: { email } })
  if (!user || user.status !== 'unverified') {
    return res.json({ message: 'CHECK_EMAIL' })
  }

  // Delete old tokens for this user
  await EmailVerificationToken.destroy({ where: { user_id: user.id } })

  const rawToken = generateToken()
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await EmailVerificationToken.create({ user_id: user.id, token_hash: tokenHash, expires_at: expiresAt })

  try {
    await sendVerificationEmail(user, rawToken)
    console.log(`[AUTH] Resent verification email → ${user.email}`)
  } catch (err) {
    console.error(`[AUTH] Failed to resend verification email → ${user.email}:`, err.message)
  }

  res.json({ message: 'CHECK_EMAIL' })
}

// POST /api/auth/forgot-password
export async function forgotPassword(req, res) {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Manjka email' })

  // Always return the same message for security
  const respond = () => res.json({ message: 'Če račun obstaja, boste prejeli email z navodili.' })

  if (!checkResetRateLimit(email)) {
    return respond() // silently rate-limited
  }

  const user = await User.findOne({ where: { email } })
  if (!user || user.status === 'suspended') return respond()

  // Delete old reset tokens for this user
  await PasswordResetToken.destroy({ where: { user_id: user.id } })

  const rawToken = generateToken()
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await PasswordResetToken.create({ user_id: user.id, token_hash: tokenHash, expires_at: expiresAt })

  try {
    await sendPasswordResetEmail(user, rawToken)
    console.log(`[AUTH] Password reset email sent → ${user.email}`)
  } catch (err) {
    console.error(`[AUTH] Failed to send password reset email → ${user.email}:`, err.message)
  }

  respond()
}

// POST /api/auth/reset-password
export async function resetPassword(req, res) {
  const { token, newPassword, confirmPassword } = req.body

  if (!token) return res.status(400).json({ error: 'Manjka žeton' })
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: 'Geslo mora imeti vsaj 8 znakov' })
  if (newPassword !== confirmPassword) return res.status(400).json({ error: 'Gesli se ne ujemata' })

  const tokenHash = hashToken(token)
  const record = await PasswordResetToken.findOne({ where: { token_hash: tokenHash } })

  if (!record) return res.status(400).json({ error: 'INVALID_TOKEN' })

  if (new Date() > record.expires_at) {
    await record.destroy()
    return res.status(400).json({ error: 'EXPIRED_TOKEN' })
  }

  const user = await User.findByPk(record.user_id)
  if (!user) return res.status(400).json({ error: 'INVALID_TOKEN' })

  user.password_hash = await bcrypt.hash(newPassword, 12)
  // Ensure account is verified when resetting password
  if (user.status === 'unverified') user.status = 'verified'
  user.refresh_token_hash = null // invalidate all sessions
  await user.save()
  await record.destroy()

  console.log(`[AUTH] Password reset completed → ${user.email}`)
  res.json({ message: 'PASSWORD_RESET' })
}
