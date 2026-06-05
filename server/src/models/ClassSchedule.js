import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

const ClassSchedule = sequelize.define('ClassSchedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  class_type_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'class_types', key: 'id' } },
  day_of_week: { type: DataTypes.INTEGER, allowNull: false, comment: '1=Mon, 2=Tue, 3=Wed, 4=Thu' },
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'class_schedules',
  underscored: true,
})

export default ClassSchedule
