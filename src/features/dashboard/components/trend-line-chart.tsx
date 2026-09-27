'use client'

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from 'styled-components'

import type { MonthlyPoint } from '@/domain/aggregations'

import { formatAxisCurrency, formatAxisMonth, formatTooltipCurrency } from '../chart-formatters'
import { CHART_HEIGHT, ChartCard } from './chart-card'

interface TrendLineChartProps {
  data: MonthlyPoint[]
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  const theme = useTheme()

  return (
    <ChartCard
      title="Evolução mensal"
      description="Linhas com receitas, despesas e saldo acumulado por mês."
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 600, height: CHART_HEIGHT }}
      >
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.border} />
          <XAxis dataKey="month" tickFormatter={formatAxisMonth} tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={formatAxisCurrency} tick={{ fontSize: 12 }} width={72} />
          <Tooltip formatter={formatTooltipCurrency} labelFormatter={formatAxisMonth} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Receitas"
            stroke={theme.colors.success}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            name="Despesas"
            stroke={theme.colors.danger}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="balance"
            name="Saldo acumulado"
            stroke={theme.colors.primary}
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
