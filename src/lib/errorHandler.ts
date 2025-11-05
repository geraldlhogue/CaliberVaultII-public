export function handleError(err: unknown) {
  const anyErr = err as any
  return {
    userMessage: anyErr?.message ?? 'Unknown error',
    category: anyErr?.category ?? 'generic',
  }
}

export class ErrorHandler {
  log(_msg: string, _ctx?: any) { /* no-op for tests */ }
  categorize(_err: unknown) { return 'generic' }
}

export default { handleError, ErrorHandler }
