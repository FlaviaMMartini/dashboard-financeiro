import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'

import { AppProviders } from '@/styles/app-providers'

/** Renderiza com os mesmos providers da aplicação (antd + styled-components + tema). */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AppProviders, ...options }),
  }
}
