'use client'

import styled from 'styled-components'

import { formatCurrency } from '@/domain/money'

import { formatAxisMonth } from '../chart-formatters'

const Box = styled.div`
  min-width: 200px;
  max-width: 280px;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.cardHover};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
`

const Title = styled.strong`
  display: block;
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.navy};

  &::first-letter {
    text-transform: uppercase;
  }
`

const List = styled.ul`
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
`

const Row = styled.li`
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
`

const Swatch = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: ${({ $color }) => $color};
`

const Name = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Amount = styled.span`
  font-weight: 500;
  font-variant-numeric: tabular-nums;
`

const Total = styled(Row).attrs({ as: 'div' })`
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 700;
`

export interface ChartTooltipItem {
  name?: unknown
  value?: unknown
  color?: string
}

export interface ChartTooltipProps {
  /** Injetados pelo Recharts. */
  active?: boolean
  payload?: ReadonlyArray<ChartTooltipItem>
  label?: unknown
  /** Ordena do maior para o menor valor (útil para barras empilhadas). */
  sortByValue?: boolean
  /** Exibe a soma dos itens (só faz sentido quando os valores são aditivos). */
  showTotal?: boolean
}

/** Tooltip compacto: sem itens zerados, valores em R$ e total opcional. */
export function ChartTooltip({
  active,
  payload,
  label,
  sortByValue,
  showTotal,
}: ChartTooltipProps) {
  const items = (payload ?? []).filter(
    (item): item is ChartTooltipItem & { value: number } =>
      typeof item.value === 'number' && item.value !== 0,
  )
  if (!active || items.length === 0) return null

  const rows = sortByValue ? [...items].sort((a, b) => b.value - a.value) : items
  const total = rows.reduce((sum, item) => sum + item.value, 0)

  return (
    <Box>
      <Title>{formatAxisMonth(label)}</Title>
      <List>
        {rows.map((item) => (
          <Row key={String(item.name)}>
            <Swatch $color={item.color ?? 'currentColor'} aria-hidden />
            <Name>{String(item.name)}</Name>
            <Amount>{formatCurrency(item.value)}</Amount>
          </Row>
        ))}
      </List>
      {showTotal && (
        <Total>
          <span />
          <Name>Total</Name>
          <Amount>{formatCurrency(total)}</Amount>
        </Total>
      )}
    </Box>
  )
}
