import { describe, it, expect } from 'vitest'
import { computeEaster } from '../src/easter'

describe('computeEaster', () => {
  it.each([
    [2020, 4, 12],
    [2021, 4, 4],
    [2022, 4, 17],
    [2023, 4, 9],
    [2024, 3, 31],
    [2025, 4, 20],
    [2026, 4, 5],
    [2027, 3, 28],
    [2028, 4, 16],
    [2030, 4, 21],
  ])('year %i → %i/%i', (year, month, day) => {
    expect(computeEaster(year)).toEqual({ month, day })
  })
})
