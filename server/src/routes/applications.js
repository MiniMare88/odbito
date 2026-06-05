import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import {
  getApplications, getApplication, createApplication,
  updateApplication, deleteApplication, bulkUpdateApplications,
  getStatuses, createStatus, updateStatus, deleteStatus,
} from '../controllers/applicationController.js'

const router = Router()

// Public — from website contact/application form
router.post('/', createApplication)

// Admin only
router.use(requireAuth, requireRole('admin'))

router.get('/', getApplications)
router.get('/:id', getApplication)
router.patch('/:id', updateApplication)
router.delete('/:id', deleteApplication)
router.post('/bulk', bulkUpdateApplications)

router.get('/statuses/list', getStatuses)
router.post('/statuses', createStatus)
router.patch('/statuses/:id', updateStatus)
router.delete('/statuses/:id', deleteStatus)

export default router
