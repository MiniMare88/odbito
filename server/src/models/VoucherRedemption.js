import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const VoucherRedemption = sequelize.define('VoucherRedemption', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  voucher_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  redeemed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  balance_before: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  balance_after: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
  tableName: 'voucher_redemptions',
  underscored: true,
  timestamps: false,
})

export default VoucherRedemption
