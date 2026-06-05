import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const SeasonalPlanPrice = sequelize.define('SeasonalPlanPrice', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  seasonal_plan_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'seasonal_plans', key: 'id' } },
  class_type_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'class_types', key: 'id' } },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
  tableName: 'seasonal_plan_prices',
  underscored: true,
  timestamps: false,
})

export default SeasonalPlanPrice
