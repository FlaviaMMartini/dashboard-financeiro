'use client'

import Skeleton from '@mui/material/Skeleton'
import styled from 'styled-components'

import { media } from '@/styles/theme'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 16px;

  ${media.md} {
    padding: 32px;
  }
`

const Row = styled.div<{ $columns: number }>`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;

  ${media.lg} {
    grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  }
`

const Block = styled(Skeleton)`
  && {
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`

export function DashboardSkeleton() {
  return (
    <Wrapper role="status" aria-label="Carregando dashboard">
      <div>
        <Skeleton variant="text" width={240} height={40} />
        <Skeleton variant="text" width={320} />
      </div>
      <Block variant="rectangular" height={88} />
      <Row $columns={4}>
        {Array.from({ length: 4 }, (_, index) => (
          <Block key={index} variant="rectangular" height={140} />
        ))}
      </Row>
      <Row $columns={2}>
        <Block variant="rectangular" height={400} />
        <Block variant="rectangular" height={400} />
      </Row>
    </Wrapper>
  )
}
