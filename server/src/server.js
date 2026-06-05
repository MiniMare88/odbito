import 'dotenv/config'
import app from './app.js'
import { sequelize } from './models/index.js'
import { ensureDefaultStatuses } from './controllers/applicationController.js'
import { seedDefaultSchedule } from './controllers/parkScheduleController.js'

const PORT = process.env.PORT || 3001

async function start() {
  try {
    await sequelize.authenticate()
    console.log('Database connected.')
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true })
      console.log('Database synced.')
    }
    await ensureDefaultStatuses()
    await seedDefaultSchedule()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
