import { Op, fn, col, literal } from 'sequelize'
import { sequelize } from '../models/db.js'
import User from '../models/User.js'
import AkademijaGroup from '../models/AkademijaGroup.js'
import OpenJumpBooking from '../models/OpenJumpBooking.js'
import Subscription from '../models/Subscription.js'
import ClassType from '../models/ClassType.js'
import DiscountCode from '../models/DiscountCode.js'
import ParkClosure from '../models/ParkClosure.js'
import WaiverVersion from '../models/WaiverVersion.js'
import StaffMember from '../models/StaffMember.js'
import BirthdayBooking from '../models/BirthdayBooking.js'
import UserNote from '../models/UserNote.js'
import { createRefundVoucher } from './voucherController.js'
import { sendVoucherEmail } from '../services/emailService.js'

// GET /api/admin/stats
export async function getStats(req, res) {
  const today = new Date().toISOString().split('T')[0]
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  const [
    totalUsers,
    todayBookings,
    monthBookings,
    totalBookings,
    activeSubscriptions,
    todayRevenue,
    monthRevenue,
    totalRevenue,
    bdTotal,
    bdInquiries,
    bdRevenue,
  ] = await Promise.all([
    User.count({ where: { role: 'customer' } }),
    OpenJumpBooking.count({ where: { date: today, status: { [Op.ne]: 'cancelled' } } }),
    OpenJumpBooking.count({ where: { date: { [Op.gte]: thisMonthStart }, status: { [Op.ne]: 'cancelled' } } }),
    OpenJumpBooking.count({ where: { status: { [Op.ne]: 'cancelled' } } }),
    Subscription.count({ where: { status: 'active' } }),
    OpenJumpBooking.sum('total_price', { where: { date: today, status: { [Op.ne]: 'cancelled' } } }),
    OpenJumpBooking.sum('total_price', { where: { date: { [Op.gte]: thisMonthStart }, status: { [Op.ne]: 'cancelled' } } }),
    OpenJumpBooking.sum('total_price', { where: { status: { [Op.ne]: 'cancelled' } } }),
    BirthdayBooking.count({ where: { status: { [Op.in]: ['inquiry', 'confirmed'] } } }),
    BirthdayBooking.count({ where: { status: 'inquiry' } }),
    BirthdayBooking.sum('total_price', { where: { status: { [Op.in]: ['confirmed', 'completed'] } } }),
  ])

  res.json({
    totalUsers,
    todayBookings,
    monthBookings,
    totalBookings,
    activeSubscriptions,
    todayRevenue: Number(todayRevenue || 0).toFixed(2),
    monthRevenue: Number(monthRevenue || 0).toFixed(2),
    totalRevenue: Number(totalRevenue || 0).toFixed(2),
    bdTotal: bdTotal || 0,
    bdInquiries: bdInquiries || 0,
    bdRevenue: Number(bdRevenue || 0).toFixed(2),
  })
}

// GET /api/admin/bookings?page=1&limit=20&status=&date=
export async function getBookings(req, res) {
  const { page = 1, limit = 20, status, date, search } = req.query
  const offset = (page - 1) * limit
  const where = {}
  if (status) where.status = status
  if (date) where.date = date

  const userWhere = {}
  if (search) {
    userWhere[Op.or] = [
      { first_name: { [Op.iLike]: `%${search}%` } },
      { last_name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ]
  }

  const { count, rows } = await OpenJumpBooking.findAndCountAll({
    where,
    include: [{ model: User, as: 'user', where: Object.keys(userWhere).length ? userWhere : undefined, required: !!search, attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] }],
    order: [['date', 'DESC'], ['start_time', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  })

  res.json({ total: count, page: parseInt(page), limit: parseInt(limit), bookings: rows })
}

// GET /api/admin/users?page=1&search=&role=
export async function getUsers(req, res) {
  const { page = 1, limit = 20, search, role } = req.query
  const offset = (page - 1) * limit
  const where = {}
  if (role) where.role = role
  if (search) {
    where[Op.or] = [
      { first_name: { [Op.iLike]: `%${search}%` } },
      { last_name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ]
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password_hash', 'refresh_token_hash'] },
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  })

  res.json({ total: count, page: parseInt(page), limit: parseInt(limit), users: rows })
}

// PATCH /api/admin/users/:id/role
export async function updateUserRole(req, res) {
  const { id } = req.params
  const { role } = req.body
  if (!['customer', 'staff', 'admin'].includes(role)) return res.status(400).json({ error: 'Neveljavna vloga' })

  const user = await User.findByPk(id)
  if (!user) return res.status(404).json({ error: 'Uporabnik ne obstaja' })
  if (user.id === req.user.id) return res.status(400).json({ error: 'Ne moreš spremeniti svoje vloge' })

  const prevRole = user.role
  user.role = role
  await user.save()

  // Sync StaffMember record
  if (role === 'staff' || role === 'admin') {
    await StaffMember.upsert(
      { user_id: user.id, is_active: true },
      { conflictFields: ['user_id'] }
    )
  } else if (prevRole === 'staff' || prevRole === 'admin') {
    await StaffMember.update({ is_active: false }, { where: { user_id: user.id } })
  }

  res.json({ id: user.id, email: user.email, role: user.role })
}

// GET /api/admin/users/:id
export async function getUser(req, res) {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password_hash', 'refresh_token_hash'] },
  })
  if (!user) return res.status(404).json({ error: 'Uporabnik ne obstaja' })

  const [ojBookings, bdBookings] = await Promise.all([
    OpenJumpBooking.findAll({
      where: { user_id: user.id },
      order: [['date', 'DESC'], ['start_time', 'DESC']],
      limit: 30,
      attributes: ['id', 'booking_code', 'date', 'start_time', 'end_time', 'participants', 'total_price', 'status', 'payment_status', 'createdAt'],
    }),
    BirthdayBooking.findAll({
      where: { user_id: user.id },
      order: [['event_date', 'DESC']],
      limit: 20,
      attributes: ['id', 'booking_code', 'event_date', 'event_time', 'package_id', 'package_label', 'children_count', 'total_price', 'status', 'createdAt'],
    }),
  ])

  res.json({ ...user.toJSON(), ojBookings, bdBookings })
}

// PATCH /api/admin/users/:id
export async function updateUser(req, res) {
  const user = await User.findByPk(req.params.id)
  if (!user) return res.status(404).json({ error: 'Uporabnik ne obstaja' })

  const allowed = ['first_name', 'last_name', 'email', 'phone', 'role']
  for (const key of allowed) {
    if (req.body[key] !== undefined) user[key] = req.body[key]
  }

  if (req.body.role && req.body.role !== user._previousDataValues?.role) {
    const newRole = req.body.role
    const prevRole = user._previousDataValues?.role
    if (newRole === 'staff' || newRole === 'admin') {
      await StaffMember.upsert({ user_id: user.id, is_active: true }, { conflictFields: ['user_id'] })
    } else if (prevRole === 'staff' || prevRole === 'admin') {
      await StaffMember.update({ is_active: false }, { where: { user_id: user.id } })
    }
  }

  await user.save()
  const { password_hash, refresh_token_hash, ...safe } = user.toJSON()
  res.json(safe)
}

// DELETE /api/admin/users/:id
export async function deleteUser(req, res) {
  const user = await User.findByPk(req.params.id)
  if (!user) return res.status(404).json({ error: 'Uporabnik ne obstaja' })
  if (user.id === req.user.id) return res.status(400).json({ error: 'Ne moreš izbrisati svojega računa' })
  await user.destroy()
  res.json({ message: 'Uporabnik izbrisan' })
}

// PATCH /api/admin/users/:id/block
export async function blockUser(req, res) {
  const user = await User.findByPk(req.params.id)
  if (!user) return res.status(404).json({ error: 'Uporabnik ne obstaja' })
  if (user.id === req.user.id) return res.status(400).json({ error: 'Ne moreš blokirati svojega računa' })
  user.is_blocked = true
  user.refresh_token_hash = null
  await user.save()
  res.json({ id: user.id, is_blocked: true })
}

// PATCH /api/admin/users/:id/unblock
export async function unblockUser(req, res) {
  const user = await User.findByPk(req.params.id)
  if (!user) return res.status(404).json({ error: 'Uporabnik ne obstaja' })
  user.is_blocked = false
  await user.save()
  res.json({ id: user.id, is_blocked: false })
}

// GET /api/admin/users/:id/notes
export async function getUserNotes(req, res) {
  const notes = await UserNote.findAll({
    where: { user_id: req.params.id },
    include: [{ model: User, as: 'author', attributes: ['id', 'first_name', 'last_name'] }],
    order: [['createdAt', 'DESC']],
  })
  res.json(notes)
}

// POST /api/admin/users/:id/notes
export async function addUserNote(req, res) {
  const { content } = req.body
  if (!content?.trim()) return res.status(400).json({ error: 'Vsebina note je obvezna' })
  const note = await UserNote.create({
    user_id: req.params.id,
    content: content.trim(),
    created_by: req.user.id,
  })
  const full = await UserNote.findByPk(note.id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'first_name', 'last_name'] }],
  })
  res.status(201).json(full)
}

// DELETE /api/admin/users/:id/notes/:noteId
export async function deleteUserNote(req, res) {
  const note = await UserNote.findOne({ where: { id: req.params.noteId, user_id: req.params.id } })
  if (!note) return res.status(404).json({ error: 'Nota ne obstaja' })
  await note.destroy()
  res.json({ message: 'Nota izbrisana' })
}

// GET /api/admin/closures
export async function getClosures(req, res) {
  const closures = await ParkClosure.findAll({
    where: { date: { [Op.gte]: new Date().toISOString().split('T')[0] } },
    order: [['date', 'ASC']],
  })
  res.json(closures)
}

// POST /api/admin/closures
export async function createClosure(req, res) {
  const { date, reason_sl, reason_en } = req.body
  if (!date) return res.status(400).json({ error: 'Manjka datum' })

  const existing = await ParkClosure.findOne({ where: { date } })
  if (existing) return res.status(409).json({ error: 'Za ta datum že obstaja zaprtje' })

  const closure = await ParkClosure.create({
    date,
    reason_sl: reason_sl || null,
    reason_en: reason_en || null,
    created_by: req.user.id,
  })
  res.status(201).json(closure)
}

// DELETE /api/admin/closures/:id
export async function deleteClosure(req, res) {
  const closure = await ParkClosure.findByPk(req.params.id)
  if (!closure) return res.status(404).json({ error: 'Zaprtje ne obstaja' })
  await closure.destroy()
  res.json({ message: 'Zaprtje odstranjeno' })
}

// GET /api/admin/discount-codes
export async function getDiscountCodes(req, res) {
  const codes = await DiscountCode.findAll({
    order: [['createdAt', 'DESC']],
  })
  res.json(codes)
}

// POST /api/admin/discount-codes
export async function createDiscountCode(req, res) {
  const { code, type, value, max_uses, single_use_per_customer, expires_at } = req.body
  if (!code || !type || !value) return res.status(400).json({ error: 'Manjkajo polja' })
  if (!['percentage', 'fixed'].includes(type)) return res.status(400).json({ error: 'Neveljaven tip' })
  if (type === 'percentage' && (value < 1 || value > 100)) return res.status(400).json({ error: 'Odstotek mora biti 1–100' })

  const dc = await DiscountCode.create({
    code: code.toUpperCase().trim(),
    type,
    value,
    max_uses: max_uses || null,
    single_use_per_customer: !!single_use_per_customer,
    expires_at: expires_at || null,
    is_active: true,
    created_by: req.user.id,
  })
  res.status(201).json(dc)
}

// PATCH /api/admin/discount-codes/:id
export async function toggleDiscountCode(req, res) {
  const dc = await DiscountCode.findByPk(req.params.id)
  if (!dc) return res.status(404).json({ error: 'Koda ne obstaja' })
  dc.is_active = !dc.is_active
  await dc.save()
  res.json(dc)
}

// GET /api/admin/waiver
export async function getWaivers(req, res) {
  const waivers = await WaiverVersion.findAll({ order: [['createdAt', 'DESC']] })
  res.json(waivers)
}

// POST /api/admin/waiver
export async function createWaiver(req, res) {
  const { version, content_sl, content_en } = req.body
  if (!version || !content_sl || !content_en) return res.status(400).json({ error: 'Manjkajo polja' })

  const existing = await WaiverVersion.findOne({ where: { version } })
  if (existing) return res.status(409).json({ error: 'Ta različica že obstaja' })

  // Deactivate all others
  await WaiverVersion.update({ is_current: false }, { where: {} })

  const waiver = await WaiverVersion.create({ version, content_sl, content_en, is_current: true })
  res.status(201).json(waiver)
}

// PATCH /api/admin/waiver/:id/activate
export async function activateWaiver(req, res) {
  const waiver = await WaiverVersion.findByPk(req.params.id)
  if (!waiver) return res.status(404).json({ error: 'Izjava ne obstaja' })

  await WaiverVersion.update({ is_current: false }, { where: {} })
  waiver.is_current = true
  await waiver.save()

  res.json(waiver)
}

// GET /api/admin/class-types
export async function getClassTypes(req, res) {
  const types = await ClassType.findAll({ order: [['id', 'ASC']] })
  res.json(types)
}

// PATCH /api/admin/class-types/:id
export async function updateClassType(req, res) {
  const ct = await ClassType.findByPk(req.params.id)
  if (!ct) return res.status(404).json({ error: 'Vadba ne obstaja' })

  const allowed = ['capacity', 'price_monthly', 'price_yearly', 'is_active', 'description_sl', 'description_en']
  allowed.forEach(f => { if (req.body[f] !== undefined) ct[f] = req.body[f] })
  await ct.save()
  res.json(ct)
}

// ── Akademija Groups ──────────────────────────────────────────────────

export async function getAkademijaGroups(req, res) {
  const groups = await AkademijaGroup.findAll({ order: [['sort_order', 'ASC'], ['name', 'ASC']] })
  res.json(groups)
}

export async function createAkademijaGroup(req, res) {
  const { name, program, age_range, color_hex, days, time_start, time_end, sort_order, notes } = req.body
  if (!name || !program || !days || !time_start || !time_end)
    return res.status(400).json({ error: 'Manjkajo obvezna polja' })
  const g = await AkademijaGroup.create({ name, program, age_range, color_hex, days, time_start, time_end, sort_order: sort_order || 0, notes })
  res.status(201).json(g)
}

export async function updateAkademijaGroup(req, res) {
  const g = await AkademijaGroup.findByPk(req.params.id)
  if (!g) return res.status(404).json({ error: 'Skupina ne obstaja' })
  const fields = ['name', 'program', 'age_range', 'color_hex', 'days', 'time_start', 'time_end', 'sort_order', 'is_active', 'notes']
  fields.forEach(f => { if (req.body[f] !== undefined) g[f] = req.body[f] })
  await g.save()
  res.json(g)
}

export async function deleteAkademijaGroup(req, res) {
  const g = await AkademijaGroup.findByPk(req.params.id)
  if (!g) return res.status(404).json({ error: 'Skupina ne obstaja' })
  await g.destroy()
  res.json({ ok: true })
}

// GET /api/admin/occupancy?view=month&year=2026&month=6
//                         ?view=week&date=YYYY-MM-DD  (any day in the week)
//                         ?view=day&date=YYYY-MM-DD
export async function getOccupancy(req, res) {
  const { view, year, month, date } = req.query
  const CAPACITY = 50

  function timeToMin(t) {
    const [h, m] = t.slice(0, 5).split(':').map(Number)
    return h * 60 + m
  }

  if (view === 'month') {
    const y = parseInt(year), m = parseInt(month)
    if (!y || !m) return res.status(400).json({ error: 'Zahtevana year in month' })
    const daysInMonth = new Date(y, m, 0).getDate()
    const startDate = `${y}-${String(m).padStart(2, '0')}-01`
    const endDate = `${y}-${String(m).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`

    const bookings = await OpenJumpBooking.findAll({
      where: { date: { [Op.between]: [startDate, endDate] }, status: { [Op.ne]: 'cancelled' } },
      attributes: ['date', 'participants'],
    })

    const byDate = {}
    bookings.forEach(b => { byDate[b.date] = (byDate[b.date] || 0) + b.participants })
    return res.json({ view: 'month', year: y, month: m, capacity: CAPACITY, data: byDate })
  }

  if (view === 'week') {
    if (!date) return res.status(400).json({ error: 'Zahtevano polje date' })
    const pivot = new Date(date + 'T12:00:00')
    const dow = pivot.getDay() // 0=Sun
    const monday = new Date(pivot)
    monday.setDate(pivot.getDate() - (dow === 0 ? 6 : dow - 1))

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d.toISOString().split('T')[0]
    })

    const bookings = await OpenJumpBooking.findAll({
      where: { date: { [Op.in]: days }, status: { [Op.ne]: 'cancelled' } },
      attributes: ['date', 'start_time', 'end_time', 'participants'],
    })

    const data = {}
    days.forEach(day => {
      data[day] = {}
      const dayB = bookings.filter(b => b.date === day)
      for (let h = 9; h <= 21; h++) {
        const hStart = h * 60, hEnd = hStart + 60
        const concurrent = dayB.reduce((sum, b) => {
          const bS = timeToMin(b.start_time), bE = timeToMin(b.end_time)
          return bS < hEnd && bE > hStart ? sum + b.participants : sum
        }, 0)
        data[day][`${String(h).padStart(2, '0')}:00`] = concurrent
      }
    })
    return res.json({ view: 'week', days, capacity: CAPACITY, data })
  }

  if (view === 'day') {
    if (!date) return res.status(400).json({ error: 'Zahtevano polje date' })
    const bookings = await OpenJumpBooking.findAll({
      where: { date, status: { [Op.ne]: 'cancelled' } },
      attributes: ['start_time', 'end_time', 'participants'],
    })

    const slots = []
    let h = 9, m = 0
    while (h < 21 || (h === 21 && m === 0)) {
      const slotStart = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      const sS = timeToMin(slotStart), sE = sS + 30
      const concurrent = bookings.reduce((sum, b) => {
        const bS = timeToMin(b.start_time), bE = timeToMin(b.end_time)
        return bS < sE && bE > sS ? sum + b.participants : sum
      }, 0)
      slots.push({ time: slotStart, occupancy: concurrent })
      m += 30
      if (m >= 60) { m -= 60; h++ }
    }
    return res.json({ view: 'day', date, capacity: CAPACITY, slots })
  }

  res.status(400).json({ error: 'view mora biti month, week ali day' })
}

// PATCH /api/admin/bookings/:id/cancel
export async function cancelBooking(req, res) {
  const booking = await OpenJumpBooking.findByPk(req.params.id, {
    include: [{ model: User, as: 'user', attributes: ['id', 'email', 'first_name'] }],
  })
  if (!booking) return res.status(404).json({ error: 'Rezervacija ne obstaja' })
  if (booking.status === 'cancelled') return res.status(409).json({ error: 'Že preklicano' })

  // Check 48h rule
  const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`)
  const hoursUntil = (bookingDateTime - new Date()) / (1000 * 60 * 60)
  const isRefundable = hoursUntil > 48

  booking.status = 'cancelled'
  booking.cancelled_by = req.user.id
  booking.cancelled_at = new Date()
  await booking.save()

  let refundVoucher = null
  if (isRefundable && booking.user_id && booking.total_price > 0) {
    try {
      refundVoucher = await createRefundVoucher({
        userId: booking.user_id,
        amount: parseFloat(booking.total_price),
        bookingId: booking.id,
        bookingType: 'open_jump',
      })
      if (booking.user?.email) {
        await sendVoucherEmail({
          vouchers: [refundVoucher],
          email: booking.user.email,
          firstName: booking.user.first_name,
          type: 'refund',
        })
      }
    } catch (e) {
      console.error('Refund voucher creation error:', e.message)
    }
  }

  res.json({
    message: 'Preklicano',
    id: booking.id,
    refund_voucher: refundVoucher ? {
      code: refundVoucher.code,
      denomination: refundVoucher.denomination,
      expires_at: refundVoucher.expires_at,
    } : null,
    refundable: isRefundable,
  })
}
