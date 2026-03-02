import type { HolidayLevel, HolidayType, Holiday } from './types'
import { computeEaster } from './easter'
import { addDays, makeAracajuDate } from './utils'

interface FixedHoliday {
  month: number
  day: number
  name: string
  type: HolidayType
  level: HolidayLevel
  since?: number
}

interface MovableHoliday {
  offset: number
  name: string
  type: HolidayType
  level: HolidayLevel
}

const FIXED_HOLIDAYS: FixedHoliday[] = [
  {
    month: 1,
    day: 1,
    name: 'Confraternização Universal',
    type: 'holiday',
    level: 'national',
  },
  {
    month: 3,
    day: 17,
    name: 'Aniversário de Aracaju',
    type: 'holiday',
    level: 'municipal',
    since: 1988,
  },
  { month: 4, day: 21, name: 'Tiradentes', type: 'holiday', level: 'national' },
  {
    month: 5,
    day: 1,
    name: 'Dia do Trabalho',
    type: 'holiday',
    level: 'national',
  },
  {
    month: 6,
    day: 24,
    name: 'São João',
    type: 'holiday',
    level: 'municipal',
    since: 2010,
  },
  {
    month: 7,
    day: 8,
    name: 'Emancipação de Sergipe',
    type: 'holiday',
    level: 'state',
  },
  {
    month: 9,
    day: 7,
    name: 'Independência do Brasil',
    type: 'holiday',
    level: 'national',
  },
  {
    month: 10,
    day: 12,
    name: 'Nossa Sra. Aparecida',
    type: 'holiday',
    level: 'national',
  },
  { month: 11, day: 2, name: 'Finados', type: 'holiday', level: 'national' },
  {
    month: 11,
    day: 15,
    name: 'Proclamação da República',
    type: 'holiday',
    level: 'national',
  },
  {
    month: 11,
    day: 20,
    name: 'Consciência Negra',
    type: 'holiday',
    level: 'national',
    since: 2024,
  },
  {
    month: 12,
    day: 8,
    name: 'Nossa Sra. da Conceição',
    type: 'holiday',
    level: 'municipal',
  },
  { month: 12, day: 25, name: 'Natal', type: 'holiday', level: 'national' },
]

const MOVABLE_HOLIDAYS: MovableHoliday[] = [
  {
    offset: -48,
    name: 'Segunda de Carnaval',
    type: 'optional',
    level: 'national',
  },
  {
    offset: -47,
    name: 'Terça de Carnaval',
    type: 'optional',
    level: 'national',
  },
  { offset: -2, name: 'Sexta-feira Santa', type: 'holiday', level: 'national' },
  { offset: 60, name: 'Corpus Christi', type: 'holiday', level: 'municipal' },
]

export function getHolidaysForYear(year: number): Holiday[] {
  const holidays: Holiday[] = []

  for (const h of FIXED_HOLIDAYS) {
    if (h.since !== undefined && year < h.since) continue
    holidays.push({
      date: makeAracajuDate(year, h.month, h.day),
      name: h.name,
      type: h.type,
      level: h.level,
    })
  }

  const easter = computeEaster(year)
  const easterDate = makeAracajuDate(year, easter.month, easter.day)

  for (const h of MOVABLE_HOLIDAYS) {
    holidays.push({
      date: addDays(easterDate, h.offset),
      name: h.name,
      type: h.type,
      level: h.level,
    })
  }

  holidays.sort((a, b) => a.date.getTime() - b.date.getTime())

  return holidays
}
