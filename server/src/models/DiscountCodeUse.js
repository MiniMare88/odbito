import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const DiscountCodeUse = sequelize.define('DiscountCodeUse', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  discount_code_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'discount_codes', key: 'id' } },
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  booking_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'open_jump_bookings', key: 'id' } },
  subscription_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'subscriptions', key: 'id' } },
  used_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'discount_code_uses',
  underscored: true,
  timestamps: false,
})

export default DiscountCodeUse
