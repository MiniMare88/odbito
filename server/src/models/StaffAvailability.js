import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const StaffAvailability = sequelize.define('StaffAvailability', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  staff_member_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'staff_members', key: 'id' },
  },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  hour: { type: DataTypes.INTEGER, allowNull: false }, // 8..22
  status: {
    type: DataTypes.ENUM('available', 'possible', 'unavailable'),
    allowNull: false,
  },
}, {
  tableName: 'staff_availability',
  underscored: true,
  indexes: [{ unique: true, fields: ['staff_member_id', 'date', 'hour'] }],
})

export default StaffAvailability
