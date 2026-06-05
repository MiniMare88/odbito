import { Op } from 'sequelize'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pricing = require('../../data/pricing.json')

import BirthdayBooking from '../models/BirthdayBooking.js'
import User from '../models/User.js'

// ── Helpers ───────────────────────────────────────────────────────────

function getPackage(id) {
  return pricing.birthdayParties.packages.find(p => p.id === id)
}

function calcPrice(pkg, childrenCount) {
  const extra = Math.max(0, childrenCount - pkg.maxChildren)
  const total = +(pkg.basePrice + extra * pkg.extraChildPrice).toFixed(2)
  return { base_price: pkg.basePrice, extra_price_per_child: pkg.extraChildPrice, extra_children: extra, total_price: total }
}

// ── Public: GET /api/birthday/packages ───────────────────────────────

export function getPackages(req, res) {
  res.json(pricing.birthdayParties)
}

// ── Public: GET /api/birthday/availability?date=YYYY-MM-DD&time=HH:MM

export async function checkAvailability(req, res) {
  const { date, time } = req.query
  if (!date) return res.status(400).json({ error: 'Manjka datum' })

  const where = { event_date: date, status: { [Op.in]: ['inquiry', 'confirmed'] } }
  if (time) where.event_time = time

  const count = await BirthdayBooking.count({ where })
  res.json({ date, time: time || null, available: count === 0, booked: count })
}

// ── Public: POST /api/birthday/book ──────────────────────────────────

export async function createBirthdayBooking(req, res) {
  const {
    package_id, event_date, event_time,
    child_name, child_age, children_count,
    contact_first_name, contact_last_name, contact_email, contact_phone,
    notes,
  } = req.body

  if (!package_id || !event_date || !event_time || !child_name || !contact_email || !contact_phone || !contact_first_name || !contact_last_name) {
    return res.status(400).json({ error: 'Manjkajo obvezna polja' })
  }

  const pkg = getPackage(package_id)
  if (!pkg) return res.status(400).json({ error: 'Neveljaven paket' })

  const count = parseInt(children_count) || 1
  if (count < 1 || count > 30) return res.status(400).json({ error: 'Število otrok mora biti 1–30' })

  // Check date in the future
  const today = new Date().toISOString().split('T')[0]
  if (event_date <= today) return res.status(400).json({ error: 'Datum mora biti v prihodnosti' })

  const pricing_snap = calcPrice(pkg, count)

  const booking = await BirthdayBooking.create({
    user_id: req.user?.id || null,
    package_id,
    package_label: pkg.label,
    ...pricing_snap,
    max_children: pkg.maxChildren,
    children_count: count,
    event_date,
    event_time,
    child_name,
    child_age: parseInt(child_age) || 0,
    contact_first_name,
    contact_last_name,
    contact_email,
    contact_phone,
    notes: notes || null,
    status: 'inquiry',
  })

  res.status(201).json({
    id: booking.id,
    booking_code: booking.booking_code,
    package_label: booking.package_label,
    event_date: booking.event_date,
    event_time: booking.event_time,
    total_price: booking.total_price,
    status: booking.status,
  })
}

// ── Public: GET /api/birthday/my-bookings (auth required) ────────────

export async function myBirthdayBookings(req, res) {
  const bookings = await BirthdayBooking.findAll({
    where: { user_id: req.user.id },
    order: [['event_date', 'DESC']],
  })
  res.json(bookings)
}

// ── Admin: GET /api/admin/birthday ───────────────────────────────────

export async function adminListBirthday(req, res) {
  const { page = 1, limit = 20, status, package_id, date_from, date_to, search } = req.query
  const offset = (parseInt(page) - 1) * parseInt(limit)
  const where = {}

  if (status) where.status = status
  if (package_id) where.package_id = package_id
  if (date_from || date_to) {
    where.event_date = {}
    if (date_from) where.event_date[Op.gte] = date_from
    if (date_to)   where.event_date[Op.lte] = date_to
  }
  if (search) {
    where[Op.or] = [
      { contact_first_name: { [Op.iLike]: `%${search}%` } },
      { contact_last_name:  { [Op.iLike]: `%${search}%` } },
      { contact_email:      { [Op.iLike]: `%${search}%` } },
      { child_name:         { [Op.iLike]: `%${search}%` } },
    ]
  }

  const { count, rows } = await BirthdayBooking.findAndCountAll({
    where,
    order: [['event_date', 'ASC'], ['event_time', 'ASC']],
    limit: parseInt(limit),
    offset,
  })

  res.json({ total: count, page: parseInt(page), limit: parseInt(limit), bookings: rows })
}

// ── Admin: GET /api/admin/birthday/stats ─────────────────────────────

export async function adminBirthdayStats(req, res) {
  const today = new Date().toISOString().split('T')[0]
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  const [total, inquiries, confirmed, thisMonth, totalRevenue, monthRevenue] = await Promise.all([
    BirthdayBooking.count({ where: { status: { [Op.ne]: 'cancelled' } } }),
    BirthdayBooking.count({ where: { status: 'inquiry' } }),
    BirthdayBooking.count({ where: { status: 'confirmed' } }),
    BirthdayBooking.count({ where: { event_date: { [Op.gte]: monthStart }, status: { [Op.ne]: 'cancelled' } } }),
    BirthdayBooking.sum('total_price', { where: { status: { [Op.in]: ['confirmed', 'completed'] } } }),
    BirthdayBooking.sum('total_price', { where: { event_date: { [Op.gte]: monthStart }, status: { [Op.in]: ['confirmed', 'completed'] } } }),
  ])

  res.json({ total, inquiries, confirmed, thisMonth, totalRevenue: Number(totalRevenue || 0).toFixed(2), monthRevenue: Number(monthRevenue || 0).toFixed(2) })
}

// ── Admin: PATCH /api/admin/birthday/:id/status ───────────────────────

export async function adminUpdateStatus(req, res) {
  const { status } = req.body
  const valid = ['inquiry', 'confirmed', 'cancelled', 'completed']
  if (!valid.includes(status)) return res.status(400).json({ error: 'Neveljaven status' })

  const booking = await BirthdayBooking.findByPk(req.params.id)
  if (!booking) return res.status(404).json({ error: 'Rezervacija ne obstaja' })

  booking.status = status
  if (status === 'cancelled') {
    booking.cancelled_by = req.user.id
    booking.cancelled_at = new Date()
  }
  await booking.save()
  res.json(booking)
}

// ── Admin: PATCH /api/admin/birthday/:id/notes ───────────────────────

export async function adminUpdateNotes(req, res) {
  const booking = await BirthdayBooking.findByPk(req.params.id)
  if (!booking) return res.status(404).json({ error: 'Rezervacija ne obstaja' })

  booking.admin_notes = req.body.admin_notes ?? booking.admin_notes
  await booking.save()
  res.json({ id: booking.id, admin_notes: booking.admin_notes })
}
