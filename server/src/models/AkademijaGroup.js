import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

// Posamezna vadbena skupina Odbite Akademije
// day_schedules: JSON array e.g. [{day:"pon",start:"15:00",end:"16:00"},{day:"sre",start:"16:00",end:"17:00"}]
// days / time_start / time_end kept for backward compat
const AkademijaGroup = sequelize.define('AkademijaGroup', {
  id:                    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:                  { type: DataTypes.STRING(20),  allowNull: false },          // "5.1"
  program:               { type: DataTypes.STRING(80),  allowNull: false },          // "Gimnastika"
  age_range:             { type: DataTypes.STRING(30),  allowNull: true },           // legacy: "11–13 let"
  age_from:              { type: DataTypes.INTEGER,     allowNull: true },           // 11
  age_to:                { type: DataTypes.INTEGER,     allowNull: true },           // 13
  color_hex:             { type: DataTypes.STRING(7),   allowNull: false, defaultValue: '#A8C8E8' },
  days:                  { type: DataTypes.JSONB,       allowNull: false, defaultValue: [] }, // legacy: ["pon","sre"]
  day_schedules:         { type: DataTypes.JSONB,       allowNull: true },           // [{day,start,end}]
  time_start:            { type: DataTypes.STRING(5),   allowNull: true },           // legacy "15:00"
  time_end:              { type: DataTypes.STRING(5),   allowNull: true },           // legacy "15:30"
  trainer_id:            { type: DataTypes.INTEGER,     allowNull: true },
  assistant_trainer_id:  { type: DataTypes.INTEGER,     allowNull: true },
  sort_order:            { type: DataTypes.INTEGER,     allowNull: false, defaultValue: 0 },
  is_active:             { type: DataTypes.BOOLEAN,     allowNull: false, defaultValue: true },
  notes:                 { type: DataTypes.TEXT,        allowNull: true },
}, {
  tableName: 'akademija_groups',
  underscored: true,
})

export default AkademijaGroup
