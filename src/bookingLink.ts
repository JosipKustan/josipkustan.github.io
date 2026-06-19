// Single source of truth for the "Book a demo" / book-a-call CTA destination.
// Points at the Google Calendar appointment scheduling page; opens in a new tab.
export const BOOKING_URL =
  'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2C-1jLVv0IWgP2ykxtiqmMnLi4viZgSHwXDscwZZbXuQGBZYPwJvqxfECW7wkTYg8vs3XWeyZj'

// Spread onto an <a>/<motion.a> alongside href={BOOKING_URL} to open safely in a new tab.
export const BOOKING_LINK_PROPS = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const
