const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Maceio',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

export function toAracajuDate(date: Date): { year: number; month: number; day: number } {
  const parts = formatter.formatToParts(date)
  const year = Number(parts.find((p) => p.type === 'year')!.value)
  const month = Number(parts.find((p) => p.type === 'month')!.value)
  const day = Number(parts.find((p) => p.type === 'day')!.value)
  return { year, month, day }
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime())
  result.setDate(result.getDate() + days)
  return result
}

export function isWeekend(date: Date, saturdayIsBusinessDay = false): boolean {
  const { year, month, day } = toAracajuDate(date)
  const local = new Date(year, month - 1, day)
  const dow = local.getDay()
  if (saturdayIsBusinessDay) return dow === 0
  return dow === 0 || dow === 6
}

export function makeAracajuDate(year: number, month: number, day: number): Date {
  // Create a date at noon UTC-3 (= 15:00 UTC) to safely land in the correct Aracaju day
  return new Date(Date.UTC(year, month - 1, day, 15, 0, 0))
}
