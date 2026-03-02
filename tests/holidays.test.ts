import { describe, it, expect } from 'vitest'
import { getHolidaysForYear } from '../src/holidays'
import { toAracajuDate } from '../src/utils'

describe('getHolidaysForYear', () => {
  it('returns 17 holidays for 2024+', () => {
    expect(getHolidaysForYear(2024)).toHaveLength(17)
    expect(getHolidaysForYear(2025)).toHaveLength(17)
    expect(getHolidaysForYear(2026)).toHaveLength(17)
  })

  it('excludes Consciência Negra before 2024', () => {
    const holidays = getHolidaysForYear(2023)
    const names = holidays.map((h) => h.name)
    expect(names).not.toContain('Consciência Negra')
    expect(holidays).toHaveLength(16)
  })

  it('includes all fixed holidays', () => {
    const holidays = getHolidaysForYear(2025)
    const names = holidays.map((h) => h.name)
    expect(names).toContain('Confraternização Universal')
    expect(names).toContain('Aniversário de Aracaju')
    expect(names).toContain('Tiradentes')
    expect(names).toContain('Dia do Trabalho')
    expect(names).toContain('São João')
    expect(names).toContain('Emancipação de Sergipe')
    expect(names).toContain('Independência do Brasil')
    expect(names).toContain('Nossa Sra. Aparecida')
    expect(names).toContain('Finados')
    expect(names).toContain('Proclamação da República')
    expect(names).toContain('Consciência Negra')
    expect(names).toContain('Nossa Sra. da Conceição')
    expect(names).toContain('Natal')
  })

  it('includes movable holidays', () => {
    const holidays = getHolidaysForYear(2025)
    const names = holidays.map((h) => h.name)
    expect(names).toContain('Segunda de Carnaval')
    expect(names).toContain('Terça de Carnaval')
    expect(names).toContain('Sexta-feira Santa')
    expect(names).toContain('Corpus Christi')
  })

  it('computes correct movable holiday dates for 2025 (Easter = April 20)', () => {
    const holidays = getHolidaysForYear(2025)
    const find = (name: string) => {
      const h = holidays.find((h) => h.name === name)!
      return toAracajuDate(h.date)
    }

    // Easter 2025 = April 20
    // Carnaval Monday = -48 days = March 3
    expect(find('Segunda de Carnaval')).toEqual({
      year: 2025,
      month: 3,
      day: 3,
    })
    // Carnaval Tuesday = -47 days = March 4
    expect(find('Terça de Carnaval')).toEqual({ year: 2025, month: 3, day: 4 })
    // Good Friday = -2 days = April 18
    expect(find('Sexta-feira Santa')).toEqual({ year: 2025, month: 4, day: 18 })
    // Corpus Christi = +60 days = June 19
    expect(find('Corpus Christi')).toEqual({ year: 2025, month: 6, day: 19 })
  })

  it('returns holidays sorted by date', () => {
    const holidays = getHolidaysForYear(2025)
    for (let i = 1; i < holidays.length; i++) {
      expect(holidays[i].date.getTime()).toBeGreaterThanOrEqual(
        holidays[i - 1].date.getTime(),
      )
    }
  })
})
