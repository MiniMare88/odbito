import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { kioskRegister, kioskWaiver } from '../controllers/kioskController.js'

const router = Router()

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
