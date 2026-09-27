/** @jest-environment node */
import { getEnv } from './env'

const secret = 'x'.repeat(32)

describe('getEnv', () => {
  it('aplica os padrões da conta de demonstração', () => {
    expect(getEnv({ NODE_ENV: 'test', SESSION_SECRET: secret })).toEqual({
      SESSION_SECRET: secret,
      DEMO_USER_NAME: 'Usuário BIX',
      DEMO_USER_EMAIL: 'admin@bix.com.br',
      DEMO_USER_PASSWORD: 'bix@2024',
    })
  })

  it('usa um segredo de desenvolvimento fora de produção', () => {
    expect(getEnv({ NODE_ENV: 'development' }).SESSION_SECRET).toHaveLength(43)
  })

  it('exige SESSION_SECRET em produção', () => {
    expect(() => getEnv({ NODE_ENV: 'production' })).toThrow()
  })

  it('rejeita segredos curtos', () => {
    expect(() => getEnv({ NODE_ENV: 'production', SESSION_SECRET: 'curto' })).toThrow(
      /32 caracteres/,
    )
  })
})
