import { toMonthKey } from './dates'
import { isPending } from './pending'
import type { Transaction, TransactionType } from './transaction'

export interface Summary {
  revenueInCents: number
  expensesInCents: number
  /** Receitas − despesas, apenas de transações compensadas. */
  balanceInCents: number
  pendingCount: number
  /** Volume (receitas + despesas) aguardando compensação. */
  pendingAmountInCents: number
  transactionCount: number
}

export interface MonthlyPoint {
  month: string
  revenue: number
  expenses: number
  /** Saldo acumulado até o fim do mês. */
  balance: number
}

export interface IndustryBreakdown {
  industries: string[]
  /** Uma linha por mês; cada indústria é uma coluna com o valor em centavos. */
  rows: Array<{ month: string } & Record<string, number | string>>
}

export function summarize(transactions: readonly Transaction[], referenceDate: number): Summary {
  const summary: Summary = {
    revenueInCents: 0,
    expensesInCents: 0,
    balanceInCents: 0,
    pendingCount: 0,
    pendingAmountInCents: 0,
    transactionCount: transactions.length,
  }

  for (const tx of transactions) {
    if (isPending(tx, referenceDate)) {
      summary.pendingCount += 1
      summary.pendingAmountInCents += tx.amountInCents
    } else if (tx.type === 'deposit') {
      summary.revenueInCents += tx.amountInCents
    } else {
      summary.expensesInCents += tx.amountInCents
    }
  }

  summary.balanceInCents = summary.revenueInCents - summary.expensesInCents
  return summary
}

export function buildMonthlySeries(transactions: readonly Transaction[]): MonthlyPoint[] {
  const byMonth = new Map<string, { revenue: number; expenses: number }>()

  for (const tx of transactions) {
    const key = toMonthKey(tx.date)
    const bucket = byMonth.get(key) ?? { revenue: 0, expenses: 0 }
    if (tx.type === 'deposit') bucket.revenue += tx.amountInCents
    else bucket.expenses += tx.amountInCents
    byMonth.set(key, bucket)
  }

  let balance = 0
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { revenue, expenses }]) => {
      balance += revenue - expenses
      return { month, revenue, expenses, balance }
    })
}

export function buildIndustryBreakdown(
  transactions: readonly Transaction[],
  type: TransactionType,
): IndustryBreakdown {
  const industries = new Set<string>()
  const byMonth = new Map<string, Map<string, number>>()

  for (const tx of transactions) {
    if (tx.type !== type) continue
    industries.add(tx.industry)
    const key = toMonthKey(tx.date)
    const month = byMonth.get(key) ?? new Map<string, number>()
    month.set(tx.industry, (month.get(tx.industry) ?? 0) + tx.amountInCents)
    byMonth.set(key, month)
  }

  const sortedIndustries = [...industries].sort((a, b) => a.localeCompare(b))

  return {
    industries: sortedIndustries,
    rows: [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, values]) => ({
        month,
        ...Object.fromEntries(sortedIndustries.map((name) => [name, values.get(name) ?? 0])),
      })),
  }
}
