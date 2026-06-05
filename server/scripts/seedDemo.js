/**
 * Demo seed — realistični vzorec obiskanosti po urah
 * Zaženi: node server/scripts/seedDemo.js
 */

import 'dotenv/config'
import bcrypt from 'bcrypt'
import { sequelize } from '../src/models/db.js'
import User from '../src/models/User.js'
import OpenJumpBooking from '../src/models/OpenJumpBooking.js'

await sequelize.authenticate()
console.log('DB connected')

// ── Demo user ─────────────────────────────────────────────────────────
const hash = await bcrypt.hash('demo2026', 10)
const [demoUser] = await User.findOrCreate({
  where: { email: 'demo@odbito.si' },
  defaults: {
    email: 'demo@odbito.si',
    password_hash: hash,
    first_name: 'Demo',
    last_name: 'Admin',
    phone: '+386 0 000 000',
    date_of_birth: '1990-01-01',
    role: 'admin',
    preferred_language: 'sl',
  },
})
if (!demoUser.isNewRecord) {
  demoUser.role = 'admin'
  await demoUser.save()
}
console.log(`Demo user: ${demoUser.email} / ID: ${demoUser.id}`)

// Izbriši stare demo rezervacije
const deleted = await OpenJumpBooking.destroy({ where: { user_id: demoUser.id } })
console.log(`Izbrisano ${deleted} starih demo rezervacij`)

// ── Ciljne urne zasedenosti (concurrent obiskovalci) ──────────────────
// Strategija: VSI prihodi ob H:00 z NATANKO 60-min paketi
// → concurrent ob H:00–H:30 = target, ob H:30–H+1:00 = target, ob H+1:00 = 0
// → ni prelivanja med urami, vrednosti so točno kot definirano
// DOW 5=Petek, 6=Sobota, 0=Nedelja
const HOUR_TARGETS = {
  5: { 15: 30, 16: 42, 17: 49, 18: 38, 19: 38, 20: 20 },
  6: { 10: 25, 11: 41, 12: 35, 13: 39, 14: 22, 15: 30, 16: 42, 17: 49, 18: 30, 19: 38, 20: 30 },
  0: { 10: 20, 11: 38, 12: 28, 13: 31, 14: 20, 15: 35, 16: 46, 17: 40, 18: 25, 19: 32, 20: 20 },
}

const MAX_CAP = 50

// ── Pomožne funkcije ──────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0') }
function toIso(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
function addMin(time, mins) {
  const [h, m] = time.split(':').map(Number)
  const t = h * 60 + m + mins
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`
}

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

// Razdeli N oseb v naravne skupine po 1–8
function splitIntoGroups(n) {
  const groups = []
  let remaining = n
  while (remaining > 0) {
    const maxSize = Math.min(8, remaining)
    const size = remaining <= 2 ? remaining : rnd(1, maxSize)
    groups.push(size)
    remaining -= size
  }
  return groups
}

// Skupinska cena (≥5 oseb)
function calcPrice(participants) {
  if (participants >= 5) return { price: 12.50, discount: +((14.00 - 12.50) * participants).toFixed(2) }
  return { price: 14.00, discount: 0 }
}

// ── Generiranje rezervacij za en dan ─────────────────────────────────
// Vsaka ura H: vsi prihodi ob H:00, paket TOČNO 60 min → end = H+1:00
// Concurrent ob H:00–H:30 = target, ob H:30–H+1:00 = target, ob H+1 = 0 (čisto!)
async function seedDay(dateStr, dow, dayMult) {
  const targets = HOUR_TARGETS[dow]
  const bookings = []

  for (const [hourStr, baseTarget] of Object.entries(targets)) {
    const h = parseInt(hourStr)
    const target = Math.min(MAX_CAP, Math.round(baseTarget * dayMult))
    if (target <= 0) continue

    const slotStart = `${pad(h)}:00`
    const slotEnd   = `${pad(h + 1)}:00`  // točno 60 min

    for (const participants of splitIntoGroups(target)) {
      const { price, discount } = calcPrice(participants)
      bookings.push({
        user_id: demoUser.id,
        date: dateStr,
        start_time: slotStart + ':00',
        end_time:   slotEnd   + ':00',
        duration_hours: 1,
        participants,
        price_per_person: price,
        total_price: +(price * participants).toFixed(2),
        discount_amount: discount,
        payment_status: 'paid',
        status: Math.random() < 0.03 ? 'cancelled' : (Math.random() < 0.12 ? 'checked_in' : 'confirmed'),
      })
    }
  }

  if (bookings.length > 0) {
    await OpenJumpBooking.bulkCreate(bookings)
  }
  return bookings.length
}

// ── Generiraj 4 mesece nazaj + 1 mesec naprej ─────────────────────────
const today = new Date()
const start = new Date(today)
start.setMonth(start.getMonth() - 4)
start.setDate(1)

const end = new Date(today)
end.setMonth(end.getMonth() + 1)
end.setDate(28)

let totalDays = 0, totalBookings = 0
const cursor = new Date(start)

while (cursor <= end) {
  const dow = cursor.getDay()
  if (dow === 0 || dow === 5 || dow === 6) {
    const dateStr = toIso(cursor)
    // Dnevna variacija: ±20% (multiplikator 0.80–1.20)
    const dayMult = 0.80 + Math.random() * 0.40
    const count = await seedDay(dateStr, dow, dayMult)
    totalBookings += count
    totalDays++
    const dayName = ['Ned', , , , , 'Pet', 'Sob'][dow]
    process.stdout.write(`  ${dayName} ${dateStr}: ${count} rezervacij (×${dayMult.toFixed(2)})\n`)
  }
  cursor.setDate(cursor.getDate() + 1)
}

console.log(`\nSeed končan: ${totalDays} dni, ${totalBookings} rezervacij`)
console.log('Login: demo@odbito.si / demo2026')
await sequelize.close()
