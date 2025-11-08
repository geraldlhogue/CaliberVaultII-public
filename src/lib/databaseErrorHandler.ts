import { withErrorHandling } from './errorHandler'
export async function withDatabaseErrorHandling<T>(op: ()=>Promise<{data:any,error:any}>){
  return withErrorHandling(async () => {
    const { data, error } = await op()
    if (error) throw error
    return { success: true, data }
  })
}
export default { withDatabaseErrorHandling }
