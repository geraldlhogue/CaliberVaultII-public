export function safeNumber(input: any, fallback = 0){
  const n = Number(input)
  return Number.isFinite(n) ? n : fallback
}
export const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ')
const defaultExport = { safeNumber, cn }
export default defaultExport
