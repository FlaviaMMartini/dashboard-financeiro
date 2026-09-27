import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'

import {
  buildIndustryBreakdown,
  buildMonthlySeries,
  summarize,
  type IndustryBreakdown,
  type MonthlyPoint,
  type Summary,
} from '@/domain/aggregations'
import { toIsoDay } from '@/domain/dates'
import { getFilterOptions, type FilterOptions } from '@/domain/filter-options'
import { applyFilters, type Filters } from '@/domain/filters'
import { isPending, PENDING_WINDOW_DAYS } from '@/domain/pending'
import { paginateTransactions, type TablePage, type TableParams } from '@/domain/table'
import type { Transaction } from '@/domain/transaction'

import { loadDataset } from './transactions-repository'

export interface TransactionRow extends Transaction {
  pending: boolean
}

export interface DashboardData {
  summary: Summary
  monthly: MonthlyPoint[]
  breakdown: Record<Transaction['type'], IndustryBreakdown>
  options: FilterOptions
  table: TablePage<TransactionRow>
  period: { firstDay: string; lastDay: string }
  pendingRule: { referenceDay: string; windowDays: number }
}

/**
 * Toda a agregação acontece no servidor: o navegador recebe alguns KB em vez
 * dos 11,7 MB do dataset. `'use cache'` guarda uma entrada por combinação de
 * filtros (os argumentos compõem a chave do cache).
 */
export async function getDashboardData(
  filters: Filters,
  tableParams: TableParams,
): Promise<DashboardData> {
  'use cache'
  cacheLife('hours')
  cacheTag('transactions')

  const dataset = await loadDataset()
  const filtered = applyFilters(dataset.transactions, filters)
  const page = paginateTransactions(filtered, tableParams)

  return {
    summary: summarize(filtered, dataset.referenceDate),
    monthly: buildMonthlySeries(filtered),
    breakdown: {
      deposit: buildIndustryBreakdown(filtered, 'deposit'),
      withdraw: buildIndustryBreakdown(filtered, 'withdraw'),
    },
    options: getFilterOptions(dataset.accountProfiles, filters),
    table: {
      ...page,
      items: page.items.map((tx) => ({ ...tx, pending: isPending(tx, dataset.referenceDate) })),
    },
    period: { firstDay: toIsoDay(dataset.firstDate), lastDay: toIsoDay(dataset.referenceDate) },
    pendingRule: {
      referenceDay: toIsoDay(dataset.referenceDate),
      windowDays: PENDING_WINDOW_DAYS,
    },
  }
}
