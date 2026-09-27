import { DASHBOARD_PATH, getSafeRedirect } from './redirect'

describe('getSafeRedirect', () => {
  it.each(['/dashboard', '/dashboard?states=TX', '/dashboard/relatorios'])('aceita %s', (path) => {
    expect(getSafeRedirect(path)).toBe(path)
  })

  it.each([
    undefined,
    42,
    '',
    'https://malicioso.com',
    '//malicioso.com',
    '/dashboard//malicioso.com',
    '/dashboardx',
    '/login',
  ])('rejeita %p (open redirect)', (value) => {
    expect(getSafeRedirect(value)).toBe(DASHBOARD_PATH)
  })
})
