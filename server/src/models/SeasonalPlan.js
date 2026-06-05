import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const SeasonalPlan = sequelize.define('SeasonalPlan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name_sl: { type: DataTypes.STRING, allowNull: false },
  name_en: { type: DataTypes.STRING, allowNull: false },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'seasonal_plans',
  underscored: true,
})

export default SeasonalPlan
