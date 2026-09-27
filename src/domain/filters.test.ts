import { makeTransaction } from '@test/factories'

import {
  applyFilters,
  countActiveFilters,
  parseFilters,
  serializeFilters,
  toSearchParamsRecord,
  withDateRange,
  type Filters,
} from './filters'

const empty: Filters = { accounts: [], industries: [], states: [] }
const period = { firstDay: '2021-11-10', lastDay: '2023-11-30' }

describe('parseFilters', () => {
  it('retorna filtros vazios sem search params', () => {
    expect(parseFilters({})).toEqual(empty)
  })

  it('lê datas válidas e listas (valor único ou repetido), removendo duplicados e vazios', () => {
    expect(
      parseFilters({
        from: '2023-01-01',
        to: ['2023-06-30', '2023-12-31'],
        accounts: ['Beta', 'Alpha', 'Beta', ' '],
        industries: 'Airlines',
        states: undefined,
      }),
    ).toEqual({
      from: '2023-01-01',
      to: '2023-06-30',
      accounts: ['Alpha', 'Beta'],
      industries: ['Airlines'],
      states: [],
    })
  })

  it('descarta datas inválidas', () => {
    expect(parseFilters({ from: '2023-13-45', to: 'ontem' })).toEqual(empty)
  })

  it('inverte o intervalo quando from > to', () => {
    expect(parseFilters({ from: '2023-06-30', to: '2023-01-01' })).toMatchObject({
      from: '2023-01-01',
      to: '2023-06-30',
    })
  })
})

describe('serializeFilters / toSearchParamsRecord', () => {
  it('faz round-trip com parseFilters', () => {
    const filters: Filters = {
      from: '2023-01-01',
      to: '2023-02-01',
      accounts: ['A & B', 'C'],
      industries: ['Airlines'],
      states: ['TX'],
    }
    const params = serializeFilters(filters)
    expect(params.toString()).toBe(
      'from=2023-01-01&to=2023-02-01&accounts=A+%26+B&accounts=C&industries=Airlines&states=TX',
    )
    expect(parseFilters(toSearchParamsRecord(params))).toEqual(filters)
  })

  it('omite datas ausentes', () => {
    expect(serializeFilters(empty).toString()).toBe('')
  })
})

describe('countActiveFilters', () => {
  it('não conta o período completo como filtro', () => {
    expect(countActiveFilters(empty, period)).toBe(0)
    expect(
      countActiveFilters({ ...empty, from: period.firstDay, to: period.lastDay }, period),
    ).toBe(0)
  })

  it('conta um período parcial e cada item selecionado', () => {
    expect(countActiveFilters({ ...empty, from: '2023-01-01' }, period)).toBe(1)
    expect(countActiveFilters({ ...empty, to: '2023-01-01' }, period)).toBe(1)
    expect(
      countActiveFilters({ accounts: ['A', 'B'], industries: ['I'], states: ['S'] }, period),
    ).toBe(4)
  })
})

describe('withDateRange', () => {
  it('aplica um intervalo completo', () => {
    expect(withDateRange(empty, ['2023-01-01', '2023-01-31'])).toEqual({
      ...empty,
      from: '2023-01-01',
      to: '2023-01-31',
    })
  })

  it.each([[null], [[undefined, '2023-01-31'] as const], [['2023-01-01', undefined] as const]])(
    'mantém os filtros para intervalo incompleto %p',
    (range) => {
      expect(withDateRange(empty, range)).toBe(empty)
    },
  )
})

describe('applyFilters', () => {
  const jan = makeTransaction({
    date: Date.UTC(2023, 0, 1),
    account: 'A',
    industry: 'I1',
    state: 'TX',
  })
  const janEnd = makeTransaction({
    date: Date.UTC(2023, 0, 31, 23, 59, 59, 999),
    account: 'B',
    industry: 'I2',
    state: 'CA',
  })
  const feb = makeTransaction({
    date: Date.UTC(2023, 1, 1),
    account: 'C',
    industry: 'I1',
    state: 'CA',
  })
  const all = [jan, janEnd, feb]

  it('sem filtros retorna tudo', () => {
    expect(applyFilters(all, empty)).toEqual(all)
  })

  it('filtra por intervalo de datas inclusivo em UTC', () => {
    expect(applyFilters(all, { ...empty, from: '2023-01-01', to: '2023-01-31' })).toEqual([
      jan,
      janEnd,
    ])
    expect(applyFilters(all, { ...empty, from: '2023-02-01' })).toEqual([feb])
    expect(applyFilters(all, { ...empty, to: '2022-12-31' })).toEqual([])
  })

  it('combina contas, indústrias e estados com E lógico', () => {
    expect(applyFilters(all, { ...empty, accounts: ['A', 'C'] })).toEqual([jan, feb])
    expect(applyFilters(all, { ...empty, industries: ['I1'], states: ['CA'] })).toEqual([feb])
  })
})
