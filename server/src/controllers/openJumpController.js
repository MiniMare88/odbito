import { Op } from 'sequelize'
import { sequelize } from '../models/index.js'
import OpenJumpBooking from '../models/OpenJumpBooking.js'
import ParkClosure from '../models/ParkClosure.js'
import User from '../models/User.js'
import { sendBookingConfirmation } from '../services/emailService.js'
import { generateQR } from '../services/qrService.js'
import { generateBookingIcs } from '../services/calendarService.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pricing = require('../../data/pricing.json')
import { getEffectiveSchedule } from './parkScheduleController.js'

const MAX_CAPACITY  = pricing.openJump.capacity      // 50 — prikaz razpoložljivosti
const MAX_SALES     = pricing.openJump.maxSalesPerHour ?? 60  // 60 — trdi limit prodaje
const GROUP_DISCOUNT = pricing.openJump.groupDiscount

const PACKAGES = pricing.openJump.packages.map(p => ({ key: p.id, duration: p.duration, price: p.price }))

function calcGroupDiscount(pkgId, pricePerPerson, participants) {
  if (participants < GROUP_DISCOUNT.minPersons) return { discounted: pricePerPerson, pct: 0 }
  const groupPkg = GROUP_DISCOUNT.packages.find(gp => gp.refPackage === pkgId)
  if (!groupPkg) return { discounted: pricePerPerson, pct: 0 }
  const discounted = groupPkg.price
  const pct = +((1 - discounted / pricePerPerson) * 100).toFixed(1)
  return { discounted, pct }
}

// Generiraj 30-minutne slote med open_time in close_time
function generateSlotsForSchedule(openTime, closeTime) {
  const slots = []
  const [oh, om] = openTime.split(':').map(Number)
  const [ch, cm] = closeTime.split(':').map(Number)
  let h = oh, m = om
  while (h * 60 + m < ch * 60 + cm) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    m += 30
    if (m >= 60) { m -= 60; h++ }
  }
  return slots
}

function addMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// GET /api/openjump/slots?date=YYYY-MM-DD
export async function getSlots(req, res) {
  const { date } = req.query
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Zahtevano polje date (YYYY-MM-DD)' })
  }

  // Preveri urnik iz baze (override > tedenska shema)
  const schedule = await getEffectiveSchedule(date)
  if (!schedule.is_open) {
    return res.json({ date, open: false, slots: [], reason: schedule.reason || 'Park ta dan ni odprt za Open Jump' })
  }

  // Preveri zaprtje parka (ParkClosure ima prednost pred vsem)
  const closure = await ParkClosure.findOne({ where: { date } })
  if (closure) {
    return res.json({ date, open: false, slots: [], reason: closure.reason_sl || 'Park zaprt' })
  }

  // Fetch all active bookings for this date
  const bookings = await OpenJumpBooking.findAll({
    where: { date, status: { [Op.ne]: 'cancelled' } },
    attributes: ['start_time', 'end_time', 'participants'],
  })

  const allSlots = generateSlotsForSchedule(schedule.open_time, schedule.close_time)

  const result = allSlots.map(slotStart => {
    const slotEnd = addMinutes(slotStart, 30)
    const slotStartM = timeToMinutes(slotStart)
    const slotEndM = timeToMinutes(slotEnd)

    const concurrent = bookings.reduce((sum, b) => {
      const bStart = timeToMinutes(b.start_time.slice(0, 5))
      const bEnd = timeToMinutes(b.end_time.slice(0, 5))
      if (bStart < slotEndM && bEnd > slotStartM) return sum + b.participants
      return sum
    }, 0)

    return {
      start: slotStart,
      available: Math.max(0, MAX_CAPACITY - concurrent),
      capacity: MAX_CAPACITY,
    }
  })

  res.json({
    date,
    open: true,
    open_time:  schedule.open_time,
    close_time: schedule.close_time,
    slots: result,
    packages: PACKAGES,
    group_discount: GROUP_DISCOUNT,
  })
}

// POST /api/openjump/book
export async function createBooking(req, res) {
  const { date, start_time, package_key, participants = 1 } = req.body
  const userId = req.user.id

  // Validate
  if (!date || !start_time || !package_key) {
    return res.status(400).json({ error: 'Manjkajo polja: date, start_time, package_key' })
  }
  const schedule = await getEffectiveSchedule(date)
  if (!schedule.is_open) {
    return res.status(400).json({ error: 'Park ta dan ni odprt za Open Jump' })
  }

  const pkg = PACKAGES.find(p => p.key === package_key)
  if (!pkg) {
    return res.status(400).json({ error: 'Neveljaven paket' })
  }
  if (participants < 1 || participants > MAX_SALES) {
    return res.status(400).json({ error: `Število udeležencev mora biti 1–${MAX_SALES}` })
  }

  const end_time = addMinutes(start_time, pkg.duration)

  // Preveri da je booking znotraj odprtih ur
  const startM = timeToMinutes(start_time)
  const endM   = timeToMinutes(end_time)
  const openM  = timeToMinutes(schedule.open_time)
  const closeM = timeToMinutes(schedule.close_time)
  if (startM < openM || endM > closeM) {
    return res.status(400).json({ error: `Termin mora biti znotraj odprtih ur (${schedule.open_time}–${schedule.close_time})` })
  }

  const { discounted: pricePerPerson, pct: discountPct } = calcGroupDiscount(pkg.key, pkg.price, participants)
  const discount_amount = +((pkg.price - pricePerPerson) * participants).toFixed(2)
  const total_price = (pricePerPerson * participants).toFixed(2)

  const result = await sequelize.transaction(async (t) => {
    // Capacity check — lock rows
    const bookings = await OpenJumpBooking.findAll({
      where: { date, status: { [Op.ne]: 'cancelled' } },
      attributes: ['start_time', 'end_time', 'participants'],
      lock: t.LOCK.UPDATE,
      transaction: t,
    })

    const startM = timeToMinutes(start_time)
    const endM = timeToMinutes(end_time)

    // Check each 30-min window within booking duration
    let cursor = startM
    while (cursor < endM) {
      const windowEnd = cursor + 30
      const concurrent = bookings.reduce((sum, b) => {
        const bStart = timeToMinutes(b.start_time.slice(0, 5))
        const bEnd = timeToMinutes(b.end_time.slice(0, 5))
        if (bStart < windowEnd && bEnd > cursor) return sum + b.participants
        return sum
      }, 0)
      if (concurrent + participants > MAX_SALES) {
        throw Object.assign(new Error('Kapaciteta zapolnjena za izbrani termin'), { status: 409 })
      }
      cursor += 30
    }

    return OpenJumpBooking.create({
      user_id: userId,
      date,
      start_time,
      end_time,
      duration_hours: pkg.duration / 60,
      participants,
      price_per_person: pricePerPerson,
      total_price,
      discount_amount,
      payment_status: 'pending',
      status: 'confirmed',
    }, { transaction: t })
  })

  // Send confirmation email (non-blocking)
  User.findByPk(req.user.id).then(user => {
    if (user) sendBookingConfirmation(result, user).catch(err => console.error('[EMAIL]', err.message))
  })

  res.status(201).json({
    id: result.id,
    booking_code: result.booking_code,
    date: result.date,
    start_time: result.start_time,
    end_time: result.end_time,
    duration_hours: result.duration_hours,
    participants: result.participants,
    price_per_person: result.price_per_person,
    discount_amount: result.discount_amount,
    discount_pct: discountPct,
    total_price: result.total_price,
    status: result.status,
    payment_status: result.payment_status,
  })
}

// GET /api/openjump/my-bookings
export async function myBookings(req, res) {
  const bookings = await OpenJumpBooking.findAll({
    where: { user_id: req.user.id },
    order: [['date', 'DESC'], ['start_time', 'DESC']],
    attributes: { exclude: ['user_id', 'cancelled_by', 'stripe_payment_intent_id'] },
  })
  res.json(bookings)
}

// GET /api/openjump/packages
export async function getPackages(req, res) {
  res.json(PACKAGES)
}

// GET /api/openjump/booking/:id/qr
export async function getBookingQr(req, res) {
  const booking = await OpenJumpBooking.findOne({
    where: { id: req.params.id, user_id: req.user.id },
  })
  if (!booking) return res.status(404).json({ error: 'Rezervacija ne obstaja' })

  const qrDataUrl = await generateQR(booking.booking_code)
  res.json({ qr: qrDataUrl, booking_code: booking.booking_code })
}

// GET /api/openjump/booking/:id/ics
export async function getBookingIcs(req, res) {
  const booking = await OpenJumpBooking.findOne({
    where: { id: req.params.id, user_id: req.user.id },
  })
  if (!booking) return res.status(404).json({ error: 'Rezervacija ne obstaja' })

  const ics = await generateBookingIcs(booking)
  res.setHeader('Content-Type', 'text/calendar')
  res.setHeader('Content-Disposition', `attachment; filename="odbito-${booking.booking_code.split('-')[0]}.ics"`)
  res.send(ics)
}
