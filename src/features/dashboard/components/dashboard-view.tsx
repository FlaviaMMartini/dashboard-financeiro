'use client'

import styled from 'styled-components'

import { formatDate } from '@/domain/dates'
import type { Filters } from '@/domain/filters'
import type { TableParams } from '@/domain/table'
import type { DashboardData } from '@/server/dashboard-service'
import { media } from '@/styles/theme'

import { FilterBar } from './filter-bar'
import { IndustryStackedBarChart } from './industry-stacked-bar-chart'
import { SummaryCards } from './summary-cards'
import { TransactionsTable } from './transactions-table'
import { TrendLineChart } from './trend-line-chart'
import { useDashboardNavigation } from '../hooks/use-dashboard-navigation'

const Page = styled.div<{ $busy: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 16px;
  max-width: 1440px;
  margin: 0 auto;
  opacity: ${({ $busy }) => ($busy ? 0.6 : 1)};
  transition: opacity 0.2s ease;

  ${media.md} {
    padding: 32px;
  }
`

const Header = styled.header`
  h1 {
    margin: 0;
    font-size: 28px;
    color: ${({ theme }) => theme.colors.navy};
  }

  p {
    margin: 4px 0 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`

const Charts = styled.section`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;

  ${media.lg} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

interface DashboardViewProps {
  userName: string
  data: DashboardData
  filters: Filters
  tableParams: TableParams
}

export function DashboardView({ userName, data, filters, tableParams }: DashboardViewProps) {
  const { navigate, isPending } = useDashboardNavigation(data.period)
  const from = filters.from ?? data.period.firstDay
  const to = filters.to ?? data.period.lastDay

  return (
    <Page $busy={isPending} aria-busy={isPending}>
      <Header>
        <h1>Olá, {userName}</h1>
        <p>
          Visão geral de {formatDate(Date.parse(from))} a {formatDate(Date.parse(to))}
        </p>
      </Header>
      <FilterBar
        filters={filters}
        options={data.options}
        period={data.period}
        onChange={(next) => navigate(next, { ...tableParams, page: 1 })}
      />
      <SummaryCards summary={data.summary} pendingRule={data.pendingRule} />
      <Charts aria-label="Gráficos">
        <IndustryStackedBarChart breakdown={data.breakdown} />
        <TrendLineChart data={data.monthly} />
      </Charts>
      <TransactionsTable
        page={data.table}
        params={tableParams}
        loading={isPending}
        onChange={(next) => navigate(filters, next)}
      />
    </Page>
  )
}
