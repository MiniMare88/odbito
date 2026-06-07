import { Op } from 'sequelize'
import { sequelize } from '../models/index.js'
import Voucher from '../models/Voucher.js'
import CustomerBalance from '../models/CustomerBalance.js'
import VoucherRedemption from '../models/VoucherRedemption.js'
import User from '../models/User.js'
import { generateCodes } from '../utils/voucherCode.js'
import { sendVoucherEmail } from '../services/emailService.js'
import { generateQR } from '../services/qrService.js'

const VALID_DENOMINATIONS = [15, 25, 50]

// ── helpers ───────────────────────────────────────────────────────────────────

function expiryDate(type) {
  const d = new Date()
  if (type === 'purchase') d.setFullYear(d.getFullYear() + 3)
  else d.setMonth(d.getMonth() + 6)
  return d
}

async function getOrCreateBalance(userId, t) {
  const [bal] = await CustomerBalance.findOrCreate({
    where: { user_id: userId },
    defaults: { user_id: userId, balance_amount: 0 },
    transaction: t,
  })
  return bal
}

// ── PUBLIC: validate voucher code (without redeeming) ────────────────────────

// POST /api/vouchers/validate-code
export async function validateVoucherCode(req, res) {
  const { code } = req.body
  if (!code) return res.status(400).json({ error: 'Koda je obvezna' })

  const cleanCode = String(code).trim().toUpperCase()
  const voucher = await Voucher.findOne({ where: { code: cleanCode } })

  if (!voucher) return res.status(404).json({ error: 'Darilni bon ni najden' })
  if (voucher.status === 'used') return res.status(400).json({ error: 'Darilni bon je že porabljen' })
  if (voucher.status === 'expired' || new Date(voucher.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Darilni bon je potekel' })
  }

  const remaining = voucher.remaining_amount !== null
    ? parseFloat(voucher.remaining_amount)
    : parseFloat(voucher.denomination)

  if (remaining <= 0) return res.status(400).json({ error: 'Darilni bon je brez vrednosti' })

  res.json({
    valid: true,
    code: voucher.code,
    denomination: parseFloat(voucher.denomination),
    remaining,
    type: voucher.type,
    expires_at: voucher.expires_at,
  })
}

// ── PUBLIC: redeem voucher ────────────────────────────────────────────────────

// POST /api/vouchers/redeem
export async function redeemVoucher(req, res) {
  const { code } = req.body
  if (!code) return res.status(400).json({ error: 'Koda je obvezna' })

  const cleanCode = String(code).trim().toUpperCase()
  const userId = req.user.id

  const result = await sequelize.transaction(async (t) => {
    const voucher = await Voucher.findOne({ where: { code: cleanCode }, transaction: t, lock: t.LOCK.UPDATE })
    if (!voucher) throw Object.assign(new Error('Koda ni veljavna'), { status: 404 })
    if (voucher.status === 'used') throw Object.assign(new Error('Ta koda je bila že unovčena'), { status: 409 })
    if (voucher.status === 'expired' || new Date(voucher.expires_at) < new Date()) {
      voucher.status = 'expired'
      await voucher.save({ transaction: t })
      throw Object.assign(new Error('Ta koda je potekla'), { status: 410 })
    }

    const balance = await getOrCreateBalance(userId, t)
    const before = parseFloat(balance.balance_amount)
    const amount = parseFloat(voucher.denomination)
    const after = before + amount

    balance.balance_amount = after
    await balance.save({ transaction: t })

    voucher.status = 'used'
    voucher.redeemed_by = userId
    voucher.redeemed_at = new Date()
    await voucher.save({ transaction: t })

    await VoucherRedemption.create({
      voucher_id: voucher.id,
      user_id: userId,
      redeemed_at: new Date(),
      balance_before: before,
      balance_after: after,
    }, { transaction: t })

    return { amount, before, after, type: voucher.type }
  })

  res.json({
    message: `€${result.amount.toFixed(2)} dodano na vaš račun.`,
    balance: result.after,
    amount_added: result.amount,
    voucher_type: result.type,
  })
}

// GET /api/vouchers/balance
export async function getBalance(req, res) {
  const bal = await CustomerBalance.findOne({ where: { user_id: req.user.id } })
  const redemptions = await VoucherRedemption.findAll({
    where: { user_id: req.user.id },
    include: [{ model: Voucher, as: 'voucher', attributes: ['code', 'type', 'denomination'] }],
    order: [['redeemed_at', 'DESC']],
    limit: 20,
  })
  res.json({
    balance: bal ? parseFloat(bal.balance_amount) : 0,
    history: redemptions,
  })
}

// GET /api/vouchers/my
export async function getMyVouchers(req, res) {
  // vouchers purchased by this user (not yet redeemed)
  const vouchers = await Voucher.findAll({
    where: { created_by: req.user.id, type: 'purchase', status: 'unused' },
    order: [['issued_at', 'DESC']],
  })
  res.json(vouchers)
}

// ── ADMIN: generate promotional vouchers ────────────────────────────────────

// POST /api/admin/vouchers/generate
export async function adminGenerateVouchers(req, res) {
  const { quantity, denomination, send_to_email } = req.body
  const qty = parseInt(quantity)
  const denom = parseFloat(denomination)

  if (!VALID_DENOMINATIONS.includes(denom)) return res.status(400).json({ error: 'Veljavne vrednosti: €15, €25, €50' })
  if (!qty || qty < 1 || qty > 100) return res.status(400).json({ error: 'Količina mora biti med 1 in 100' })

  const codes = await generateCodes(qty)
  const expires = expiryDate('promotional')

  const vouchers = await Voucher.bulkCreate(codes.map(code => ({
    code,
    type: 'promotional',
    denomination: denom,
    status: 'unused',
    issued_at: new Date(),
    expires_at: expires,
    created_by: req.user.id,
  })))

  if (send_to_email) {
    try {
      await sendVoucherEmail({ vouchers, email: send_to_email, type: 'promotional' })
    } catch (e) {
      console.error('Voucher email error:', e.message)
    }
  }

  res.json({ vouchers: vouchers.map(v => ({ id: v.id, code: v.code, denomination: v.denomination, expires_at: v.expires_at })) })
}

// GET /api/admin/vouchers
export async function adminListVouchers(req, res) {
  const { type, status, denomination, page = 1, limit = 50 } = req.query
  const where = {}
  if (type) where.type = type
  if (status) where.status = status
  if (denomination) where.denomination = parseFloat(denomination)

  const { count, rows } = await Voucher.findAndCountAll({
    where,
    include: [
      { model: User, as: 'redeemedByUser', attributes: ['id', 'first_name', 'last_name', 'email'], required: false },
      { model: User, as: 'createdByUser', attributes: ['id', 'first_name', 'last_name', 'email'], required: false },
    ],
    order: [['issued_at', 'DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  })

  res.json({ total: count, page: parseInt(page), vouchers: rows })
}

// GET /api/admin/vouchers/stats
export async function adminVoucherStats(req, res) {
  const [total, unused, used, expired] = await Promise.all([
    Voucher.count(),
    Voucher.count({ where: { status: 'unused' } }),
    Voucher.count({ where: { status: 'used' } }),
    Voucher.count({ where: { status: 'expired' } }),
  ])
  const totalValue = await Voucher.sum('denomination', { where: { status: 'unused' } }) || 0
  const redeemedValue = await Voucher.sum('denomination', { where: { status: 'used' } }) || 0
  res.json({ total, unused, used, expired, total_outstanding_value: totalValue, total_redeemed_value: redeemedValue })
}

// PATCH /api/admin/vouchers/:id/expire  (admin can manually expire a voucher)
export async function adminExpireVoucher(req, res) {
  const v = await Voucher.findByPk(req.params.id)
  if (!v) return res.status(404).json({ error: 'Voucher ne obstaja' })
  if (v.status === 'used') return res.status(409).json({ error: 'Voucher je že bil unovčen' })
  v.status = 'expired'
  await v.save()
  res.json({ message: 'Voucher je bil razveljavljen' })
}

// ── INTERNAL: create refund voucher (called from cancellation) ───────────────

export async function createRefundVoucher({ userId, amount, bookingId, bookingType = 'open_jump' }) {
  const code = (await generateCodes(1))[0]
  const expires = expiryDate('refund')
  const voucher = await Voucher.create({
    code,
    type: 'refund',
    denomination: amount,
    status: 'unused',
    issued_at: new Date(),
    expires_at: expires,
    redeemed_by: null,
    created_by: null, // system
    booking_id: bookingId,
    booking_type: bookingType,
  })
  return voucher
}

// ── PURCHASE vouchers (Stripe) ────────────────────────────────────────────────

// POST /api/vouchers/purchase/intent  — create Stripe payment intent
export async function createPurchaseIntent(req, res) {
  const { denomination, quantity } = req.body
  const denom = parseFloat(denomination)
  const qty = parseInt(quantity) || 1

  if (!VALID_DENOMINATIONS.includes(denom)) return res.status(400).json({ error: 'Veljavne vrednosti: €15, €25, €50' })
  if (qty < 1 || qty > 20) return res.status(400).json({ error: 'Količina mora biti med 1 in 20' })

  const stripe = (await import('stripe')).default(process.env.STRIPE_SECRET_KEY)
  const amount = Math.round(denom * qty * 100) // cents

  const intent = await stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    metadata: {
      type: 'voucher_purchase',
      denomination: denom,
      quantity: qty,
      user_id: req.user.id,
    },
  })

  res.json({ client_secret: intent.client_secret, amount, denomination: denom, quantity: qty })
}

// POST /api/vouchers/purchase/confirm  — after successful Stripe payment
export async function confirmPurchase(req, res) {
  const { payment_intent_id } = req.body
  if (!payment_intent_id) return res.status(400).json({ error: 'payment_intent_id je obvezen' })

  const stripe = (await import('stripe')).default(process.env.STRIPE_SECRET_KEY)
  const intent = await stripe.paymentIntents.retrieve(payment_intent_id)

  if (intent.status !== 'succeeded') return res.status(400).json({ error: 'Plačilo ni bilo uspešno' })
  if (intent.metadata.type !== 'voucher_purchase') return res.status(400).json({ error: 'Napačen tip plačila' })

  // Prevent double-processing
  const existing = await Voucher.findOne({ where: { stripe_payment_intent_id: payment_intent_id } })
  if (existing) {
    const all = await Voucher.findAll({ where: { stripe_payment_intent_id: payment_intent_id } })
    return res.json({ vouchers: all, already_processed: true })
  }

  const { denomination, quantity, user_id } = intent.metadata
  const denom = parseFloat(denomination)
  const qty = parseInt(quantity)
  const expires = expiryDate('purchase')

  const codes = await generateCodes(qty)
  const vouchers = await Voucher.bulkCreate(codes.map(code => ({
    code,
    type: 'purchase',
    denomination: denom,
    status: 'unused',
    issued_at: new Date(),
    expires_at: expires,
    created_by: parseInt(user_id),
    stripe_payment_intent_id: payment_intent_id,
  })))

  // Send email
  const user = await User.findByPk(req.user.id)
  if (user) {
    try {
      await sendVoucherEmail({ vouchers, email: user.email, firstName: user.first_name, type: 'purchase' })
    } catch (e) {
      console.error('Voucher purchase email error:', e.message)
    }
  }

  res.json({ vouchers: vouchers.map(v => ({ code: v.code, denomination: v.denomination, expires_at: v.expires_at })) })
}
