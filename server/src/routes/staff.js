import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import {
  todayOpenJump,
  checkInOpenJump,
  todayClasses,
  checkInClass,
  staffStats,
} from '../controllers/staffController.js'

const router = Router()

// All staff routes require staff or admin role
router.use(requireAuth, requireRole('staff', 'admin'))

router.get('/stats', staffStats)
router.get('/openjump/today', todayOpenJump)
router.post('/openjump/checkin', checkInOpenJump)
router.get('/classes/today', todayClasses)
router.post('/classes/checkin/:attendanceId', checkInClass)

export default router
