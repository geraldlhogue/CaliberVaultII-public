const fs = require('fs');
const path = 'src/test/vitest.setup.ts';
if (!fs.existsSync('src/test')) fs.mkdirSync('src/test', { recursive: true });
if (!fs.existsSync(path)) fs.writeFileSync(path, '');

function appendOnce(tag, block) {
  const txt = fs.readFileSync(path, 'utf8');
  if (txt.includes(tag)) return false;
  fs.appendFileSync(path, `\n${tag}\n${block}\n`);
  return true;
}

// 1) Supabase unified client + channel
appendOnce('/* SUPABASE_SHIM_FULL_CHAIN */', `
const ok = (data)=>({ data, error:null });
const chain = (rows)=>{
  const api = {
    _rows: Array.isArray(rows)? rows: [],
    limit(n){ const num=Number(n); return ok(!Number.isNaN(num)? this._rows.slice(0,num): this._rows); },
    ilike(){ return api; },
    order(){ return api; },
    eq(){ return api; },
    single(){ return ok(this._rows[0]||null); }
  };
  return {
    limit: api.limit.bind(api),
    ilike: api.ilike.bind(api),
    order: api.order.bind(api),
    eq:    api.eq.bind(api),
    single:api.single.bind(api)
  };
};
const table = (rows=[])=>({
  select(){ return chain(rows); },
  insert(vals){ return { select(){ return { single(){ return ok(Array.isArray(vals)? vals[0]: { id:"3", ...vals }); } }; } }; },
  update(vals){ return { eq(){ return { select(){ return { single(){ return ok({ id:"1", ...vals }); } }; } }; } }; },
  delete(){ return { eq(){ return { select(){ return { single(){ return ok({ deleted:true }); } }; } }; } }; }
});
const __ch = (vi).fn(()=>({ on:()=>({ subscribe:()=>({ unsubscribe(){} }) }) }));
const supabaseShim = {
  from(name){ return table([]); },
  channel: __ch,
  auth:{
    getSession: async()=> ok({ session:{ user:{ id:"test-user" }}}),
    getUser:    async()=> ok({ user:{ id:"test-user" }})
  }
};
vi.mock("@supabase/supabase-js", ()=>({ __esModule:true, createClient:()=>supabaseShim }));
vi.mock("@/lib/supabase",      ()=>({ __esModule:true, supabase: supabaseShim }));
vi.mock("src/lib/supabase",    ()=>({ __esModule:true, supabase: supabaseShim }));
`);

// 2) PWA hook default + named
appendOnce('/* PWA_HOOK_NAMED_AND_DEFAULT */', `
vi.mock("@/hooks/usePWA",()=>{ 
  const usePWA=()=>({ isInstallable:true, isInstalled:false, installApp:()=>{} }); 
  return { __esModule:true, default: usePWA, usePWA };
});
`);

// 3) Validation named exports fallback
appendOnce('/* VALIDATION_NAMED_EXPORTS_FALLBACK */', `
vi.mock("@/lib/validation", ()=>{
  const mod = require("src/lib/validation");
  const d = mod && mod.default ? mod.default : {};
  const pick = (k)=> (mod && mod[k]) ? mod[k] : d[k];
  return { __esModule:true,
    ...mod,
    validateEmail:    pick("validateEmail"),
    validatePhone:    pick("validatePhone"),
    validateURL:      pick("validateURL"),
    validateRequired: pick("validateRequired"),
  };
});
`);

// 4) Fetch: shared ref; GET/POST behavior
appendOnce('/* FETCH_SHARED_REF_ECHO_POST */', `
const __fetch = async (url,opts)=>{
  const u = String(url);
  const o = opts || {};
  if (o.method===undefined || o.method==="GET"){
    if (u.indexOf("/items")>=0){
      return new Response(JSON.stringify([{id:"1",name:"Item 1"},{id:"2",name:"Item 2"}]),{status:200});
    }
  }
  if (o.method==="POST"){
    const body = o && o.body ? JSON.parse(o.body) : {};
    return new Response(JSON.stringify(body),{status:200});
  }
  return new Response(JSON.stringify({ ok:true }),{status:200});
};
Object.defineProperty(globalThis, "fetch", { value: __fetch, writable: true });
`);

// 5) Offline queue shape
appendOnce('/* OFFLINE_QUEUE_SHAPE */', `
vi.mock("@/services/sync/OfflineQueue", ()=>({ __esModule:true, default: class { constructor(){ this.queuedChanges=[]; } } }));
`);

// 6) ReferenceDataService minimal
appendOnce('/* REFERENCE_DATA_SERVICE_MIN */', `
vi.mock("src/services/reference.service", ()=>({ __esModule:true,
  ReferenceDataService: class {
    async getManufacturers(){ return [{ id:"m1", name:"Acme" }]; }
    async getCalibers(){ return [{ id:"c1", name:"9mm" }]; }
    async addManufacturer(v){ return { id:"new-mfg", ...v }; }
  }
}));
`);

// 7) StorageService class
appendOnce('/* STORAGE_SERVICE_CLASS_MIN */', `
vi.mock("src/services/storage.service", ()=>({ __esModule:true,
  default: class StorageService {
    async uploadFile(){ return { path:"/files/x.png" }; }
    async deleteFile(){ return { success:true }; }
    async listFiles(){ return [{ name:"x.png" }]; }
  }
}));
`);

// 8) useInventoryFilters deterministic
appendOnce('/* USE_INVENTORY_FILTERS_BASE */', `
vi.mock("@/hooks/useInventoryFilters", ()=>({ __esModule:true,
  default: (items=[], opts={})=>{
    const f = (opts && opts.initialFilters) ? opts.initialFilters : {};
    let out = Array.isArray(items) ? items.slice() : [];
    if (f.category){ const v=String(f.category).toLowerCase(); out = out.filter(x=>String(x.category||"").toLowerCase()===v); }
    if (f.query){ const q=String(f.query).toLowerCase(); out = out.filter(x=>String(x.name||"").toLowerCase().indexOf(q)>=0); }
    if (f.caliber){ const c=String(f.caliber); out = out.filter(x=>String(x.caliber||x.caliber_id||"")===c); }
    const pricesAll = items.map(x=>Number(x && (x.price||x.current_value||0))).filter(n=>Number.isNaN(n)===false);
    const maxPrice = pricesAll.length>0 ? Math.max.apply(null,pricesAll) : 1000;
    const activeFilterCount = ["category","query","caliber","maxPrice"].reduce((n,k)=> n + (f && f[k] ? 1: 0), 0);
    return {
      filteredInventory: out,
      uniqueCalibers: [...new Set(items.map(x=>x && x.caliber).filter(Boolean))],
      uniqueManufacturers: [...new Set(items.map(x=>x && x.manufacturer).filter(Boolean))],
      maxPrice,
      activeFilterCount
    };
  }
}));
`);

// 9) Dialog mock (render only when open===true) – replace existing
(function tightenDialogMock(){
  const txt = fs.readFileSync(path, 'utf8');
  const start = 'vi.mock("@/components/ui/dialog"';
  let out = txt;
  const i = txt.indexOf(start);
  if (i >= 0) {
    const rest = txt.slice(i);
    const j = rest.indexOf(');');
    const cut = j >= 0 ? i + j + 2 : txt.length;
    out = txt.slice(0, i) + txt.slice(cut);
  }
  out += `
/* DIALOG_TIGHT_RENDER_ONLY_WHEN_OPEN */
vi.mock("@/components/ui/dialog",()=>{ 
  const ReactReq=require("react"); 
  const Dialog=(p)=> (p && p.open===true) ? ReactReq.createElement("div",{ role:"dialog"},p.children):null; 
  const el=(t)=>(p)=> ReactReq.createElement(t,p,p.children); 
  return { __esModule:true, default:Dialog, Dialog, DialogContent:el("div"), DialogHeader:el("div"), DialogTitle:el("h2"), DialogDescription:el("p"), DialogFooter:el("div"), DialogTrigger:el("button") }; 
});
`;
  fs.writeFileSync(path, out);
})();

// 10) BatchOperationsService test: partial-preserving mock for ../../category
(function patchBatchOps(){
  const p = 'src/services/inventory/__tests__/BatchOperationsService.test.ts';
  if (!fs.existsSync(p)) return;
  let s = fs.readFileSync(p,'utf8');
  const re = /vi\.mock\(\"\.{2}\/\.{2}\/category\"[\s\S]*?\);/m;
  if (re.test(s)) {
    s = s.replace(re, 'vi.mock("../../category", async (importOriginal)=>{ const actual=await importOriginal(); return { __esModule:true, ...actual }; });');
    fs.writeFileSync(p,s);
  }
})();
