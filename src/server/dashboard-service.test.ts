/** @jest-environment node */
import { cacheLife, cacheTag } from 'next/cache'

import { makeTransaction } from '@test/factories'

import { DAY_IN_MS } from '@/domain/dates'
import { extractAccountProfiles } from '@/domain/filter-options'
import { DEFAULT_TABLE_PARAMS } from '@/domain/table'

import { getDashboardData } from './dashboard-service'
import { loadDataset } from './transactions-repository'

jest.mock('next/cache', () => ({ cacheLife: jest.fn(), cacheTag: jest.fn() }))
jest.mock('./transactions-repository', () => ({ loadDataset: jest.fn() }))

const reference = Date.UTC(2023, 10, 30)
const transactions = [
  makeTransaction({ id: 'old', date: reference - 40 * DAY_IN_MS, state: 'TX', amountInCents: 900 }),
  makeTransaction({
    id: 'recent',
    date: reference,
    state: 'TX',
    type: 'withdraw',
    amountInCents: 100,
  }),
  makeTransaction({ id: 'other', date: reference - 40 * DAY_IN_MS, account: 'Other', state: 'CA' }),
]

jest.mocked(loadDataset).mockResolvedValue({
  transactions,
  accountProfiles: extractAccountProfiles(transactions),
  referenceDate: reference,
  firstDate: reference - 40 * DAY_IN_MS,
})

describe('getDashboardData', () => {
  it('agrega apenas as transações filtradas e marca pendentes', async () => {
    const data = await getDashboardData(
      { accounts: [], industries: [], states: ['TX'] },
      DEFAULT_TABLE_PARAMS,
    )

    expect(data.summary).toMatchObject({
      revenueInCents: 900,
      pendingCount: 1,
      pendingAmountInCents: 100,
      transactionCount: 2,
    })
    expect(data.table.items.map((row) => [row.id, row.pending])).toEqual([
      ['recent', true],
      ['old', false],
    ])
    expect(data.monthly).toHaveLength(2)
    expect(data.breakdown.withdraw.industries).toEqual(['Airlines'])
    expect(data.options.states).toEqual(['CA', 'TX'])
    expect(data.period).toEqual({ firstDay: '2023-10-21', lastDay: '2023-11-30' })
    expect(data.pendingRule).toEqual({ referenceDay: '2023-11-30', windowDays: 7 })
  })

  it("usa o cache do Next ('use cache') com revalidação e tag", async () => {
    await getDashboardData({ accounts: [], industries: [], states: [] }, DEFAULT_TABLE_PARAMS)
    expect(cacheLife).toHaveBeenCalledWith('hours')
    expect(cacheTag).toHaveBeenCalledWith('transactions')
  })
})
