import { useMemo, useState } from 'react'
type Item = { id:string; name:string; category?:string; caliber?:string; manufacturer?:string; price?:number }
type Filters = { category?: string; manufacturer?: string; query?: string; caliber?: string; priceRange?: [number, number] }
const defaultInventory: Item[] = [
  { id:'1', name:'Test Rifle', category:'firearms',   caliber:'5.56mm', manufacturer:'Test Mfg', price:1000 },
  { id:'2', name:'Ammo Box',  category:'ammunition', caliber:'9mm',     manufacturer:'Ammo Co',  price:200  },
]
export function useInventoryFilters(arg?: Item[] | { inventory?: Item[], initialFilters?: Partial<Filters> }) {
  const inventory = Array.isArray(arg) ? arg : (arg?.inventory ?? defaultInventory)
  const initial: Filters = { category: undefined, manufacturer: undefined, query:'', caliber: undefined, priceRange: [0, 1000] }
  const [filters, setFilters] = useState<Filters>({ ...initial, ...(Array.isArray(arg) ? {} : (arg?.initialFilters ?? {})) })
  const clearFilters = () => setFilters(initial)
  const [min, max] = Array.isArray(filters.priceRange) ? filters.priceRange : [0, 1000]
  const filteredInventory = useMemo(() => {
    let out = inventory.slice()
    if (filters.category) out = out.filter(i => i.category === filters.category)
    if (filters.query)    out = out.filter(i => (i.name || '').toLowerCase().includes(String(filters.query).toLowerCase()))
    if (filters.caliber)  out = out.filter(i => i.caliber === filters.caliber)
    out = out.filter(i => (i.price ?? 0) >= min && (i.price ?? 0) <= max)
    return out
  }, [inventory, filters, min, max])
  const unique = (arr: (string|undefined)[]) => Array.from(new Set(arr.filter(Boolean) as string[]))
  const uniqueCalibers = useMemo(() => unique(inventory.map(i => i.caliber)), [inventory])
  const uniqueManufacturers = useMemo(() => unique(inventory.map(i => i.manufacturer)).sort(), [inventory])
  const maxPrice = useMemo(() => Math.max(...inventory.map(i => i.price ?? 0), 0), [inventory])
  const activeFilterCount = useMemo(() => {
    const f = filters
    return Number(!!f.category) + Number(!!f.manufacturer) + Number(!!f.query) + Number(!!f.caliber) +
           Number((f.priceRange?.[0] ?? 0) !== 0 || (f.priceRange?.[1] ?? 1000) !== 1000)
  }, [filters])
  return { filters, setFilters, clearFilters, filteredInventory, uniqueCalibers, uniqueManufacturers, maxPrice, activeFilterCount }
}
export default useInventoryFilters
