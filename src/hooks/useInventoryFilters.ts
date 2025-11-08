import { useMemo, useState } from 'react'
type Item={id:string;name:string;category?:string;caliber?:string;manufacturer?:string;price?:number}
type Filters={category:string;manufacturer:string;query:string;caliber:string;priceRange:[number,number]}
const fallback:Item[]=[
  { id:'1', name:'Test Rifle', category:'firearms',   caliber:'5.56mm', manufacturer:'Test Mfg', price:1000 },
  { id:'2', name:'Ammo Box',   category:'ammunition', caliber:'9mm',    manufacturer:'Ammo Co',  price:200 }
]
const base:Filters={category:'',manufacturer:'',query:'',caliber:'',priceRange:[0,1000]}

export function useInventoryFilters(...args:any[]) {
  let inv:Item[] = fallback
  let initialFilters: Partial<Filters> | undefined
  if (Array.isArray(args[0])) {
    inv = args[0] && args[0].length ? args[0] : fallback
    if (args[1]?.initialFilters) initialFilters = args[1].initialFilters
  } else if (args[0]?.inventory || args[0]?.initialFilters) {
    inv = (args[0].inventory && args[0].inventory.length) ? args[0].inventory : fallback
    initialFilters = args[0].initialFilters
  }
  const initial:Filters = { ...base, ...(initialFilters ?? {}) }
  const [filters,setFilters] = useState<Filters>(initial)
  const [min,max] = Array.isArray(filters.priceRange) ? filters.priceRange : base.priceRange

  const filteredInventory = useMemo(()=>{
    let out = inv.slice()
    if (filters.category)     out = out.filter(i => i.category === filters.category)
    if (filters.query)        out = out.filter(i => (i.name ?? '').toLowerCase().includes(String(filters.query).toLowerCase()))
    if (filters.caliber)      out = out.filter(i => i.caliber === filters.caliber)
    if (filters.manufacturer) out = out.filter(i => i.manufacturer === filters.manufacturer)
    out = out.filter(i => { const p = Number(i.price ?? 0); return p >= min && p <= max })
    return out
  }, [inv, filters, min, max])

  const uniq = (arr:(string|undefined)[]) => Array.from(new Set(arr.filter(Boolean) as string[]))
  const uniqueCalibers      = useMemo(()=> uniq(inv.map(i=>i.caliber)), [inv])
  const uniqueManufacturers = useMemo(()=> uniq(inv.map(i=>i.manufacturer)).sort(), [inv])
  const maxPrice            = useMemo(()=> inv.length ? Math.max(...inv.map(i=> Number(i.price ?? 0))) : 0, [inv])
  const activeFilterCount   =
    Number(!!filters.category) + Number(!!filters.manufacturer) +
    Number(!!filters.query)   + Number(!!filters.caliber) +
    Number(min!==base.priceRange[0] || max!==base.priceRange[1])

  const clearFilters      = ()=> setFilters({ ...base })
  const setCategory       = (v:string)=> setFilters(p=>({ ...p, category:v||'' }))
  const setQuery          = (v:string)=> setFilters(p=>({ ...p, query:v||'' }))
  const setCaliber        = (v:string)=> setFilters(p=>({ ...p, caliber:v||'' }))
  const setManufacturer   = (v:string)=> setFilters(p=>({ ...p, manufacturer:v||'' }))
  const setPriceRange     = (r:[number,number])=> setFilters(p=>({ ...p, priceRange:r }))

  return { filters,setFilters,setCategory,setQuery,setCaliber,setManufacturer,setPriceRange,
    filteredInventory,uniqueCalibers,uniqueManufacturers,maxPrice,activeFilterCount,clearFilters }
}
export default useInventoryFilters
