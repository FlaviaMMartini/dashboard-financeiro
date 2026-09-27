import { z } from 'zod'

/*
 * Variáveis lidas sob demanda (e não no carregamento do módulo) e separadas por
 * responsabilidade: quem precisa só da conta de demonstração (ex.: a página de
 * login, pré-renderizada no build) não depende do segredo de sessão.
 */

const DEVELOPMENT_SECRET = 'dev-only-secret-never-use-in-production-000'

const demoUserSchema = z.object({
  DEMO_USER_NAME: z.string().min(1).default('Usuário BIX'),
  DEMO_USER_EMAIL: z.email().default('admin@bix.com.br'),
  DEMO_USER_PASSWORD: z.string().min(6).default('bix@2024'),
})

const sessionSecretSchema = z
  .string({ error: 'SESSION_SECRET é obrigatório em produção' })
  .min(32, 'SESSION_SECRET deve ter pelo menos 32 caracteres')

export interface DemoUser {
  name: string
  email: string
  password: string
}

export function getDemoUser(source: NodeJS.ProcessEnv = process.env): DemoUser {
  const env = demoUserSchema.parse(source)
  return { name: env.DEMO_USER_NAME, email: env.DEMO_USER_EMAIL, password: env.DEMO_USER_PASSWORD }
}

/** Obrigatório em produção; em desenvolvimento há um padrão para rodar sem configuração. */
export function getSessionSecret(source: NodeJS.ProcessEnv = process.env): string {
  const isProduction = source.NODE_ENV === 'production'
  return sessionSecretSchema.parse(
    source.SESSION_SECRET ?? (isProduction ? undefined : DEVELOPMENT_SECRET),
  )
}
