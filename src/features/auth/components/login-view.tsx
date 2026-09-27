'use client'

import InfoOutlined from '@mui/icons-material/InfoOutlined'
import { Suspense } from 'react'
import styled from 'styled-components'

import { Logo } from '@/components/logo'
import { media } from '@/styles/theme'

import { LoginForm } from './login-form'

const Page = styled.main`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr;

  ${media.lg} {
    grid-template-columns: 1.1fr 1fr;
  }
`

const Hero = styled.section`
  display: none;
  padding: 48px;
  color: ${({ theme }) => theme.colors.surface};
  background:
    radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.25), transparent 45%),
    ${({ theme }) => theme.colors.navy};

  ${media.lg} {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  h1 {
    font-size: 40px;
    line-height: 1.2;
    margin: 0 0 16px;
  }

  p {
    font-size: 16px;
    max-width: 480px;
    color: rgba(255, 255, 255, 0.75);
  }
`

const FormSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
`

const FormCard = styled.div`
  width: 100%;
  max-width: 400px;

  h2 {
    margin: 24px 0 4px;
    font-size: 28px;
    color: ${({ theme }) => theme.colors.navy};
  }

  > p {
    margin: 0 0 32px;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`

const DemoHint = styled.aside`
  margin-top: 24px;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.primarySoft};
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 13px;

  code {
    font-weight: 500;
  }
`

interface LoginViewProps {
  demoCredentials: { email: string; password: string }
}

export function LoginView({ demoCredentials }: LoginViewProps) {
  return (
    <Page>
      <Hero>
        <Logo inverted />
        <div>
          <h1>Seu financeiro, de ponta a ponta.</h1>
          <p>
            Acompanhe receitas, despesas, transações pendentes e o saldo da sua operação com filtros
            dinâmicos e visualizações claras.
          </p>
        </div>
        <small>Next.js · TypeScript · Material UI · styled-components</small>
      </Hero>
      <FormSection>
        <FormCard>
          <Logo />
          <h2>Entrar</h2>
          <p>Acesse sua dashboard financeira.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
          <DemoHint>
            <InfoOutlined fontSize="inherit" /> Acesso de demonstração:{' '}
            <code>{demoCredentials.email}</code> / <code>{demoCredentials.password}</code>
          </DemoHint>
        </FormCard>
      </FormSection>
    </Page>
  )
}
