export type HolidayType = 'holiday' | 'optional'

export type HolidayLevel = 'national' | 'state' | 'municipal'

export interface Holiday {
  date: Date
  name: string
  type: HolidayType
  level: HolidayLevel
}

export interface BusinessDayOptions {
  saturdayIsBusinessDay?: boolean
}
