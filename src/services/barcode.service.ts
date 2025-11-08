type Usage = { callsToday: number; limit: number; remaining: number; percentUsed: number }

class BarcodeService {
  private calls = 0
  private cache = new Map<string, any>()

  private inc(){ this.calls += 1 }
  private isDigits(s:string){ return /^[0-9]+$/.test(s) }

  isValidUPC(code:string){
    const s = String(code||'')
    this.inc()
    if (!this.isDigits(s)) return false
    return s.length === 12 || s.length === 13
  }
  isValidEAN(code:string){
    const s = String(code||'')
    this.inc()
    if (!this.isDigits(s)) return false
    return s.length === 13
  }
  detectBarcodeType(code:string){
    const s = String(code||'')
    this.inc()
    if (this.isDigits(s) && s.length === 12) return 'UPC'
    if (this.isDigits(s) && s.length === 13) return 'EAN'
    if (this.isDigits(s) && s.length === 8)  return 'EAN-8'
    if (this.isDigits(s) && s.length === 14) return 'ITF-14'
    return 'UNKNOWN'
  }

  async lookup(code:string){
    this.inc()
    if (this.cache.has(code)) return { success:true, data: this.cache.get(code), source:'cache' }
    return { success:false, data:null, source:'cache' }
  }

  getApiUsage(): Usage {
    const limit = 90
    const remaining = Math.max(0, limit - this.calls)
    const percentUsed = Math.min(100, Math.round((this.calls / limit) * 100))
    return { callsToday: this.calls, limit, remaining, percentUsed }
  }
  resetApiCounter(){ this.calls = 0 }
  getCacheStats(){ return { size: this.cache.size } }
  async clearCache(){ this.cache.clear() }
  cacheResult(code:string, value:any){ this.cache.set(code, value) }

  static getInstance(){ return instance }
}
const instance = new BarcodeService()
export default instance
export { BarcodeService }
