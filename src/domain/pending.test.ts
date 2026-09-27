import { makeTransaction } from '@test/factories'

import { DAY_IN_MS } from './dates'
import { getReferenceDate, isPending, PENDING_WINDOW_DAYS } from './pending'

const reference = Date.UTC(2023, 10, 30, 12)

describe('getReferenceDate', () => {
  it('retorna a data da transação mais recente', () => {
    const txs = [
      makeTransaction({ date: 10 }),
      makeTransaction({ date: 30 }),
      makeTransaction({ date: 20 }),
    ]
    expect(getReferenceDate(txs)).toBe(30)
  })

  it('retorna 0 para lista vazia', () => {
    expect(getReferenceDate([])).toBe(0)
  })
})

describe('isPending (ADR-001)', () => {
  it(`considera pendente dentro da janela de ${PENDING_WINDOW_DAYS} dias`, () => {
    expect(isPending({ date: reference }, reference)).toBe(true)
    expect(isPending({ date: reference - 6 * DAY_IN_MS }, reference)).toBe(true)
  })

  it('considera compensada no limite exato da janela e antes dela', () => {
    expect(isPending({ date: reference - PENDING_WINDOW_DAYS * DAY_IN_MS }, reference)).toBe(false)
    expect(isPending({ date: reference - 30 * DAY_IN_MS }, reference)).toBe(false)
  })

  it('aceita uma janela customizada', () => {
    expect(isPending({ date: reference - 20 * DAY_IN_MS }, reference, 30)).toBe(true)
  })
})
