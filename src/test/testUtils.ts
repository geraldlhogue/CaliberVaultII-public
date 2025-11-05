import React, { createContext, useContext } from 'react'
import { render } from '@testing-library/react'

/** Minimal App context used by various hooks/components */
type AppCtx = {
  inventory?: any[]
  user?: { id: string } | null
}
const AppContext = createContext<AppCtx>({ inventory: [], user: { id: 'test-user' }})
export const useAppContext = () => useContext(AppContext)

/** Render with sensible defaults – can be extended per test */
export function renderWithProviders(ui: React.ReactElement, ctx: Partial<AppCtx> = {}) {
  const value: AppCtx = {
    inventory: [],
    user: { id: 'test-user' },
    ...ctx,
  }
  return render(<AppContext.Provider value={value}>{ui}</AppContext.Provider>)
}
