'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'

/** Coleta os estilos gerados no SSR e os injeta no <head>, evitando flash sem estilo. */
export function StyledComponentsRegistry({ children }: { children: ReactNode }) {
  const [sheet] = useState(() => new ServerStyleSheet())

  useServerInsertedHTML(() => {
    const styles = sheet.getStyleElement()
    sheet.instance.clearTag()
    return <>{styles}</>
  })

  if (typeof window !== 'undefined') return <>{children}</>

  return <StyleSheetManager sheet={sheet.instance}>{children}</StyleSheetManager>
}
