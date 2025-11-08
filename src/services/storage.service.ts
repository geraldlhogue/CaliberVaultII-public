export class StorageService {
  async uploadFile(){ return { path: '/files/x.png' } }
  async deleteFile(){ return { success: true } }
 async listFiles(){ return [{ name: 'x.png' }] }
}
export default StorageService
