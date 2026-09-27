/** @jest-environment node */
import { NextRequest } from 'next/server'

import { createSessionToken } from './features/auth/session'
import { config, FILTERS_COOKIE, proxy } from './proxy'

const BASE = 'http://localhost:3000'

async function request(path: string, cookies: Record<string, string> = {}) {
  const req = new NextRequest(new URL(path, BASE))
  Object.entries(cookies).forEach(([name, value]) => req.cookies.set(name, value))
  return proxy(req)
}

let token: string
beforeAll(async () => {
  token = await createSessionToken({ name: 'Ana', email: 'ana@bix.com.br' })
})

const location = (response: Response) => response.headers.get('location')

describe('proxy', () => {
  it('protege a dashboard, preservando o destino', async () => {
    const response = await request('/dashboard?states=TX')
    expect(response.status).toBe(307)
    expect(location(response)).toBe(`${BASE}/login?from=%2Fdashboard%3Fstates%3DTX`)
  })

  it('redireciona a raiz conforme a sessão', async () => {
    expect(location(await request('/'))).toBe(`${BASE}/login`)
    expect(location(await request('/', { bix_session: token }))).toBe(`${BASE}/dashboard`)
  })

  it('tira usuários logados da tela de login', async () => {
    expect(location(await request('/login', { bix_session: token }))).toBe(`${BASE}/dashboard`)
    expect(location(await request('/login'))).toBeNull()
  })

  it('deixa passar rotas fora do escopo', async () => {
    expect(location(await request('/outra', { bix_session: token }))).toBeNull()
  })

  it('persiste filtros válidos (saneados) em cookie', async () => {
    const response = await request('/dashboard?states=TX&from=invalida&page=2&hack=<script>', {
      bix_session: token,
    })
    expect(location(response)).toBeNull()
    expect(response.cookies.get(FILTERS_COOKIE)).toMatchObject({
      value: 'states=TX&page=2',
      httpOnly: true,
    })
  })

  it('restaura os filtros salvos ao abrir a dashboard sem query', async () => {
    const response = await request('/dashboard', {
      bix_session: token,
      [FILTERS_COOKIE]: 'states=TX',
    })
    expect(location(response)).toBe(`${BASE}/dashboard?states=TX`)
  })

  it('segue normalmente sem filtros salvos', async () => {
    const response = await request('/dashboard', { bix_session: token })
    expect(location(response)).toBeNull()
    expect(response.cookies.get(FILTERS_COOKIE)).toBeUndefined()
  })

  it('só roda nas rotas relevantes', () => {
    expect(config.matcher).toEqual(['/', '/login', '/dashboard/:path*'])
  })
})
