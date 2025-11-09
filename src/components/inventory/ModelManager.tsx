import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface ModelManagerProps {
  manufacturerId?: string;
  onModelSelect?: (model: any) => void;
}

export const ModelManager: React.FC<ModelManagerProps> = ({ manufacturerId, onModelSelect }) => {
  const [models, setModels] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (manufacturerId) loadModels();
  }, [manufacturerId]);

  const loadModels = async () => {
    const { data, error } = await supabase
      .from('model_descriptions')
      .select('*')
      .eq('manufacturer_id', manufacturerId)
      .order('model_number');
    
    if (data) setModels(data);
  };

  const handleSave = async () => {
    try {
      const saveData = {
        ...formData,
        manufacturer_id: manufacturerId
      };
      
      if (editingId && editingId !== 'new') {
        await supabase.from('model_descriptions').update(saveData).eq('id', editingId);
      } else {
        await supabase.from('model_descriptions').insert(saveData);
      }
      
      toast.success('Model saved');
      setEditingId(null);
      setFormData({});
      loadModels();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this model?')) return;
    await supabase.from('model_descriptions').delete().eq('id', id);
    toast.success('Model deleted');
    loadModels();
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => { setEditingId('new'); setFormData({}); }}>
        <Plus className="w-4 h-4 mr-2" /> Add Model
      </Button>
      
      {editingId && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Input
              placeholder="Model Number"
              value={formData.model_number || ''}
              onChange={(e) => setFormData({...formData, model_number: e.target.value})}
            />
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Model Description"
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Save</Button>
              <Button variant="outline" onClick={() => setEditingId(null)}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {models.map((model) => (
        <Card key={model.id} className="cursor-pointer" onClick={() => onModelSelect?.(model)}>
          <CardContent className="flex justify-between items-center py-4">
            <div>
              <p className="font-medium">{model.model_number}</p>
              <p className="text-sm text-muted-foreground">{model.description}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={(e) => { 
                e.stopPropagation(); 
                setEditingId(model.id); 
                setFormData(model); 
              }}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={(e) => {
                e.stopPropagation();
                handleDelete(model.id);
              }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};