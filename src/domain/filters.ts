import { z } from 'zod'

import { endOfIsoDay, startOfIsoDay } from './dates'
import type { Transaction } from './transaction'

export interface Filters {
  /** `YYYY-MM-DD`, inclusivo. */
  from?: string
  /** `YYYY-MM-DD`, inclusivo. */
  to?: string
  accounts: string[]
  industries: string[]
  states: string[]
}

export type SearchParams = Record<string, string | string[] | undefined>

const isoDaySchema = z.iso.date()

/** Converte `URLSearchParams` no mesmo formato que o Next entrega em `page.searchParams`. */
export function toSearchParamsRecord(params: URLSearchParams): SearchParams {
  const record: Record<string, string | string[]> = {}
  for (const key of new Set(params.keys())) {
    const values = params.getAll(key)
    record[key] = values.length === 1 ? values[0]! : values
  }
  return record
}

function readList(value: string | string[] | undefined): string[] {
  const list = Array.isArray(value) ? value : value ? [value] : []
  return [...new Set(list.map((item) => item.trim()).filter(Boolean))].sort()
}

function readIsoDay(value: string | string[] | undefined): string | undefined {
  const single = Array.isArray(value) ? value[0] : value
  const parsed = isoDaySchema.safeParse(single)
  return parsed.success ? parsed.data : undefined
}

/** Converte search params não confiáveis em filtros válidos, descartando valores inválidos. */
export function parseFilters(searchParams: SearchParams): Filters {
  let from = readIsoDay(searchParams.from)
  let to = readIsoDay(searchParams.to)
  if (from && to && from > to) [from, to] = [to, from]

  return {
    ...(from && { from }),
    ...(to && { to }),
    accounts: readList(searchParams.accounts),
    industries: readList(searchParams.industries),
    states: readList(searchParams.states),
  }
}

export function serializeFilters(filters: Filters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  filters.accounts.forEach((value) => params.append('accounts', value))
  filters.industries.forEach((value) => params.append('industries', value))
  filters.states.forEach((value) => params.append('states', value))
  return params
}

export interface Period {
  firstDay: string
  lastDay: string
}

/** Um período igual ao do dataset inteiro não conta como filtro ativo. */
export function countActiveFilters(filters: Filters, period: Period): number {
  const isFullPeriod =
    (filters.from ?? period.firstDay) <= period.firstDay &&
    (filters.to ?? period.lastDay) >= period.lastDay
  return (
    (isFullPeriod ? 0 : 1) +
    filters.accounts.length +
    filters.industries.length +
    filters.states.length
  )
}

/** Aplica um intervalo do DatePicker; intervalos incompletos mantêm os filtros atuais. */
export function withDateRange(
  filters: Filters,
  range: readonly [string | undefined, string | undefined] | null,
): Filters {
  const [from, to] = range ?? []
  return from && to ? { ...filters, from, to } : filters
}

export function applyFilters(
  transactions: readonly Transaction[],
  filters: Filters,
): Transaction[] {
  const start = filters.from ? startOfIsoDay(filters.from) : Number.NEGATIVE_INFINITY
  const end = filters.to ? endOfIsoDay(filters.to) : Number.POSITIVE_INFINITY
  const accounts = new Set(filters.accounts)
  const industries = new Set(filters.industries)
  const states = new Set(filters.states)

  return transactions.filter(
    (tx) =>
      tx.date >= start &&
      tx.date <= end &&
      (accounts.size === 0 || accounts.has(tx.account)) &&
      (industries.size === 0 || industries.has(tx.industry)) &&
      (states.size === 0 || states.has(tx.state)),
  )
}
