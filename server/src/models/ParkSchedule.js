import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

// Tedenska shema (7 vrstic, ena na dan v tednu, se ponavlja)
const ParkSchedule = sequelize.define('ParkSchedule', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  day_of_week: { type: DataTypes.INTEGER, allowNull: false, unique: true }, // 0=Ned, 1=Pon, ..., 6=Sob
  is_open:     { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  open_time:   { type: DataTypes.STRING(5), allowNull: true },   // 'HH:MM'
  close_time:  { type: DataTypes.STRING(5), allowNull: true },   // 'HH:MM'
  notes:       { type: DataTypes.STRING, allowNull: true },
  updated_by:  { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'park_schedules',
  underscored: true,
})

export default ParkSchedule
