export class StorageService {
  constructor(){}
  async uploadFile(path){ return { path, uploaded:true } }
  async deleteFile(path){ return { path, deleted:true } }
  async listFiles(){ return [] }
}
export default StorageService
