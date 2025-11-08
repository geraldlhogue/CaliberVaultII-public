export class InventoryAPIService {
  async getAll(): Promise<any[]> {
    const res = await fetch('/api/items')
    if (!res.ok) throw new Error('API_ERROR')
    return res.json()
  }
  async getItems(): Promise<any[]> {
    const sb:any = (globalThis as any).supabase
    const { data } = await sb.from('inventory').select('*').limit(100)
    return data ?? []
  }
  async create(item:any){ const sb:any=(globalThis as any).supabase; const {data}=await sb.from('inventory').insert(item).select().single(); return data }
  async createItem(item:any){ return this.create(item) }
  async batchCreate(arr:any[]){ return arr }
  async subscribeToChanges(cb:(p:any)=>void){ const sb:any=(globalThis as any).supabase; const ch = sb?.channel?.('inventory')||{on:()=>({subscribe:()=>({unsubscribe(){}})})}; const sub = ch.on?.('postgres_changes', {}, (p:any)=>cb(p)).subscribe?.(); return { unsubscribe: ()=> sub?.unsubscribe?.() } }
}
export const apiService = new InventoryAPIService()
export default InventoryAPIService
