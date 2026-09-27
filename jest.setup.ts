import '@testing-library/jest-dom'

if (typeof window !== 'undefined') {
  // APIs de layout ausentes no jsdom, usadas pelo MUI (useMediaQuery) e pelo Recharts.
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  })

  class ResizeObserverMock {
    observe = jest.fn()
    unobserve = jest.fn()
    disconnect = jest.fn()
  }
  window.ResizeObserver = ResizeObserverMock
}
