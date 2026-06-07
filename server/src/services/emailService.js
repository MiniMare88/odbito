import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import { generateQRSvg } from './qrService.js'
import { generateBookingIcs, generateSubscriptionIcs } from './calendarService.js'

// Resend client (za transakcijske emaile — verifikacija, reset gesla)
const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://odbito.si'

function verificationHtml({ user, verificationUrl }) {
  const lang = user.preferred_language || 'sl'
  const isSl = lang === 'sl'

  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080A0E;font-family:'Helvetica Neue',Arial,sans-serif;color:#F5F5F0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-family:Georgia,serif;font-size:36px;letter-spacing:0.1em;color:#F5F5F0;">
        ODBITO <span style="color:#fab120;">360</span>
      </div>
    </div>
    <div style="background:#141820;border-radius:16px;padding:32px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.07);">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#fab120;margin-bottom:8px;">
        ${isSl ? 'Potrditev emaila' : 'Email verification'}
      </div>
      <h1 style="margin:0 0 16px;font-size:28px;letter-spacing:0.02em;color:#F5F5F0;">
        ${isSl ? `Pozdravljeni, ${user.first_name}!` : `Hello, ${user.first_name}!`}
      </h1>
      <p style="color:#7A8499;font-size:15px;line-height:1.6;margin:0 0 24px;">
        ${isSl
          ? 'Za dokončanje registracije potrdite vaš email naslov s klikom na spodnji gumb. Povezava velja 24 ur.'
          : 'To complete your registration, please verify your email address by clicking the button below. The link is valid for 24 hours.'}
      </p>
      <div style="text-align:center;">
        <a href="${verificationUrl}" style="display:inline-block;background:#fab120;color:#080A0E;font-weight:700;font-size:14px;letter-spacing:0.1em;text-transform:uppercase;padding:14px 32px;border-radius:8px;text-decoration:none;">
          ${isSl ? 'Potrdi email naslov' : 'Verify email address'}
        </a>
      </div>
    </div>
    <div style="background:rgba(250,177,32,0.08);border:1px solid rgba(250,177,32,0.2);border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#F5F5F0;line-height:1.6;">
        ${isSl
          ? '⚠️ Če gumb ne deluje, kopirajte to povezavo v brskalnik:'
          : '⚠️ If the button doesn\'t work, copy this link into your browser:'}
        <br><span style="color:#fab120;word-break:break-all;font-size:12px;">${verificationUrl}</span>
      </p>
    </div>
    <div style="text-align:center;color:#7A8499;font-size:12px;">
      <p>${isSl ? 'Če niste ustvarili računa, ignorirajte ta email.' : 'If you did not create an account, you can safely ignore this email.'}</p>
      <p>Odbito 360 d.o.o. · Dolgi most, Ljubljana</p>
      <p>info@odbito.si · odbito.si</p>
      <p style="margin-top:16px;color:#1C2230;">© 2026 Odbito 360 d.o.o. — Powered by Dunking Devils</p>
    </div>
  </div>
</body>
</html>`
}

function passwordResetHtml({ user, resetUrl }) {
  const lang = user.preferred_language || 'sl'
  const isSl = lang === 'sl'

  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080A0E;font-family:'Helvetica Neue',Arial,sans-serif;color:#F5F5F0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-family:Georgia,serif;font-size:36px;letter-spacing:0.1em;color:#F5F5F0;">
        ODBITO <span style="color:#fab120;">360</span>
      </div>
    </div>
    <div style="background:#141820;border-radius:16px;padding:32px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.07);">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#fab120;margin-bottom:8px;">
        ${isSl ? 'Ponastavitev gesla' : 'Password reset'}
      </div>
      <h1 style="margin:0 0 16px;font-size:28px;letter-spacing:0.02em;color:#F5F5F0;">
        ${isSl ? `Pozdravljeni, ${user.first_name}!` : `Hello, ${user.first_name}!`}
      </h1>
      <p style="color:#7A8499;font-size:15px;line-height:1.6;margin:0 0 24px;">
        ${isSl
          ? 'Prejeli smo zahtevo za ponastavitev gesla za vaš račun. Kliknite spodnji gumb za nastavitev novega gesla. Povezava velja 1 uro.'
          : 'We received a request to reset the password for your account. Click the button below to set a new password. The link is valid for 1 hour.'}
      </p>
      <div style="text-align:center;">
        <a href="${resetUrl}" style="display:inline-block;background:#fab120;color:#080A0E;font-weight:700;font-size:14px;letter-spacing:0.1em;text-transform:uppercase;padding:14px 32px;border-radius:8px;text-decoration:none;">
          ${isSl ? 'Ponastavi geslo' : 'Reset password'}
        </a>
      </div>
    </div>
    <div style="background:rgba(250,177,32,0.08);border:1px solid rgba(250,177,32,0.2);border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#F5F5F0;line-height:1.6;">
        ${isSl
          ? '⚠️ Če gumb ne deluje, kopirajte to povezavo v brskalnik:<br><span style="color:#fab120;word-break:break-all;font-size:12px;">' + resetUrl + '</span>'
          : '⚠️ If the button doesn\'t work, copy this link into your browser:<br><span style="color:#fab120;word-break:break-all;font-size:12px;">' + resetUrl + '</span>'}
      </p>
    </div>
    <div style="text-align:center;color:#7A8499;font-size:12px;">
      <p>${isSl ? 'Če niste zahtevali ponastavitve gesla, ignorirajte ta email — vaše geslo ostane nespremenjeno.' : 'If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.'}</p>
      <p>Odbito 360 d.o.o. · Dolgi most, Ljubljana</p>
      <p>info@odbito.si · odbito.si</p>
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

export async function sendVerificationEmail(user, rawToken) {
  const verificationUrl = `${FRONTEND_URL}/potrdi-email?token=${rawToken}`
  const lang = user.preferred_language || 'sl'
  const isSl = lang === 'sl'

  if (resendClient) {
    const { data, error } = await resendClient.emails.send({
      from: 'Odbito 360 <info@odbito.si>',
      to: user.email,
      subject: isSl ? 'Potrdite vaš email naslov — Odbito' : 'Verify your email address — Odbito',
      html: verificationHtml({ user, verificationUrl }),
    })
    if (error) throw new Error(error.message)
    console.log(`[EMAIL] Verification sent via Resend → ${user.email} | id: ${data?.id}`)
    return data
  }

  // Fallback: log only
  console.log(`[EMAIL DEV] Verification email → ${user.email} | URL: ${verificationUrl}`)
}

export async function sendPasswordResetEmail(user, rawToken) {
  const resetUrl = `${FRONTEND_URL}/novo-geslo?token=${rawToken}`
  const lang = user.preferred_language || 'sl'
  const isSl = lang === 'sl'

  if (resendClient) {
    const { data, error } = await resendClient.emails.send({
      from: 'Odbito 360 <info@odbito.si>',
      to: user.email,
      subject: isSl ? 'Ponastavitev gesla — Odbito' : 'Password reset — Odbito',
      html: passwordResetHtml({ user, resetUrl }),
    })
    if (error) throw new Error(error.message)
    console.log(`[EMAIL] Password reset sent via Resend → ${user.email} | id: ${data?.id}`)
    return data
  }

  // Fallback: log only
  console.log(`[EMAIL DEV] Password reset email → ${user.email} | URL: ${resetUrl}`)
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

// ── Voucher email ─────────────────────────────────────────────────────────────

function voucherEmailHtml({ vouchers, type, firstName }) {
  const isPurchase = type === 'purchase'
  const isRefund = type === 'refund'
  const titleSl = isPurchase ? 'Vaša darilna kartica' : isRefund ? 'Kredit za preklicano rezervacijo' : 'Vaš promocijski bon'
  const titleEn = isPurchase ? 'Your Gift Voucher' : isRefund ? 'Refund Voucher for Cancelled Booking' : 'Your Promotional Voucher'
  const intro = isPurchase
    ? `Hvala za nakup! Spodaj najdete ${vouchers.length > 1 ? 'vaše darilne kartice' : 'vašo darilno kartico'}.`
    : isRefund
    ? 'Vaša rezervacija je bila uspešno preklicana. Prejeli ste povračilo v obliki kredita.'
    : 'Prejeli ste promocijski bon za Odbito.'

  const voucherCards = vouchers.map(v => {
    const expiryStr = new Date(v.expires_at).toLocaleDateString('sl-SI', { day: 'numeric', month: 'long', year: 'numeric' })
    return `
    <div style="background:#1a1f2e;border-radius:12px;padding:24px;margin-bottom:16px;border:1px solid rgba(250,177,32,0.3);text-align:center;">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#fab120;margin-bottom:8px;">Vrednost kartice</div>
      <div style="font-size:48px;font-weight:900;color:#fab120;margin-bottom:12px;">€${parseFloat(v.denomination).toFixed(0)}</div>
      <div style="font-family:monospace;font-size:18px;letter-spacing:4px;color:#fff;background:#0d0d0d;padding:12px 20px;border-radius:8px;display:inline-block;margin-bottom:8px;">${v.code}</div>
      <div style="font-size:12px;color:#666;margin-top:8px;">Veljavno do: ${expiryStr}</div>
    </div>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="sl">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#080A0E;font-family:'Helvetica Neue',Arial,sans-serif;color:#F5F5F0;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:32px;">
    <div style="font-family:Georgia,serif;font-size:36px;letter-spacing:0.1em;color:#F5F5F0;">ODBITO <span style="color:#fab120;">360</span></div>
  </div>
  <div style="background:#141820;border-radius:16px;padding:32px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.07);">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#fab120;margin-bottom:8px;">${titleSl}</div>
    <h1 style="margin:0 0 8px;font-size:28px;color:#F5F5F0;">${titleEn}</h1>
    <p style="margin:0;color:#7A8499;">${firstName ? `Pozdravljeni, ${firstName}! ` : ''}${intro}</p>
  </div>
  ${voucherCards}
  <div style="background:#141820;border-radius:12px;padding:20px;border:1px solid rgba(255,255,255,0.07);margin-top:16px;">
    <p style="margin:0;color:#7A8499;font-size:13px;">Kodo unovčite v vašem profilu na <a href="https://www.odbito.fun" style="color:#fab120;">odbito.fun</a> → "Unovči bon". Koda je veljavna za enkratno uporabo.</p>
  </div>
  <div style="text-align:center;margin-top:32px;color:#444;font-size:12px;">© 2026 Odbito 360 · info@odbito.si</div>
</div>
</body></html>`
}

export async function sendVoucherEmail({ vouchers, email, firstName, type }) {
  const subjectMap = {
    purchase: 'Vaša darilna kartica — Odbito',
    refund: 'Kredit za preklicano rezervacijo — Odbito',
    promotional: 'Vaš promocijski bon — Odbito',
  }

  if (resendClient) {
    const { error } = await resendClient.emails.send({
      from: FROM,
      to: email,
      subject: subjectMap[type] || 'Vaš bon — Odbito',
      html: voucherEmailHtml({ vouchers, type, firstName }),
    })
    if (error) console.error('Resend voucher email error:', error)
    return
  }

  const transport = createTransport()
  await transport.sendMail({
    from: FROM,
    to: email,
    subject: subjectMap[type] || 'Vaš bon — Odbito',
    html: voucherEmailHtml({ vouchers, type, firstName }),
  })
  console.log(`[EMAIL DEV] Voucher email → ${email}`)
}
