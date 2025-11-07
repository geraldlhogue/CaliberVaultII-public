import { withErrorHandling } from './errorHandler'
export async function withDatabaseErrorHandling<T>(operation: () => Promise<{ data: any; error: any }>, _ctx?: any) {
  const result = await withErrorHandling(async () => {
    const { data, error } = await operation()
    if (error) throw error
    return data
  })
  return result
}
export default { withDatabaseErrorHandling }
