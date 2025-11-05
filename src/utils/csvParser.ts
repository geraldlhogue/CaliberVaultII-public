
export function parseCSV(text: string): Array<Record<string,string>> {
  const t = (text ?? '').trim();
  if (!t) return [];
  const rows = t.split(/\r?\n/);
  if (rows.length === 0) return [];
  const header = rows[0].split(',').map(h => h.trim());
  const out: Array<Record<string,string>> = [];
  for (let r = 1; r < rows.length; r++) {
    const line = rows[r];
    if (line.trim() === '') continue;
    const cells: string[] = [];
    let cur = '', inQ = false;
    for (let i=0;i<line.length;i++){
      const ch=line[i];
      if (ch === '"') { if (inQ && line[i+1]==='"'){ cur+='"'; i++; } else { inQ=!inQ; } }
      else if (ch === ',' && !inQ) { cells.push(cur); cur=''; }
      else cur += ch;
    }
    cells.push(cur);
    const obj: Record<string,string> = {};
    header.forEach((h, i) => { obj[h] = (cells[i] ?? '').trim(); });
    out.push(obj);
  }
  return out;
}
export function generateCSVTemplate(headers: string[]): string {
  return headers.join(',') + '\n';
}
