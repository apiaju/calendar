import { describe, it, expect } from 'vitest'
import {
  toAracajuDate,
  addDays,
  isWeekend,
  makeAracajuDate,
} from '../src/utils'

describe('toAracajuDate', () => {
  it('converts UTC midnight to Aracaju date (previous day when before 03:00 UTC)', () => {
    // 2025-01-01 00:00 UTC = 2024-12-31 21:00 Aracaju (UTC-3)
    const date = new Date('2025-01-01T00:00:00Z')
    expect(toAracajuDate(date)).toEqual({ year: 2024, month: 12, day: 31 })
  })

  it('converts UTC afternoon to same Aracaju day', () => {
    // 2025-01-01 15:00 UTC = 2025-01-01 12:00 Aracaju
    const date = new Date('2025-01-01T15:00:00Z')
    expect(toAracajuDate(date)).toEqual({ year: 2025, month: 1, day: 1 })
  })

  it('handles UTC+9 perspective correctly', () => {
    // Someone in UTC+9 at 2025-01-01 08:00 local = 2024-12-31 23:00 UTC = 2024-12-31 20:00 Aracaju
    const date = new Date('2024-12-31T23:00:00Z')
    expect(toAracajuDate(date)).toEqual({ year: 2024, month: 12, day: 31 })
  })
})

describe('addDays', () => {
  it('adds positive days', () => {
    const date = new Date('2025-03-01T12:00:00Z')
    const result = addDays(date, 5)
    expect(result.toISOString()).toBe('2025-03-06T12:00:00.000Z')
  })

  it('subtracts days with negative offset', () => {
    const date = new Date('2025-03-10T12:00:00Z')
    const result = addDays(date, -3)
    expect(result.toISOString()).toBe('2025-03-07T12:00:00.000Z')
  })
})

describe('isWeekend', () => {
  it('returns true for Saturday', () => {
    // 2025-03-01 is a Saturday
    expect(isWeekend(makeAracajuDate(2025, 3, 1))).toBe(true)
  })

  it('returns true for Sunday', () => {
    // 2025-03-02 is a Sunday
    expect(isWeekend(makeAracajuDate(2025, 3, 2))).toBe(true)
  })

  it('returns false for Monday', () => {
    // 2025-03-03 is a Monday
    expect(isWeekend(makeAracajuDate(2025, 3, 3))).toBe(false)
  })
})

describe('makeAracajuDate', () => {
  it('creates a date that resolves to the correct Aracaju day', () => {
    const date = makeAracajuDate(2025, 6, 24)
    const parts = toAracajuDate(date)
    expect(parts).toEqual({ year: 2025, month: 6, day: 24 })
  })
})
