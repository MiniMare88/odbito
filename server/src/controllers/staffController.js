import { Op } from 'sequelize'
import OpenJumpBooking from '../models/OpenJumpBooking.js'
import ClassSession from '../models/ClassSession.js'
import ClassSchedule from '../models/ClassSchedule.js'
import ClassType from '../models/ClassType.js'
import ClassAttendance from '../models/ClassAttendance.js'
import Subscription from '../models/Subscription.js'
import User from '../models/User.js'

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

// GET /api/staff/openjump/today
export async function todayOpenJump(req, res) {
  const today = todayISO()
  const bookings = await OpenJumpBooking.findAll({
    where: {
      date: today,
      status: { [Op.ne]: 'cancelled' },
    },
    include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] }],
    order: [['start_time', 'ASC']],
  })
  res.json(bookings)
}

// POST /api/staff/openjump/checkin
export async function checkInOpenJump(req, res) {
  const { code } = req.body
  if (!code) return res.status(400).json({ error: 'Manjka koda' })

  const today = todayISO()

  // Try matching booking_code (UUID or short prefix)
  const booking = await OpenJumpBooking.findOne({
    where: {
      date: today,
      status: 'confirmed',
      [Op.or]: [
        { booking_code: code },
        // short code: first segment of UUID
        { booking_code: { [Op.iLike]: `${code}%` } },
      ],
    },
    include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'phone'] }],
  })

  if (!booking) {
    return res.status(404).json({ error: 'Rezervacija ni najdena ali je že prijavljena' })
  }

  booking.status = 'checked_in'
  booking.checked_in_at = new Date()
  await booking.save()

  res.json({
    success: true,
    message: `✓ Check-in: ${booking.user.first_name} ${booking.user.last_name}`,
    booking: {
      id: booking.id,
      booking_code: booking.booking_code,
      start_time: booking.start_time?.slice(0, 5),
      end_time: booking.end_time?.slice(0, 5),
      participants: booking.participants,
      user: booking.user,
      checked_in_at: booking.checked_in_at,
    },
  })
}

// GET /api/staff/classes/today
export async function todayClasses(req, res) {
  const today = todayISO()

  const sessions = await ClassSession.findAll({
    where: { session_date: today, status: 'scheduled' },
    include: [
      {
        model: ClassSchedule,
        as: 'schedule',
        include: [{ model: ClassType, as: 'classType' }],
      },
    ],
    order: [['start_time', 'ASC']],
  })

  // Attach attendance for each session
  const result = await Promise.all(sessions.map(async s => {
    const attendance = await ClassAttendance.findAll({
      where: { class_session_id: s.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'phone'] }],
      order: [['registered_at', 'ASC']],
    })

    return {
      id: s.id,
      session_date: s.session_date,
      start_time: s.start_time?.slice(0, 5),
      end_time: s.end_time?.slice(0, 5),
      class_type: {
        id: s.schedule.classType.id,
        name_sl: s.schedule.classType.name_sl,
        color_hex: s.schedule.classType.color_hex,
        capacity: s.schedule.classType.capacity,
      },
      attendance: attendance.map(a => ({
        id: a.id,
        status: a.status,
        checked_in_at: a.checked_in_at,
        user: a.user,
      })),
      registered: attendance.filter(a => ['registered', 'attended'].includes(a.status)).length,
      waitlisted: attendance.filter(a => a.status === 'waitlisted').length,
    }
  }))

  res.json(result)
}

// POST /api/staff/classes/checkin/:attendanceId
export async function checkInClass(req, res) {
  const { attendanceId } = req.params
  const attendance = await ClassAttendance.findByPk(attendanceId, {
    include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }],
  })

  if (!attendance) return res.status(404).json({ error: 'Prisotnost ni najdena' })
  if (attendance.status === 'attended') return res.status(409).json({ error: 'Že prijavljen' })

  attendance.status = 'attended'
  attendance.checked_in_at = new Date()
  await attendance.save()

  res.json({
    success: true,
    message: `✓ ${attendance.user.first_name} ${attendance.user.last_name}`,
  })
}

// GET /api/staff/stats
export async function staffStats(req, res) {
  const today = todayISO()

  const [ojTotal, ojCheckedIn, ojPending, classSessions] = await Promise.all([
    OpenJumpBooking.count({ where: { date: today, status: { [Op.ne]: 'cancelled' } } }),
    OpenJumpBooking.count({ where: { date: today, status: 'checked_in' } }),
    OpenJumpBooking.count({ where: { date: today, status: 'confirmed' } }),
    ClassSession.count({ where: { session_date: today, status: 'scheduled' } }),
  ])

  res.json({ ojTotal, ojCheckedIn, ojPending, classSessions, date: today })
}
