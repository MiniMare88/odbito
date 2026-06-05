import { createEvent } from 'ics'

/**
 * Generate an .ics buffer for an Open Jump booking
 */
export function generateBookingIcs(booking) {
  const [year, month, day] = booking.date.split('-').map(Number)
  const [startH, startM] = booking.start_time.slice(0, 5).split(':').map(Number)
  const [endH, endM] = booking.end_time.slice(0, 5).split(':').map(Number)

  return new Promise((resolve, reject) => {
    createEvent({
      title: `Odbito — Open Jump ${booking.start_time.slice(0, 5)}`,
      start: [year, month, day, startH, startM],
      end: [year, month, day, endH, endM],
      location: 'Odbito 360, Dolgi most, Ljubljana',
      description: `Rezervacijska koda: ${booking.booking_code}\nUdeleženci: ${booking.participants}\nSkupaj: €${Number(booking.total_price).toFixed(2)}`,
      organizer: { name: 'Odbito 360', email: 'info@odbito.si' },
      url: 'https://odbito.si',
    }, (error, value) => {
      if (error) return reject(error)
      resolve(value)
    })
  })
}

/**
 * Generate an .ics buffer for a class subscription reminder
 */
export function generateSubscriptionIcs(subscription, classType, schedules) {
  const events = schedules.map(s => {
    const now = new Date()
    // Find next occurrence of this weekday
    const dow = s.day_of_week // 1=Mon
    const diff = ((dow - 1) - (now.getDay() === 0 ? 6 : now.getDay() - 1) + 7) % 7
    const next = new Date(now)
    next.setDate(now.getDate() + (diff === 0 ? 7 : diff))

    const [year, month, day] = [next.getFullYear(), next.getMonth() + 1, next.getDate()]
    const [sh, sm] = s.start_time.slice(0, 5).split(':').map(Number)
    const [eh, em] = s.end_time.slice(0, 5).split(':').map(Number)

    return {
      title: `Odbito — ${classType.name_sl}`,
      start: [year, month, day, sh, sm],
      end: [year, month, day, eh, em],
      location: 'Odbito 360, Dolgi most, Ljubljana',
      description: `Naročnina do: ${subscription.end_date}`,
      recurrenceRule: 'FREQ=WEEKLY',
      organizer: { name: 'Odbito 360', email: 'info@odbito.si' },
    }
  })

  // Return first event as single ics (multiple events = multiple calls)
  if (!events.length) return Promise.resolve('')
  return new Promise((resolve, reject) => {
    createEvent(events[0], (error, value) => {
      if (error) return reject(error)
      resolve(value)
    })
  })
}
