import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const ClassSession = sequelize.define('ClassSession', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  class_schedule_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'class_schedules', key: 'id' } },
  class_type_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'class_types', key: 'id' } },
  session_date: { type: DataTypes.DATEONLY, allowNull: false },
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME, allowNull: false },
  status: { type: DataTypes.ENUM('scheduled', 'cancelled'), allowNull: false, defaultValue: 'scheduled' },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'class_sessions',
  underscored: true,
})

export default ClassSession
