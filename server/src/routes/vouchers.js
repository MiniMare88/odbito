import express from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import {
  redeemVoucher,
  getBalance,
  getMyVouchers,
  createPurchaseIntent,
  confirmPurchase,
  adminGenerateVouchers,
  adminListVouchers,
  adminVoucherStats,
  adminExpireVoucher,
} from '../controllers/voucherController.js'

const router = express.Router()

// ── Customer routes (authenticated) ──────────────────────────────────────────
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
