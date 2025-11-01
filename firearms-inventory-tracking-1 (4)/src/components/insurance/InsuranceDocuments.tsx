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
import { FileText, Upload, Trash2, Shield, DollarSign, Calendar, Download, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

interface InsuranceDocument {
  id: string;
  item_id: string;
  document_type: string;
  document_name: string;
  document_url?: string;
  insurance_value?: number;
  coverage_start_date?: string;
  coverage_end_date?: string;
  insurance_company?: string;
  policy_number?: string;
  deductible?: number;
  notes?: string;
  created_at: string;
}

interface InsuranceDocumentsProps {
  itemId: string;
  itemName: string;
}

export function InsuranceDocuments({ itemId, itemName }: InsuranceDocumentsProps) {
  const [documents, setDocuments] = useState<InsuranceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    document_type: 'receipt',
    document_name: '',
    insurance_value: '',
    coverage_start_date: '',
    coverage_end_date: '',
    insurance_company: '',
    policy_number: '',
    deductible: '',
    notes: ''
  });

  useEffect(() => {
    loadDocuments();
  }, [itemId]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('insurance_documents')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('insurance_documents')
        .insert({
          item_id: itemId,
          user_id: user.id,
          ...formData,
          insurance_value: formData.insurance_value ? parseFloat(formData.insurance_value) : null,
          deductible: formData.deductible ? parseFloat(formData.deductible) : null
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Insurance document added successfully'
      });

      setShowAddDialog(false);
      loadDocuments();
      setFormData({
        document_type: 'receipt',
        document_name: '',
        insurance_value: '',
        coverage_start_date: '',
        coverage_end_date: '',
        insurance_company: '',
        policy_number: '',
        deductible: '',
        notes: ''
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add document',
        variant: 'destructive'
      });
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('insurance_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Document deleted successfully'
      });
      loadDocuments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive'
      });
    }
  };

  const exportToCSV = () => {
    if (documents.length === 0) {
      toast({
        title: 'No data to export',
        description: 'Add insurance documents first',
        variant: 'destructive'
      });
      return;
    }

    const csvContent = [
      ['Item', 'Document Name', 'Type', 'Value', 'Deductible', 'Company', 'Policy', 'Start Date', 'End Date', 'Notes'],
      ...documents.map(doc => [
        itemName,
        doc.document_name,
        doc.document_type,
        doc.insurance_value || '',
        doc.deductible || '',
        doc.insurance_company || '',
        doc.policy_number || '',
        doc.coverage_start_date || '',
        doc.coverage_end_date || '',
        doc.notes || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insurance_report_${itemName}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export successful',
      description: `Exported ${documents.length} insurance documents`
    });
  };

  const totalValue = documents.reduce((sum, doc) => sum + (doc.insurance_value || 0), 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Insurance Documentation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Total Insured Value: ${totalValue.toFixed(2)}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={exportToCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Insurance Document</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Document Type</Label>
                      <Select value={formData.document_type} onValueChange={(v) => setFormData({...formData, document_type: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="receipt">Receipt</SelectItem>
                          <SelectItem value="appraisal">Appraisal</SelectItem>
                          <SelectItem value="warranty">Warranty</SelectItem>
                          <SelectItem value="insurance_policy">Insurance Policy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Document Name</Label>
                      <Input value={formData.document_name} onChange={(e) => setFormData({...formData, document_name: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Insurance Value</Label>
                      <Input type="number" value={formData.insurance_value} onChange={(e) => setFormData({...formData, insurance_value: e.target.value})} />
                    </div>
                    <div>
                      <Label>Deductible</Label>
                      <Input type="number" value={formData.deductible} onChange={(e) => setFormData({...formData, deductible: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Coverage Start Date</Label>
                      <Input type="date" value={formData.coverage_start_date} onChange={(e) => setFormData({...formData, coverage_start_date: e.target.value})} />
                    </div>
                    <div>
                      <Label>Coverage End Date</Label>
                      <Input type="date" value={formData.coverage_end_date} onChange={(e) => setFormData({...formData, coverage_end_date: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Insurance Company</Label>
                      <Input value={formData.insurance_company} onChange={(e) => setFormData({...formData, insurance_company: e.target.value})} />
                    </div>
                    <div>
                      <Label>Policy Number</Label>
                      <Input value={formData.policy_number} onChange={(e) => setFormData({...formData, policy_number: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                  </div>
                  <Button onClick={handleSubmit}>Add Document</Button>
                </div>
              </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">{doc.document_name}</span>
                      <span className="text-xs bg-secondary px-2 py-1 rounded">{doc.document_type}</span>
                    </div>
                    {doc.insurance_value && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Value: ${doc.insurance_value.toFixed(2)}
                        </span>
                        {doc.deductible && <span>Deductible: ${doc.deductible.toFixed(2)}</span>}
                      </div>
                    )}
                    {doc.insurance_company && (
                      <div className="text-sm text-muted-foreground">
                        {doc.insurance_company} {doc.policy_number && `- Policy: ${doc.policy_number}`}
                      </div>
                    )}
                    {doc.coverage_end_date && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Coverage until: {format(new Date(doc.coverage_end_date), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteDocument(doc.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}