import { z } from 'zod'

import type { SearchParams } from './filters'
import type { Transaction } from './transaction'

export const PAGE_SIZE = 10

export type SortField = 'date' | 'amount'
export type SortOrder = 'ascend' | 'descend'

export interface TableParams {
  page: number
  sortField: SortField
  sortOrder: SortOrder
}

export const DEFAULT_TABLE_PARAMS: TableParams = {
  page: 1,
  sortField: 'date',
  sortOrder: 'descend',
}

const tableParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(DEFAULT_TABLE_PARAMS.page),
  sortField: z.enum(['date', 'amount']).catch(DEFAULT_TABLE_PARAMS.sortField),
  sortOrder: z.enum(['ascend', 'descend']).catch(DEFAULT_TABLE_PARAMS.sortOrder),
})

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

export function parseTableParams(searchParams: SearchParams): TableParams {
  return tableParamsSchema.parse({
    page: first(searchParams.page),
    sortField: first(searchParams.sort),
    sortOrder: first(searchParams.order),
  })
}

/** Só escreve na URL o que difere do padrão, mantendo links curtos. */
export function serializeTableParams(params: TableParams, target = new URLSearchParams()) {
  if (params.page !== DEFAULT_TABLE_PARAMS.page) target.set('page', String(params.page))
  if (params.sortField !== DEFAULT_TABLE_PARAMS.sortField) target.set('sort', params.sortField)
  if (params.sortOrder !== DEFAULT_TABLE_PARAMS.sortOrder) target.set('order', params.sortOrder)
  return target
}

export interface TablePage<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export function paginateTransactions(
  transactions: readonly Transaction[],
  { page, sortField, sortOrder }: TableParams,
  pageSize = PAGE_SIZE,
): TablePage<Transaction> {
  const direction = sortOrder === 'ascend' ? 1 : -1
  const key = sortField === 'date' ? 'date' : 'amountInCents'
  const sorted = [...transactions].sort((a, b) => (a[key] - b[key]) * direction)

  const lastPage = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, lastPage)
  const start = (safePage - 1) * pageSize

  return {
    items: sorted.slice(start, start + pageSize),
    total: sorted.length,
    page: safePage,
    pageSize,
  }
}

/** Clique no cabeçalho: inverte a ordem da mesma coluna ou ordena outra de forma decrescente. */
export function toggleSort(params: TableParams, field: SortField): TableParams {
  const sortOrder: SortOrder =
    params.sortField === field && params.sortOrder === 'descend' ? 'ascend' : 'descend'
  return { page: 1, sortField: field, sortOrder }
}
