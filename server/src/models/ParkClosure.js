import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const ParkClosure = sequelize.define('ParkClosure', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATEONLY, allowNull: false, unique: true },
  reason_sl: { type: DataTypes.STRING, allowNull: true },
  reason_en: { type: DataTypes.STRING, allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
}, {
  tableName: 'park_closures',
  underscored: true,
  updatedAt: false,
})

export default ParkClosure
