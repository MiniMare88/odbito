import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const Application = sequelize.define('Application', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  first_name: { type: DataTypes.STRING(100), allowNull: false },
  last_name:  { type: DataTypes.STRING(100), allowNull: false },
  email:      { type: DataTypes.STRING(255), allowNull: false },
  phone:      { type: DataTypes.STRING(30),  allowNull: true },
  desired_role: {
    type: DataTypes.ENUM('animator', 'trener', 'pomocnik_trenerja'),
    allowNull: false,
  },
  availability: { type: DataTypes.TEXT, allowNull: true },
  message:      { type: DataTypes.TEXT, allowNull: true },
  cv_url:       { type: DataTypes.STRING(500), allowNull: true },
  submitted_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  status_id:    {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'application_statuses', key: 'id' },
  },
  admin_notes: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'applications',
  underscored: true,
})

export default Application
