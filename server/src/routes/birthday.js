import { Router } from 'express'
import { body, query, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { requireAuth, requireRole } from '../middleware/auth.js'
import {
  getPackages, checkAvailability, createBirthdayBooking, myBirthdayBookings,
  adminListBirthday, adminBirthdayStats, adminUpdateStatus, adminUpdateNotes,
} from '../controllers/birthdayController.js'

const router = Router()

function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })
  next()
}

// Attach user if valid token present, but don't require it
function optionalAuth(req, res, next) {
  const token = req.cookies?.access_token || req.headers.authorization?.replace('Bearer ', '')
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET) } catch {}
  }
  next()
}

// ── Public ────────────────────────────────────────────────────────────

router.get('/packages', getPackages)

router.get('/availability', [
  query('date').matches(/^\d{4}-\d{2}-\d{2}$/),
], validate, checkAvailability)

router.post('/book', optionalAuth, [
  body('package_id').isIn(['bd_basic', 'bd_standard', 'bd_premium']),
  body('event_date').matches(/^\d{4}-\d{2}-\d{2}$/),
  body('event_time').matches(/^\d{2}:\d{2}$/),
  body('child_name').notEmpty().trim(),
  body('child_age').isInt({ min: 1, max: 18 }),
  body('children_count').isInt({ min: 1, max: 30 }),
  body('contact_first_name').notEmpty().trim(),
  body('contact_last_name').notEmpty().trim(),
  body('contact_email').isEmail().normalizeEmail(),
  body('contact_phone').notEmpty().trim(),
], validate, createBirthdayBooking)

router.get('/my-bookings', requireAuth, myBirthdayBookings)

// ── Admin ─────────────────────────────────────────────────────────────

router.get('/admin/list',  requireAuth, requireRole('admin'), adminListBirthday)
router.get('/admin/stats', requireAuth, requireRole('admin'), adminBirthdayStats)

router.patch('/admin/:id/status', requireAuth, requireRole('admin'), [
  body('status').isIn(['inquiry', 'confirmed', 'cancelled', 'completed']),
], validate, adminUpdateStatus)

router.patch('/admin/:id/notes', requireAuth, requireRole('admin'), adminUpdateNotes)

export default router
