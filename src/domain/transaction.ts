import { z } from 'zod'

/** Formato exato de cada item de `data/transactions.json`. */
export const rawTransactionSchema = z.object({
  date: z.number().int().nonnegative(),
  amount: z.string().regex(/^\d+$/, 'amount deve conter apenas dígitos (centavos)'),
  transaction_type: z.enum(['deposit', 'withdraw']),
  currency: z.literal('brl'),
  account: z.string().min(1),
  industry: z.string().min(1),
  state: z.string().min(1),
})

export type RawTransaction = z.infer<typeof rawTransactionSchema>
export type TransactionType = RawTransaction['transaction_type']

export interface Transaction {
  id: string
  /** Epoch em milissegundos (UTC). */
  date: number
  /** Valor sempre em centavos inteiros para evitar erros de ponto flutuante. */
  amountInCents: number
  type: TransactionType
  account: string
  industry: string
  state: string
}

export function normalizeTransaction(raw: RawTransaction, index: number): Transaction {
  return {
    id: `tx-${index}`,
    date: raw.date,
    amountInCents: Number.parseInt(raw.amount, 10),
    type: raw.transaction_type,
    account: raw.account,
    industry: raw.industry,
    state: raw.state,
  }
}

export function parseTransactions(input: unknown): Transaction[] {
  return z.array(rawTransactionSchema).parse(input).map(normalizeTransaction)
}
