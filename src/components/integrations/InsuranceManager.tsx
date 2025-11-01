import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, FileText, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface InsuranceProvider {
  id: string;
  provider_name: string;
  policy_number: string;
  coverage_amount: number;
  status: string;
  policy_end_date: string;
}

export function InsuranceManager() {
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('insurance_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (error: any) {
      toast.error('Failed to load insurance providers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await supabase
        .from('insurance_providers')
        .insert({
          provider_name: formData.get('provider_name'),
          policy_number: formData.get('policy_number'),
          coverage_amount: parseFloat(formData.get('coverage_amount') as string),
          deductible: parseFloat(formData.get('deductible') as string),
          policy_start_date: formData.get('policy_start_date'),
          policy_end_date: formData.get('policy_end_date'),
          status: 'active'
        });

      if (error) throw error;
      
      toast.success('Insurance provider added');
      setOpen(false);
      loadProviders();
    } catch (error: any) {
      toast.error('Failed to add provider');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Insurance Management</h2>
          <p className="text-muted-foreground">Track policies and file claims</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Insurance Policy</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Provider Name</Label>
                <Input name="provider_name" required />
              </div>
              <div>
                <Label>Policy Number</Label>
                <Input name="policy_number" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Coverage Amount</Label>
                  <Input name="coverage_amount" type="number" required />
                </div>
                <div>
                  <Label>Deductible</Label>
                  <Input name="deductible" type="number" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input name="policy_start_date" type="date" required />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input name="policy_end_date" type="date" required />
                </div>
              </div>
              <Button type="submit" className="w-full">Add Policy</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {providers.map(provider => (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {provider.provider_name}
                </CardTitle>
                <Badge variant={provider.status === 'active' ? 'default' : 'secondary'}>
                  {provider.status}
                </Badge>
              </div>
              <CardDescription>Policy #{provider.policy_number}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Coverage</p>
                  <p className="font-medium">${provider.coverage_amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expires</p>
                  <p className="font-medium">{new Date(provider.policy_end_date).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
