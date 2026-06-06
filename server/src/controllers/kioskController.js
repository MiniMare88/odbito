import crypto from 'crypto'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import WaiverVersion from '../models/WaiverVersion.js'

const KIOSK_SECRET = process.env.KIOSK_SECRET

// POST /api/kiosk/register
export async function kioskRegister(req, res) {
  const { secret, email, first_name, last_name, phone, date_of_birth, preferred_language, waiver_accepted } = req.body

  // Validate kiosk secret
  if (!KIOSK_SECRET || secret !== KIOSK_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  // Age validation: must be 3+ years old
  if (date_of_birth) {
    const dob = new Date(date_of_birth)
    const minAge = new Date()
    minAge.setFullYear(minAge.getFullYear() - 3)
    if (dob > minAge) {
      return res.status(400).json({ error: 'AGE_TOO_YOUNG' })
    }
  }

  // Check if email already exists
  const existing = await User.findOne({ where: { email } })
  if (existing) {
    return res.status(409).json({
      error: 'EMAIL_EXISTS',
      user: {
        first_name: existing.first_name,
        last_name: existing.last_name,
        email: existing.email,
      },
    })
  }

  // Auto-generate a random password (user can reset later via forgot-password)
  const rawPassword = crypto.randomBytes(16).toString('hex')
  const password_hash = await bcrypt.hash(rawPassword, 12)

  // Get current waiver version
  const waiver = await WaiverVersion.findOne({ where: { is_current: true } })

  const user = await User.create({
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    date_of_birth,
    preferred_language: preferred_language || 'sl',
    role: 'customer',
    status: 'verified',           // No email verification for kiosk
    registration_source: 'kiosk',
    marketing_consent: false,
    waiver_accepted_at: waiver_accepted ? new Date() : null,
    waiver_version: (waiver_accepted && waiver) ? waiver.version : null,
  })

  console.log(`[KIOSK] New registration: ${user.email} (${user.first_name} ${user.last_name})`)

  res.status(201).json({
    message: 'KIOSK_REGISTERED',
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    },
  })
}

// GET /api/kiosk/waiver  (public, no auth needed)
export async function kioskWaiver(req, res) {
  const waiver = await WaiverVersion.findOne({ where: { is_current: true } })
  if (!waiver) return res.status(404).json({ error: 'No waiver found' })
  res.json(waiver)
}
