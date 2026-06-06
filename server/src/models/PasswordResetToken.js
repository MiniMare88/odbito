import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const PasswordResetToken = sequelize.define('PasswordResetToken', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  token_hash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  expires_at: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: 'password_reset_tokens',
  underscored: true,
})

export default PasswordResetToken
