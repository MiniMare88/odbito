import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

// Izjeme — specifični datumi, ki zamenjajo tedensko shemo
const ParkScheduleOverride = sequelize.define('ParkScheduleOverride', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date:       { type: DataTypes.DATEONLY, allowNull: false, unique: true },
  is_open:    { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  open_time:  { type: DataTypes.STRING(5), allowNull: true },
  close_time: { type: DataTypes.STRING(5), allowNull: true },
  reason:     { type: DataTypes.STRING, allowNull: true },  // npr. 'Šolske počitnice', 'Državni praznik'
  created_by: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'park_schedule_overrides',
  underscored: true,
})

export default ParkScheduleOverride
