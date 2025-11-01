import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface FilterCondition {
  id: string;
  field: string;
  operator: 'contains' | 'equals' | 'greater' | 'less';
  value: string;
  logicalOp: 'AND' | 'OR' | 'NOT';
}

interface BooleanFilterBuilderProps {
  conditions: FilterCondition[];
  onChange: (conditions: FilterCondition[]) => void;
}

export const BooleanFilterBuilder: React.FC<BooleanFilterBuilderProps> = ({ conditions, onChange }) => {
  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: Date.now().toString(),
      field: 'name',
      operator: 'contains',
      value: '',
      logicalOp: 'AND'
    };
    onChange([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    onChange(conditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeCondition = (id: string) => {
    onChange(conditions.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-2">
      {conditions.map((condition, index) => (
        <Card key={condition.id} className="p-3 bg-slate-800 border-slate-700">
          <div className="flex gap-2 items-center">
            {index > 0 && (
              <Select value={condition.logicalOp} onValueChange={(v) => updateCondition(condition.id, { logicalOp: v as any })}>
                <SelectTrigger className="w-20 bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                  <SelectItem value="NOT">NOT</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            <Select value={condition.field} onValueChange={(v) => updateCondition(condition.id, { field: v })}>
              <SelectTrigger className="w-32 bg-slate-900 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="model">Model</SelectItem>
                <SelectItem value="serial_number">Serial</SelectItem>
                <SelectItem value="caliber">Caliber</SelectItem>
                <SelectItem value="manufacturer">Manufacturer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={condition.operator} onValueChange={(v) => updateCondition(condition.id, { operator: v as any })}>
              <SelectTrigger className="w-32 bg-slate-900 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="greater">Greater</SelectItem>
                <SelectItem value="less">Less</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={condition.value}
              onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
              placeholder="Value"
              className="flex-1 bg-slate-900 border-slate-700 text-white"
            />

            <Button onClick={() => removeCondition(condition.id)} variant="ghost" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}

      <Button onClick={addCondition} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Condition
      </Button>
    </div>
  );
};
