import nodemailer from 'nodemailer'
import { generateQRSvg } from './qrService.js'
import { generateBookingIcs, generateSubscriptionIcs } from './calendarService.js'

function createTransport() {
  // In dev without real SMTP: use Ethereal (auto-catch) or log
  if (!process.env.EMAIL_USER || process.env.EMAIL_HOST === 'smtp.example.com') {
    return nodemailer.createTransport({
      jsonTransport: true, // log only, no real send
    })
  }
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

const FROM = process.env.EMAIL_FROM || '"Odbito 360" <noreply@odbito.si>'

function bookingHtml({ booking, user, qrSvg }) {
  const formatPrice = (n) => new Intl.NumberFormat('sl-SI', { style: 'currency', currency: 'EUR' }).format(n)
  const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return `<!DOCTYPE html>
<html lang="sl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080A0E;font-family:'Helvetica Neue',Arial,sans-serif;color:#F5F5F0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-family:Georgia,serif;font-size:36px;letter-spacing:0.1em;color:#F5F5F0;">
        ODBITO <span style="color:#fab120;">360</span>
      </div>
    </div>

    <!-- Title -->
    <div style="background:#141820;border-radius:16px;padding:32px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.07);">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#fab120;margin-bottom:8px;">Potrditev rezervacije</div>
      <h1 style="margin:0 0 4px;font-size:32px;letter-spacing:0.02em;color:#F5F5F0;">
        REZERVACIJA POTRJENA!
      </h1>
      <p style="margin:0;color:#7A8499;font-size:15px;">Pozdravljeni, ${user.first_name}! Vaša rezervacija je uspešno potrjena.</p>
    </div>

    <!-- Details -->
    <div style="background:#141820;border-radius:16px;padding:24px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.07);">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#fab120;margin-bottom:16px;">Podrobnosti</div>
      ${[
        ['Datum', formatDate(booking.date)],
        ['Ura', `${booking.start_time.slice(0,5)} – ${booking.end_time.slice(0,5)}`],
        ['Trajanje', `${booking.duration_hours}h`],
        ['Udeleženci', `${booking.participants}`],
        ['Skupaj', formatPrice(booking.total_price)],
        ['Status plačila', 'Plačilo na blagajni'],
      ].map(([k, v]) => `
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
          <span style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7A8499;">${k}</span>
          <span style="font-size:14px;font-weight:700;color:#F5F5F0;">${v}</span>
        </div>`).join('')}
    </div>

    <!-- QR Code -->
    <div style="background:#141820;border-radius:16px;padding:24px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.07);text-align:center;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#fab120;margin-bottom:16px;">QR koda za check-in</div>
      <div style="background:#FFFFFF;display:inline-block;padding:12px;border-radius:8px;margin-bottom:12px;">
        ${qrSvg}
      </div>
      <div style="font-size:18px;font-weight:700;letter-spacing:0.15em;color:#fab120;margin-top:8px;">
        ${booking.booking_code.split('-')[0].toUpperCase()}
      </div>
      <p style="color:#7A8499;font-size:13px;margin:8px 0 0;">Pokažite QR kodo ali kodo pri vstopu.</p>
    </div>

    <!-- Info -->
    <div style="background:rgba(250,177,32,0.08);border:1px solid rgba(250,177,32,0.2);border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#F5F5F0;line-height:1.6;">
        ⚠️ <strong>Plačilo na blagajni</strong> ob prihodu. Rezervacija velja 15 minut po dogovorjeni uri začetka. Odpoved ni mogoča.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;color:#7A8499;font-size:12px;">
      <p>Odbito 360 d.o.o. · Dolgi most, Ljubljana</p>
      <p>info@odbito.si · odbito.si</p>
      <p style="margin-top:16px;color:#1C2230;">© 2026 Odbito 360 d.o.o. — Powered by Dunking Devils</p>
    </div>
  </div>
</body>
</html>`
}

function subscriptionHtml({ subscription, classType, user }) {
  const planLabel = { monthly: 'Mesečna', yearly: 'Letna', seasonal: 'Sezonska' }
  const endDate = new Date(subscription.end_date + 'T12:00:00').toLocaleDateString('sl-SI', { day: 'numeric', month: 'long', year: 'numeric' })
  const price = subscription.plan_type === 'yearly' ? classType.price_yearly : classType.price_monthly

  return `<!DOCTYPE html>
<html lang="sl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080A0E;font-family:'Helvetica Neue',Arial,sans-serif;color:#F5F5F0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-family:Georgia,serif;font-size:36px;letter-spacing:0.1em;color:#F5F5F0;">
        ODBITO <span style="color:#fab120;">360</span>
      </div>
    </div>

    <div style="background:#141820;border-radius:16px;padding:32px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.07);">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#fab120;margin-bottom:8px;">Naročnina aktivirana</div>
      <h1 style="margin:0 0 4px;font-size:32px;letter-spacing:0.02em;color:#F5F5F0;">NAROČNINA AKTIVNA!</h1>
      <p style="margin:0;color:#7A8499;font-size:15px;">Pozdravljeni, ${user.first_name}! Vaša naročnina za <strong style="color:#F5F5F0;">${classType.name_sl}</strong> je aktivna.</p>
    </div>

    <div style="background:#141820;border-radius:16px;padding:24px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.07);">
      ${[
        ['Vadba', classType.name_sl],
        ['Plan', planLabel[subscription.plan_type] || subscription.plan_type],
        ['Velja od', new Date(subscription.start_date + 'T12:00:00').toLocaleDateString('sl-SI')],
        ['Velja do', endDate],
        ['Znesek', `€${Number(price).toFixed(2)}`],
        ['Status plačila', 'Plačilo na blagajni ob prvem obisku'],
      ].map(([k, v]) => `
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
          <span style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7A8499;">${k}</span>
          <span style="font-size:14px;font-weight:700;color:#F5F5F0;">${v}</span>
        </div>`).join('')}
    </div>

    <div style="text-align:center;color:#7A8499;font-size:12px;">
      <p>Odbito 360 d.o.o. · Dolgi most, Ljubljana · info@odbito.si</p>
      <p style="margin-top:16px;color:#1C2230;">© 2026 Odbito 360 d.o.o. — Powered by Dunking Devils</p>
    </div>
  </div>
</body>
</html>`
}

// ── PUBLIC API ────────────────────────────────────────────

export async function sendBookingConfirmation(booking, user) {
  const transport = createTransport()
  const qrSvg = await generateQRSvg(booking.booking_code)

  let icsContent
  try { icsContent = await generateBookingIcs(booking) } catch { icsContent = null }

  const mailOptions = {
    from: FROM,
    to: user.email,
    subject: `✅ Rezervacija potrjena — Odbito ${booking.date}`,
    html: bookingHtml({ booking, user, qrSvg }),
    attachments: icsContent ? [{
      filename: `odbito-${booking.booking_code.split('-')[0]}.ics`,
      content: icsContent,
      contentType: 'text/calendar',
    }] : [],
  }

  const info = await transport.sendMail(mailOptions)

  // Dev: log preview URL if Ethereal
  if (info?.envelope || process.env.NODE_ENV === 'development') {
    if (transport.options?.jsonTransport) {
      console.log(`[EMAIL DEV] Booking confirmation → ${user.email} (not sent, no SMTP configured)`)
    }
  }

  return info
}

export async function sendSubscriptionConfirmation(subscription, classType, user, schedules = []) {
  const transport = createTransport()

  let icsContent
  try { icsContent = await generateSubscriptionIcs(subscription, classType, schedules) } catch { icsContent = null }

  const mailOptions = {
    from: FROM,
    to: user.email,
    subject: `✅ Naročnina aktivna — Odbito ${classType.name_sl}`,
    html: subscriptionHtml({ subscription, classType, user }),
    attachments: icsContent ? [{
      filename: `odbito-${classType.name_sl.toLowerCase().replace(/\s+/g, '-')}.ics`,
      content: icsContent,
      contentType: 'text/calendar',
    }] : [],
  }

  const info = await transport.sendMail(mailOptions)
  if (transport.options?.jsonTransport) {
    console.log(`[EMAIL DEV] Subscription confirmation → ${user.email} (not sent, no SMTP configured)`)
  }
  return info
}
