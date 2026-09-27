/** @jest-environment node */
import { getDemoUser, getSessionSecret } from './env'

describe('getDemoUser', () => {
  it('aplica os padrões da conta de demonstração', () => {
    expect(getDemoUser({ NODE_ENV: 'production' })).toEqual({
      name: 'Usuário BIX',
      email: 'admin@bix.com.br',
      password: 'bix@2024',
    })
  })

  it('não depende do segredo de sessão (a página de login é pré-renderizada no build)', () => {
    expect(() => getDemoUser({ NODE_ENV: 'production' })).not.toThrow()
  })

  it('aceita valores customizados e valida o e-mail', () => {
    expect(
      getDemoUser({
        NODE_ENV: 'test',
        DEMO_USER_NAME: 'Ana',
        DEMO_USER_EMAIL: 'ana@empresa.com',
        DEMO_USER_PASSWORD: 'segredo123',
      }),
    ).toEqual({ name: 'Ana', email: 'ana@empresa.com', password: 'segredo123' })
    expect(() => getDemoUser({ NODE_ENV: 'test', DEMO_USER_EMAIL: 'invalido' })).toThrow()
  })
})

describe('getSessionSecret', () => {
  const secret = 'x'.repeat(32)

  it('usa o segredo informado', () => {
    expect(getSessionSecret({ NODE_ENV: 'production', SESSION_SECRET: secret })).toBe(secret)
  })

  it('usa um segredo de desenvolvimento fora de produção', () => {
    expect(getSessionSecret({ NODE_ENV: 'development' })).toHaveLength(43)
  })

  it('exige SESSION_SECRET em produção', () => {
    expect(() => getSessionSecret({ NODE_ENV: 'production' })).toThrow(/obrigatório em produção/)
  })

  it('rejeita segredos curtos', () => {
    expect(() => getSessionSecret({ NODE_ENV: 'production', SESSION_SECRET: 'curto' })).toThrow(
      /32 caracteres/,
    )
  })
})
