import { makeTransaction } from '@test/factories'

import { buildIndustryBreakdown, buildMonthlySeries, summarize } from './aggregations'
import { DAY_IN_MS } from './dates'

const reference = Date.UTC(2023, 10, 30)
const old = reference - 30 * DAY_IN_MS

describe('summarize', () => {
  it('separa receitas, despesas e pendentes; o saldo ignora pendentes', () => {
    const summary = summarize(
      [
        makeTransaction({ type: 'deposit', amountInCents: 10_000, date: old }),
        makeTransaction({ type: 'withdraw', amountInCents: 2_500, date: old }),
        makeTransaction({ type: 'deposit', amountInCents: 700, date: reference }),
        makeTransaction({ type: 'withdraw', amountInCents: 300, date: reference }),
      ],
      reference,
    )

    expect(summary).toEqual({
      revenueInCents: 10_000,
      expensesInCents: 2_500,
      balanceInCents: 7_500,
      pendingCount: 2,
      pendingAmountInCents: 1_000,
      transactionCount: 4,
    })
  })

  it('permite saldo negativo e lista vazia', () => {
    expect(
      summarize([makeTransaction({ type: 'withdraw', amountInCents: 50, date: old })], reference)
        .balanceInCents,
    ).toBe(-50)
    expect(summarize([], reference).transactionCount).toBe(0)
  })
})

describe('buildMonthlySeries', () => {
  it('agrupa por mês em ordem cronológica com saldo acumulado', () => {
    const series = buildMonthlySeries([
      makeTransaction({ date: Date.UTC(2023, 1, 5), type: 'withdraw', amountInCents: 400 }),
      makeTransaction({ date: Date.UTC(2023, 0, 5), type: 'deposit', amountInCents: 1000 }),
      makeTransaction({ date: Date.UTC(2023, 0, 20), type: 'withdraw', amountInCents: 300 }),
      makeTransaction({ date: Date.UTC(2023, 1, 9), type: 'deposit', amountInCents: 100 }),
    ])

    expect(series).toEqual([
      { month: '2023-01', revenue: 1000, expenses: 300, balance: 700 },
      { month: '2023-02', revenue: 100, expenses: 400, balance: 400 },
    ])
  })
})

describe('buildIndustryBreakdown', () => {
  it('soma por mês e indústria apenas o tipo pedido, preenchendo zeros', () => {
    const breakdown = buildIndustryBreakdown(
      [
        makeTransaction({
          date: Date.UTC(2023, 1, 1),
          industry: 'Hotels',
          type: 'withdraw',
          amountInCents: 5,
        }),
        makeTransaction({
          date: Date.UTC(2023, 0, 1),
          industry: 'Airlines',
          type: 'withdraw',
          amountInCents: 10,
        }),
        makeTransaction({
          date: Date.UTC(2023, 0, 2),
          industry: 'Airlines',
          type: 'withdraw',
          amountInCents: 20,
        }),
        makeTransaction({
          date: Date.UTC(2023, 0, 3),
          industry: 'Mail',
          type: 'deposit',
          amountInCents: 99,
        }),
      ],
      'withdraw',
    )

    expect(breakdown).toEqual({
      industries: ['Airlines', 'Hotels'],
      rows: [
        { month: '2023-01', Airlines: 30, Hotels: 0 },
        { month: '2023-02', Airlines: 0, Hotels: 5 },
      ],
    })
  })
})
