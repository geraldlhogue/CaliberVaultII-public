import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Package, Plus, Save, Wrench } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BuildComponent {
  category: string;
  itemId: string;
  itemName: string;
  manufacturer?: string;
  model?: string;
}

export const BuildConfigurator: React.FC = () => {
  const [builds, setBuilds] = useState<any[]>([]);
  const [currentBuild, setCurrentBuild] = useState<BuildComponent[]>([]);
  const [buildName, setBuildName] = useState('');
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const componentCategories = [
    'Upper Receiver',
    'Lower Receiver', 
    'Barrel',
    'Bolt Carrier Group',
    'Trigger',
    'Stock',
    'Handguard',
    'Muzzle Device',
    'Optic',
    'Sights',
    'Light',
    'Sling',
    'Magazine',
    'Grip',
    'Other'
  ];

  useEffect(() => {
    fetchBuilds();
    fetchAvailableItems();
  }, []);

  const fetchBuilds = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('firearm_builds')
      .select('*')
      .eq('user_id', user.id);
    
    setBuilds(data || []);
  };

  const fetchAvailableItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('inventory_items')
      .select('id, name, manufacturer, model, category')
      .eq('user_id', user.id)
      .in('category', ['firearms', 'accessories', 'optics']);
    
    setAvailableItems(data || []);
  };

  const addComponent = (category: string, itemId: string) => {
    const item = availableItems.find(i => i.id === itemId);
    if (item) {
      setCurrentBuild([...currentBuild, {
        category,
        itemId,
        itemName: item.name,
        manufacturer: item.manufacturer,
        model: item.model
      }]);
    }
  };

  const removeComponent = (index: number) => {
    setCurrentBuild(currentBuild.filter((_, i) => i !== index));
  };

  const saveBuild = async () => {
    if (!buildName || currentBuild.length === 0) {
      toast({ 
        title: 'Missing Information', 
        description: 'Please enter a build name and add at least one component',
        variant: 'destructive'
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('firearm_builds')
      .insert({
        user_id: user.id,
        name: buildName,
        components: currentBuild,
        created_at: new Date().toISOString()
      });

    if (error) {
      toast({ title: 'Error saving build', variant: 'destructive' });
    } else {
      toast({ title: 'Build saved successfully' });
      setBuildName('');
      setCurrentBuild([]);
      fetchBuilds();
    }
  };

  const loadBuild = (build: any) => {
    setBuildName(build.name);
    setCurrentBuild(build.components || []);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold">Build Configurator</h2>
      </div>

      <Card className="p-6 bg-slate-800">
        <div className="space-y-4">
          <div>
            <Label>Build Name</Label>
            <input
              type="text"
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              placeholder="Enter build name..."
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Add Components</h3>
            <div className="grid grid-cols-2 gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select component type" />
                </SelectTrigger>
                <SelectContent>
                  {componentCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCategory && (
                <Select onValueChange={(itemId) => {
                  addComponent(selectedCategory, itemId);
                  setSelectedCategory('');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItems.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.manufacturer} {item.model || item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Current Build Components</h3>
            {currentBuild.length === 0 ? (
              <p className="text-slate-400">No components added yet</p>
            ) : (
              <div className="space-y-2">
                {currentBuild.map((component, index) => (
                  <div key={index} className="bg-slate-700 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{component.category}</div>
                      <div className="text-sm text-slate-400">
                        {component.manufacturer} {component.model || component.itemName}
                      </div>
                    </div>
                    <Button 
                      onClick={() => removeComponent(index)}
                      size="sm" 
                      variant="destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button onClick={saveBuild} className="w-full">
            <Save className="w-4 h-4 mr-2" /> Save Build
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-slate-800">
        <h3 className="font-semibold mb-4">Saved Builds</h3>
        {builds.length === 0 ? (
          <p className="text-slate-400">No saved builds yet</p>
        ) : (
          <div className="space-y-2">
            {builds.map(build => (
              <div key={build.id} className="bg-slate-700 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{build.name}</div>
                    <div className="text-sm text-slate-400">
                      {build.components?.length || 0} components
                    </div>
                  </div>
                  <Button onClick={() => loadBuild(build)} size="sm">
                    Load Build
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};