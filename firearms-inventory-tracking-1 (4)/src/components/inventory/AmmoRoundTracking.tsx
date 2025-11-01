import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, Plus, Minus, TrendingDown, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AmmoInventory {
  id: string;
  cartridge: string;
  manufacturer: string;
  grainWeight: number;
  roundCount: number;
  lotNumber?: string;
}

export const AmmoRoundTracking: React.FC = () => {
  const [ammoInventory, setAmmoInventory] = useState<AmmoInventory[]>([]);
  const [selectedAmmo, setSelectedAmmo] = useState<string>('');
  const [roundsToAdd, setRoundsToAdd] = useState('');
  const [roundsToDeduct, setRoundsToDeduct] = useState('');
  const [shootingSession, setShootingSession] = useState({
    date: new Date().toISOString().split('T')[0],
    location: '',
    notes: ''
  });
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchAmmoInventory();
    fetchHistory();
  }, []);

  const fetchAmmoInventory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', 'ammunition')
      .order('cartridge');
    
    if (data) {
      setAmmoInventory(data.map(item => ({
        id: item.id,
        cartridge: item.cartridge || 'Unknown',
        manufacturer: item.manufacturer || 'Unknown',
        grainWeight: item.grain_weight || 0,
        roundCount: item.round_count || 0,
        lotNumber: item.lot_number
      })));
    }
  };

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('ammo_usage_history')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10);
    
    setHistory(data || []);
  };

  const addRounds = async () => {
    if (!selectedAmmo || !roundsToAdd) {
      toast({ title: 'Please select ammo and enter rounds to add', variant: 'destructive' });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ammo = ammoInventory.find(a => a.id === selectedAmmo);
    if (!ammo) return;

    const newCount = ammo.roundCount + parseInt(roundsToAdd);

    const { error } = await supabase
      .from('inventory_items')
      .update({ round_count: newCount })
      .eq('id', selectedAmmo);

    if (error) {
      toast({ title: 'Error adding rounds', variant: 'destructive' });
    } else {
      toast({ title: `Added ${roundsToAdd} rounds to inventory` });
      setRoundsToAdd('');
      fetchAmmoInventory();
    }
  };

  const deductRounds = async () => {
    if (!selectedAmmo || !roundsToDeduct) {
      toast({ title: 'Please select ammo and enter rounds used', variant: 'destructive' });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ammo = ammoInventory.find(a => a.id === selectedAmmo);
    if (!ammo) return;

    const roundsUsed = parseInt(roundsToDeduct);
    if (roundsUsed > ammo.roundCount) {
      toast({ title: 'Not enough rounds in inventory', variant: 'destructive' });
      return;
    }

    const newCount = ammo.roundCount - roundsUsed;

    // Update inventory
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({ round_count: newCount })
      .eq('id', selectedAmmo);

    // Log usage history
    const { error: historyError } = await supabase
      .from('ammo_usage_history')
      .insert({
        user_id: user.id,
        ammo_id: selectedAmmo,
        cartridge: ammo.cartridge,
        manufacturer: ammo.manufacturer,
        rounds_used: roundsUsed,
        date: shootingSession.date,
        location: shootingSession.location,
        notes: shootingSession.notes
      });

    if (updateError || historyError) {
      toast({ title: 'Error recording usage', variant: 'destructive' });
    } else {
      toast({ title: `Deducted ${roundsUsed} rounds from inventory` });
      setRoundsToDeduct('');
      setShootingSession({
        date: new Date().toISOString().split('T')[0],
        location: '',
        notes: ''
      });
      fetchAmmoInventory();
      fetchHistory();
    }
  };

  const getLowStockItems = () => {
    return ammoInventory.filter(ammo => ammo.roundCount < 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold">Ammo Round Tracking</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Rounds</p>
              <p className="text-2xl font-bold">
                {ammoInventory.reduce((sum, ammo) => sum + ammo.roundCount, 0)}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4 bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Ammo Types</p>
              <p className="text-2xl font-bold">{ammoInventory.length}</p>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4 bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Low Stock Items</p>
              <p className="text-2xl font-bold">{getLowStockItems().length}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-slate-800">
        <h3 className="font-semibold mb-4">Manage Inventory</h3>
        <div className="space-y-4">
          <div>
            <Label>Select Ammunition</Label>
            <Select value={selectedAmmo} onValueChange={setSelectedAmmo}>
              <SelectTrigger>
                <SelectValue placeholder="Choose ammo type" />
              </SelectTrigger>
              <SelectContent>
                {ammoInventory.map(ammo => (
                  <SelectItem key={ammo.id} value={ammo.id}>
                    {ammo.cartridge} - {ammo.manufacturer} ({ammo.roundCount} rds)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Add Rounds</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={roundsToAdd}
                  onChange={(e) => setRoundsToAdd(e.target.value)}
                  placeholder="Rounds to add"
                />
                <Button onClick={addRounds}>
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deduct Rounds (Range Session)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={roundsToDeduct}
                  onChange={(e) => setRoundsToDeduct(e.target.value)}
                  placeholder="Rounds used"
                />
                <Button onClick={deductRounds} variant="destructive">
                  <Minus className="w-4 h-4 mr-2" /> Deduct
                </Button>
              </div>
            </div>
          </div>

          {roundsToDeduct && (
            <div className="space-y-2 p-4 bg-slate-700 rounded-lg">
              <h4 className="font-semibold">Range Session Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={shootingSession.date}
                    onChange={(e) => setShootingSession({...shootingSession, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={shootingSession.location}
                    onChange={(e) => setShootingSession({...shootingSession, location: e.target.value})}
                    placeholder="Range name"
                  />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <textarea
                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                  rows={2}
                  value={shootingSession.notes}
                  onChange={(e) => setShootingSession({...shootingSession, notes: e.target.value})}
                  placeholder="Session notes..."
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {getLowStockItems().length > 0 && (
        <Card className="p-6 bg-slate-800 border-yellow-500">
          <h3 className="font-semibold mb-4 text-yellow-500">Low Stock Alert</h3>
          <div className="space-y-2">
            {getLowStockItems().map(ammo => (
              <div key={ammo.id} className="bg-slate-700 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{ammo.cartridge}</div>
                    <div className="text-sm text-slate-400">{ammo.manufacturer}</div>
                  </div>
                  <div className="text-red-500 font-bold">
                    {ammo.roundCount} rounds remaining
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-slate-800">
        <h3 className="font-semibold mb-4">Recent Usage History</h3>
        {history.length === 0 ? (
          <p className="text-slate-400">No usage history yet</p>
        ) : (
          <div className="space-y-2">
            {history.map(entry => (
              <div key={entry.id} className="bg-slate-700 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{entry.cartridge}</div>
                    <div className="text-sm text-slate-400">
                      {entry.date} - {entry.location || 'Unknown location'}
                    </div>
                    {entry.notes && (
                      <div className="text-sm text-slate-300 mt-1">{entry.notes}</div>
                    )}
                  </div>
                  <div className="text-yellow-500 font-bold">
                    -{entry.rounds_used} rounds
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};