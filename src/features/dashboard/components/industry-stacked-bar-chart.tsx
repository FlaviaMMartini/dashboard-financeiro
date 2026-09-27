'use client'

import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from 'styled-components'

import type { IndustryBreakdown } from '@/domain/aggregations'
import type { TransactionType } from '@/domain/transaction'

import { formatAxisCurrency, formatAxisMonth } from '../chart-formatters'
import { CHART_HEIGHT, ChartCard } from './chart-card'
import { ChartTooltip } from './chart-tooltip'

const TYPE_OPTIONS = [
  { label: 'Despesas', value: 'withdraw' },
  { label: 'Receitas', value: 'deposit' },
] satisfies Array<{ label: string; value: TransactionType }>

interface IndustryStackedBarChartProps {
  breakdown: Record<TransactionType, IndustryBreakdown>
}

export function IndustryStackedBarChart({ breakdown }: IndustryStackedBarChartProps) {
  const theme = useTheme()
  const [type, setType] = useState<TransactionType>('withdraw')
  const { industries, rows } = breakdown[type]

  // Clicar no botão já selecionado envia `null`: mantemos a seleção atual.
  const handleType = (_: unknown, value: TransactionType | null) => {
    if (value) setType(value)
  }

  return (
    <ChartCard
      title="Composição mensal por indústria"
      description={`Barras empilhadas com o total de ${type === 'withdraw' ? 'despesas' : 'receitas'} por mês, segmentado por indústria.`}
      isEmpty={rows.length === 0}
      action={
        <ToggleButtonGroup
          size="small"
          color="primary"
          exclusive
          value={type}
          onChange={handleType}
          aria-label="Tipo de transação"
        >
          {TYPE_OPTIONS.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      }
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 600, height: CHART_HEIGHT }}
      >
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.border} />
          <XAxis dataKey="month" tickFormatter={formatAxisMonth} tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={formatAxisCurrency} tick={{ fontSize: 12 }} width={72} />
          <Tooltip
            content={<ChartTooltip sortByValue showTotal />}
            wrapperStyle={{ zIndex: 10, outline: 'none' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {industries.map((industry, index) => (
            <Bar
              key={industry}
              dataKey={industry}
              stackId="industries"
              fill={theme.chartPalette[index % theme.chartPalette.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
