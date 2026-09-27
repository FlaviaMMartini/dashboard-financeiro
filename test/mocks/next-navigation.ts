/**
 * Mock compartilhado de `next/navigation` para testes de componentes client.
 * Uso: jest.mock('next/navigation', () => jest.requireActual('@test/mocks/next-navigation'))
 */
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
}

export const searchParamsState = { current: new URLSearchParams() }

export const useRouter = () => mockRouter
export const useSearchParams = () => searchParamsState.current
export const usePathname = () => '/dashboard'
export const useServerInsertedHTML = jest.fn()
export const redirect = jest.fn()
