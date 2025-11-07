export class ReferenceDataService {
  addManufacturer = async (mfg: { name: string }) => ({ id: 'mfg123', ...mfg })
  getManufacturers = async () => [{ id: 'mfg123', name: 'Test Mfg' }]
  getCalibers = async () => [{ id: 'cal123', name: '5.56mm' }]
}
export default ReferenceDataService
