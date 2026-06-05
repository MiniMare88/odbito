import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import {
  listStaff, getManagerWeek, getManagerDay,
  proposeBlock, unlockBlock, deleteBlock,
  getMyWeek, setAvailability,
  getNotifications, markAllRead, respondToProposal,
} from '../controllers/scheduleController.js'

const router = Router()
router.use(requireAuth)

// ── Admin/manager routes ──────────────────────────────────────────────
router.get('/manager/staff',        requireRole('admin'), listStaff)
router.get('/manager/week',         requireRole('admin'), getManagerWeek)
router.get('/manager/day',          requireRole('admin'), getManagerDay)
router.post('/manager/propose',     requireRole('admin'), proposeBlock)
router.patch('/manager/proposals/:id/unlock', requireRole('admin'), unlockBlock)
router.delete('/manager/proposals/:id',       requireRole('admin'), deleteBlock)

// ── Staff routes (staff or admin can access own schedule) ─────────────
router.get('/my/week',             requireRole('staff','admin'), getMyWeek)
router.put('/my/availability',     requireRole('staff','admin'), setAvailability)
router.get('/my/notifications',    requireRole('staff','admin'), getNotifications)
router.patch('/my/notifications/read-all', requireRole('staff','admin'), markAllRead)
router.post('/my/proposals/:id/respond',  requireRole('staff','admin'), respondToProposal)

export default router
