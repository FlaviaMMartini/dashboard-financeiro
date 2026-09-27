import { normalizeTransaction, parseTransactions, type RawTransaction } from './transaction'

const raw: RawTransaction = {
  date: 1682698259192,
  amount: '5565',
  transaction_type: 'deposit',
  currency: 'brl',
  account: 'Baker Hughes',
  industry: 'Oil and Gas Equipment',
  state: 'TX',
}

describe('normalizeTransaction', () => {
  it('converte o amount em string para centavos inteiros e gera um id estável', () => {
    expect(normalizeTransaction(raw, 7)).toEqual({
      id: 'tx-7',
      date: 1682698259192,
      amountInCents: 5565,
      type: 'deposit',
      account: 'Baker Hughes',
      industry: 'Oil and Gas Equipment',
      state: 'TX',
    })
  })
})

describe('parseTransactions', () => {
  it('valida e normaliza uma lista', () => {
    expect(parseTransactions([raw, { ...raw, transaction_type: 'withdraw' }])).toHaveLength(2)
  })

  it.each([
    ['amount com separador decimal', { ...raw, amount: '55.65' }],
    ['moeda diferente de BRL', { ...raw, currency: 'usd' }],
    ['tipo desconhecido', { ...raw, transaction_type: 'refund' }],
    ['data ausente', { ...raw, date: undefined }],
  ])('rejeita %s', (_, invalid) => {
    expect(() => parseTransactions([invalid])).toThrow()
  })
})
