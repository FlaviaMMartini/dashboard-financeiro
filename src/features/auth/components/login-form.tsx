'use client'

import LockOutlined from '@mui/icons-material/LockOutlined'
import MailOutlined from '@mui/icons-material/MailOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { useSearchParams } from 'next/navigation'
import { useState, useTransition, type FormEvent } from 'react'
import styled from 'styled-components'
import { z } from 'zod'

import { login } from '../actions'
import { loginSchema } from '../schemas'

type FieldErrors = Partial<Record<'email' | 'password', string>>

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const SubmitButton = styled(Button)`
  && {
    height: 48px;
    border-radius: ${({ theme }) => theme.radii.pill};
    font-size: 16px;
  }
`

export function LoginForm() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    // Mesmo schema Zod usado pela Server Action: validação idêntica nos dois lados.
    const parsed = loginSchema.safeParse({
      email: data.get('email'),
      password: data.get('password'),
      from: searchParams.get('from') ?? undefined,
    })

    setError(undefined)
    if (!parsed.success) {
      const { fieldErrors: errors } = z.flattenError(parsed.error)
      setFieldErrors({ email: errors.email?.[0], password: errors.password?.[0] })
      return
    }

    setFieldErrors({})
    startTransition(async () => {
      const result = await login(parsed.data)
      // Em caso de sucesso a action redireciona e não há resultado.
      if (result) setError(result.error)
    })
  }

  return (
    <Form onSubmit={handleSubmit} noValidate aria-label="Formulário de login">
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        autoFocus
        fullWidth
        disabled={isPending}
        error={Boolean(fieldErrors.email)}
        helperText={fieldErrors.email}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <MailOutlined fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField
        label="Senha"
        name="password"
        type="password"
        autoComplete="current-password"
        fullWidth
        disabled={isPending}
        error={Boolean(fieldErrors.password)}
        helperText={fieldErrors.password}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlined fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <SubmitButton type="submit" variant="contained" fullWidth loading={isPending}>
        Entrar
      </SubmitButton>
    </Form>
  )
}
