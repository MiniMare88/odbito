import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import {
  getClassTypes,
  getSchedule,
  mySubscriptions,
  subscribe,
  myAttendance,
  registerSession,
  unregisterSession,
} from '../controllers/classController.js'

const router = Router()

// Public
router.get('/types', getClassTypes)
router.get('/schedule', getSchedule)

// Authenticated
router.get('/my-subscriptions', requireAuth, mySubscriptions)
router.post('/subscribe', requireAuth, requireRole('customer'), subscribe)
router.get('/sessions/:sessionId/attendance', requireAuth, myAttendance)
router.post('/sessions/:sessionId/register', requireAuth, requireRole('customer'), registerSession)
router.delete('/sessions/:sessionId/register', requireAuth, requireRole('customer'), unregisterSession)

export default router
