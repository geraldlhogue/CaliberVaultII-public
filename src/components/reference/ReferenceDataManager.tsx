import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

interface ReferenceTable {
  name: string;
  displayName: string;
  fields: Array<{
    name: string;
    type: 'text' | 'number' | 'boolean';
    label: string;
  }>;
}

const REFERENCE_TABLES: ReferenceTable[] = [
  { 
    name: 'manufacturers', 
    displayName: 'Manufacturers', 
    fields: [
      { name: 'name', type: 'text', label: 'Name' },
      { name: 'firearm_indicator', type: 'boolean', label: 'Firearms' },
      { name: 'bullet_indicator', type: 'boolean', label: 'Bullets' },
      { name: 'optics_indicator', type: 'boolean', label: 'Optics' },
      { name: 'primer_indicator', type: 'boolean', label: 'Primers' },
      { name: 'powder_indicator', type: 'boolean', label: 'Powder' },
      { name: 'country', type: 'text', label: 'Country' }
    ]
  },
  { 
    name: 'calibers', 
    displayName: 'Calibers', 
    fields: [
      { name: 'name', type: 'text', label: 'Caliber Name' }
    ]
  },
  { 
    name: 'locations',  // Changed from storage_locations to locations
    displayName: 'Storage Locations', 
    fields: [
      { name: 'name', type: 'text', label: 'Location Name' },
      { name: 'type', type: 'text', label: 'Type' },
      { name: 'description', type: 'text', label: 'Description' }
    ]
  },
  { 
    name: 'actions',  // Changed from firearm_actions to actions
    displayName: 'Firearm Actions', 
    fields: [
      { name: 'name', type: 'text', label: 'Action Type' },
      { name: 'description', type: 'text', label: 'Description' }
    ]
  },

  { 
    name: 'powder_types', 
    displayName: 'Powder Types', 
    fields: [
      { name: 'name', type: 'text', label: 'Type' },
      { name: 'description', type: 'text', label: 'Description' }
    ]
  },
  { 
    name: 'primer_types', 
    displayName: 'Primer Types', 
    fields: [
      { name: 'name', type: 'text', label: 'Type' },
      { name: 'description', type: 'text', label: 'Description' }
    ]
  },
  { 
    name: 'reticle_types', 
    displayName: 'Reticle Types', 
    fields: [
      { name: 'name', type: 'text', label: 'Type' },
      { name: 'description', type: 'text', label: 'Description' }
    ]
  },
  { 
    name: 'units_of_measure', 
    displayName: 'Units of Measure', 
    fields: [
      { name: 'name', type: 'text', label: 'Unit' },
      { name: 'abbreviation', type: 'text', label: 'Abbreviation' },
      { name: 'type', type: 'text', label: 'Type' }
    ]
  }
];

export const ReferenceDataManager: React.FC = () => {
  const [activeTable, setActiveTable] = useState(REFERENCE_TABLES[0].name);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [newItem, setNewItem] = useState<any>({});
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTable]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(activeTable)
        .select('*')
        .order('name', { ascending: true, nullsFirst: false });
      
      if (error) throw error;
      setData(data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const { error } = await supabase
        .from(activeTable)
        .insert(newItem);
      
      if (error) throw error;
      toast.success('Item added successfully');
      setNewItem({});
      setShowNewForm(false);
      fetchData();
    } catch (error: any) {
      toast.error(`Failed to add item: ${error.message}`);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const { error } = await supabase
        .from(activeTable)
        .update(editValues)
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Item updated successfully');
      setEditingId(null);
      setEditValues({});
      fetchData();
    } catch (error: any) {
      toast.error(`Failed to update item: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const { error } = await supabase
        .from(activeTable)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Item deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(`Failed to delete item: ${error.message}`);
    }
  };

  const currentTable = REFERENCE_TABLES.find(t => t.name === activeTable)!;

  const renderField = (field: any, value: any, onChange: (val: any) => void) => {
    if (field.type === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={value || false}
            onCheckedChange={onChange}
          />
          <label className="text-sm">{field.label}</label>
        </div>
      );
    }
    return (
      <Input
        type={field.type === 'number' ? 'number' : 'text'}
        placeholder={field.label}
        value={value || ''}
        onChange={(e) => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
      />
    );
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Reference Data Manager</h2>
      
      <Tabs value={activeTable} onValueChange={setActiveTable}>
        <TabsList className="grid grid-cols-4 mb-4">
          {REFERENCE_TABLES.slice(0, 4).map(table => (
            <TabsTrigger key={table.name} value={table.name}>
              {table.displayName}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsList className="grid grid-cols-4 mb-4">
          {REFERENCE_TABLES.slice(4).map(table => (
            <TabsTrigger key={table.name} value={table.name}>
              {table.displayName}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeTable}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{currentTable.displayName}</h3>
              <Button onClick={() => setShowNewForm(true)} disabled={showNewForm}>
                <Plus className="mr-2 h-4 w-4" /> Add New
              </Button>
            </div>
            
            {showNewForm && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="grid grid-cols-2 gap-4">
                  {currentTable.fields.map(field => (
                    <div key={field.name}>
                      {renderField(field, newItem[field.name], (val) => 
                        setNewItem({ ...newItem, [field.name]: val })
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleAdd}>Save</Button>
                  <Button onClick={() => { setShowNewForm(false); setNewItem({}); }} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {loading ? (
                <div>Loading...</div>
              ) : data.length === 0 ? (
                <div className="text-muted-foreground">No items found</div>
              ) : (
                data.map(item => (
                  <div key={item.id} className="p-3 border rounded-lg">
                    {editingId === item.id ? (
                      <div>
                        <div className="grid grid-cols-2 gap-4">
                          {currentTable.fields.map(field => (
                            <div key={field.name}>
                              {renderField(field, editValues[field.name], (val) =>
                                setEditValues({ ...editValues, [field.name]: val })
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button onClick={() => handleUpdate(item.id)} size="sm">Save</Button>
                          <Button onClick={() => { setEditingId(null); setEditValues({}); }} variant="outline" size="sm">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {currentTable.fields.map(field => (
                            <span key={field.name} className="mr-4">
                              <strong>{field.label}:</strong> {
                                field.type === 'boolean' 
                                  ? (item[field.name] ? '✓' : '✗')
                                  : (item[field.name] || '-')
                              }
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditValues(item);
                            }}
                            variant="ghost"
                            size="sm"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(item.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};