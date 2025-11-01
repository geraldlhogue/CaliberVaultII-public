import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Copy, Tag, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  is_active: boolean;
  usage_count: number;
  tags: string[];
  auto_resolve: boolean;
}

export function FeedbackTemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<Template> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback_response_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingTemplate?.name || !editingTemplate?.subject || !editingTemplate?.body) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingTemplate.id) {
        const { error } = await supabase
          .from('feedback_response_templates')
          .update(editingTemplate)
          .eq('id', editingTemplate.id);
        if (error) throw error;
        toast.success('Template updated');
      } else {
        const { error } = await supabase
          .from('feedback_response_templates')
          .insert([editingTemplate]);
        if (error) throw error;
        toast.success('Template created');
      }
      setIsEditing(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('feedback_response_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Template deleted');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleDuplicate = (template: Template) => {
    setEditingTemplate({
      ...template,
      id: undefined,
      name: `${template.name} (Copy)`,
      usage_count: 0
    });
    setIsEditing(true);
  };

  if (loading) return <div>Loading templates...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Response Templates</h2>
        <Button onClick={() => { setEditingTemplate({ is_active: true, auto_resolve: false, tags: [] }); setIsEditing(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {isEditing && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{editingTemplate?.id ? 'Edit' : 'Create'} Template</h3>
          <div className="space-y-4">
            <div>
              <Label>Template Name *</Label>
              <Input value={editingTemplate?.name || ''} onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })} />
            </div>
            <div>
              <Label>Category *</Label>
              <Input value={editingTemplate?.category || ''} onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })} />
            </div>
            <div>
              <Label>Subject *</Label>
              <Input value={editingTemplate?.subject || ''} onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })} />
            </div>
            <div>
              <Label>Body *</Label>
              <Textarea rows={5} value={editingTemplate?.body || ''} onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={editingTemplate?.is_active} onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate, is_active: checked })} />
              <Label>Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={editingTemplate?.auto_resolve} onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate, auto_resolve: checked })} />
              <Label>Auto-resolve feedback</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={() => { setIsEditing(false); setEditingTemplate(null); }}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{template.name}</h3>
                  <Badge variant={template.is_active ? 'default' : 'secondary'}>{template.is_active ? 'Active' : 'Inactive'}</Badge>
                  {template.auto_resolve && <Badge variant="outline"><CheckCircle2 className="w-3 h-3 mr-1" />Auto-resolve</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{template.subject}</p>
                <p className="text-sm mb-2">{template.body}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Tag className="w-3 h-3" />
                  <span>Used {template.usage_count} times</span>
                  <span>•</span>
                  <span>{template.category}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setEditingTemplate(template); setIsEditing(true); }}><Edit2 className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDuplicate(template)}><Copy className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(template.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
