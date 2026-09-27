'use client'

import InsertChartOutlined from '@mui/icons-material/InsertChartOutlined'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import type { ReactNode } from 'react'
import styled from 'styled-components'

export const CHART_HEIGHT = 320

const StyledCard = styled(Card)`
  && {
    min-width: 0;
    border-radius: ${({ theme }) => theme.radii.lg};
    box-shadow: ${({ theme }) => theme.shadows.card};
  }

  && .MuiCardHeader-root {
    flex-wrap: wrap;
    gap: 8px;
    padding-bottom: 0;
  }

  && .MuiCardHeader-title {
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.navy};
  }
`

const Body = styled.div`
  height: ${CHART_HEIGHT}px;
`

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  color: ${({ theme }) => theme.colors.textMuted};
`

interface ChartCardProps {
  title: string
  description: string
  action?: ReactNode
  isEmpty: boolean
  children: ReactNode
}

/** Container comum dos gráficos, com resumo textual acessível e estado vazio. */
export function ChartCard({ title, description, action, isEmpty, children }: ChartCardProps) {
  return (
    <StyledCard>
      <CardHeader title={title} action={action} />
      <CardContent>
        <Body role="figure" aria-label={`${title}. ${description}`}>
          {isEmpty ? (
            <Empty>
              <InsertChartOutlined fontSize="large" aria-hidden />
              Nenhuma transação para os filtros selecionados
            </Empty>
          ) : (
            children
          )}
        </Body>
      </CardContent>
    </StyledCard>
  )
}
