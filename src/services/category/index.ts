const mkSvc = () => ({
  create:  async (x:any) => ({ id: '1', ...x }),
  update:  async (x:any) => ({ updated: true, ...x }),
  delete:  async () => ({ deleted: true }),
  getById: async (id:string) => ({ id }),
})
export const firearmsService = mkSvc()
export const ammunitionService = mkSvc()
export const opticsService = mkSvc()
export const magazinesService = mkSvc()
export const accessoriesService = mkSvc()
export const suppressorsService = mkSvc()
export default { firearmsService, ammunitionService, opticsService, magazinesService, accessoriesService, suppressorsService }
