import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, Calendar, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface ComplianceDocument {
  id: string;
  item_id?: string;
  item_type?: string;
  document_type: string;
  document_number?: string;
  issue_date?: string;
  expiration_date?: string;
  issuing_authority?: string;
  status: string;
  file_url?: string;
  notes?: string;
  reminder_days_before?: number;
}

export function ComplianceDocuments({ itemId, itemType }: { itemId?: string; itemType?: string }) {
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    document_type: 'atf_form',
    document_number: '',
    issue_date: '',
    expiration_date: '',
    issuing_authority: '',
    status: 'active',
    notes: '',
    reminder_days_before: '30'
  });

  useEffect(() => {
    fetchDocuments();
  }, [itemId]);

  const fetchDocuments = async () => {
    try {
      let query = supabase.from('compliance_documents').select('*').order('expiration_date', { ascending: true });
      if (itemId && itemType) {
        query = query.eq('item_id', itemId).eq('item_type', itemType);
      }
      const { data, error } = await query;
      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast({ title: 'Error loading documents', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('compliance_documents').insert({
        item_id: itemId,
        item_type: itemType,
        ...formData,
        reminder_days_before: parseInt(formData.reminder_days_before),
        user_id: user.id
      });

      if (error) throw error;
      toast({ title: 'Success', description: 'Document added' });
      setIsOpen(false);
      fetchDocuments();
      setFormData({ document_type: 'atf_form', document_number: '', issue_date: '', expiration_date: '', issuing_authority: '', status: 'active', notes: '', reminder_days_before: '30' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      const { error } = await supabase.from('compliance_documents').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Document removed' });
      fetchDocuments();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate) return null;
    const daysUntil = differenceInDays(new Date(expirationDate), new Date());
    if (daysUntil < 0) return { label: 'Expired', variant: 'destructive' as const, icon: AlertTriangle };
    if (daysUntil <= 30) return { label: `${daysUntil} days left`, variant: 'warning' as const, icon: AlertTriangle };
    return { label: 'Active', variant: 'default' as const, icon: CheckCircle };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Compliance Documents</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Document</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>New Compliance Document</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Document Type</Label>
                  <Select value={formData.document_type} onValueChange={(v) => setFormData({...formData, document_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="atf_form">ATF Form</SelectItem>
                      <SelectItem value="permit">Permit</SelectItem>
                      <SelectItem value="license">License</SelectItem>
                      <SelectItem value="transfer">Transfer Document</SelectItem>
                      <SelectItem value="registration">Registration</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Document Number</Label><Input value={formData.document_number} onChange={(e) => setFormData({...formData, document_number: e.target.value})} placeholder="e.g., Form 4 #12345" /></div>
                <div><Label>Issue Date</Label><Input type="date" value={formData.issue_date} onChange={(e) => setFormData({...formData, issue_date: e.target.value})} /></div>
                <div><Label>Expiration Date</Label><Input type="date" value={formData.expiration_date} onChange={(e) => setFormData({...formData, expiration_date: e.target.value})} /></div>
                <div><Label>Issuing Authority</Label><Input value={formData.issuing_authority} onChange={(e) => setFormData({...formData, issuing_authority: e.target.value})} placeholder="e.g., ATF, State Police" /></div>
                <div><Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="revoked">Revoked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Reminder (days before expiration)</Label><Input type="number" value={formData.reminder_days_before} onChange={(e) => setFormData({...formData, reminder_days_before: e.target.value})} /></div>
                <div><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></div>
                <Button type="submit" className="w-full">Save Document</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading...</p> : documents.length === 0 ? <p className="text-muted-foreground">No documents yet</p> : (
          <div className="space-y-3">
            {documents.map(doc => {
              const expStatus = getExpirationStatus(doc.expiration_date);
              return (
                <div key={doc.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold capitalize">{doc.document_type.replace('_', ' ')}</p>
                      {doc.document_number && <p className="text-sm text-muted-foreground">{doc.document_number}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {expStatus && <Badge variant={expStatus.variant} className="flex items-center gap-1"><expStatus.icon className="h-3 w-3" />{expStatus.label}</Badge>}
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  {doc.issuing_authority && <p className="text-sm">Authority: {doc.issuing_authority}</p>}
                  {doc.issue_date && <p className="text-sm flex items-center gap-1"><Calendar className="h-3 w-3" />Issued: {format(new Date(doc.issue_date), 'MMM d, yyyy')}</p>}
                  {doc.expiration_date && <p className="text-sm flex items-center gap-1"><Calendar className="h-3 w-3" />Expires: {format(new Date(doc.expiration_date), 'MMM d, yyyy')}</p>}
                  {doc.notes && <p className="text-sm text-muted-foreground">{doc.notes}</p>}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
