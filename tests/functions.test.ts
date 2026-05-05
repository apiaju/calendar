import { describe, it, expect } from 'vitest'
import {
  isHoliday,
  isOptionalHoliday,
  isHolidayOrOptional,
  getHoliday,
  getHolidays,
  isBusinessDay,
  countBusinessDays,
  addBusinessDays,
} from '../src/functions'
import { makeAracajuDate, toAracajuDate } from '../src/utils'

describe('isHoliday', () => {
  it('returns true for Natal', () => {
    expect(isHoliday(makeAracajuDate(2025, 12, 25))).toBe(true)
  })

  it('returns false for optional holiday (Carnaval)', () => {
    // Terça de Carnaval 2025 = March 4
    expect(isHoliday(makeAracajuDate(2025, 3, 4))).toBe(false)
  })

  it('returns false for regular day', () => {
    expect(isHoliday(makeAracajuDate(2025, 3, 10))).toBe(false)
  })
})

describe('isOptionalHoliday', () => {
  it('returns true for Terça de Carnaval', () => {
    expect(isOptionalHoliday(makeAracajuDate(2025, 3, 4))).toBe(true)
  })

  it('returns false for official holiday', () => {
    expect(isOptionalHoliday(makeAracajuDate(2025, 12, 25))).toBe(false)
  })
})

describe('isHolidayOrOptional', () => {
  it('returns true for official holiday', () => {
    expect(isHolidayOrOptional(makeAracajuDate(2025, 12, 25))).toBe(true)
  })

  it('returns true for optional holiday', () => {
    expect(isHolidayOrOptional(makeAracajuDate(2025, 3, 4))).toBe(true)
  })

  it('returns false for regular day', () => {
    expect(isHolidayOrOptional(makeAracajuDate(2025, 3, 10))).toBe(false)
  })
})

describe('getHoliday', () => {
  it('returns Holiday object for known holiday', () => {
    const h = getHoliday(makeAracajuDate(2025, 12, 25))
    expect(h).not.toBeNull()
    expect(h!.name).toBe('Natal')
    expect(h!.type).toBe('holiday')
    expect(h!.level).toBe('national')
  })

  it('returns null for non-holiday', () => {
    expect(getHoliday(makeAracajuDate(2025, 3, 10))).toBeNull()
  })
})

describe('getHolidays', () => {
  it('returns all holidays for the given year', () => {
    const holidays = getHolidays(2025)
    expect(holidays).toHaveLength(17)
  })
})

describe('getHolidays with date range', () => {
  it('returns holidays within a single-year range', () => {
    // 2025: Sexta-feira Santa (4/18), Tiradentes (4/21), Dia do Trabalho (5/1),
    // Corpus Christi (6/19), São João (6/24) = 5 holidays
    const result = getHolidays({ start: makeAracajuDate(2025, 4, 1), end: makeAracajuDate(2025, 6, 30) })
    expect(result).toHaveLength(5)
    const names = result.map((h) => h.name)
    expect(names).toContain('Sexta-feira Santa')
    expect(names).toContain('Tiradentes')
    expect(names).toContain('Dia do Trabalho')
    expect(names).toContain('Corpus Christi')
    expect(names).toContain('São João')
  })

  it('includes holidays exactly on start and end bounds (inclusive)', () => {
    // Dia do Trabalho 2025 = May 1; São João 2025 = June 24
    const result = getHolidays({ start: makeAracajuDate(2025, 5, 1), end: makeAracajuDate(2025, 6, 24) })
    const names = result.map((h) => h.name)
    expect(names).toContain('Dia do Trabalho')
    expect(names).toContain('São João')
  })

  it('returns holidays across a cross-year range', () => {
    // 2024: Nossa Sra. da Conceição (12/8), Natal (12/25)
    // 2025: Confraternização Universal (1/1)
    const result = getHolidays({ start: makeAracajuDate(2024, 12, 1), end: makeAracajuDate(2025, 1, 31) })
    expect(result).toHaveLength(3)
    const names = result.map((h) => h.name)
    expect(names).toContain('Nossa Sra. da Conceição')
    expect(names).toContain('Natal')
    expect(names).toContain('Confraternização Universal')
  })

  it('returns result sorted by date for cross-year ranges', () => {
    const result = getHolidays({ start: makeAracajuDate(2024, 12, 1), end: makeAracajuDate(2025, 1, 31) })
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date.getTime()).toBeGreaterThanOrEqual(result[i - 1].date.getTime())
    }
  })

  it('returns empty array when range contains no holidays', () => {
    // 2025-03-11 to 2025-03-16 — Carnaval acabou (3/3–3/4); próximo é Aniversário de Aracaju (3/17)
    const result = getHolidays({ start: makeAracajuDate(2025, 3, 11), end: makeAracajuDate(2025, 3, 16) })
    expect(result).toHaveLength(0)
  })

  it('returns empty array when start is after end', () => {
    const result = getHolidays({ start: makeAracajuDate(2025, 6, 1), end: makeAracajuDate(2025, 3, 1) })
    expect(result).toHaveLength(0)
  })

  it('returns a single holiday when range is one day and it is a holiday', () => {
    const result = getHolidays({ start: makeAracajuDate(2025, 12, 25), end: makeAracajuDate(2025, 12, 25) })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Natal')
  })

  it('returns empty array when range is one day and it is not a holiday', () => {
    const result = getHolidays({ start: makeAracajuDate(2025, 3, 10), end: makeAracajuDate(2025, 3, 10) })
    expect(result).toHaveLength(0)
  })

  it('normalizes UTC date input via toAracajuDate', () => {
    // 2025-01-01T03:00:00Z = 2025-01-01 00:00 Aracaju — inclui Confraternização
    const startUTC = new Date('2025-01-01T03:00:00Z')
    const endUTC   = new Date('2025-01-01T03:00:00Z')
    const result = getHolidays({ start: startUTC, end: endUTC })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Confraternização Universal')
  })

  it('does not include holiday when UTC midnight resolves to previous Aracaju day', () => {
    // 2025-01-01T00:00:00Z = 2024-12-31 21:00 Aracaju — Dec 31 não é feriado
    const startUTC = new Date('2025-01-01T00:00:00Z')
    const endUTC   = new Date('2025-01-01T00:00:00Z')
    const result = getHolidays({ start: startUTC, end: endUTC })
    expect(result).toHaveLength(0)
  })

  it('backward compat: numeric year still works', () => {
    expect(getHolidays(2025)).toHaveLength(17)
  })

  it('backward compat: no argument still works', () => {
    expect(Array.isArray(getHolidays())).toBe(true)
  })
})

describe('isBusinessDay', () => {
  it('returns true for a regular weekday', () => {
    // 2025-03-10 Monday, not a holiday
    expect(isBusinessDay(makeAracajuDate(2025, 3, 10))).toBe(true)
  })

  it('returns false for a Saturday', () => {
    expect(isBusinessDay(makeAracajuDate(2025, 3, 1))).toBe(false)
  })

  it('returns true for a Saturday when saturdayIsBusinessDay is true', () => {
    // 2025-03-08 Saturday
    expect(isBusinessDay(makeAracajuDate(2025, 3, 8), { saturdayIsBusinessDay: true })).toBe(true)
  })

  it('returns false for a Sunday even when saturdayIsBusinessDay is true', () => {
    // 2025-03-09 Sunday
    expect(isBusinessDay(makeAracajuDate(2025, 3, 9), { saturdayIsBusinessDay: true })).toBe(false)
  })

  it('returns false for a holiday on a weekday', () => {
    // 2025-04-21 Tiradentes (Monday)
    expect(isBusinessDay(makeAracajuDate(2025, 4, 21))).toBe(false)
  })

  it('returns false for an optional holiday', () => {
    // 2025-03-04 Terça de Carnaval (Tuesday)
    expect(isBusinessDay(makeAracajuDate(2025, 3, 4))).toBe(false)
  })
})

describe('countBusinessDays', () => {
  it('counts business days between two dates (exclusive of end)', () => {
    // 2025-03-10 (Mon) to 2025-03-14 (Fri) = Mon, Tue, Wed, Thu = 4
    const start = makeAracajuDate(2025, 3, 10)
    const end = makeAracajuDate(2025, 3, 14)
    expect(countBusinessDays(start, end)).toBe(4)
  })

  it('returns 0 when start equals end', () => {
    const date = makeAracajuDate(2025, 3, 3)
    expect(countBusinessDays(date, date)).toBe(0)
  })

  it('returns 0 when end is before start', () => {
    const start = makeAracajuDate(2025, 3, 7)
    const end = makeAracajuDate(2025, 3, 3)
    expect(countBusinessDays(start, end)).toBe(0)
  })

  it('excludes holidays from count', () => {
    // Week of Carnaval 2025: Mon March 3 (optional), Tue March 4 (optional)
    // March 3 to March 8 (Sat) → Wed 5, Thu 6, Fri 7 = 3 business days
    const start = makeAracajuDate(2025, 3, 3)
    const end = makeAracajuDate(2025, 3, 8)
    expect(countBusinessDays(start, end)).toBe(3)
  })

  it('includes Saturdays when saturdayIsBusinessDay is true', () => {
    // 2025-03-10 (Mon) to 2025-03-16 (Sun) = Mon-Fri + Sat = 6
    const start = makeAracajuDate(2025, 3, 10)
    const end = makeAracajuDate(2025, 3, 16)
    expect(countBusinessDays(start, end, { saturdayIsBusinessDay: true })).toBe(6)
  })
})

describe('addBusinessDays', () => {
  it('adds business days to a date', () => {
    // 2025-03-10 (Mon) + 3 business days = 2025-03-13 (Thu)
    const result = addBusinessDays(makeAracajuDate(2025, 3, 10), 3)
    const { year, month, day } = toAracajuDate(result)
    expect({ year, month, day }).toEqual({ year: 2025, month: 3, day: 13 })
  })

  it('skips weekends', () => {
    // 2025-03-14 (Fri) + 1 business day → skips Sat 15, Sun 16, Mon 17 (Aniversário de Aracaju) → Tue 18
    const result = addBusinessDays(makeAracajuDate(2025, 3, 14), 1)
    const { year, month, day } = toAracajuDate(result)
    expect({ year, month, day }).toEqual({ year: 2025, month: 3, day: 18 })
  })

  it('skips holidays', () => {
    // 2025-04-17 (Thu) + 1 business day → skips Apr 18 (Sexta-feira Santa) → Apr 21 (Mon)
    // But Apr 21 is Tiradentes → Apr 22 (Tue)
    const result = addBusinessDays(makeAracajuDate(2025, 4, 17), 1)
    const { year, month, day } = toAracajuDate(result)
    expect({ year, month, day }).toEqual({ year: 2025, month: 4, day: 22 })
  })

  it('skips optional holidays (Carnaval)', () => {
    // 2025-02-28 (Fri) + 1 business day → skips Sat 1, Sun 2, Mon 3 (Carnaval), Tue 4 (Carnaval) → Wed Mar 5
    const result = addBusinessDays(makeAracajuDate(2025, 2, 28), 1)
    const { year, month, day } = toAracajuDate(result)
    expect({ year, month, day }).toEqual({ year: 2025, month: 3, day: 5 })
  })

  it('returns same date for 0 days', () => {
    const result = addBusinessDays(makeAracajuDate(2025, 3, 10), 0)
    const { year, month, day } = toAracajuDate(result)
    expect({ year, month, day }).toEqual({ year: 2025, month: 3, day: 10 })
  })

  it('lands on Saturday when saturdayIsBusinessDay is true', () => {
    // 2025-03-14 (Fri) + 1 business day → Sat 15 (now counts as business day)
    const result = addBusinessDays(makeAracajuDate(2025, 3, 14), 1, { saturdayIsBusinessDay: true })
    const { year, month, day } = toAracajuDate(result)
    expect({ year, month, day }).toEqual({ year: 2025, month: 3, day: 15 })
  })
})

describe('timezone edge cases', () => {
  it('UTC midnight Jan 1 resolves to Dec 31 in Aracaju (not a holiday)', () => {
    // 2025-01-01 00:00 UTC = 2024-12-31 21:00 Aracaju
    const utcMidnight = new Date('2025-01-01T00:00:00Z')
    // Dec 31 is not a holiday in Aracaju
    expect(isHoliday(utcMidnight)).toBe(false)
  })

  it('UTC 03:00 Jan 1 resolves to Jan 1 in Aracaju (Confraternização)', () => {
    // 2025-01-01 03:00 UTC = 2025-01-01 00:00 Aracaju
    const utc3am = new Date('2025-01-01T03:00:00Z')
    expect(isHoliday(utc3am)).toBe(true)
    expect(getHoliday(utc3am)!.name).toBe('Confraternização Universal')
  })
})
