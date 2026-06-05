import { Op } from 'sequelize'
import ParkSchedule from '../models/ParkSchedule.js'
import ParkScheduleOverride from '../models/ParkScheduleOverride.js'

// ── Core helper (used by openJumpController too) ──────────────────────

export async function getEffectiveSchedule(date) {
  // 1. Check override for this specific date
  const override = await ParkScheduleOverride.findOne({ where: { date } })
  if (override) {
    return {
      is_open:    override.is_open,
      open_time:  override.open_time,
      close_time: override.close_time,
      source:     'override',
      reason:     override.reason,
    }
  }
  // 2. Fall back to weekly schedule
  const dow = new Date(date + 'T12:00:00').getDay()
  const weekly = await ParkSchedule.findOne({ where: { day_of_week: dow } })
  if (!weekly) return { is_open: false, source: 'weekly' }
  return {
    is_open:    weekly.is_open,
    open_time:  weekly.open_time,
    close_time: weekly.close_time,
    source:     'weekly',
  }
}

// ── GET /api/park-schedule/weekly (public) ────────────────────────────

export async function getWeeklySchedule(req, res) {
  const rows = await ParkSchedule.findAll({ order: [['day_of_week', 'ASC']] })
  res.json(rows)
}

// ── PUT /api/park-schedule/weekly (admin) ─────────────────────────────

export async function updateWeeklySchedule(req, res) {
  const { days } = req.body  // array of { day_of_week, is_open, open_time, close_time, notes }
  if (!Array.isArray(days) || days.length === 0)
    return res.status(400).json({ error: 'Manjka polje days' })

  const results = []
  for (const d of days) {
    const [row] = await ParkSchedule.upsert({
      day_of_week: d.day_of_week,
      is_open:    !!d.is_open,
      open_time:  d.is_open ? (d.open_time  || null) : null,
      close_time: d.is_open ? (d.close_time || null) : null,
      notes:      d.notes || null,
      updated_by: req.user.id,
    }, { returning: true })
    results.push(row)
  }
  res.json(results)
}

// ── GET /api/park-schedule/overrides?from=&to= (admin) ────────────────

export async function getOverrides(req, res) {
  const { from, to } = req.query
  const where = {}
  if (from || to) {
    where.date = {}
    if (from) where.date[Op.gte] = from
    if (to)   where.date[Op.lte] = to
  }
  const rows = await ParkScheduleOverride.findAll({
    where,
    order: [['date', 'ASC']],
  })
  res.json(rows)
}

// ── POST /api/park-schedule/overrides (admin) ─────────────────────────
// Podpira enkratni datum ali razpon datumov (date_from + date_to)

export async function createOverride(req, res) {
  const { date_from, date_to, is_open, open_time, close_time, reason } = req.body

  if (!date_from) return res.status(400).json({ error: 'Manjka datum' })

  // Generiraj seznam datumov
  const dates = []
  const start = new Date(date_from + 'T12:00:00')
  const end   = date_to ? new Date(date_to + 'T12:00:00') : start
  if (end < start) return res.status(400).json({ error: 'Datum do mora biti za datum od' })
  const diff = Math.floor((end - start) / 86400000)
  if (diff > 90) return res.status(400).json({ error: 'Razpon ne sme biti daljši od 90 dni' })

  for (let i = 0; i <= diff; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }

  const created = []
  for (const date of dates) {
    const [row] = await ParkScheduleOverride.upsert({
      date,
      is_open:    !!is_open,
      open_time:  is_open ? (open_time  || null) : null,
      close_time: is_open ? (close_time || null) : null,
      reason:     reason || null,
      created_by: req.user.id,
    }, { returning: true })
    created.push(row)
  }
  res.status(201).json(created)
}

// ── DELETE /api/park-schedule/overrides/:id (admin) ───────────────────

export async function deleteOverride(req, res) {
  const row = await ParkScheduleOverride.findByPk(req.params.id)
  if (!row) return res.status(404).json({ error: 'Ne obstaja' })
  await row.destroy()
  res.json({ message: 'Odstranjeno' })
}

// ── GET /api/park-schedule/day?date= (public) ─────────────────────────

export async function getScheduleForDay(req, res) {
  const { date } = req.query
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ error: 'Manjka datum' })
  const schedule = await getEffectiveSchedule(date)
  res.json({ date, ...schedule })
}

// ── GET /api/park-schedule/range?from=&to= (public) ───────────────────
// Vrne efektivni urnik za vsak datum v razponu

export async function getScheduleRange(req, res) {
  const { from, to } = req.query
  if (!from || !to) return res.status(400).json({ error: 'Manjka from ali to' })

  const start = new Date(from + 'T12:00:00')
  const end   = new Date(to   + 'T12:00:00')
  if (end < start) return res.status(400).json({ error: 'Neveljaven razpon' })
  const diff = Math.floor((end - start) / 86400000)
  if (diff > 366) return res.status(400).json({ error: 'Max 366 dni' })

  // Fetch all weekly + overrides in range at once
  const [weekly, overrides] = await Promise.all([
    ParkSchedule.findAll(),
    ParkScheduleOverride.findAll({ where: { date: { [Op.between]: [from, to] } } }),
  ])

  const weeklyMap    = Object.fromEntries(weekly.map(r => [r.day_of_week, r]))
  const overrideMap  = Object.fromEntries(overrides.map(r => [r.date, r]))

  const result = {}
  for (let i = 0; i <= diff; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const ov = overrideMap[dateStr]
    if (ov) {
      result[dateStr] = { is_open: ov.is_open, open_time: ov.open_time, close_time: ov.close_time, source: 'override' }
    } else {
      const dow = d.getDay()
      const w = weeklyMap[dow]
      result[dateStr] = w
        ? { is_open: w.is_open, open_time: w.open_time, close_time: w.close_time, source: 'weekly' }
        : { is_open: false, source: 'default' }
    }
  }
  res.json(result)
}

// ── Seed: ustvari privzete vrstice če tabela prazna ───────────────────

export async function seedDefaultSchedule() {
  const count = await ParkSchedule.count()
  if (count > 0) return  // že posejano

  const defaults = [
    { day_of_week: 0, is_open: true,  open_time: '09:00', close_time: '20:00' }, // Ned
    { day_of_week: 1, is_open: false, open_time: null,     close_time: null    }, // Pon
    { day_of_week: 2, is_open: false, open_time: null,     close_time: null    }, // Tor
    { day_of_week: 3, is_open: false, open_time: null,     close_time: null    }, // Sre
    { day_of_week: 4, is_open: false, open_time: null,     close_time: null    }, // Čet
    { day_of_week: 5, is_open: true,  open_time: '15:00', close_time: '20:00' }, // Pet
    { day_of_week: 6, is_open: true,  open_time: '09:00', close_time: '21:00' }, // Sob
  ]
  await ParkSchedule.bulkCreate(defaults)
  console.log('[ParkSchedule] Privzete vrednosti ustvarjene.')
}
