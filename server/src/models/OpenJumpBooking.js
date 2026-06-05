import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const OpenJumpBooking = sequelize.define('OpenJumpBooking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME, allowNull: false },
  duration_hours: { type: DataTypes.DECIMAL(3, 1), allowNull: false },
  participants: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  price_per_person: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discount_code_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'discount_codes', key: 'id' } },
  discount_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  stripe_payment_intent_id: { type: DataTypes.STRING, allowNull: true },
  payment_status: { type: DataTypes.ENUM('pending', 'paid', 'refunded'), allowNull: false, defaultValue: 'pending' },
  booking_code: { type: DataTypes.UUID, allowNull: false, unique: true, defaultValue: DataTypes.UUIDV4 },
  status: { type: DataTypes.ENUM('confirmed', 'cancelled', 'checked_in'), allowNull: false, defaultValue: 'confirmed' },
  checked_in_at: { type: DataTypes.DATE, allowNull: true },
  cancelled_by: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
  cancelled_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'open_jump_bookings',
  underscored: true,
})

export default OpenJumpBooking
