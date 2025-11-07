type LookupResult = { success: boolean; data?: any; error?: string }
export class BarcodeService {
  private static _instance: BarcodeService | null = null
  private _apiCalls = 0
  static getInstance(){ return this._instance ??= new BarcodeService() }
  isValidUPC(s: string){ return /^[0-9]{12,13}$/.test(s) }
  isValidEAN(s: string){ return /^[0-9]{8}|[0-9]{13}$/.test(s) }
  detectBarcodeType(s: string){ return this.isValidUPC(s) ? 'UPC' : (this.isValidEAN(s) ? (s.length===8?'EAN-8':'EAN') : 'UNKNOWN') }
  async lookup(s: string): Promise<LookupResult> { this._apiCalls++; return { success: false, error: 'cache-miss', data: { code: s } } }
  getApiUsage(){ return { callsToday: this._apiCalls, limit: 1000 } }
  resetApiCounter(){ this._apiCalls = 0 }
  getCacheStats(){ return { size: 0 } }
  clearCache(){ return Promise.resolve(true) }
}
export default BarcodeService
