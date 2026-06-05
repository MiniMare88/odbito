import { Router } from 'express'
import { body, query, validationResult } from 'express-validator'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { getSlots, createBooking, myBookings, getPackages, getBookingQr, getBookingIcs } from '../controllers/openJumpController.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pricing = require('../../data/pricing.json')
const VALID_PACKAGE_KEYS = pricing.openJump.packages.map(p => p.id)

const router = Router()

function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })
  next()
}

router.get('/packages', getPackages)

router.get('/slots', [
  query('date').matches(/^\d{4}-\d{2}-\d{2}$/),
], validate, getSlots)

router.post('/book', requireAuth, requireRole('customer', 'admin'), [
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/),
  body('start_time').matches(/^\d{2}:\d{2}$/),
  body('package_key').isIn(VALID_PACKAGE_KEYS),
  body('participants').optional().isInt({ min: 1, max: 50 }),
], validate, createBooking)

router.get('/my-bookings', requireAuth, myBookings)
router.get('/booking/:id/qr', requireAuth, getBookingQr)
router.get('/booking/:id/ics', requireAuth, getBookingIcs)

export default router
