import { Op } from 'sequelize'
import Application from '../models/Application.js'
import ApplicationStatus from '../models/ApplicationStatus.js'

// Seed default statuses if none exist
export async function ensureDefaultStatuses() {
  const count = await ApplicationStatus.count()
  if (count > 0) return
  await ApplicationStatus.bulkCreate([
    { label: 'Nova prijava',         color: '#3b82f6', is_staff_trigger: false, sort_order: 0 },
    { label: 'V obravnavi',          color: '#eab308', is_staff_trigger: false, sort_order: 1 },
    { label: 'Povabljen na razgovor',color: '#f97316', is_staff_trigger: false, sort_order: 2 },
    { label: 'Zaposlen',             color: '#22c55e', is_staff_trigger: true,  sort_order: 3 },
    { label: 'Zavrnjen',             color: '#ef4444', is_staff_trigger: false, sort_order: 4 },
    { label: 'Na čakanju',           color: '#6b7280', is_staff_trigger: false, sort_order: 5 },
  ])
}

// GET /api/admin/applications
export async function getApplications(req, res) {
  const { status, role, search, dateFrom, dateTo, page = 1, limit = 25, sort = 'submitted_at', order = 'DESC' } = req.query

  const where = {}
  if (status)  where.status_id = status
  if (role)    where.desired_role = role
  if (search) {
    where[Op.or] = [
      { first_name: { [Op.iLike]: `%${search}%` } },
      { last_name:  { [Op.iLike]: `%${search}%` } },
      { email:      { [Op.iLike]: `%${search}%` } },
    ]
  }
  if (dateFrom || dateTo) {
    where.submitted_at = {}
    if (dateFrom) where.submitted_at[Op.gte] = new Date(dateFrom)
    if (dateTo)   where.submitted_at[Op.lte] = new Date(dateTo + 'T23:59:59')
  }

  const allowedSort = ['submitted_at', 'first_name', 'last_name', 'email', 'desired_role']
  const col = allowedSort.includes(sort) ? sort : 'submitted_at'
  const dir = order === 'ASC' ? 'ASC' : 'DESC'

  const { rows, count } = await Application.findAndCountAll({
    where,
    include: [{ model: ApplicationStatus, as: 'status', attributes: ['id', 'label', 'color', 'is_staff_trigger'] }],
    order: [[col, dir]],
    limit: Math.min(+limit, 100),
    offset: (Math.max(+page, 1) - 1) * Math.min(+limit, 100),
  })

  res.json({ applications: rows, total: count, page: +page })
}

// GET /api/admin/applications/:id
export async function getApplication(req, res) {
  const app = await Application.findByPk(req.params.id, {
    include: [{ model: ApplicationStatus, as: 'status' }],
  })
  if (!app) return res.status(404).json({ error: 'Prijava ne obstaja' })
  res.json(app)
}

// POST /api/admin/applications  (public — from website form, no auth)
export async function createApplication(req, res) {
  const { first_name, last_name, email, phone, desired_role, availability, message } = req.body
  if (!first_name || !last_name || !email || !desired_role) {
    return res.status(400).json({ error: 'Manjkajo obvezna polja' })
  }

  // Find default status (Nova prijava)
  const defaultStatus = await ApplicationStatus.findOne({ order: [['sort_order', 'ASC']] })

  const app = await Application.create({
    first_name, last_name, email, phone, desired_role,
    availability, message,
    status_id: defaultStatus?.id || null,
    submitted_at: new Date(),
  })
  res.status(201).json(app)
}

// PATCH /api/admin/applications/:id
export async function updateApplication(req, res) {
  const app = await Application.findByPk(req.params.id)
  if (!app) return res.status(404).json({ error: 'Prijava ne obstaja' })

  const allowed = ['status_id', 'admin_notes', 'first_name', 'last_name', 'email', 'phone', 'desired_role', 'availability', 'message']
  allowed.forEach(f => { if (req.body[f] !== undefined) app[f] = req.body[f] })
  await app.save()

  const updated = await Application.findByPk(app.id, {
    include: [{ model: ApplicationStatus, as: 'status' }],
  })
  res.json(updated)
}

// DELETE /api/admin/applications/:id
export async function deleteApplication(req, res) {
  const app = await Application.findByPk(req.params.id)
  if (!app) return res.status(404).json({ error: 'Prijava ne obstaja' })
  await app.destroy()
  res.json({ message: 'Izbrisano' })
}

// POST /api/admin/applications/bulk
export async function bulkUpdateApplications(req, res) {
  const { ids, action, status_id } = req.body
  if (!ids?.length) return res.status(400).json({ error: 'Ni izbranih prijav' })

  if (action === 'status' && status_id) {
    await Application.update({ status_id }, { where: { id: { [Op.in]: ids } } })
    return res.json({ message: `Posodobljeno ${ids.length} prijav` })
  }
  if (action === 'delete') {
    await Application.destroy({ where: { id: { [Op.in]: ids } } })
    return res.json({ message: `Izbrisano ${ids.length} prijav` })
  }
  res.status(400).json({ error: 'Neznano dejanje' })
}

// ── Statuses ──────────────────────────────────────────────────────────

// GET /api/admin/application-statuses
export async function getStatuses(req, res) {
  const statuses = await ApplicationStatus.findAll({ order: [['sort_order', 'ASC']] })
  res.json(statuses)
}

// POST /api/admin/application-statuses
export async function createStatus(req, res) {
  const { label, color, is_staff_trigger, sort_order } = req.body
  if (!label) return res.status(400).json({ error: 'Manjka naziv' })
  const s = await ApplicationStatus.create({ label, color: color || '#6b7280', is_staff_trigger: !!is_staff_trigger, sort_order: sort_order || 0 })
  res.status(201).json(s)
}

// PATCH /api/admin/application-statuses/:id
export async function updateStatus(req, res) {
  const s = await ApplicationStatus.findByPk(req.params.id)
  if (!s) return res.status(404).json({ error: 'Status ne obstaja' })
  const allowed = ['label', 'color', 'is_staff_trigger', 'sort_order']
  allowed.forEach(f => { if (req.body[f] !== undefined) s[f] = req.body[f] })
  await s.save()
  res.json(s)
}

// DELETE /api/admin/application-statuses/:id
export async function deleteStatus(req, res) {
  const s = await ApplicationStatus.findByPk(req.params.id)
  if (!s) return res.status(404).json({ error: 'Status ne obstaja' })
  await s.destroy()
  res.json({ message: 'Izbrisano' })
}
