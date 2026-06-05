import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const StaffMember = sequelize.define('StaffMember', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: 'users', key: 'id' },
  },
  primary_role: {
    type: DataTypes.ENUM('animator', 'trener', 'pomocnik_trenerja'),
    allowNull: true,
  },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'staff_members',
  underscored: true,
})

export default StaffMember
