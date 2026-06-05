import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const BirthdayBooking = sequelize.define('BirthdayBooking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // Optional link to registered user
  user_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },

  // Package from pricing.json
  package_id:    { type: DataTypes.ENUM('bd_basic', 'bd_standard', 'bd_premium'), allowNull: false },
  package_label: { type: DataTypes.STRING, allowNull: false },

  // Pricing snapshot at time of booking
  base_price:           { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  extra_price_per_child: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  max_children:         { type: DataTypes.INTEGER, allowNull: false },
  children_count:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  extra_children:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  total_price:          { type: DataTypes.DECIMAL(10, 2), allowNull: false },

  // Event details
  event_date: { type: DataTypes.DATEONLY, allowNull: false },
  event_time: { type: DataTypes.STRING(5), allowNull: false }, // 'HH:MM'

  // Child info
  child_name: { type: DataTypes.STRING, allowNull: false },
  child_age:  { type: DataTypes.INTEGER, allowNull: false },

  // Contact (always required, even for guests)
  contact_first_name: { type: DataTypes.STRING, allowNull: false },
  contact_last_name:  { type: DataTypes.STRING, allowNull: false },
  contact_email:      { type: DataTypes.STRING, allowNull: false },
  contact_phone:      { type: DataTypes.STRING, allowNull: false },

  // Notes
  notes:       { type: DataTypes.TEXT, allowNull: true },
  admin_notes: { type: DataTypes.TEXT, allowNull: true },

  // Status flow: inquiry → confirmed → completed | cancelled
  status: {
    type: DataTypes.ENUM('inquiry', 'confirmed', 'cancelled', 'completed'),
    allowNull: false,
    defaultValue: 'inquiry',
  },

  // Unique booking reference
  booking_code: { type: DataTypes.UUID, allowNull: false, unique: true, defaultValue: DataTypes.UUIDV4 },

  // Cancellation tracking
  cancelled_by: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
  cancelled_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'birthday_bookings',
  underscored: true,
})

export default BirthdayBooking
