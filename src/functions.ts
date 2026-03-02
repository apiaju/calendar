import type { Holiday, BusinessDayOptions } from './types'
import { getHolidaysForYear } from './holidays'
import { toAracajuDate, isWeekend, makeAracajuDate } from './utils'

function findHoliday(date: Date): Holiday | null {
  const { year, month, day } = toAracajuDate(date)
  const holidays = getHolidaysForYear(year)
  return (
    holidays.find((h) => {
      const hd = toAracajuDate(h.date)
      return hd.month === month && hd.day === day
    }) ?? null
  )
}

export function isHoliday(date: Date = new Date()): boolean {
  const h = findHoliday(date)
  return h !== null && h.type === 'holiday'
}

export function isOptionalHoliday(date: Date = new Date()): boolean {
  const h = findHoliday(date)
  return h !== null && h.type === 'optional'
}

export function isHolidayOrOptional(date: Date = new Date()): boolean {
  return findHoliday(date) !== null
}

export function getHoliday(date: Date = new Date()): Holiday | null {
  return findHoliday(date)
}

export function getHolidays(year?: number): Holiday[] {
  const y = year ?? toAracajuDate(new Date()).year
  return getHolidaysForYear(y)
}

export function isBusinessDay(date: Date = new Date(), options?: BusinessDayOptions): boolean {
  const sat = options?.saturdayIsBusinessDay ?? false
  return !isWeekend(date, sat) && !isHolidayOrOptional(date)
}

export function countBusinessDays(start: Date, end: Date, options?: BusinessDayOptions): number {
  const s = toAracajuDate(start)
  const e = toAracajuDate(end)

  const startMs = Date.UTC(s.year, s.month - 1, s.day)
  const endMs = Date.UTC(e.year, e.month - 1, e.day)

  if (endMs <= startMs) return 0

  let count = 0
  const current = new Date(startMs)

  while (current.getTime() < endMs) {
    // Create a date in Aracaju timezone for checking
    const checkDate = new Date(current.getTime() + 15 * 60 * 60 * 1000) // +15h to land at noon Aracaju time
    if (isBusinessDay(checkDate, options)) {
      count++
    }
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return count
}

export function addBusinessDays(date: Date, days: number, options?: BusinessDayOptions): Date {
  const { year, month, day } = toAracajuDate(date)
  const current = new Date(Date.UTC(year, month - 1, day))
  let remaining = days

  while (remaining > 0) {
    current.setUTCDate(current.getUTCDate() + 1)
    const checkDate = new Date(current.getTime() + 15 * 60 * 60 * 1000)
    if (isBusinessDay(checkDate, options)) {
      remaining--
    }
  }

  const result = toAracajuDate(new Date(current.getTime() + 15 * 60 * 60 * 1000))
  return makeAracajuDate(result.year, result.month, result.day)
}
