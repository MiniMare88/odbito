# ODBITO.fun — Arhitektura sistema
*Zadnja posodobitev: junij 2026*

---

## 🗺️ Pregled — kako vse drži skupaj

```
Uporabnik
    │
    ▼
www.odbito.fun          ← domena (GoDaddy DNS)
    │
    ▼
Railway — odbito-client (frontend)
    │  React + Vite, buildan statičen
    │  GitHub: MiniMare88/odbito  /client
    │
    │  API klici →
    ▼
Railway — odbito (backend)
    │  Node.js + Express
    │  GitHub: MiniMare88/odbito  /server
    │
    ├──► Railway — Postgres (baza)
    │    interno: postgres.railway.internal:5432
    │
    ├──► Resend (emaili)
    │    pošilja iz: info@odbito.si
    │
    ├──► Google OAuth (prijava z Googlom)
    │
    └──► Stripe (plačila — test mode)
```

---

## 🌐 Domene & DNS

| Domena | Status | Kaže na | Namen |
|--------|--------|---------|-------|
| `odbito.si` | 🟡 Aktivna | lastni hosting / statična | **Teaser stran** pred odprtjem |
| `odbito.com` | 🔴 Stara | ? | Stara stran za dogodek — ni v aktivni rabi |
| `odbito.fun` / `www.odbito.fun` | 🟢 Aktivna | Railway `odbito-client` | **Booking sistem** (glavna app) |
| `odbito-client-production.up.railway.app` | 🟢 Aktivna | Railway `odbito-client` | Railway direktni URL (enako kot odbito.fun) |
| `odbito-production.up.railway.app` | 🟢 Aktivna | Railway `odbito` (backend) | **API** — ne odpiraj direktno v browserju |

### Načrtovano (pred odprtjem):
- `odbito.si` → preusmeriti na `www.odbito.fun` (ali obratno)
- `odbito.com` → preusmeriti na `www.odbito.fun`
- Odločiti katera domena bo **primarna** za stranke

**GoDaddy:** registrator za `odbito.si`, `odbito.com`, `odbito.fun`
- DNS `www.odbito.fun` → CNAME → Railway
- MX zapisi za `odbito.si` → email dostava (Resend)

---

## 🚂 Railway — strežnik

**Projekt:** `beautiful-cooperation`
**URL:** railway.app → projekt → `beautiful-cooperation`

### Servisi:

| Service | Vloga | URL |
|---------|-------|-----|
| `odbito-client` | Frontend (React build) | `www.odbito.fun` |
| `odbito` | Backend (Node.js API) | `odbito-production.up.railway.app` |
| `Postgres` | Baza podatkov | interno samo |

### Kako Railway dobi kodo:
1. Ti pushaš na GitHub (`git push origin main`)
2. Railway opazi spremembo (webhook)
3. Avtomatično builda in deploya oba servisa (~2 min)
4. Baza se posodobi avtomatično (`sequelize.sync({ alter: true })`)

---

## 🐙 GitHub

**Repozitorij:** `https://github.com/MiniMare88/odbito`
**Branch:** `main` (produkcija)

### Struktura repo:
```
odbito/
├── client/          → frontend (Railway: odbito-client)
│   └── src/
├── server/          → backend (Railway: odbito)
│   └── src/
├── data/
│   └── pricing.json → edini vir cen
└── docker-compose.yml → za lokalni razvoj
```

**Workflow:**
```
Mac (lokalno) → git push → GitHub → Railway (auto-deploy)
```

---

## 💌 Email — Resend

**Storitev:** [resend.com](https://resend.com)
**Pošilja iz:** `info@odbito.si` (Odbito 360)
**API ključ:** shranjen v Railway env varibali `RESEND_API_KEY`

### Kdaj se pošljejo emaili:
- Potrditev rezervacije (Open Jump, Rojstni dan)
- Registracija → verifikacija emaila
- Pozabljeno geslo → reset link
- Potrditev naročnine na vadbe

### Backup SMTP (Gmail):
- `info@odbito.si` preko Gmail SMTP
- Geslo: app password (ne pravo geslo)
- Trenutno nastavljen ampak Resend je primarni

---

## 🔐 Avtentikacija

### JWT tokeni:
- **Access token:** 15 minut (shranjen v memory)
- **Refresh token:** 7 dni (httpOnly cookie)
- Ob vsakem request-u se access token obnovi

### Google OAuth:
- Prijava z Google računom
- ⚠️ **PROBLEM:** `GOOGLE_CALLBACK_URL` je še vedno `http://localhost:3001` → Google prijava **ne deluje na produkciji!**
- Treba popraviti na: `https://odbito-production.up.railway.app/api/auth/google/callback`

### Vloge:
- `customer` — navadni uporabniki
- `staff` — osebje
- `admin` — polni dostop

---

## 💳 Stripe — plačila

**Status:** ⚠️ TEST MODE (pk_test_... / sk_test_...)
**Za produkcijo:** treba zamenjati na live ključe

---

## 🗄️ Baza podatkov

**Tip:** PostgreSQL (managed Railway)
**Verzija:** avtomatično vzdrževana
**Backup:** Railway dela avtomatične backupe

### Ključni modeli:
| Model | Namen |
|-------|-------|
| `User` | Uporabniki (customer/staff/admin) |
| `OpenJumpBooking` | Rezervacije prosega skakanja |
| `BirthdayBooking` | Rezervacije rojstnih dni |
| `ParkSchedule` | Tedenski urnik parka |
| `ParkScheduleOverride` | Izjeme urnika (počitnice, prazniki) |
| `ParkClosure` | Zaprtja parka |
| `DiscountCode` | Popusti |
| `WaiverVersion` | Izjave odgovornosti |
| `UserNote` | Admin zapiski o uporabnikih |
| `StaffMember` | Profili osebja |
| `Application` | Prijave za zaposlitev |

**Posodabljanje sheme:** `sequelize.sync({ alter: true })` — ob vsakem deployu se nova polja avtomatično dodajo

---

## 💻 Lokalni razvoj (Mac)

**Pot:** `/Users/MiniMare/CLAUDE FOLDER/Dvorana ODBITO/Booking system/odbito/`

### Zagon:
```bash
# Baza (Docker)
docker-compose up -d

# Backend
cd server && npm run dev   # port 3001

# Frontend
cd client && npm run dev   # port 5173–5176
```

### .env datoteke:
- `server/.env` — lokalne nastavitve backenda
- `client/.env` — lokalne nastavitve frontenda
- **Ne commitaj** .env datotek na GitHub!

---

## ⚠️ Znane težave / TODO

| Težava | Status |
|--------|--------|
| Google OAuth callback URL napačen (localhost) | ❌ Ne deluje na produkciji |
| Stripe v test modu | ⚠️ Treba zamenjati pred odprtjem |
| JWT secret preveč preprost | ⚠️ Zamenjaj z random stringom |
| Email verifikacija blokira stare račune | ⚠️ Obstoječi uporabniki morajo preveriti email |

---

## 👤 Dostopi — kje so računi

| Storitev | Kje | Opomba |
|----------|-----|--------|
| Railway | railway.app | projekt `beautiful-cooperation` |
| GitHub | github.com/MiniMare88 | repo `odbito` |
| GoDaddy | godaddy.com | domeni `odbito.fun` + `odbito.si` |
| Resend | resend.com | email API |
| Stripe | dashboard.stripe.com | plačila |
| Google Cloud | console.cloud.google.com | OAuth app |

---

## 🔄 Kako narediti spremembo (workflow)

```
1. Uredi kodo lokalno (Mac)
         ↓
2. Testiraj na localhost
         ↓
3. git add -A && git commit -m "opis"
         ↓
4. git push origin main
         ↓
5. Railway avtomatično redeploya (~2 min)
         ↓
6. Preveri na www.odbito.fun
```
