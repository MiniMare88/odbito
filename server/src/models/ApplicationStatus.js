import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const ApplicationStatus = sequelize.define('ApplicationStatus', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  label: { type: DataTypes.STRING(100), allowNull: false },
  color: { type: DataTypes.STRING(20), allowNull: false, defaultValue: '#6b7280' },
  is_staff_trigger: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  tableName: 'application_statuses',
  underscored: true,
})

export default ApplicationStatus
