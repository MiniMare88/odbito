import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import {
  getWeeklySchedule, updateWeeklySchedule,
  getOverrides, createOverride, deleteOverride,
  getScheduleForDay, getScheduleRange,
} from '../controllers/parkScheduleController.js'

const router = Router()

// ── Public ────────────────────────────────────────────────────────────
router.get('/weekly',  getWeeklySchedule)
router.get('/day',     getScheduleForDay)
router.get('/range',   getScheduleRange)

// ── Admin ─────────────────────────────────────────────────────────────
router.put('/weekly',           requireAuth, requireRole('admin'), updateWeeklySchedule)
router.get('/overrides',        requireAuth, requireRole('admin'), getOverrides)
router.post('/overrides',       requireAuth, requireRole('admin'), createOverride)
router.delete('/overrides/:id', requireAuth, requireRole('admin'), deleteOverride)

export default router
