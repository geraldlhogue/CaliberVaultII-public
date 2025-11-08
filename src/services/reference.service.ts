export class ReferenceDataService {
  async getManufactures(){ return [ { id: 'm1', name: 'Acme' } ] }
  async getCalibers(){ return [ { id: 'c1', name: '9mm' } ] }
  async addManufacturer(v) { return { id: 'new-mfg', ...v } }
}
export default ReferenceDataService
