import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { requireAuth } from '../middleware/auth.js'
import {
  register,
  login,
  refresh,
  logout,
  googleAuth,
  acceptWaiver,
  getWaiver,
  me,
  updateMe,
} from '../controllers/authController.js'

const router = Router()

function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })
  next()
}

router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('first_name').notEmpty(),
  body('last_name').notEmpty(),
  body('phone').notEmpty(),
  body('date_of_birth').isDate(),
], validate, register)

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], validate, login)

router.post('/refresh', refresh)
router.post('/logout', logout)
router.post('/google', [body('id_token').notEmpty()], validate, googleAuth)

router.get('/waiver', getWaiver)
router.post('/accept-waiver', requireAuth, acceptWaiver)

router.get('/me', requireAuth, me)
router.patch('/me', requireAuth, updateMe)

export default router
