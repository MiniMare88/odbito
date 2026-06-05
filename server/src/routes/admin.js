import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import {
  getStats, getBookings, getUsers, updateUserRole,
  getUser, updateUser, deleteUser, blockUser, unblockUser,
  getClosures, createClosure, deleteClosure,
  getDiscountCodes, createDiscountCode, toggleDiscountCode,
  getWaivers, createWaiver, activateWaiver,
  getClassTypes, updateClassType,
  cancelBooking,
  getOccupancy,
} from '../controllers/adminController.js'

const router = Router()
router.use(requireAuth, requireRole('admin'))

router.get('/stats', getStats)

router.get('/bookings', getBookings)
router.patch('/bookings/:id/cancel', cancelBooking)

router.get('/users', getUsers)
router.get('/users/:id', getUser)
router.patch('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)
router.patch('/users/:id/role', updateUserRole)
router.patch('/users/:id/block', blockUser)
router.patch('/users/:id/unblock', unblockUser)

router.get('/closures', getClosures)
router.post('/closures', createClosure)
router.delete('/closures/:id', deleteClosure)

router.get('/discount-codes', getDiscountCodes)
router.post('/discount-codes', createDiscountCode)
router.patch('/discount-codes/:id/toggle', toggleDiscountCode)

router.get('/waiver', getWaivers)
router.post('/waiver', createWaiver)
router.patch('/waiver/:id/activate', activateWaiver)

router.get('/class-types', getClassTypes)
router.patch('/class-types/:id', updateClassType)

router.get('/occupancy', getOccupancy)

export default router
