import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const ClassAttendance = sequelize.define('ClassAttendance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  subscription_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'subscriptions', key: 'id' } },
  class_session_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'class_sessions', key: 'id' } },
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  status: { type: DataTypes.ENUM('registered', 'attended', 'absent', 'waitlisted'), allowNull: false, defaultValue: 'registered' },
  registered_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  checked_in_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'class_attendance',
  underscored: true,
  timestamps: false,
  indexes: [{ unique: true, fields: ['subscription_id', 'class_session_id'] }],
})

export default ClassAttendance
