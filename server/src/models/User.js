import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: true },
  google_id: { type: DataTypes.STRING, allowNull: true, unique: true },
  first_name: { type: DataTypes.STRING, allowNull: false },
  last_name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  date_of_birth: { type: DataTypes.DATEONLY, allowNull: false },
  role: { type: DataTypes.ENUM('customer', 'staff', 'admin'), allowNull: false, defaultValue: 'customer' },
  preferred_language: { type: DataTypes.ENUM('sl', 'en'), allowNull: false, defaultValue: 'sl' },
  waiver_accepted_at: { type: DataTypes.DATE, allowNull: true },
  waiver_version: { type: DataTypes.STRING, allowNull: true },
  refresh_token_hash: { type: DataTypes.STRING, allowNull: true },
  is_blocked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  status: { type: DataTypes.ENUM('unverified', 'verified', 'suspended'), allowNull: false, defaultValue: 'unverified' },
  marketing_consent: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  registration_source: { type: DataTypes.ENUM('web', 'kiosk'), allowNull: false, defaultValue: 'web' },
}, {
  tableName: 'users',
  underscored: true,
})

export default User
