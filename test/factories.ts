import type { Transaction } from '@/domain/transaction'

let sequence = 0

export function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  sequence += 1
  return {
    id: `tx-${sequence}`,
    date: Date.UTC(2023, 0, 15),
    amountInCents: 1000,
    type: 'deposit',
    account: 'Acme',
    industry: 'Airlines',
    state: 'TX',
    ...overrides,
  }
}

const NBSP = String.fromCharCode(160)

/** Normaliza o espaço não separável (NBSP) que o Intl usa em "R$ 1,00". */
export const normalizeSpaces = (value: string | null | undefined) =>
  (value ?? '').replaceAll(NBSP, ' ')
