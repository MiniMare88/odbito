import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.js'
import openJumpRoutes from './routes/openJump.js'
import classRoutes from './routes/classes.js'
import staffRoutes from './routes/staff.js'
import adminRoutes from './routes/admin.js'
import applicationRoutes from './routes/applications.js'
import scheduleRoutes from './routes/schedule.js'
import birthdayRoutes from './routes/birthday.js'
import parkScheduleRoutes from './routes/parkSchedule.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5174',
    'http://localhost:5174',
    'http://127.0.0.1:5175',
    'http://localhost:5175',
    'http://127.0.0.1:5176',
    'http://localhost:5176',
  ],
  credentials: true,
}))

// Raw body for Stripe webhook
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.use('/api/auth', authRoutes)
app.use('/api/openjump', openJumpRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/schedule', scheduleRoutes)
app.use('/api/birthday', birthdayRoutes)
app.use('/api/park-schedule', parkScheduleRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

export default app
