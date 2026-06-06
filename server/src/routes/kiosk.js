import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { kioskRegister, kioskWaiver } from '../controllers/kioskController.js'

const router = Router()

function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  next()
}

// Public: get current waiver text for display
router.get('/waiver', kioskWaiver)

// Register via kiosk (secret validated inside controller)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty(),
  body('phone').trim().notEmpty(),
  body('date_of_birth').isDate(),
  body('secret').notEmpty(),
], validate, kioskRegister)

export default router
