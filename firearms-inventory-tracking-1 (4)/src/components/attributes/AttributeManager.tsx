import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Edit2, Trash2, Save, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';

interface Attribute {
  id: string;
  name: string;
  description?: string;
  [key: string]: any;
}

export const AttributeManager: React.FC = () => {
  const [manufacturers, setManufacturers] = useState<Attribute[]>([]);
  const [categories, setCategories] = useState<Attribute[]>([]);
  const [locations, setLocations] = useState<Attribute[]>([]);
  const [firearmTypes, setFirearmTypes] = useState<Attribute[]>([]);
  const [calibers, setCalibers] = useState<Attribute[]>([]);
  const [actionTypes, setActionTypes] = useState<Attribute[]>([]);
  
  const [editingItem, setEditingItem] = useState<Attribute | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [currentTable, setCurrentTable] = useState('');
  const [formData, setFormData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllAttributes();
  }, []);

  const loadAllAttributes = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to manage attributes');
        setLoading(false);
        return;
      }

      const [mfrs, cats, locs, types, cals, actions] = await Promise.all([
        supabase.from('manufacturers').select('*').eq('user_id', user.id).order('name'),
        supabase.from('categories').select('*').eq('user_id', user.id).order('name'),
        supabase.from('locations').select('*').eq('user_id', user.id).order('name'),
        supabase.from('firearm_types').select('*').eq('user_id', user.id).order('name'),
        supabase.from('calibers').select('*').eq('user_id', user.id).order('name'),
        supabase.from('action_types').select('*').eq('user_id', user.id).order('name'),
      ]);

      setManufacturers(mfrs.data || []);
      setCategories(cats.data || []);
      setLocations(locs.data || []);
      setFirearmTypes(types.data || []);
      setCalibers(cals.data || []);
      setActionTypes(actions.data || []);
    } catch (error) {
      console.error('Error loading attributes:', error);
      toast.error('Failed to load attributes');
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (item: Attribute, table: string) => {
    setEditingItem(item);
    setFormData(item);
    setCurrentTable(table);
    setIsAddMode(false);
  };

  const handleAdd = (table: string, fields: any) => {
    const newItem: any = { id: 'new' };
    fields.forEach((field: any) => {
      newItem[field.name] = '';
    });
    setEditingItem(newItem);
    setFormData(newItem);
    setCurrentTable(table);
    setIsAddMode(true);
  };

  const handleSave = async () => {
    if (!currentTable) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save');
        return;
      }

      const dataToSave = { ...formData, user_id: user.id };
      delete dataToSave.id;
      delete dataToSave.created_at;
      delete dataToSave.updated_at;

      if (isAddMode) {
        const { error } = await supabase.from(currentTable).insert(dataToSave);
        if (error) throw error;
        toast.success('Added successfully');
      } else {
        const { error } = await supabase
          .from(currentTable)
          .update(dataToSave)
          .eq('id', editingItem?.id);
        if (error) throw error;
        toast.success('Updated successfully');
      }
      
      setEditingItem(null);
      setFormData({});
      loadAllAttributes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    }
  };

  const handleDelete = async (table: string, id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      toast.success('Deleted successfully');
      loadAllAttributes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const filterItems = (items: Attribute[]) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const AttributeTable = ({ items, table, fields, title }: any) => {
    const filteredItems = filterItems(items);
    
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{title}</CardTitle>
            <Button onClick={() => handleAdd(table, fields)} size="sm">
              <Plus className="w-4 h-4 mr-2" /> Add New
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No items found' : 'No items yet. Click "Add New" to create one.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  {fields.slice(1).map((field: any) => (
                    <TableHead key={field.name}>{field.label}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    {fields.slice(1).map((field: any) => (
                      <TableCell key={field.name}>
                        {item[field.name] || '-'}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item, table)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(table, item.id, item.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  };

  const getFieldsForTable = (table: string) => {
    switch (table) {
      case 'manufacturers':
        return [
          { name: 'name', label: 'Name', placeholder: 'Enter manufacturer name' },
          { name: 'website', label: 'Website', placeholder: 'https://example.com' },
          { name: 'phone', label: 'Phone', placeholder: '1-800-XXX-XXXX' },
          { name: 'email', label: 'Email', placeholder: 'contact@example.com' },
          { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
        ];
      case 'categories':
        return [
          { name: 'name', label: 'Name', placeholder: 'Enter category name' },
          { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Category description' },
        ];
      case 'locations':
        return [
          { name: 'name', label: 'Name', placeholder: 'Enter location name' },
          { name: 'building', label: 'Building', placeholder: 'Building name/number' },
          { name: 'room', label: 'Room', placeholder: 'Room number' },
          { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Location details' },
        ];
      default:
        return [
          { name: 'name', label: 'Name', placeholder: 'Enter name' },
          { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
        ];
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Attribute Management</h2>
      
      <Tabs defaultValue="manufacturers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="manufacturers">Manufacturers</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="types">Firearm Types</TabsTrigger>
          <TabsTrigger value="calibers">Calibers</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="manufacturers">
          <AttributeTable
            items={manufacturers}
            table="manufacturers"
            fields={getFieldsForTable('manufacturers')}
            title="Manufacturers"
          />
        </TabsContent>

        <TabsContent value="categories">
          <AttributeTable
            items={categories}
            table="categories"
            fields={getFieldsForTable('categories')}
            title="Categories"
          />
        </TabsContent>

        <TabsContent value="locations">
          <AttributeTable
            items={locations}
            table="locations"
            fields={getFieldsForTable('locations')}
            title="Storage Locations"
          />
        </TabsContent>

        <TabsContent value="types">
          <AttributeTable
            items={firearmTypes}
            table="firearm_types"
            fields={[
              { name: 'name', label: 'Name', placeholder: 'e.g., AR-15' },
              { name: 'category', label: 'Category', placeholder: 'e.g., Rifle' },
              { name: 'description', label: 'Description', type: 'textarea' },
            ]}
            title="Firearm Types"
          />
        </TabsContent>

        <TabsContent value="calibers">
          <AttributeTable
            items={calibers}
            table="calibers"
            fields={[
              { name: 'name', label: 'Caliber', placeholder: 'e.g., .223 Remington' },
              { name: 'type', label: 'Type', placeholder: 'centerfire/rimfire/shotgun' },
              { name: 'description', label: 'Description', type: 'textarea' },
            ]}
            title="Calibers"
          />
        </TabsContent>

        <TabsContent value="actions">
          <AttributeTable
            items={actionTypes}
            table="action_types"
            fields={[
              { name: 'name', label: 'Action Type', placeholder: 'e.g., Semi-automatic' },
              { name: 'description', label: 'Description', type: 'textarea' },
            ]}
            title="Action Types"
          />
        </TabsContent>
      </Tabs>

      {/* Edit/Add Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => {
        setEditingItem(null);
        setFormData({});
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isAddMode ? 'Add New' : 'Edit'} {currentTable.replace(/_/g, ' ').replace(/s$/, '')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {editingItem && getFieldsForTable(currentTable).map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium">{field.label}</label>
                {field.type === 'textarea' ? (
                  <Textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                ) : (
                  <Input
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditingItem(null);
              setFormData({});
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};