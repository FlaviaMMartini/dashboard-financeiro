'use client'

import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined'
import TrendingDown from '@mui/icons-material/TrendingDown'
import TrendingUp from '@mui/icons-material/TrendingUp'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Tooltip from '@mui/material/Tooltip'
import type { ReactNode } from 'react'
import styled, { type DefaultTheme } from 'styled-components'

import type { Summary } from '@/domain/aggregations'
import { formatDate } from '@/domain/dates'
import { formatCurrency } from '@/domain/money'
import { media } from '@/styles/theme'

type Tone = 'success' | 'danger' | 'warning' | 'primary'

const toneColor = (theme: DefaultTheme, tone: Tone) => theme.colors[tone]

const Grid = styled.section`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;

  ${media.md} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${media.lg} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const StyledCard = styled(Card)<{ $tone: Tone }>`
  && {
    border-radius: ${({ theme }) => theme.radii.lg};
    border-top: 4px solid ${({ theme, $tone }) => toneColor(theme, $tone)};
    box-shadow: ${({ theme }) => theme.shadows.card};
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  &&:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  font-weight: 500;

  > span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
`

const IconBadge = styled.span<{ $tone: Tone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme, $tone }) => toneColor(theme, $tone)};
  background: ${({ theme, $tone }) => `${toneColor(theme, $tone)}1A`};
`

const Value = styled.strong<{ $negative?: boolean }>`
  display: block;
  margin-top: 12px;
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme, $negative }) => ($negative ? theme.colors.danger : theme.colors.navy)};
  font-variant-numeric: tabular-nums;
`

const Caption = styled.small`
  display: block;
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.textMuted};
`

interface SummaryCardProps {
  title: ReactNode
  value: string
  caption: string
  icon: ReactNode
  tone: Tone
  negative?: boolean
}

function SummaryCard({ title, value, caption, icon, tone, negative }: SummaryCardProps) {
  return (
    <StyledCard $tone={tone}>
      <CardContent>
        <Header>
          <span>{title}</span>
          <IconBadge $tone={tone} aria-hidden>
            {icon}
          </IconBadge>
        </Header>
        <Value $negative={negative}>{value}</Value>
        <Caption>{caption}</Caption>
      </CardContent>
    </StyledCard>
  )
}

interface SummaryCardsProps {
  summary: Summary
  pendingRule: { referenceDay: string; windowDays: number }
}

export function SummaryCards({ summary, pendingRule }: SummaryCardsProps) {
  const pendingExplanation = `Transações dos últimos ${pendingRule.windowDays} dias até ${formatDate(
    Date.parse(pendingRule.referenceDay),
  )} (data mais recente do dataset) ainda não foram compensadas e não entram no saldo.`

  return (
    <Grid aria-label="Resumo">
      <SummaryCard
        title="Receitas"
        value={formatCurrency(summary.revenueInCents)}
        caption="Depósitos compensados"
        icon={<TrendingUp />}
        tone="success"
      />
      <SummaryCard
        title="Despesas"
        value={formatCurrency(summary.expensesInCents)}
        caption="Saques compensados"
        icon={<TrendingDown />}
        tone="danger"
      />
      <SummaryCard
        title={
          <>
            Transações pendentes
            <Tooltip title={pendingExplanation}>
              <InfoOutlined fontSize="inherit" aria-label={pendingExplanation} role="img" />
            </Tooltip>
          </>
        }
        value={summary.pendingCount.toLocaleString('pt-BR')}
        caption={`${formatCurrency(summary.pendingAmountInCents)} em compensação`}
        icon={<ScheduleOutlined />}
        tone="warning"
      />
      <SummaryCard
        title="Saldo total"
        value={formatCurrency(summary.balanceInCents)}
        caption={`${summary.transactionCount.toLocaleString('pt-BR')} transações no período`}
        icon={<AccountBalanceWalletOutlined />}
        tone="primary"
        negative={summary.balanceInCents < 0}
      />
    </Grid>
  )
}
