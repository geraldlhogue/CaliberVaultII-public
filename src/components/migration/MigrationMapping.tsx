import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  caliber?: string;
  quantity?: number;
  [key: string]: any;
}

interface MigrationMappingProps {
  onMappingComplete: (mappings: CategoryMapping[]) => void;
}

interface CategoryMapping {
  itemId: string;
  originalData: InventoryItem;
  targetCategory: string;
  fieldMappings: Record<string, any>;
  selected: boolean;
}

const CATEGORY_OPTIONS = [
  { value: 'firearms', label: 'Firearms' },
  { value: 'optics', label: 'Optics' },
  { value: 'bullets', label: 'Bullets' },
  { value: 'casings', label: 'Casings' },
  { value: 'powder', label: 'Powder' },
  { value: 'primers', label: 'Primers' },
  { value: 'skip', label: 'Skip (Do Not Migrate)' }
];

export function MigrationMapping({ onMappingComplete }: MigrationMappingProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [mappings, setMappings] = useState<CategoryMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(true);

  useEffect(() => {
    loadInventoryItems();
  }, []);

  const loadInventoryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (error) throw error;

      setItems(data || []);
      
      // Auto-detect categories based on existing data
      const initialMappings = (data || []).map(item => ({
        itemId: item.id,
        originalData: item,
        targetCategory: detectCategory(item),
        fieldMappings: mapFields(item, detectCategory(item)),
        selected: true
      }));
      
      setMappings(initialMappings);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectCategory = (item: InventoryItem): string => {
    const name = item.name?.toLowerCase() || '';
    const category = item.category?.toLowerCase() || '';
    
    if (item.serial_number && (category.includes('firearm') || category.includes('rifle') || 
        category.includes('pistol') || category.includes('shotgun'))) {
      return 'firearms';
    }
    if (category.includes('optic') || category.includes('scope') || name.includes('scope')) {
      return 'optics';
    }
    if (category.includes('bullet') || category.includes('projectile')) {
      return 'bullets';
    }
    if (category.includes('brass') || category.includes('casing')) {
      return 'casings';
    }
    if (category.includes('powder')) {
      return 'powder';
    }
    if (category.includes('primer')) {
      return 'primers';
    }
    
    return 'skip';
  };

  const mapFields = (item: InventoryItem, category: string): Record<string, any> => {
    const baseMapping = {
      manufacturer: item.manufacturer,
      notes: item.notes,
      purchase_date: item.purchase_date,
      cost: item.purchase_price
    };

    switch (category) {
      case 'firearms':
        return {
          ...baseMapping,
          model: item.model,
          serial_number: item.serial_number,
          caliber_gauge: item.caliber,
          round_count: 0,
          current_value: item.current_value || item.purchase_price
        };
      case 'optics':
        return {
          ...baseMapping,
          model: item.model,
          serial_number: item.serial_number
        };
      case 'bullets':
      case 'casings':
      case 'powder':
      case 'primers':
        return {
          ...baseMapping,
          quantity: item.quantity || 0,
          lot_number: item.lot_number
        };
      default:
        return baseMapping;
    }
  };

  const updateMapping = (itemId: string, field: string, value: any) => {
    setMappings(prev => prev.map(m => 
      m.itemId === itemId 
        ? { ...m, [field]: value, fieldMappings: field === 'targetCategory' ? mapFields(m.originalData, value) : m.fieldMappings }
        : m
    ));
  };

  const toggleSelection = (itemId: string) => {
    setMappings(prev => prev.map(m => 
      m.itemId === itemId ? { ...m, selected: !m.selected } : m
    ));
  };

  const toggleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setMappings(prev => prev.map(m => ({ ...m, selected: newValue })));
  };

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    mappings.forEach(m => {
      if (m.selected && m.targetCategory !== 'skip') {
        stats[m.targetCategory] = (stats[m.targetCategory] || 0) + 1;
      }
    });
    return stats;
  };

  const handleProceed = () => {
    const selectedMappings = mappings.filter(m => m.selected && m.targetCategory !== 'skip');
    onMappingComplete(selectedMappings);
  };

  if (loading) {
    return <div className="p-4">Loading inventory items...</div>;
  }

  const stats = getCategoryStats();
  const totalSelected = mappings.filter(m => m.selected && m.targetCategory !== 'skip').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Map Items for Migration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Review how each item will be migrated to the new category-specific tables.
            Items marked as "Skip" will not be migrated.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2 flex-wrap">
          {Object.entries(stats).map(([category, count]) => (
            <Badge key={category} variant="secondary">
              {category}: {count} items
            </Badge>
          ))}
          <Badge variant="outline">
            Total to migrate: {totalSelected}
          </Badge>
        </div>

        <ScrollArea className="h-[400px] border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectAll}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Current Item</TableHead>
                <TableHead>Target Category</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map((mapping) => (
                <TableRow key={mapping.itemId}>
                  <TableCell>
                    <Checkbox
                      checked={mapping.selected}
                      onCheckedChange={() => toggleSelection(mapping.itemId)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{mapping.originalData.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {mapping.originalData.manufacturer} {mapping.originalData.model}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={mapping.targetCategory}
                      onValueChange={(value) => updateMapping(mapping.itemId, 'targetCategory', value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {mapping.targetCategory === 'skip' ? (
                      <Badge variant="secondary">Will Skip</Badge>
                    ) : mapping.selected ? (
                      <Badge variant="default">Ready</Badge>
                    ) : (
                      <Badge variant="outline">Not Selected</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {totalSelected} items will be migrated
          </div>
          <Button 
            onClick={handleProceed}
            disabled={totalSelected === 0}
          >
            Proceed with Migration
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}