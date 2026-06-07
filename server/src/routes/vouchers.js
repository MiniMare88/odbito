import express from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
const requireAdmin = requireRole('admin')
import {
  redeemVoucher,
  getBalance,
  getMyVouchers,
  createPurchaseIntent,
  confirmPurchase,
  validateVoucherCode,
  adminGenerateVouchers,
  adminListVouchers,
  adminVoucherStats,
  adminExpireVoucher,
} from '../controllers/voucherController.js'

const router = express.Router()

// ── Customer routes (authenticated) ──────────────────────────────────────────
router.post('/validate-code', requireAuth, validateVoucherCode)
router.post('/redeem', requireAuth, redeemVoucher)
router.get('/balance', requireAuth, getBalance)
router.get('/my', requireAuth, getMyVouchers)
router.post('/purchase/intent', requireAuth, createPurchaseIntent)
router.post('/purchase/confirm', requireAuth, confirmPurchase)

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/admin/list', requireAuth, requireAdmin, adminListVouchers)
router.get('/admin/stats', requireAuth, requireAdmin, adminVoucherStats)
router.post('/admin/generate', requireAuth, requireAdmin, adminGenerateVouchers)
router.patch('/admin/:id/expire', requireAuth, requireAdmin, adminExpireVoucher)

export default router
