export class ErrorHandler {
  log(msg: string, _ctx?: any) {
    console.log('[ErrorHandler]', msg)
  }

  categorize(_e: any) {
    return 'unknown'
  }
}

export function handleError(e: any) {
  return { ok: false, error: e }
}

export default { ErrorHandler, handleError }

