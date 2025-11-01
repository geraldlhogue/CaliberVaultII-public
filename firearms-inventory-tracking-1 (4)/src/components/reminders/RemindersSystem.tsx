import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Bell, AlertTriangle, Calendar, Wrench, FileText, RefreshCw } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';

interface Reminder {
  id: string;
  type: 'maintenance' | 'compliance' | 'cleaning';
  title: string;
  description: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  itemName?: string;
  itemId?: string;
}

export function RemindersSystem() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReminders();
    
    // Set up real-time subscriptions
    const maintenanceChannel = supabase
      .channel('maintenance-reminders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_records' }, fetchReminders)
      .subscribe();

    const complianceChannel = supabase
      .channel('compliance-reminders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'compliance_documents' }, fetchReminders)
      .subscribe();

    return () => {
      maintenanceChannel.unsubscribe();
      complianceChannel.unsubscribe();
    };
  }, []);

  const fetchReminders = async () => {
    try {
      const allReminders: Reminder[] = [];

      // Fetch maintenance due dates
      const { data: maintenance } = await supabase
        .from('maintenance_records')
        .select('*')
        .not('next_service_date', 'is', null)
        .order('next_service_date', { ascending: true });

      if (maintenance) {
        maintenance.forEach(record => {
          const daysUntil = differenceInDays(new Date(record.next_service_date), new Date());
          if (daysUntil <= 30 && daysUntil >= 0) {
            allReminders.push({
              id: record.id,
              type: 'maintenance',
              title: 'Maintenance Due',
              description: `${record.maintenance_type.replace('_', ' ')} scheduled`,
              dueDate: record.next_service_date,
              priority: daysUntil <= 7 ? 'high' : daysUntil <= 14 ? 'medium' : 'low',
              itemId: record.item_id
            });
          }
        });
      }

      // Fetch expiring compliance documents
      const { data: compliance } = await supabase
        .from('compliance_documents')
        .select('*')
        .not('expiration_date', 'is', null)
        .order('expiration_date', { ascending: true });

      if (compliance) {
        compliance.forEach(doc => {
          const daysUntil = differenceInDays(new Date(doc.expiration_date), new Date());
          const reminderDays = doc.reminder_days_before || 30;
          if (daysUntil <= reminderDays) {
            allReminders.push({
              id: doc.id,
              type: 'compliance',
              title: daysUntil < 0 ? 'Document Expired' : 'Document Expiring',
              description: `${doc.document_type.replace('_', ' ')} ${doc.document_number || ''}`,
              dueDate: doc.expiration_date,
              priority: daysUntil < 0 ? 'high' : daysUntil <= 7 ? 'high' : 'medium',
              itemId: doc.item_id
            });
          }
        });
      }

      // Sort by priority and date
      allReminders.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });

      setReminders(allReminders);
    } catch (error: any) {
      toast({ title: 'Error loading reminders', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return Wrench;
      case 'compliance': return FileText;
      case 'cleaning': return RefreshCw;
      default: return Bell;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Reminders & Alerts
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchReminders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading reminders...</p>
        ) : reminders.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No upcoming reminders</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map(reminder => {
              const Icon = getIcon(reminder.type);
              const daysUntil = reminder.dueDate ? differenceInDays(new Date(reminder.dueDate), new Date()) : null;
              
              return (
                <div key={reminder.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{reminder.title}</p>
                        <p className="text-sm text-muted-foreground">{reminder.description}</p>
                      </div>
                    </div>
                    <Badge variant={getPriorityColor(reminder.priority) as any}>
                      {reminder.priority}
                    </Badge>
                  </div>
                  {reminder.dueDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {daysUntil !== null && daysUntil < 0 
                          ? `Overdue by ${Math.abs(daysUntil)} days`
                          : daysUntil === 0 
                          ? 'Due today'
                          : `Due in ${daysUntil} days (${format(new Date(reminder.dueDate), 'MMM d, yyyy')})`
                        }
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
