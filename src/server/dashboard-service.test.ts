/** @jest-environment node */
import { cacheLife, cacheTag } from 'next/cache'

import { makeTransaction } from '@test/factories'

import { DAY_IN_MS } from '@/domain/dates'
import { extractAccountProfiles } from '@/domain/filter-options'
import { DEFAULT_TABLE_PARAMS } from '@/domain/table'

import {
  getDashboardOverview,
  getTransactionsPage,
  TRANSACTIONS_CACHE_TAG,
} from './dashboard-service'
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

const onlyTx = { accounts: [], industries: [], states: ['TX'] }

beforeEach(() => jest.clearAllMocks())

describe('getDashboardOverview', () => {
  it('agrega apenas as transações filtradas (cards, gráficos e opções)', async () => {
    const data = await getDashboardOverview(onlyTx)

    expect(data.summary).toMatchObject({
      revenueInCents: 900,
      pendingCount: 1,
      pendingAmountInCents: 100,
      transactionCount: 2,
    })
    expect(data.monthly).toHaveLength(2)
    expect(data.breakdown.withdraw.industries).toEqual(['Airlines'])
    expect(data.options.states).toEqual(['CA', 'TX'])
    expect(data.period).toEqual({ firstDay: '2023-10-21', lastDay: '2023-11-30' })
    expect(data.pendingRule).toEqual({ referenceDay: '2023-11-30', windowDays: 7 })
    expect(data).not.toHaveProperty('table')
  })

  it('depende só dos filtros: página e ordenação não fazem parte da chave do cache', () => {
    // Os argumentos de uma função com 'use cache' compõem a chave.
    expect(getDashboardOverview).toHaveLength(1)
  })
})

describe('getTransactionsPage', () => {
  it('pagina as transações filtradas e marca pendentes', async () => {
    const page = await getTransactionsPage(onlyTx, DEFAULT_TABLE_PARAMS)

    expect(page).toMatchObject({ total: 2, page: 1, pageSize: 10 })
    expect(page.items.map((row) => [row.id, row.pending])).toEqual([
      ['recent', true],
      ['old', false],
    ])
  })

  it('respeita a ordenação pedida', async () => {
    const page = await getTransactionsPage(onlyTx, {
      page: 1,
      sortField: 'amount',
      sortOrder: 'ascend',
    })
    expect(page.items.map((row) => row.id)).toEqual(['recent', 'old'])
  })
})

describe("cache do Next ('use cache')", () => {
  it.each([
    ['getDashboardOverview', () => getDashboardOverview(onlyTx)],
    ['getTransactionsPage', () => getTransactionsPage(onlyTx, DEFAULT_TABLE_PARAMS)],
  ])('%s usa revalidação e a tag compartilhada', async (_, call) => {
    await call()
    expect(cacheLife).toHaveBeenCalledWith('hours')
    expect(cacheTag).toHaveBeenCalledWith(TRANSACTIONS_CACHE_TAG)
  })
})
