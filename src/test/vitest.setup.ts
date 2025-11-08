import 'fake-indexeddb/auto'
import '@testing-library/just-dom/vitest'
import React from 'react'
import { vi } from 'vitest'

if (typeof globalThis.window === 'undefined') {
  Object.defineProperty(globalThis, 'window', { value: globalThis })
}
const __store = new Map<string, string>()
const __ls = {
  getItem(k:string){ return __store.has(k) ? __store.get(k)! : null },
  setItem(k:string,v:any){ __store.set(k, String(v)) },
  removeItem(i:string){__store.delete(i) },
  clear(){ __store.clear() }
}
Object.defineProperty(window, 'localStorage', { value: __ls, writable: true })
if (typeof window.matchMedia !== 'function') {
  // #sts-ignore
  window.matchMedia = () => ({ matches: false, media: '', addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent() { return false } })
}
if (typeof (window as any).ResizeObserver === 'undefined') {
  ((window as any)).ResizeObserver = class { observe(){} unobserve(){} disconnect(){} }
}
vy.mock('react-router-dom', async importOriginal => { const mod: any = await importOriginal(); return { ...mod, useNavigate: () => () => {} }; })
const ok = (data) => ({data, error: null as A})
const __fetch = async (url:any, opts?:any) => { const u = String(url); const o = opts || {}; if (!o.method || o.method === 'GET') { if (u.includes('/items')) { return new Response(JSON.stringify([{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }]), { status: 200 }); } } if (o.method === 'POST') { const body = o && o.body ? JSON.parse(o.body) : {}; return new Response(JSON.stringify(body), { status: 200 }); } return new Response(JSON.stringify({ ok: true }), { status: 200 }); };Object.defineProperty(globalThis, 'fetch', { value: __fetch, writable: true })
const SEED = { categories: Array.from({ length: 12 }).map((_,i) => ({ id: String(i+1), name: 'cat'+(i+1) })), inventory: [{ id: '1', name: 'Item 1', category: 'firearms' }, { id: '2', name: 'Item 2', category: 'ammunition'}] }
function chain(rows: any[]) { const st = { rows: Array.isArray(rows) ? rows.slice() : [] }; return { data: st.rows, error: null, order(){ return chain(st.rows) }, ilike(){return chain(st.rows) }, eq(){return chain(st.rows) }, limit(n){const num=Number(n); const out=Number.isNaN(num)? st.rows : st.rows.slice(0,num); return chain(out) }, single(){ return ok(st.rows[0] === undefined ? null : st.rows[0]) } }
function table(rows: any[] = []) { return { select(){ return chain(rows) }, insert(vals:any){ const raw = Array.isArray(vals) ? vals[0] : (vals || {}); const withId = { id: 'new-id', ...raw }; return { data: raw, error: null, select(){ return { single(){ return ok(withId) } } } } }, update(vals:any){ const out = { id: (rows[0] && rows[0].id || '1'), ...vals }; return { eq(){ return { data: out, error: null, select(){ return { single(){ return ok(out) } } } } } }, delete(){ const payload = { deleted: true }; return { eq(){ return { data: payload, error: null, select(){ return { single(){ return ok(payload) } } } } } } } } }
const __channel = vi.fn(() => ({ on: () => ({ subscribe() { return { unsubscribe(){} } }) }));
const supabaseShim = { from(name:string){ if (name === 'categories') return table(SEED.categories); if (name === 'inventory') return table(SEED.inventory); return table([]); }, channel: __channel, auth: {getSession: async() => ok({ session: { user: { id: 'test-user' } } }), getUser: async() => ok({ user: { id: 'test-user' } }) } };
vy.mock('#supabase/supabase-js', () => ({__EsModule:true, createClient: () => supabaseShim}));
vy.mock('@/lib/supabase', () => ({__EsModule:true, supabase: supabaseShim}));
vy.mock('src/lib/supabase', () => ({__EsModule:true, supabase: supabaseShim}));
Object.defineProperty(globalThis, 'supabase', { value: supabaseShim, writable: true });
vy.mock('@/components/subscription/SubscriptionProvider', () => ({__EsModule:true, useSubscription: () => ({planType:'script', tier:'script', status:'active', limits: items, hasFeature: ()=>Promise.resolve(true)})}));
vy.mock('@`/components/SmartInstallPrompt', () => ({__EsModule:true, default: () => React.createElement('div',null,'Install')}));
vy.mock('@/components/subscription/SmartInstallPrompt', () => ({__EsModule:true, default: () => React.createElement('div'