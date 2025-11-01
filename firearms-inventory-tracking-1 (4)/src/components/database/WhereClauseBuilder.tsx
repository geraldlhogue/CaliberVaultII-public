import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

interface WhereCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
  logicalOp?: 'AND' | 'OR';
}

interface Props {
  conditions: WhereCondition[];
  columns: string[];
  onChange: (conditions: WhereCondition[]) => void;
}

export function WhereClauseBuilder({ conditions, columns, onChange }: Props) {
  const operators = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN', 'IS NULL', 'IS NOT NULL'];

  const addCondition = () => {
    onChange([...conditions, {
      id: Date.now().toString(),
      column: columns[0] || '',
      operator: '=',
      value: '',
      logicalOp: conditions.length > 0 ? 'AND' : undefined
    }]);
  };

  const removeCondition = (id: string) => {
    onChange(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, field: keyof WhereCondition, value: string) => {
    onChange(conditions.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">WHERE Conditions</h4>
        <Button size="sm" onClick={addCondition}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>
      {conditions.map((cond, idx) => (
        <div key={cond.id} className="flex gap-2 items-center">
          {idx > 0 && (
            <Select value={cond.logicalOp} onValueChange={(v) => updateCondition(cond.id, 'logicalOp', v)}>
              <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="AND">AND</SelectItem><SelectItem value="OR">OR</SelectItem></SelectContent>
            </Select>
          )}
          <Select value={cond.column} onValueChange={(v) => updateCondition(cond.id, 'column', v)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{columns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={cond.operator} onValueChange={(v) => updateCondition(cond.id, 'operator', v)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>{operators.map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}</SelectContent>
          </Select>
          {!cond.operator.includes('NULL') && (
            <Input value={cond.value} onChange={(e) => updateCondition(cond.id, 'value', e.target.value)} placeholder="Value" />
          )}
          <Button size="icon" variant="ghost" onClick={() => removeCondition(cond.id)}><X className="w-4 h-4" /></Button>
        </div>
      ))}
    </div>
  );
}
