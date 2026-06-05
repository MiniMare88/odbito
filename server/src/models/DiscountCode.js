import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const DiscountCode = sequelize.define('DiscountCode', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  type: { type: DataTypes.ENUM('percentage', 'fixed'), allowNull: false },
  value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  max_uses: { type: DataTypes.INTEGER, allowNull: true },
  uses_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  single_use_per_customer: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  expires_at: { type: DataTypes.DATE, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  created_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
}, {
  tableName: 'discount_codes',
  underscored: true,
})

export default DiscountCode
