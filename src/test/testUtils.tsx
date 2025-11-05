import React from 'react'
import { render as rtlRender } from '@testing-library/react'
export * from '@testing-library/react'

function Providers({ children }: { children: React.ReactNode }) {
  // Add shared context/providers here if needed later
  return <>{children}</>
}

export function render(ui: React.ReactElement, options?: any) {
  return rtlRender(ui, { wrapper: Providers, ...options })
}
