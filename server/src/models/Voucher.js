import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const Voucher = sequelize.define('Voucher', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  type: { type: DataTypes.ENUM('purchase', 'promotional', 'refund'), allowNull: false },
  denomination: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('unused', 'used', 'expired'), allowNull: false, defaultValue: 'unused' },
  issued_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  redeemed_by: { type: DataTypes.INTEGER, allowNull: true },
  redeemed_at: { type: DataTypes.DATE, allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: true }, // null = system
  booking_id: { type: DataTypes.INTEGER, allowNull: true }, // for refund vouchers
  booking_type: { type: DataTypes.ENUM('open_jump', 'birthday'), allowNull: true },
  stripe_payment_intent_id: { type: DataTypes.STRING, allowNull: true },
  remaining_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true }, // null = denomination (backwards compat)
}, {
  tableName: 'vouchers',
  underscored: true,
})

export default Voucher
