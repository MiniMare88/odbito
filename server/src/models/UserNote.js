import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const UserNote = sequelize.define('UserNote', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: false },
  content:    { type: DataTypes.TEXT, allowNull: false },
  created_by: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'user_notes',
  underscored: true,
})

export default UserNote
