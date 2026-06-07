import crypto from 'crypto'
import Voucher from '../models/Voucher.js'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I, O, 0, 1 (confusing)

function generateRaw() {
  const bytes = crypto.randomBytes(16)
  let result = ''
  for (const byte of bytes) {
    result += CHARS[byte % CHARS.length]
    if (result.length === 16) break
  }
  return result.padEnd(16, CHARS[0])
}

export function formatCode(raw) {
  return `ODBITO-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`
}

export async function generateUniqueCode() {
  let attempts = 0
  while (attempts < 10) {
    const raw = generateRaw()
    const code = formatCode(raw)
    const exists = await Voucher.findOne({ where: { code } })
    if (!exists) return code
    attempts++
  }
  throw new Error('Failed to generate unique voucher code')
}

export async function generateCodes(count) {
  const codes = []
  for (let i = 0; i < count; i++) {
    codes.push(await generateUniqueCode())
  }
  return codes
}
