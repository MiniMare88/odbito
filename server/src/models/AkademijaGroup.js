import { DataTypes } from 'sequelize'
import { sequelize } from './db.js'

// Posamezna vadbena skupina Odbite Akademije
// days: JSON array of day keys, e.g. ["pon","sre"]
const AkademijaGroup = sequelize.define('AkademijaGroup', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(20),  allowNull: false },          // "5.1"
  program:     { type: DataTypes.STRING(80),  allowNull: false },          // "Gimnastika"
  age_range:   { type: DataTypes.STRING(30),  allowNull: true },           // "11–13 let"
  color_hex:   { type: DataTypes.STRING(7),   allowNull: false, defaultValue: '#A8C8E8' },
  days:        { type: DataTypes.JSONB,       allowNull: false, defaultValue: [] }, // ["pon","sre"]
  time_start:  { type: DataTypes.STRING(5),   allowNull: false },          // "15:00"
  time_end:    { type: DataTypes.STRING(5),   allowNull: false },          // "15:30"
  sort_order:  { type: DataTypes.INTEGER,     allowNull: false, defaultValue: 0 },
  is_active:   { type: DataTypes.BOOLEAN,     allowNull: false, defaultValue: true },
  notes:       { type: DataTypes.TEXT,        allowNull: true },
}, {
  tableName: 'akademija_groups',
  underscored: true,
})

export default AkademijaGroup
