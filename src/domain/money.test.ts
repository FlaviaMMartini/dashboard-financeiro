import { normalizeSpaces } from '@test/factories'

import { formatCompactCurrency, formatCurrency } from './money'

describe('formatCurrency', () => {
  it.each([
    [5565, 'R$ 55,65'],
    [0, 'R$ 0,00'],
    [115233454, 'R$ 1.152.334,54'],
    [-93736, '-R$ 937,36'],
  ])('formata %i centavos como %s', (cents, expected) => {
    expect(normalizeSpaces(formatCurrency(cents))).toBe(expected)
  })
})

describe('formatCompactCurrency', () => {
  it('abrevia valores grandes para os eixos dos gráficos', () => {
    expect(normalizeSpaces(formatCompactCurrency(125_000_00))).toBe('R$ 125 mil')
    expect(normalizeSpaces(formatCompactCurrency(1_500_000_00))).toBe('R$ 1,5 mi')
  })
})
