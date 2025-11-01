import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Loader2, Settings } from 'lucide-react';
import { SearchService, SearchResult, SearchFilters } from '@/services/search/SearchService';
import { BooleanFilterBuilder, FilterCondition } from './BooleanFilterBuilder';
import { SearchHistoryPanel } from './SearchHistoryPanel';
import { SavedSearchPresets } from './SavedSearchPresets';
import { ItemCard } from '../inventory/ItemCard';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const EnhancedAdvancedSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [conditions, setConditions] = useState<FilterCondition[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [fuzzyEnabled, setFuzzyEnabled] = useState(true);

  const performSearch = async () => {
    if (!query.trim() && conditions.length === 0) {
      toast.error('Please enter a search query or add filter conditions');
      return;
    }

    setLoading(true);
    try {
      const searchResults = await SearchService.search(query, filters, fuzzyEnabled);
      setResults(searchResults);
      toast.success(`Found ${searchResults.length} results`);
    } catch (error) {
      toast.error('Search failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (historyQuery: string, historyFilters: any) => {
    setQuery(historyQuery);
    setFilters(historyFilters);
  };

  const handleSelectPreset = (presetQuery: string, presetFilters: any) => {
    setQuery(presetQuery);
    setFilters(presetFilters);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search Engine
          </CardTitle>
          <CardDescription className="text-slate-400">
            Full-text search with fuzzy matching, boolean operators, and intelligent ranking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && performSearch()}
              placeholder="Search by name, model, serial number, caliber..."
              className="flex-1 bg-slate-900 border-slate-700 text-white"
            />
            <Button onClick={performSearch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="fuzzy"
              checked={fuzzyEnabled}
              onCheckedChange={setFuzzyEnabled}
            />
            <Label htmlFor="fuzzy" className="text-slate-300">
              Enable fuzzy matching (finds similar results even with typos)
            </Label>
          </div>

          <Tabs defaultValue="simple" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-900">
              <TabsTrigger value="simple">Simple</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>

            <TabsContent value="simple" className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Manufacturer"
                  className="bg-slate-900 border-slate-700 text-white"
                  onChange={(e) => setFilters({ ...filters, manufacturer_id: e.target.value })}
                />
                <Input
                  placeholder="Caliber"
                  className="bg-slate-900 border-slate-700 text-white"
                  onChange={(e) => setFilters({ ...filters, caliber_id: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <BooleanFilterBuilder conditions={conditions} onChange={setConditions} />
            </TabsContent>

            <TabsContent value="saved" className="grid grid-cols-2 gap-4">
              <SearchHistoryPanel onSelectSearch={handleSelectHistory} />
              <SavedSearchPresets 
                onSelectPreset={handleSelectPreset}
                currentQuery={query}
                currentFilters={filters}
              />
            </TabsContent>
          </Tabs>

          {results.length > 0 && (
            <div className="border-t border-slate-700 pt-4">
              <p className="text-slate-400 text-sm mb-4">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {results.map(item => (
                  <div key={item.id} className="bg-slate-900 p-4 rounded-lg">
                    <h3 className="text-white font-medium">{item.name}</h3>
                    {item.model && <p className="text-slate-400 text-sm">{item.model}</p>}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-slate-500">{item.category}</span>
                      <span className="text-xs text-green-400">Match: {(item.rank * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
