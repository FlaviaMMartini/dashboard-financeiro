import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe sua senha'),
  from: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>

export interface LoginResult {
  error: string
}
