export class StorageService {
  constructor() {}
  async uploadFile(path: string, _f: any){ return { path, uploaded: true } }
  async deleteFile(path: string){ return { path, deleted: true } }
  async listFiles(_p: string){ return [] }
}
export default StorageService
