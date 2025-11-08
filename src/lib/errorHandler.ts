export class ErrorHandler {
  private logs: any[] = []
  log(message:string, meta?:any){ this.logs.push({ message, meta, ts: Date.now() }) }
  categorize(_err:unknown){ return 'generic' }
  getLogs(){ return this.logs.slice() }
}
export const errorHandler = new ErrorHandler()
export function handleError(error:any){ errorHandler.log(String(error?.message ?? error)); return { handled:true } }
export function withErrorHandling<T>(fn: ()=>Promise<T> | T): Promise<T>{
  try{ return Promise.resolve(fn()) }catch(e){ return Promise.reject(e) }
}
export function logError(message:string, meta?:any){ errorHandler.log(message, meta) }
export function getErrorLogs(){ return errorHandler.getLogs() }
export default { ErrorHandler, errorHandler, withErrorHandling, handleError, logError, getErrorLogs }
