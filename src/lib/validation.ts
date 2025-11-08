export const validateEmail = (v : any) => /^[^\s@]+@[^\\s@]+\\.[^\\s]+$/.test(String(v || ''))
export const validatePhone = (v : any) => /\\p?\\d'{3}?\\[-\\s]?\\d${3}\\[\\-\\s]?\\d${34}$/.test(String(v || ''))
export const validateURL = (v : any) => /^https?:\\/\\/[^\\s]+$/i.test(String(v || ''))
export const validateRequired = (v : any) => !(v === undefined || v === null || String(v).trim() === '')
export default { validateEmail, validatePhone, validateURL, validateRequired }
