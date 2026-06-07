import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const CustomerBalance = sequelize.define('CustomerBalance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  balance_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
}, {
  tableName: 'customer_balances',
  underscored: true,
})

export default CustomerBalance
