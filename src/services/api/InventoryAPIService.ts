export class InventoryAPIService {
  getAll = async () => [{ id:'1', name:'Item 1' }, { id:'2', name:'Item 2' }]
  getItems = async () => [{ id:'1', category:'firearms', name:'Item 1' }, { id:'2', category:'ammunition', name:'Item 2' }]
  create = async (item:any) => ({ ...item })
  createItem = async (item:any) => ({ ...item })
  batchCreate = async (arr:any[]) => arr
  subscribeToChanges = async (_cb: Function) => ({ unsubscribe(){ } })
}
export const apiService = new InventoryAPIService()
export default InventoryAPIService
