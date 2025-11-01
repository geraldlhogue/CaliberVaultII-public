import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ScheduleQueryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queryConfig: any;
  sqlQuery: string;
}

export function ScheduleQueryModal({ open, onOpenChange, queryConfig, sqlQuery }: ScheduleQueryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState('daily');
  const [format, setFormat] = useState<'csv' | 'excel' | 'json'>('csv');
  const [emails, setEmails] = useState('');
  const [saving, setSaving] = useState(false);

  const scheduleOptions = {
    hourly: '0 * * * *',
    daily: '0 9 * * *',
    weekly: '0 9 * * 1',
    monthly: '0 9 1 * *'
  };

  const handleSchedule = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('scheduled_queries').insert({
        name,
        description,
        query_config: queryConfig,
        sql_query: sqlQuery,
        schedule_cron: scheduleOptions[schedule as keyof typeof scheduleOptions],
        export_format: format,
        email_recipients: emails.split(',').map(e => e.trim()).filter(Boolean)
      });

      if (error) throw error;

      toast.success('Query scheduled successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Failed to schedule: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Recurring Query</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Daily sales report" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Schedule</Label>
            <Select value={schedule} onValueChange={setSchedule}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily (9 AM)</SelectItem>
                <SelectItem value="weekly">Weekly (Monday 9 AM)</SelectItem>
                <SelectItem value="monthly">Monthly (1st, 9 AM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Export Format</Label>
            <Select value={format} onValueChange={(v: any) => setFormat(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Email Recipients (comma-separated)</Label>
            <Input value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="user@example.com, admin@example.com" />
          </div>
          <Button onClick={handleSchedule} disabled={saving} className="w-full">
            <Clock className="w-4 h-4 mr-2" />
            Schedule Query
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
