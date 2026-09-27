import { z } from 'zod'

const DEVELOPMENT_SECRET = 'dev-only-secret-never-use-in-production-000'

const envSchema = z.object({
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET deve ter pelo menos 32 caracteres'),
  DEMO_USER_NAME: z.string().min(1).default('Usuário BIX'),
  DEMO_USER_EMAIL: z.email().default('admin@bix.com.br'),
  DEMO_USER_PASSWORD: z.string().min(6).default('bix@2024'),
})

export type Env = z.infer<typeof envSchema>

/**
 * Lido sob demanda (e não no carregamento do módulo) para que o build não
 * dependa de segredos. Em produção o segredo é obrigatório; em desenvolvimento
 * há um valor padrão para que o projeto rode sem configuração.
 */
export function getEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const isProduction = source.NODE_ENV === 'production'
  return envSchema.parse({
    ...source,
    SESSION_SECRET: source.SESSION_SECRET ?? (isProduction ? undefined : DEVELOPMENT_SECRET),
  })
}
