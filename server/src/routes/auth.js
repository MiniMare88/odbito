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
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
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

router.post('/verify-email', [body('token').notEmpty()], validate, verifyEmail)
router.post('/resend-verification', [body('email').isEmail()], validate, resendVerification)
router.post('/forgot-password', [body('email').isEmail()], validate, forgotPassword)
router.post('/reset-password', [
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  body('confirmPassword').notEmpty(),
], validate, resetPassword)

export default router
