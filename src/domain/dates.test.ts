import {
  DAY_IN_MS,
  endOfIsoDay,
  formatDate,
  formatMonthKey,
  startOfIsoDay,
  toIsoDay,
  toMonthKey,
} from './dates'

const lateNightUtc = Date.UTC(2023, 10, 30, 23, 59, 59)

describe('dates (sempre em UTC)', () => {
  it('extrai dia e mês ISO sem depender do fuso local', () => {
    expect(toIsoDay(lateNightUtc)).toBe('2023-11-30')
    expect(toMonthKey(lateNightUtc)).toBe('2023-11')
  })

  it('calcula início e fim inclusivos do dia', () => {
    expect(startOfIsoDay('2023-11-30')).toBe(Date.UTC(2023, 10, 30))
    expect(endOfIsoDay('2023-11-30')).toBe(Date.UTC(2023, 10, 30) + DAY_IN_MS - 1)
  })

  it('formata datas e meses em pt-BR', () => {
    expect(formatDate(lateNightUtc)).toBe('30/11/2023')
    expect(formatMonthKey('2023-11')).toMatch(/nov.*23/)
  })
})
