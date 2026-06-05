import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const WorkBlockProposal = sequelize.define('WorkBlockProposal', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  staff_member_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'staff_members', key: 'id' },
  },
  proposed_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  hour_start: { type: DataTypes.INTEGER, allowNull: false }, // e.g. 9
  hour_end:   { type: DataTypes.INTEGER, allowNull: false }, // e.g. 13 (exclusive)
  role: { type: DataTypes.STRING(50), allowNull: true },
  segment: {
    type: DataTypes.ENUM('akademija', 'open_jump'),
    allowNull: true,
  },
  note: { type: DataTypes.STRING(300), allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  },
  rejection_reason: { type: DataTypes.STRING(300), allowNull: true },
  proposed_at:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  responded_at: { type: DataTypes.DATE, allowNull: true },
  locked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  tableName: 'work_block_proposals',
  underscored: true,
})

export default WorkBlockProposal
