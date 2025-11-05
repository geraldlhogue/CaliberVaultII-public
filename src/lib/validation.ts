export const validateEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s ?? ''))
export const validatePhone = (s: string) => /^(?:\(\d{3}\)\s?|\d{3}[-\s]?)\d{3}[-\s]?\d{4}$/.test(String(s ?? ''))
export const validateURL   = (s: string) => { try { const u = new URL(String(s)); return !!u.protocol && !!u.host } catch { return false } }
export const validateRequired = (v: unknown) => !(v === null || v === undefined || v === '')
export default { validateEmail, validatePhone, validateURL, validateRequired }
