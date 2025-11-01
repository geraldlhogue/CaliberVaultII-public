import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, Trash2, Plus, Search } from 'lucide-react';
import { SearchService, SavedSearch } from '@/services/search/SearchService';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SavedSearchPresetsProps {
  onSelectPreset: (query: string, filters: any) => void;
  currentQuery?: string;
  currentFilters?: any;
}

export const SavedSearchPresets: React.FC<SavedSearchPresetsProps> = ({ 
  onSelectPreset, 
  currentQuery = '', 
  currentFilters = {} 
}) => {
  const [presets, setPresets] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const data = await SearchService.getSavedSearches();
      setPresets(data);
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreset = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      await SearchService.saveSearchPreset(name, description, currentQuery, currentFilters);
      toast.success('Search preset saved');
      setDialogOpen(false);
      setName('');
      setDescription('');
      loadPresets();
    } catch (error) {
      toast.error('Failed to save preset');
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      await SearchService.toggleFavorite(id, !isFavorite);
      loadPresets();
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const deletePreset = async (id: string) => {
    try {
      await SearchService.deleteSearchPreset(id);
      toast.success('Preset deleted');
      loadPresets();
    } catch (error) {
      toast.error('Failed to delete preset');
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <Star className="h-4 w-4" />
          Saved Searches
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-3 w-3 mr-1" />
              Save
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Save Search Preset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Preset name"
                className="bg-slate-900 border-slate-700 text-white"
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="bg-slate-900 border-slate-700 text-white"
              />
              <Button onClick={savePreset} className="w-full">Save Preset</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {presets.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No saved searches yet</p>
          ) : (
            <div className="space-y-2">
              {presets.map((preset) => (
                <div key={preset.id} className="p-2 rounded bg-slate-900 hover:bg-slate-700 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => onSelectPreset(preset.query || '', preset.filters)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="h-3 w-3 text-slate-400" />
                        <span className="text-white text-sm font-medium">{preset.name}</span>
                      </div>
                      {preset.description && (
                        <p className="text-xs text-slate-400 mt-1">{preset.description}</p>
                      )}
                    </button>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => toggleFavorite(preset.id, preset.is_favorite)}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                      >
                        <Star className={`h-3 w-3 ${preset.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </Button>
                      <Button
                        onClick={() => deletePreset(preset.id)}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
