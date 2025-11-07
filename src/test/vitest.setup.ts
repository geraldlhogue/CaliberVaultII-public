import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'

// ---- Basic browser shims ----
globalThis.matchMedia = () => ({
  matches: false,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() { return false },
}) as any

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
;(globalThis as any).ResizeObserver = ResizeObserverStub

// ---- localStorage/sessionStorage ----
;(() => {
  const store = new Map<string,string>()
  const api = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, String(v)) },
    removeItem: (k: string) => { store.delete(k) },
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length(){ return store.size },
  }
  Object.defineProperty(globalThis, 'localStorage', { value: api, configurable: true })
  Object.defineProperty(globalThis, 'sessionStorage', { value: { ...api }, configurable: true })
})()

// ---- simple fetch stub ----
globalThis.fetch = async () => ({ ok: true, json: async () => ({}) }) as Response

export {}

