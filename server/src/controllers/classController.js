import { Op } from 'sequelize'
import { sequelize } from '../models/db.js'
import ClassType from '../models/ClassType.js'
import ClassSchedule from '../models/ClassSchedule.js'
import ClassSession from '../models/ClassSession.js'
import Subscription from '../models/Subscription.js'
import ClassAttendance from '../models/ClassAttendance.js'
import User from '../models/User.js'
import { sendSubscriptionConfirmation } from '../services/emailService.js'

const DAY_NAMES = { 1: 'Ponedeljek', 2: 'Torek', 3: 'Sreda', 4: 'Četrtek' }

// Generate sessions for a schedule from today up to N weeks ahead
async function ensureSessions(schedule, weeksAhead = 8) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sessions = []

  for (let w = 0; w < weeksAhead; w++) {
    const d = new Date(today)
    d.setDate(d.getDate() + w * 7)
    // Find the right weekday within this week
    const diff = ((schedule.day_of_week - 1) - (d.getDay() === 0 ? 6 : d.getDay() - 1) + 7) % 7
    const sessionDate = new Date(d)
    sessionDate.setDate(d.getDate() + diff)
    if (sessionDate < today) continue

    const iso = sessionDate.toISOString().split('T')[0]
    const [session] = await ClassSession.findOrCreate({
      where: { class_schedule_id: schedule.id, session_date: iso },
      defaults: {
        class_type_id: schedule.class_type_id,
        session_date: iso,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        status: 'scheduled',
      },
    })
    sessions.push(session)
  }
  return sessions
}

// GET /api/classes/types
export async function getClassTypes(req, res) {
  const types = await ClassType.findAll({
    where: { is_active: true },
    include: [{ model: ClassSchedule, as: 'schedules', where: { is_active: true }, required: false }],
    order: [['id', 'ASC'], [{ model: ClassSchedule, as: 'schedules' }, 'day_of_week', 'ASC']],
  })
  res.json(types)
}

// GET /api/classes/schedule?weeks=4&from=2026-09-01
export async function getSchedule(req, res) {
  const weeks = Math.min(parseInt(req.query.weeks) || 4, 52)

  const schedules = await ClassSchedule.findAll({
    where: { is_active: true },
    include: [{ model: ClassType, as: 'classType', where: { is_active: true } }],
    order: [['day_of_week', 'ASC'], ['start_time', 'ASC']],
  })

  // Ensure sessions exist for each schedule
  for (const s of schedules) {
    await ensureSessions(s, weeks)
  }

  // Return sessions for the next `weeks` weeks (or from a specific date)
  const today = req.query.from ? new Date(req.query.from + 'T00:00:00') : new Date()
  today.setHours(0, 0, 0, 0)
  const until = new Date(today)
  until.setDate(until.getDate() + weeks * 7)

  const sessions = await ClassSession.findAll({
    where: {
      session_date: { [Op.between]: [today.toISOString().split('T')[0], until.toISOString().split('T')[0]] },
      status: 'scheduled',
    },
    include: [
      { model: ClassSchedule, as: 'schedule', include: [{ model: ClassType, as: 'classType' }] },
    ],
    order: [['session_date', 'ASC'], ['start_time', 'ASC']],
  })

  // Attach attendance counts
  const sessionIds = sessions.map(s => s.id)
  const attendanceCounts = await ClassAttendance.findAll({
    where: { class_session_id: { [Op.in]: sessionIds }, status: { [Op.in]: ['registered', 'attended'] } },
    attributes: ['class_session_id', [sequelize.fn('COUNT', '*'), 'count']],
    group: ['class_session_id'],
    raw: true,
  })
  const countMap = Object.fromEntries(attendanceCounts.map(a => [a.class_session_id, parseInt(a.count)]))

  const result = sessions.map(s => ({
    id: s.id,
    session_date: s.session_date,
    start_time: s.start_time?.slice(0, 5),
    end_time: s.end_time?.slice(0, 5),
    class_type: {
      id: s.schedule.classType.id,
      name_sl: s.schedule.classType.name_sl,
      name_en: s.schedule.classType.name_en,
      description_sl: s.schedule.classType.description_sl,
      color_hex: s.schedule.classType.color_hex,
      capacity: s.schedule.classType.capacity,
    },
    registered: countMap[s.id] || 0,
    available: s.schedule.classType.capacity - (countMap[s.id] || 0),
  }))

  res.json(result)
}

// GET /api/classes/my-subscriptions
export async function mySubscriptions(req, res) {
  const subs = await Subscription.findAll({
    where: { user_id: req.user.id },
    include: [{ model: ClassType, as: 'classType' }],
    order: [['created_at', 'DESC']],
  })
  res.json(subs)
}

// POST /api/classes/subscribe
export async function subscribe(req, res) {
  const { class_type_id, plan_type } = req.body
  const userId = req.user.id

  if (!class_type_id || !plan_type) {
    return res.status(400).json({ error: 'Manjka class_type_id ali plan_type' })
  }
  if (!['monthly', 'yearly'].includes(plan_type)) {
    return res.status(400).json({ error: 'plan_type mora biti monthly ali yearly' })
  }

  const classType = await ClassType.findOne({ where: { id: class_type_id, is_active: true } })
  if (!classType) return res.status(404).json({ error: 'Vadba ne obstaja' })

  // Check for existing active subscription
  const existing = await Subscription.findOne({
    where: { user_id: userId, class_type_id, status: 'active' },
  })
  if (existing) return res.status(409).json({ error: 'Že imaš aktivno naročnino za to vadbo' })

  const start_date = new Date().toISOString().split('T')[0]
  const end = new Date()
  end.setDate(end.getDate() + (plan_type === 'yearly' ? 365 : 30))
  const end_date = end.toISOString().split('T')[0]

  const price = plan_type === 'yearly' ? classType.price_yearly : classType.price_monthly

  const sub = await Subscription.create({
    user_id: userId,
    class_type_id,
    plan_type,
    start_date,
    end_date,
    payment_status: 'pending',
    status: 'active',
  })

  const full = await Subscription.findByPk(sub.id, {
    include: [{ model: ClassType, as: 'classType' }],
  })

  // Send confirmation email (non-blocking)
  Promise.all([
    User.findByPk(userId),
    ClassSchedule.findAll({ where: { class_type_id, is_active: true } }),
  ]).then(([user, schedules]) => {
    if (user) sendSubscriptionConfirmation(full, classType, user, schedules).catch(err => console.error('[EMAIL]', err.message))
  })

  res.status(201).json(full)
}

// GET /api/classes/sessions/:sessionId/attendance  — check my status
export async function myAttendance(req, res) {
  const { sessionId } = req.params
  const session = await ClassSession.findByPk(sessionId)
  if (!session) return res.status(404).json({ error: 'Termin ne obstaja' })

  const attendance = await ClassAttendance.findOne({
    where: { class_session_id: sessionId, user_id: req.user.id },
  })

  res.json({ registered: !!attendance, status: attendance?.status || null })
}

// POST /api/classes/sessions/:sessionId/register
export async function registerSession(req, res) {
  const { sessionId } = req.params
  const userId = req.user.id

  const session = await ClassSession.findByPk(sessionId, {
    include: [{ model: ClassSchedule, as: 'schedule', include: [{ model: ClassType, as: 'classType' }] }],
  })
  if (!session || session.status === 'cancelled') {
    return res.status(404).json({ error: 'Termin ne obstaja ali je preklican' })
  }

  // Must have active subscription for this class type
  const sub = await Subscription.findOne({
    where: { user_id: userId, class_type_id: session.class_type_id, status: 'active' },
  })
  if (!sub) return res.status(403).json({ error: 'Nimaš aktivne naročnine za to vadbo' })

  // Check if already registered
  const existing = await ClassAttendance.findOne({
    where: { class_session_id: sessionId, user_id: userId },
  })
  if (existing) return res.status(409).json({ error: 'Že si prijavljen na ta termin' })

  // Count registered (non-waitlist)
  const capacity = session.schedule.classType.capacity
  const registered = await ClassAttendance.count({
    where: { class_session_id: sessionId, status: { [Op.in]: ['registered', 'attended'] } },
  })

  const status = registered >= capacity ? 'waitlisted' : 'registered'

  const attendance = await ClassAttendance.create({
    subscription_id: sub.id,
    class_session_id: sessionId,
    user_id: userId,
    status,
    registered_at: new Date(),
  })

  res.status(201).json({
    status: attendance.status,
    message: status === 'waitlisted' ? 'Dodan na čakalno listo' : 'Uspešno prijavljen',
  })
}

// DELETE /api/classes/sessions/:sessionId/register
export async function unregisterSession(req, res) {
  const { sessionId } = req.params
  const userId = req.user.id

  const attendance = await ClassAttendance.findOne({
    where: { class_session_id: sessionId, user_id: userId },
  })
  if (!attendance) return res.status(404).json({ error: 'Nisi prijavljen na ta termin' })

  const wasRegistered = attendance.status === 'registered'
  await attendance.destroy()

  // If a spot opened up, promote first waitlisted person
  if (wasRegistered) {
    const next = await ClassAttendance.findOne({
      where: { class_session_id: sessionId, status: 'waitlisted' },
      order: [['registered_at', 'ASC']],
    })
    if (next) {
      next.status = 'registered'
      await next.save()
    }
  }

  res.json({ message: 'Uspešno odjavljen' })
}
