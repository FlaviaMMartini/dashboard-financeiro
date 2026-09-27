'use client'

import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import styled from 'styled-components'

const Wrapper = styled.div`
  max-width: 560px;
  margin: 64px auto;
  padding: 0 16px;
`

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Wrapper>
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={reset}>
            Tentar novamente
          </Button>
        }
      >
        <AlertTitle>Não foi possível carregar a dashboard</AlertTitle>
        Tente novamente em alguns instantes.
      </Alert>
    </Wrapper>
  )
}
