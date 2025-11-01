import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  auto_resolve: boolean;
}

interface ScheduledBulkActionsModalProps {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  onScheduled: () => void;
}

export function ScheduledBulkActionsModal({ open, onClose, selectedIds, onScheduled }: ScheduledBulkActionsModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [markAsResolved, setMarkAsResolved] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTemplates();
      const now = new Date();
      setScheduledDate(now.toISOString().split('T')[0]);
      setScheduledTime('09:00');
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback_response_templates')
        .select('id, name, subject, body, auto_resolve')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error('Please select date and time');
      return;
    }

    if (!selectedTemplate && !customMessage) {
      toast.error('Please select a template or enter a custom message');
      return;
    }

    setLoading(true);
    try {
      const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('scheduled_bulk_actions')
        .insert([{
          action_type: 'bulk_response',
          feedback_ids: selectedIds,
          template_id: selectedTemplate || null,
          custom_message: customMessage || null,
          mark_as_resolved: markAsResolved,
          scheduled_for: scheduledFor.toISOString(),
          created_by: user.id,
          status: 'pending'
        }]);

      if (error) throw error;

      toast.success(`Scheduled bulk action for ${scheduledFor.toLocaleString()}`);
      onScheduled();
      onClose();
    } catch (error) {
      console.error('Error scheduling action:', error);
      toast.error('Failed to schedule action');
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule Bulk Response</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-900">
              Scheduling response for <strong>{selectedIds.length}</strong> feedback items
            </p>
          </div>

          <div>
            <Label>Select Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplateData && (
              <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                <p className="font-medium">{selectedTemplateData.subject}</p>
                <p className="text-muted-foreground mt-1">{selectedTemplateData.body}</p>
              </div>
            )}
          </div>

          <div>
            <Label>Custom Message (Optional)</Label>
            <Textarea
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a custom message or override template..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Schedule Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div>
              <Label>Schedule Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={markAsResolved}
              onCheckedChange={setMarkAsResolved}
            />
            <Label>Mark all as resolved when sent</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSchedule} disabled={loading}>
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Scheduling...' : 'Schedule Action'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
