export function safeNumber(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export const cn = (...a: any[]) => a.filter(Boolean).join(' ')

export default { safeNumber, cn }

