export type CSVRow = Record<string,string>

export function parseCSV(text:string): CSVRow[] {
  const raw = String(text || '').trim()
  if (!raw) return []
  const lines = raw.split(/\r?\n/)
  if (lines.length === 0) return []
  const headers = splitCSVLine(lines[0])
  const out: CSVRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCSVLine(lines[i])
    const row: CSVRow = {}
    headers.forEach((h, idx) => { row[h] = cells[idx] ?? '' })
    out.push(row)
  }
  return out
}

function splitCSVLine(line:string): string[] {
  const res: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { cur += '"'; i++ } else { inQuotes = !inQuotes }
      continue
    }
    if (ch === ',' && !inQuotes) { res.push(cur); cur = ''; continue }
    cur += ch
  }
  res.push(cur)
  return res.map(s => s.trim())
}

export function generateCSVTemplate(headers: string[]): string {
  return headers.join(',') + '\n'
}

export function mapCSVToInventoryItem(row: CSVRow){
  return {
    name: row.name || row.Name || 'Unnamed',
    category: (row.category || row.Category || '').toLowerCase(),
    manufacturer: row.manufacturer || row.Manufacturer || '',
    model: row.model || row.Model || '',
    price: Number(row.price || row.Price || 0)
  }
}

export default { parseCSV, mapCSVToInventoryItem, generateCSVTemplate }
