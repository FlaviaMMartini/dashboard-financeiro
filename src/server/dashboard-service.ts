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

export const TRANSACTIONS_CACHE_TAG = 'transactions'

export interface TransactionRow extends Transaction {
  pending: boolean
}

/** Tudo que depende apenas dos filtros: cards, gráficos e opções dos selects. */
export interface DashboardOverview {
  summary: Summary
  monthly: MonthlyPoint[]
  breakdown: Record<Transaction['type'], IndustryBreakdown>
  options: FilterOptions
  period: { firstDay: string; lastDay: string }
  pendingRule: { referenceDay: string; windowDays: number }
}

export interface DashboardData extends DashboardOverview {
  table: TablePage<TransactionRow>
}

/*
 * Toda a agregação acontece no servidor: o navegador recebe alguns KB em vez
 * dos 11,7 MB do dataset. O cache é dividido em duas funções, porque os
 * argumentos de uma função com `'use cache'` compõem a sua chave:
 *
 * - `getDashboardOverview(filters)`: trocar de página ou de ordenação não
 *   recalcula cards e gráficos;
 * - `getTransactionsPage(filters, tableParams)`: uma entrada por página.
 */

export async function getDashboardOverview(filters: Filters): Promise<DashboardOverview> {
  'use cache'
  cacheLife('hours')
  cacheTag(TRANSACTIONS_CACHE_TAG)

  const dataset = await loadDataset()
  const filtered = applyFilters(dataset.transactions, filters)

  return {
    summary: summarize(filtered, dataset.referenceDate),
    monthly: buildMonthlySeries(filtered),
    breakdown: {
      deposit: buildIndustryBreakdown(filtered, 'deposit'),
      withdraw: buildIndustryBreakdown(filtered, 'withdraw'),
    },
    options: getFilterOptions(dataset.accountProfiles, filters),
    period: { firstDay: toIsoDay(dataset.firstDate), lastDay: toIsoDay(dataset.referenceDate) },
    pendingRule: {
      referenceDay: toIsoDay(dataset.referenceDate),
      windowDays: PENDING_WINDOW_DAYS,
    },
  }
}

export async function getTransactionsPage(
  filters: Filters,
  tableParams: TableParams,
): Promise<TablePage<TransactionRow>> {
  'use cache'
  cacheLife('hours')
  cacheTag(TRANSACTIONS_CACHE_TAG)

  const dataset = await loadDataset()
  const page = paginateTransactions(applyFilters(dataset.transactions, filters), tableParams)

  return {
    ...page,
    items: page.items.map((tx) => ({ ...tx, pending: isPending(tx, dataset.referenceDate) })),
  }
}
