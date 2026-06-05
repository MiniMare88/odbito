import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const Subscription = sequelize.define('Subscription', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  class_type_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'class_types', key: 'id' } },
  plan_type: { type: DataTypes.ENUM('monthly', 'yearly', 'seasonal'), allowNull: false },
  seasonal_plan_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'seasonal_plans', key: 'id' } },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  discount_code_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'discount_codes', key: 'id' } },
  discount_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  stripe_payment_intent_id: { type: DataTypes.STRING, allowNull: true },
  payment_status: { type: DataTypes.ENUM('pending', 'paid', 'refunded'), allowNull: false, defaultValue: 'pending' },
  status: { type: DataTypes.ENUM('active', 'expired', 'cancelled'), allowNull: false, defaultValue: 'active' },
  expiry_reminder_sent_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'subscriptions',
  underscored: true,
})

export default Subscription
