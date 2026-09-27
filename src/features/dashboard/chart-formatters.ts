import { formatMonthKey } from '@/domain/dates'
import { formatCompactCurrency } from '@/domain/money'

/** Formatadores isolados em funções puras: testáveis sem renderizar o gráfico. */

export function formatAxisCurrency(value: number): string {
  return formatCompactCurrency(value)
}

export function formatAxisMonth(value: unknown): string {
  return typeof value === 'string' ? formatMonthKey(value) : String(value)
}
