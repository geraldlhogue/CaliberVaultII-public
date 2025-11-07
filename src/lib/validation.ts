export const validateEmail = (s: string) => /\S+@\S+\.\S+/.test(s)
export const validatePhone = (s: string) => /[0-9\-\(\)\s]{7,}/.test(s)
export const validateURL = (s: string) => /^https?:\/\/\S+/i.test(s)
export const validateRequired = (v: any) => v !== null && v !== undefined && String(v).trim() !== ''

export default { validateEmail, validatePhone, validateURL, validateRequired }

