import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FolderSync, Plus, Trash2 } from 'lucide-react';
import { EnhancedCloudStorageService, SyncSchedule } from '@/services/integrations/EnhancedCloudStorageService';
import { toast } from 'sonner';

interface Props {
  connectionId: string;
}

export function SyncScheduleManager({ connectionId }: Props) {
  const [schedules, setSchedules] = useState<SyncSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    schedule_type: 'daily' as any,
    cron_expression: '',
    enabled: true,
    selective_folders: [] as string[],
    file_filters: {}
  });

  useEffect(() => {
    loadSchedules();
  }, [connectionId]);

  const loadSchedules = async () => {
    try {
      const data = await EnhancedCloudStorageService.getSchedules(connectionId);
      setSchedules(data);
    } catch (error: any) {
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await EnhancedCloudStorageService.createSchedule({
        connection_id: connectionId,
        ...formData
      });
      toast.success('Schedule created');
      setShowForm(false);
      loadSchedules();
    } catch (error: any) {
      toast.error('Failed to create schedule');
    }
  };

  const handleToggle = async (scheduleId: string, enabled: boolean) => {
    try {
      await EnhancedCloudStorageService.updateSchedule(scheduleId, { enabled });
      toast.success(enabled ? 'Schedule enabled' : 'Schedule disabled');
      loadSchedules();
    } catch (error: any) {
      toast.error('Failed to update schedule');
    }
  };

  const scheduleTypeLabels = {
    hourly: 'Every Hour',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    custom: 'Custom (Cron)'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sync Schedules</CardTitle>
            <CardDescription>Configure automatic backup schedules</CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="border rounded-lg p-4 mb-4 space-y-4">
            <div>
              <Label>Schedule Type</Label>
              <Select 
                value={formData.schedule_type}
                onValueChange={(value) => setFormData({ ...formData, schedule_type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom (Cron)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.schedule_type === 'custom' && (
              <div>
                <Label>Cron Expression</Label>
                <Input
                  placeholder="0 0 * * *"
                  value={formData.cron_expression}
                  onChange={(e) => setFormData({ ...formData, cron_expression: e.target.value })}
                />
              </div>
            )}

            <div>
              <Label>Selective Folders (comma-separated)</Label>
              <Input
                placeholder="/Documents, /Photos"
                onChange={(e) => setFormData({ 
                  ...formData, 
                  selective_folders: e.target.value.split(',').map(f => f.trim()).filter(Boolean)
                })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
              />
              <Label>Enable immediately</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create Schedule</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {schedules.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No schedules configured</p>
        ) : (
          <div className="space-y-3">
            {schedules.map(schedule => (
              <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{scheduleTypeLabels[schedule.schedule_type]}</p>
                    <p className="text-sm text-muted-foreground">
                      {schedule.last_run_at ? `Last run: ${new Date(schedule.last_run_at).toLocaleString()}` : 'Never run'}
                    </p>
                    {schedule.selective_folders.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {schedule.selective_folders.map((folder, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <FolderSync className="h-3 w-3 mr-1" />
                            {folder}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={schedule.enabled}
                    onCheckedChange={(checked) => handleToggle(schedule.id, checked)}
                  />
                  <Badge variant={schedule.enabled ? 'default' : 'secondary'}>
                    {schedule.enabled ? 'Active' : 'Paused'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
