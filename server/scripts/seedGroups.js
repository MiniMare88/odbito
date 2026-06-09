// node scripts/seedGroups.js
// Seeda začetne vadbene skupine v tabelo akademija_groups
import '../src/models/AkademijaGroup.js'
import AkademijaGroup from '../src/models/AkademijaGroup.js'
import { sequelize } from '../src/models/db.js'
import dotenv from 'dotenv'
dotenv.config()

const GROUPS = [
  // ── Skupina 0 (pon, sre) ───────────────────────────────────────────
  { name: '0.1', program: 'Osnovna motorika', age_range: '3–4 let', color_hex: '#A8C8E8', days: ['pon','sre'], time_start: '15:00', time_end: '15:30', sort_order: 10 },
  { name: '0.2', program: 'Osnovna motorika', age_range: '3–4 let', color_hex: '#A8C8E8', days: ['pon','sre'], time_start: '15:00', time_end: '15:30', sort_order: 11 },
  // ── Skupina 1 (pon, sre) ───────────────────────────────────────────
  { name: '1.1', program: 'Osnove gimnastike', age_range: '4–6 let', color_hex: '#6B9FD4', days: ['pon','sre'], time_start: '17:00', time_end: '17:30', sort_order: 20 },
  { name: '1.2', program: 'Osnove gimnastike', age_range: '4–6 let', color_hex: '#6B9FD4', days: ['pon','sre'], time_start: '17:00', time_end: '17:30', sort_order: 21 },
  // ── Skupina 2 (tor, cet) ───────────────────────────────────────────
  { name: '2.1', program: 'Gimnastika Junior', age_range: '6–8 let', color_hex: '#5A8FCA', days: ['tor','cet'], time_start: '17:00', time_end: '17:30', sort_order: 30 },
  { name: '2.2', program: 'Gimnastika Junior', age_range: '6–8 let', color_hex: '#5A8FCA', days: ['tor','cet'], time_start: '17:00', time_end: '17:30', sort_order: 31 },
  // ── Skupina 3 (pon, sre) ───────────────────────────────────────────
  { name: '3.1', program: 'Cicibani', age_range: '8–10 let', color_hex: '#7BBFB8', days: ['pon','sre'], time_start: '17:30', time_end: '18:00', sort_order: 40 },
  { name: '3.2', program: 'Cicibani', age_range: '8–10 let', color_hex: '#7BBFB8', days: ['pon','sre'], time_start: '17:30', time_end: '18:00', sort_order: 41 },
  // ── Skupina 4 (tor, cet) ───────────────────────────────────────────
  { name: '4.1', program: 'Cicibani', age_range: '8–10 let', color_hex: '#7BBFB8', days: ['tor','cet'], time_start: '17:30', time_end: '18:00', sort_order: 50 },
  { name: '4.2', program: 'Gimnastika', age_range: '11–13 let', color_hex: '#88C47C', days: ['tor','cet'], time_start: '17:30', time_end: '18:00', sort_order: 51 },
  // ── Skupina 5 (pon, sre) ───────────────────────────────────────────
  { name: '5.1', program: 'Gimnastika', age_range: '11–13 let', color_hex: '#88C47C', days: ['pon','sre'], time_start: '19:00', time_end: '19:30', sort_order: 60 },
  { name: '5.2', program: 'Gimnastika Advance', age_range: '13–16 let', color_hex: '#E8A87B', days: ['pon','sre'], time_start: '19:00', time_end: '19:30', sort_order: 61 },
  { name: '5.3', program: 'Gimnastika Advance', age_range: '13–16 let', color_hex: '#6B9FD4', days: ['pon','sre'], time_start: '19:00', time_end: '19:30', sort_order: 62 },
  // ── Skupina 6 (tor, cet, pet) ──────────────────────────────────────
  { name: '6.1', program: 'Gimnastika Advance', age_range: '13–16 let', color_hex: '#E8A87B', days: ['tor','cet'], time_start: '19:00', time_end: '19:30', sort_order: 70 },
  { name: '6.2', program: 'Gimnastika PRO', age_range: '16+', color_hex: '#D47878', days: ['tor','cet'], time_start: '19:00', time_end: '19:30', sort_order: 71 },
  { name: '6.3', program: 'Gimnastika PRO', age_range: '16+', color_hex: '#5A8FCA', days: ['tor','cet','pet'], time_start: '19:00', time_end: '19:30', sort_order: 72 },
  // ── Skupina 7 (pon, sre, pet) ──────────────────────────────────────
  { name: '7.1', program: 'AKR', age_range: '', color_hex: '#E07878', days: ['pon','sre','pet'], time_start: '20:30', time_end: '21:00', sort_order: 80 },
  { name: '7.2', program: 'ZAB', age_range: '', color_hex: '#C87B7B', days: ['pon','sre','pet'], time_start: '20:30', time_end: '21:00', sort_order: 81 },
  { name: '7.3', program: 'WALL', age_range: '', color_hex: '#909AAA', days: ['pon','sre'], time_start: '20:30', time_end: '21:00', sort_order: 82 },
  // ── Skupina 8 (tor, cet) ───────────────────────────────────────────
  { name: '8.1', program: 'AKR', age_range: '', color_hex: '#E07878', days: ['tor','cet'], time_start: '20:30', time_end: '21:00', sort_order: 90 },
  { name: '8.2', program: 'ZAB', age_range: '', color_hex: '#C87B7B', days: ['tor','cet'], time_start: '20:30', time_end: '21:00', sort_order: 91 },
  { name: '8.3', program: 'WALL', age_range: '', color_hex: '#7EC87E', days: ['tor','cet'], time_start: '20:30', time_end: '21:00', sort_order: 92 },
]

async function seed() {
  await sequelize.authenticate()
  await sequelize.sync({ alter: true })

  const existing = await AkademijaGroup.count()
  if (existing > 0) {
    console.log(`Tabela že vsebuje ${existing} skupin. Preskačem seed.`)
    process.exit(0)
  }

  await AkademijaGroup.bulkCreate(GROUPS)
  console.log(`✅ Seeded ${GROUPS.length} skupin v akademija_groups.`)
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
