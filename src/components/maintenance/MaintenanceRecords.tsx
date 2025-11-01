import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Wrench, Plus, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface MaintenanceRecord {
  id: string;
  item_id: string;
  item_type: string;
  maintenance_type: string;
  date_performed: string;
  performed_by?: string;
  cost?: number;
  notes?: string;
  parts_used?: any[];
  next_service_date?: string;
}

export function MaintenanceRecords({ itemId, itemType }: { itemId?: string; itemType?: string }) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    maintenance_type: 'cleaning',
    date_performed: new Date().toISOString().split('T')[0],
    performed_by: '',
    cost: '',
    notes: '',
    next_service_date: ''
  });

  useEffect(() => {
    fetchRecords();
  }, [itemId]);

  const fetchRecords = async () => {
    try {
      let query = supabase.from('maintenance_records').select('*').order('date_performed', { ascending: false });
      
      if (itemId && itemType) {
        query = query.eq('item_id', itemId).eq('item_type', itemType);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      toast({ title: 'Error loading records', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('maintenance_records').insert({
        item_id: itemId,
        item_type: itemType,
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        user_id: user.id
      });

      if (error) throw error;
      toast({ title: 'Success', description: 'Maintenance record added' });
      setIsOpen(false);
      fetchRecords();
      setFormData({ maintenance_type: 'cleaning', date_performed: new Date().toISOString().split('T')[0], performed_by: '', cost: '', notes: '', next_service_date: '' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    try {
      const { error } = await supabase.from('maintenance_records').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Record removed' });
      fetchRecords();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" />Maintenance Records</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Record</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>New Maintenance Record</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Type</Label>
                  <Select value={formData.maintenance_type} onValueChange={(v) => setFormData({...formData, maintenance_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="upgrade">Upgrade</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="parts_replacement">Parts Replacement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Date</Label><Input type="date" value={formData.date_performed} onChange={(e) => setFormData({...formData, date_performed: e.target.value})} /></div>
                <div><Label>Performed By</Label><Input value={formData.performed_by} onChange={(e) => setFormData({...formData, performed_by: e.target.value})} /></div>
                <div><Label>Cost ($)</Label><Input type="number" step="0.01" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} /></div>
                <div><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></div>
                <div><Label>Next Service Date</Label><Input type="date" value={formData.next_service_date} onChange={(e) => setFormData({...formData, next_service_date: e.target.value})} /></div>
                <Button type="submit" className="w-full">Save Record</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading...</p> : records.length === 0 ? <p className="text-muted-foreground">No records yet</p> : (
          <div className="space-y-3">
            {records.map(record => (
              <div key={record.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold capitalize">{record.maintenance_type.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(record.date_performed), 'MMM d, yyyy')}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                {record.performed_by && <p className="text-sm">By: {record.performed_by}</p>}
                {record.cost && <p className="text-sm flex items-center gap-1"><DollarSign className="h-3 w-3" />${record.cost.toFixed(2)}</p>}
                {record.notes && <p className="text-sm text-muted-foreground">{record.notes}</p>}
                {record.next_service_date && <p className="text-sm text-amber-600">Next service: {format(new Date(record.next_service_date), 'MMM d, yyyy')}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MaintenanceRecords;

