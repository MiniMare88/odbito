import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const WaiverVersion = sequelize.define('WaiverVersion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  version: { type: DataTypes.STRING, allowNull: false, unique: true },
  content_sl: { type: DataTypes.TEXT, allowNull: false },
  content_en: { type: DataTypes.TEXT, allowNull: false },
  is_current: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  tableName: 'waiver_versions',
  underscored: true,
  updatedAt: false,
})

export default WaiverVersion
