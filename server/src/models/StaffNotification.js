import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const StaffNotification = sequelize.define('StaffNotification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  staff_member_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'staff_members', key: 'id' },
  },
  type: { type: DataTypes.STRING(50), allowNull: false }, // 'block_proposed','block_unlocked','block_rejected'
  message: { type: DataTypes.STRING(500), allowNull: false },
  block_proposal_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'work_block_proposals', key: 'id' },
  },
  read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  tableName: 'staff_notifications',
  underscored: true,
})

export default StaffNotification
