import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, TrendingUp, Clock, Users, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

interface ErrorLog {
  id: string;
  error_type: string;
  message: string;
  stack: string;
  user_id: string;
  created_at: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

export function ErrorMonitoringDashboard() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    unresolved: 0,
    last24h: 0
  });

  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = async () => {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setErrors(data || []);
      calculateStats(data || []);
    } catch (err) {
      toast.error('Failed to load errors');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: ErrorLog[]) => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    setStats({
      total: data.length,
      critical: data.filter(e => e.severity === 'critical').length,
      unresolved: data.filter(e => !e.resolved).length,
      last24h: data.filter(e => new Date(e.created_at) > yesterday).length
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Error Monitoring</h2>
        <Button onClick={loadErrors} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Unresolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.unresolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Last 24h</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.last24h}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
