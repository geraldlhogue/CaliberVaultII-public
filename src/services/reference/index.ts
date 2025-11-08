export class ReferenceDataService {
  async addManufacturer(mfg){ return { id:'mfg123', ...mfg } }
  async getManufacturers(){ return [{ id:'mfg123', name:'Test Mfg' }] }
  async getCalibers(){ return [{ id:'cal123', name:'5.56mm' }] }
}
export const service = new ReferenceDataService()
export default service
