import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const ClassType = sequelize.define('ClassType', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name_sl: { type: DataTypes.STRING, allowNull: false },
  name_en: { type: DataTypes.STRING, allowNull: false },
  description_sl: { type: DataTypes.TEXT, allowNull: true },
  description_en: { type: DataTypes.TEXT, allowNull: true },
  capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 15 },
  color_hex: { type: DataTypes.STRING(7), allowNull: false, defaultValue: '#D4FF00' },
  price_monthly: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  price_yearly: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'class_types',
  underscored: true,
})

export default ClassType
