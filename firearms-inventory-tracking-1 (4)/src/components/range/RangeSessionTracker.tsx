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
import { Target, Plus, Calendar, MapPin, Trash2, Star } from 'lucide-react';
import { format } from 'date-fns';

interface RangeSession {
  id: string;
  session_date: string;
  location: string;
  duration_minutes?: number;
  firearm_id?: string;
  rounds_fired: number;
  ammo_type?: string;
  distance_yards?: number;
  target_type?: string;
  accuracy_notes?: string;
  weather_conditions?: string;
  temperature_f?: number;
  wind_speed_mph?: number;
  performance_rating?: number;
  notes?: string;
}

export function RangeSessionTracker({ firearmId }: { firearmId?: string }) {
  const [sessions, setSessions] = useState<RangeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    session_date: new Date().toISOString().split('T')[0],
    location: '',
    duration_minutes: '',
    rounds_fired: '',
    ammo_type: '',
    distance_yards: '',
    target_type: '',
    accuracy_notes: '',
    weather_conditions: '',
    temperature_f: '',
    wind_speed_mph: '',
    performance_rating: '3',
    notes: ''
  });

  useEffect(() => {
    fetchSessions();
  }, [firearmId]);

  const fetchSessions = async () => {
    try {
      let query = supabase.from('range_sessions').select('*').order('session_date', { ascending: false });
      if (firearmId) query = query.eq('firearm_id', firearmId);
      const { data, error } = await query;
      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast({ title: 'Error loading sessions', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('range_sessions').insert({
        firearm_id: firearmId,
        location: formData.location,
        session_date: formData.session_date,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        rounds_fired: parseInt(formData.rounds_fired),
        ammo_type: formData.ammo_type || null,
        distance_yards: formData.distance_yards ? parseInt(formData.distance_yards) : null,
        target_type: formData.target_type || null,
        accuracy_notes: formData.accuracy_notes || null,
        weather_conditions: formData.weather_conditions || null,
        temperature_f: formData.temperature_f ? parseInt(formData.temperature_f) : null,
        wind_speed_mph: formData.wind_speed_mph ? parseInt(formData.wind_speed_mph) : null,
        performance_rating: parseInt(formData.performance_rating),
        notes: formData.notes || null,
        user_id: user.id
      });

      if (error) throw error;
      toast({ title: 'Success', description: 'Range session logged' });
      setIsOpen(false);
      fetchSessions();
      setFormData({ session_date: new Date().toISOString().split('T')[0], location: '', duration_minutes: '', rounds_fired: '', ammo_type: '', distance_yards: '', target_type: '', accuracy_notes: '', weather_conditions: '', temperature_f: '', wind_speed_mph: '', performance_rating: '3', notes: '' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this session?')) return;
    try {
      const { error } = await supabase.from('range_sessions').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Session removed' });
      fetchSessions();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Range Sessions</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" />Log Session</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Log Range Session</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Date</Label><Input type="date" required value={formData.session_date} onChange={(e) => setFormData({...formData, session_date: e.target.value})} /></div>
                  <div><Label>Location</Label><Input required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Range name" /></div>
                  <div><Label>Duration (min)</Label><Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})} /></div>
                  <div><Label>Rounds Fired</Label><Input type="number" required value={formData.rounds_fired} onChange={(e) => setFormData({...formData, rounds_fired: e.target.value})} /></div>
                  <div><Label>Ammo Type</Label><Input value={formData.ammo_type} onChange={(e) => setFormData({...formData, ammo_type: e.target.value})} placeholder="e.g., 9mm 115gr FMJ" /></div>
                  <div><Label>Distance (yards)</Label><Input type="number" value={formData.distance_yards} onChange={(e) => setFormData({...formData, distance_yards: e.target.value})} /></div>
                  <div><Label>Target Type</Label><Input value={formData.target_type} onChange={(e) => setFormData({...formData, target_type: e.target.value})} placeholder="e.g., Paper, Steel" /></div>
                  <div><Label>Performance</Label>
                    <Select value={formData.performance_rating} onValueChange={(v) => setFormData({...formData, performance_rating: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">★ Poor</SelectItem>
                        <SelectItem value="2">★★ Fair</SelectItem>
                        <SelectItem value="3">★★★ Good</SelectItem>
                        <SelectItem value="4">★★★★ Very Good</SelectItem>
                        <SelectItem value="5">★★★★★ Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Weather</Label><Input value={formData.weather_conditions} onChange={(e) => setFormData({...formData, weather_conditions: e.target.value})} placeholder="Sunny, cloudy, etc." /></div>
                  <div><Label>Temp (°F)</Label><Input type="number" value={formData.temperature_f} onChange={(e) => setFormData({...formData, temperature_f: e.target.value})} /></div>
                  <div><Label>Wind (mph)</Label><Input type="number" value={formData.wind_speed_mph} onChange={(e) => setFormData({...formData, wind_speed_mph: e.target.value})} /></div>
                </div>
                <div><Label>Accuracy Notes</Label><Textarea value={formData.accuracy_notes} onChange={(e) => setFormData({...formData, accuracy_notes: e.target.value})} placeholder="Grouping, POI, etc." /></div>
                <div><Label>Additional Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></div>
                <Button type="submit" className="w-full">Save Session</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading...</p> : sessions.length === 0 ? <p className="text-muted-foreground">No sessions logged yet</p> : (
          <div className="space-y-3">
            {sessions.map(session => (
              <div key={session.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" />{session.location}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(session.session_date), 'MMM d, yyyy')}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(session.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>Rounds: <span className="font-semibold">{session.rounds_fired}</span></p>
                  {session.distance_yards && <p>Distance: {session.distance_yards} yds</p>}
                  {session.ammo_type && <p className="col-span-2">Ammo: {session.ammo_type}</p>}
                </div>
                {session.performance_rating && <div className="flex items-center gap-1">{renderStars(session.performance_rating)}</div>}
                {session.accuracy_notes && <p className="text-sm text-muted-foreground">{session.accuracy_notes}</p>}
                {session.notes && <p className="text-sm">{session.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
