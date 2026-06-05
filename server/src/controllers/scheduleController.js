import { Op } from 'sequelize'
import StaffMember from '../models/StaffMember.js'
import StaffAvailability from '../models/StaffAvailability.js'
import WorkBlockProposal from '../models/WorkBlockProposal.js'
import StaffNotification from '../models/StaffNotification.js'
import User from '../models/User.js'

function pad(n) { return String(n).padStart(2, '0') }
function isoWeekStart(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const dow = d.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  const mon = new Date(d)
  mon.setDate(d.getDate() + diff)
  return mon.toISOString().split('T')[0]
}
function addDays(isoDate, n) {
  const d = new Date(isoDate + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}
function dayName(isoDate) {
  return new Date(isoDate + 'T12:00:00').toLocaleDateString('sl-SI', { weekday: 'long' })
}

// ── MANAGER ROUTES ────────────────────────────────────────────────────

// GET /api/admin/schedule/staff
export async function listStaff(req, res) {
  const members = await StaffMember.findAll({
    where: { is_active: true },
    include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] }],
    order: [[{ model: User, as: 'user' }, 'first_name', 'ASC']],
  })
  res.json(members)
}

// GET /api/admin/schedule/week?date=YYYY-MM-DD
// Returns: per-day status (covered/partial/empty) + all proposals for the week
export async function getManagerWeek(req, res) {
  const { date } = req.query
  if (!date) return res.status(400).json({ error: 'Manjka date' })
  const monday = isoWeekStart(date)
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  const [availability, proposals, staff] = await Promise.all([
    StaffAvailability.findAll({
      where: { date: { [Op.in]: days } },
      include: [{ model: StaffMember, as: 'staffMember',
        include: [{ model: User, as: 'user', attributes: ['id','first_name','last_name'] }] }],
    }),
    WorkBlockProposal.findAll({
      where: { date: { [Op.in]: days } },
      include: [{ model: StaffMember, as: 'staffMember',
        include: [{ model: User, as: 'user', attributes: ['id','first_name','last_name'] }] }],
    }),
    StaffMember.findAll({
      where: { is_active: true },
      include: [{ model: User, as: 'user', attributes: ['id','first_name','last_name'] }],
    }),
  ])

  // Build day summaries
  const daySummaries = days.map(d => {
    const dow = new Date(d + 'T12:00:00').getDay()
    const isOJ = dow === 0 || dow === 5 || dow === 6
    const isAkademija = dow >= 1 && dow <= 4
    const dayProposals = proposals.filter(p => p.date === d && p.status !== 'rejected')
    const dayAvail = availability.filter(a => a.date === d)

    // Status: green=has confirmed blocks, yellow=has pending, red=nothing
    let status = 'empty'
    if (dayProposals.some(p => p.status === 'confirmed')) status = 'confirmed'
    else if (dayProposals.some(p => p.status === 'pending')) status = 'partial'

    return { date: d, dayName: dayName(d), isOJ, isAkademija, status, proposalCount: dayProposals.length }
  })

  res.json({ monday, days: daySummaries, staff, proposals, availability })
}

// GET /api/admin/schedule/day?date=YYYY-MM-DD
export async function getManagerDay(req, res) {
  const { date } = req.query
  if (!date) return res.status(400).json({ error: 'Manjka date' })

  const [availability, proposals, staff] = await Promise.all([
    StaffAvailability.findAll({
      where: { date },
      include: [{ model: StaffMember, as: 'staffMember',
        include: [{ model: User, as: 'user', attributes: ['id','first_name','last_name'] }] }],
      order: [['hour', 'ASC']],
    }),
    WorkBlockProposal.findAll({
      where: { date },
      include: [{ model: StaffMember, as: 'staffMember',
        include: [{ model: User, as: 'user', attributes: ['id','first_name','last_name'] }] }],
      order: [['hour_start', 'ASC']],
    }),
    StaffMember.findAll({
      where: { is_active: true },
      include: [{ model: User, as: 'user', attributes: ['id','first_name','last_name','phone'] }],
    }),
  ])

  // Build per-hour grid (8..22)
  const hours = Array.from({ length: 15 }, (_, i) => i + 8)
  const hourGrid = hours.map(h => {
    const hourAvail = availability.filter(a => a.hour === h)
    const hourProposals = proposals.filter(p => p.hour_start <= h && p.hour_end > h && p.status !== 'rejected')
    return {
      hour: h,
      label: `${pad(h)}:00`,
      availability: hourAvail.map(a => ({
        staffMemberId: a.staff_member_id,
        name: `${a.staffMember.user.first_name} ${a.staffMember.user.last_name}`,
        status: a.status,
      })),
      proposals: hourProposals.map(p => ({
        id: p.id,
        staffMemberId: p.staff_member_id,
        name: `${p.staffMember.user.first_name} ${p.staffMember.user.last_name}`,
        role: p.role,
        status: p.status,
        locked: p.locked,
      })),
    }
  })

  res.json({ date, dayName: dayName(date), hourGrid, staff, proposals, availability })
}

// POST /api/admin/schedule/propose
export async function proposeBlock(req, res) {
  const { staff_member_id, date, hour_start, hour_end, role, segment, note } = req.body
  if (!staff_member_id || !date || hour_start == null || hour_end == null) {
    return res.status(400).json({ error: 'Manjkajo obvezna polja' })
  }
  if (hour_start >= hour_end) return res.status(400).json({ error: 'Neveljavne ure' })

  const member = await StaffMember.findByPk(staff_member_id, {
    include: [{ model: User, as: 'user', attributes: ['first_name','last_name'] }],
  })
  if (!member) return res.status(404).json({ error: 'Zaposleni ne obstaja' })

  // Check for overlapping confirmed/pending proposals for this staff member
  const existing = await WorkBlockProposal.findOne({
    where: {
      staff_member_id,
      date,
      status: { [Op.in]: ['pending', 'confirmed'] },
      hour_start: { [Op.lt]: hour_end },
      hour_end:   { [Op.gt]: hour_start },
    },
  })
  if (existing) return res.status(409).json({ error: 'Prekrivanje z obstoječim terminom' })

  const proposal = await WorkBlockProposal.create({
    staff_member_id,
    proposed_by: req.user.id,
    date, hour_start, hour_end, role, segment, note,
    proposed_at: new Date(),
  })

  // Create notification for staff member
  const d = new Date(date + 'T12:00:00').toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long' })
  await StaffNotification.create({
    staff_member_id,
    type: 'block_proposed',
    message: `Predlagan termin: ${d}, ${pad(hour_start)}:00–${pad(hour_end)}:00`,
    block_proposal_id: proposal.id,
  })

  res.status(201).json(proposal)
}

// PATCH /api/admin/schedule/proposals/:id/unlock
export async function unlockBlock(req, res) {
  const proposal = await WorkBlockProposal.findByPk(req.params.id)
  if (!proposal) return res.status(404).json({ error: 'Termin ne obstaja' })
  proposal.locked = false
  proposal.status = 'pending'
  proposal.responded_at = null
  await proposal.save()

  // Notify staff
  await StaffNotification.create({
    staff_member_id: proposal.staff_member_id,
    type: 'block_unlocked',
    message: `Termin ${proposal.date} ${pad(proposal.hour_start)}:00–${pad(proposal.hour_end)}:00 je bil odklenjen`,
    block_proposal_id: proposal.id,
  })
  res.json(proposal)
}

// DELETE /api/admin/schedule/proposals/:id
export async function deleteBlock(req, res) {
  const proposal = await WorkBlockProposal.findByPk(req.params.id)
  if (!proposal) return res.status(404).json({ error: 'Termin ne obstaja' })
  if (proposal.locked) return res.status(409).json({ error: 'Termin je zaklenjen' })
  await StaffNotification.destroy({ where: { block_proposal_id: proposal.id } })
  await proposal.destroy()
  res.json({ message: 'Izbrisano' })
}

// ── STAFF ROUTES ──────────────────────────────────────────────────────

async function getMyStaffMember(userId) {
  return StaffMember.findOne({ where: { user_id: userId, is_active: true } })
}

// GET /api/staff/urnik/week?date=YYYY-MM-DD
export async function getMyWeek(req, res) {
  const { date } = req.query
  if (!date) return res.status(400).json({ error: 'Manjka date' })
  const member = await getMyStaffMember(req.user.id)
  if (!member) return res.status(403).json({ error: 'Nisi član osebja' })

  const monday = isoWeekStart(date)
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  const [availability, proposals] = await Promise.all([
    StaffAvailability.findAll({
      where: { staff_member_id: member.id, date: { [Op.in]: days } },
      order: [['date', 'ASC'], ['hour', 'ASC']],
    }),
    WorkBlockProposal.findAll({
      where: { staff_member_id: member.id, date: { [Op.in]: days } },
      order: [['date', 'ASC'], ['hour_start', 'ASC']],
    }),
  ])

  const hours = Array.from({ length: 15 }, (_, i) => i + 8)

  const grid = days.map(d => ({
    date: d,
    dayName: dayName(d),
    hours: hours.map(h => {
      const avail = availability.find(a => a.date === d && a.hour === h)
      const proposal = proposals.find(p => p.date === d && p.hour_start <= h && p.hour_end > h && p.status !== 'rejected')
      return {
        hour: h,
        label: `${pad(h)}:00`,
        availability: avail?.status || null,
        proposal: proposal ? { id: proposal.id, status: proposal.status, locked: proposal.locked, hour_start: proposal.hour_start, hour_end: proposal.hour_end } : null,
      }
    }),
  }))

  res.json({ monday, grid, proposals })
}

// PUT /api/staff/urnik/availability
// Body: { date, hour, status }  or  { date, hours: [h1,h2,...], status }
export async function setAvailability(req, res) {
  const member = await getMyStaffMember(req.user.id)
  if (!member) return res.status(403).json({ error: 'Nisi član osebja' })

  const { date, hour, hours, status } = req.body
  const validStatuses = ['available', 'possible', 'unavailable', null]
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Neveljaven status' })

  const targetHours = hours || (hour != null ? [hour] : [])
  if (!targetHours.length || !date) return res.status(400).json({ error: 'Manjkajo polja' })

  // Can't change locked hours
  const lockedProposals = await WorkBlockProposal.findAll({
    where: { staff_member_id: member.id, date, status: 'confirmed', locked: true },
  })

  const results = []
  for (const h of targetHours) {
    const isLocked = lockedProposals.some(p => p.hour_start <= h && p.hour_end > h)
    if (isLocked) { results.push({ hour: h, error: 'Zaklenjen termin' }); continue }

    if (status === null) {
      await StaffAvailability.destroy({ where: { staff_member_id: member.id, date, hour: h } })
      results.push({ hour: h, status: null })
    } else {
      const [rec] = await StaffAvailability.upsert(
        { staff_member_id: member.id, date, hour: h, status },
        { conflictFields: ['staff_member_id', 'date', 'hour'] }
      )
      results.push({ hour: h, status })
    }
  }
  res.json({ results })
}

// GET /api/staff/urnik/notifications
export async function getNotifications(req, res) {
  const member = await getMyStaffMember(req.user.id)
  if (!member) return res.json({ notifications: [], unread: 0 })

  const notifications = await StaffNotification.findAll({
    where: { staff_member_id: member.id },
    include: [{ model: WorkBlockProposal, as: 'proposal' }],
    order: [['created_at', 'DESC']],
    limit: 50,
  })
  const unread = notifications.filter(n => !n.read).length
  res.json({ notifications, unread })
}

// PATCH /api/staff/urnik/notifications/read-all
export async function markAllRead(req, res) {
  const member = await getMyStaffMember(req.user.id)
  if (!member) return res.json({ ok: true })
  await StaffNotification.update({ read: true }, { where: { staff_member_id: member.id, read: false } })
  res.json({ ok: true })
}

// POST /api/staff/urnik/proposals/:id/respond
export async function respondToProposal(req, res) {
  const member = await getMyStaffMember(req.user.id)
  if (!member) return res.status(403).json({ error: 'Nisi član osebja' })

  const proposal = await WorkBlockProposal.findOne({
    where: { id: req.params.id, staff_member_id: member.id },
  })
  if (!proposal) return res.status(404).json({ error: 'Termin ne obstaja' })
  if (proposal.status !== 'pending') return res.status(409).json({ error: 'Termin je že bil odgovorjen' })

  const { response, rejection_reason } = req.body // response: 'confirm' | 'reject'
  if (!['confirm', 'reject'].includes(response)) return res.status(400).json({ error: 'Neveljaven odgovor' })

  proposal.status = response === 'confirm' ? 'confirmed' : 'rejected'
  proposal.locked = response === 'confirm'
  proposal.rejection_reason = response === 'reject' ? (rejection_reason || '') : null
  proposal.responded_at = new Date()
  await proposal.save()

  // Mark related notifications as read
  await StaffNotification.update(
    { read: true },
    { where: { staff_member_id: member.id, block_proposal_id: proposal.id } }
  )

  // If confirmed: upsert availability for those hours as "available" (locked)
  if (response === 'confirm') {
    for (let h = proposal.hour_start; h < proposal.hour_end; h++) {
      await StaffAvailability.upsert(
        { staff_member_id: member.id, date: proposal.date, hour: h, status: 'available' },
        { conflictFields: ['staff_member_id', 'date', 'hour'] }
      )
    }
  }

  res.json(proposal)
}
