import { makeTransaction } from '@test/factories'

import {
  DEFAULT_TABLE_PARAMS,
  paginateTransactions,
  parseTableParams,
  serializeTableParams,
  toggleSort,
} from './table'

describe('parseTableParams', () => {
  it('usa os padrões quando ausentes ou inválidos', () => {
    expect(parseTableParams({})).toEqual(DEFAULT_TABLE_PARAMS)
    expect(parseTableParams({ page: '-2', sort: 'account', order: 'up' })).toEqual(
      DEFAULT_TABLE_PARAMS,
    )
  })

  it('lê valores válidos (inclusive repetidos)', () => {
    expect(parseTableParams({ page: ['3', '9'], sort: 'amount', order: 'ascend' })).toEqual({
      page: 3,
      sortField: 'amount',
      sortOrder: 'ascend',
    })
  })
})

describe('serializeTableParams', () => {
  it('omite valores padrão', () => {
    expect(serializeTableParams(DEFAULT_TABLE_PARAMS).toString()).toBe('')
  })

  it('escreve apenas o que difere, reaproveitando params existentes', () => {
    const target = new URLSearchParams('states=TX')
    expect(
      serializeTableParams(
        { page: 2, sortField: 'amount', sortOrder: 'ascend' },
        target,
      ).toString(),
    ).toBe('states=TX&page=2&sort=amount&order=ascend')
  })
})

describe('paginateTransactions', () => {
  const txs = [
    makeTransaction({ id: 'a', date: 1, amountInCents: 300 }),
    makeTransaction({ id: 'b', date: 3, amountInCents: 100 }),
    makeTransaction({ id: 'c', date: 2, amountInCents: 200 }),
  ]
  const ids = (page: { items: Array<{ id: string }> }) => page.items.map((item) => item.id)

  it('ordena por data decrescente e pagina', () => {
    const page = paginateTransactions(txs, DEFAULT_TABLE_PARAMS, 2)
    expect(ids(page)).toEqual(['b', 'c'])
    expect(page).toMatchObject({ total: 3, page: 1, pageSize: 2 })
  })

  it('ordena por valor crescente', () => {
    const page = paginateTransactions(txs, { page: 1, sortField: 'amount', sortOrder: 'ascend' })
    expect(ids(page)).toEqual(['b', 'c', 'a'])
  })

  it('limita a página à última existente e não altera a entrada', () => {
    const page = paginateTransactions(txs, { ...DEFAULT_TABLE_PARAMS, page: 99 }, 2)
    expect(page.page).toBe(2)
    expect(ids(page)).toEqual(['a'])
    expect(txs.map((tx) => tx.id)).toEqual(['a', 'b', 'c'])
  })

  it('lida com lista vazia', () => {
    expect(paginateTransactions([], DEFAULT_TABLE_PARAMS)).toMatchObject({
      items: [],
      page: 1,
      total: 0,
    })
  })
})

describe('toggleSort', () => {
  it('inverte a ordem da coluna atual e volta para a primeira página', () => {
    expect(toggleSort({ page: 4, sortField: 'date', sortOrder: 'descend' }, 'date')).toEqual({
      page: 1,
      sortField: 'date',
      sortOrder: 'ascend',
    })
    expect(toggleSort({ page: 1, sortField: 'date', sortOrder: 'ascend' }, 'date').sortOrder).toBe(
      'descend',
    )
  })

  it('ordena uma nova coluna de forma decrescente', () => {
    expect(toggleSort({ page: 2, sortField: 'date', sortOrder: 'ascend' }, 'amount')).toEqual({
      page: 1,
      sortField: 'amount',
      sortOrder: 'descend',
    })
  })
})
