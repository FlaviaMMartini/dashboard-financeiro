import { normalizeSpaces } from '@test/factories'

import { formatAxisCurrency, formatAxisMonth, formatTooltipCurrency } from './chart-formatters'

describe('chart-formatters', () => {
  it('formata o eixo de valores de forma compacta', () => {
    expect(normalizeSpaces(formatAxisCurrency(125_000_00))).toBe('R$ 125 mil')
  })

  it('formata o tooltip em reais e repassa valores não numéricos', () => {
    expect(normalizeSpaces(formatTooltipCurrency(5565))).toBe('R$ 55,65')
    expect(formatTooltipCurrency('n/d')).toBe('n/d')
  })

  it('formata o eixo de meses', () => {
    expect(formatAxisMonth('2023-11')).toMatch(/nov.*23/)
    expect(formatAxisMonth(3)).toBe('3')
  })
})
