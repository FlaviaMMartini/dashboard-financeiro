'use client'

import styled from 'styled-components'

const Wrapper = styled.span<{ $inverted: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: ${({ theme, $inverted }) => ($inverted ? theme.colors.surface : theme.colors.navy)};
  white-space: nowrap;

  span {
    font-weight: 400;
  }
`

const Mark = styled.span`
  display: grid;
  grid-template-columns: repeat(3, 6px);
  gap: 3px;

  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
  }

  i:nth-child(3n + 2) {
    background: ${({ theme }) => theme.colors.accent};
  }
`

interface LogoProps {
  inverted?: boolean
}

export function Logo({ inverted = false }: LogoProps) {
  return (
    <Wrapper $inverted={inverted} aria-label="Dashboard Financeiro">
      <Mark aria-hidden>
        {Array.from({ length: 6 }, (_, index) => (
          <i key={index} />
        ))}
      </Mark>
      FIN <span>DASHBOARD</span>
    </Wrapper>
  )
}
