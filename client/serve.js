// Produkcijski strežnik za React SPA + basic-auth zaščiten /poslovni_nacrt
import express from 'express'
import basicAuth from 'express-basic-auth'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, 'dist')
const PORT = process.env.PORT || 4173

const app = express()

// ── /poslovni_nacrt — basic auth zaščita ──────────────────────────
// Brez env vars POSLOVNI_USER + POSLOVNI_PASS pot vrne 503 (varno default).
const PN_USER = process.env.POSLOVNI_USER
const PN_PASS = process.env.POSLOVNI_PASS
if (PN_USER && PN_PASS) {
  const pnAuth = basicAuth({
    users: { [PN_USER]: PN_PASS },
    challenge: true,
    realm: 'Odbito 360 — poslovni nacrt',
    unauthorizedResponse: 'Neavtoriziran dostop',
  })
  app.use('/poslovni_nacrt', pnAuth, express.static(path.join(DIST, 'poslovni_nacrt')))
  console.log('Basic-auth za /poslovni_nacrt: omogočen')
} else {
  app.use('/poslovni_nacrt', (req, res) =>
    res.status(503).send('Poslovni nacrt: env vars POSLOVNI_USER in POSLOVNI_PASS niso nastavljeni.')
  )
  console.warn('Basic-auth za /poslovni_nacrt: ONEMOGOČEN (env vars manjkajo)')
}

// ── Statične datoteke iz dist/ ────────────────────────────────────
app.use(express.static(DIST, { index: false }))

// ── SPA fallback: vse ostalo → React index.html (razen /poslovni_nacrt/*) ──
app.get('*', (req, res) => {
  if (req.path.startsWith('/poslovni_nacrt')) {
    return res.status(404).send('Not found')
  }
  res.sendFile(path.join(DIST, 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Odbito client serving on port ${PORT}`)
})
