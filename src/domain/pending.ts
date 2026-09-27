import { DAY_IN_MS } from './dates'
import type { Transaction } from './transaction'

/**
 * ADR-001 — O dataset não possui status. Consideramos "pendentes" as transações
 * ocorridas nos últimos `PENDING_WINDOW_DAYS` dias antes da data de referência
 * (a transação mais recente do dataset), simulando uma janela de compensação.
 * Transações pendentes não entram no saldo.
 */
export const PENDING_WINDOW_DAYS = 7

export function getReferenceDate(transactions: readonly Transaction[]): number {
  return transactions.reduce((latest, tx) => Math.max(latest, tx.date), 0)
}

export function isPending(
  transaction: Pick<Transaction, 'date'>,
  referenceDate: number,
  windowDays: number = PENDING_WINDOW_DAYS,
): boolean {
  return transaction.date > referenceDate - windowDays * DAY_IN_MS
}
