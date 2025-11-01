import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';

export interface JoinConfig {
  id: string;
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
  table: string;
  leftColumn: string;
  rightColumn: string;
}

interface Props {
  joins: JoinConfig[];
  availableTables: string[];
  selectedTables: Array<{ table: string; columns: string[] }>;
  onChange: (joins: JoinConfig[]) => void;
}

export function JoinBuilder({ joins, availableTables, selectedTables, onChange }: Props) {
  const addJoin = () => {
    onChange([...joins, {
      id: Date.now().toString(),
      type: 'INNER',
      table: availableTables[0] || '',
      leftColumn: '',
      rightColumn: ''
    }]);
  };

  const removeJoin = (id: string) => {
    onChange(joins.filter(j => j.id !== id));
  };

  const updateJoin = (id: string, field: keyof JoinConfig, value: string) => {
    onChange(joins.map(j => j.id === id ? { ...j, [field]: value } : j));
  };

  const getColumnsForTable = (tableName: string) => {
    return selectedTables.find(t => t.table === tableName)?.columns || [];
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">JOIN Tables</h4>
        <Button size="sm" onClick={addJoin}><Plus className="w-4 h-4 mr-1" />Add Join</Button>
      </div>
      {joins.map(join => (
        <div key={join.id} className="flex gap-2 items-center p-3 border rounded-lg">
          <Select value={join.type} onValueChange={(v) => updateJoin(join.id, 'type', v as any)}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['INNER', 'LEFT', 'RIGHT', 'FULL'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-sm">JOIN</span>
          <Select value={join.table} onValueChange={(v) => updateJoin(join.id, 'table', v)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Table" /></SelectTrigger>
            <SelectContent>{availableTables.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <span className="text-sm">ON</span>
          <Select value={join.leftColumn} onValueChange={(v) => updateJoin(join.id, 'leftColumn', v)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Column" /></SelectTrigger>
            <SelectContent>{selectedTables[0]?.columns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <span className="text-sm">=</span>
          <Select value={join.rightColumn} onValueChange={(v) => updateJoin(join.id, 'rightColumn', v)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Column" /></SelectTrigger>
            <SelectContent>{getColumnsForTable(join.table).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="icon" variant="ghost" onClick={() => removeJoin(join.id)}><X className="w-4 h-4" /></Button>
        </div>
      ))}
    </div>
  );
}
