import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Save, X } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { ItemCard } from '../inventory/ItemCard';

export const AdvancedSearchEngine: React.FC = () => {
  const { inventory } = useAppContext();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', manufacturer: '', caliber: '' });
  const [savedSearches, setSavedSearches] = useState<string[]>([]);

  const results = useMemo(() => {
    if (!query && !filters.category && !filters.manufacturer && !filters.caliber) {
      return [];
    }

    return inventory.filter(item => {
      const matchesQuery = !query || 
        item.name?.toLowerCase().includes(query.toLowerCase()) ||
        item.manufacturer?.toLowerCase().includes(query.toLowerCase()) ||
        item.caliber?.toLowerCase().includes(query.toLowerCase()) ||
        item.serialNumber?.toLowerCase().includes(query.toLowerCase());

      const matchesCategory = !filters.category || item.category === filters.category;
      const matchesManufacturer = !filters.manufacturer || 
        item.manufacturer?.toLowerCase().includes(filters.manufacturer.toLowerCase());
      const matchesCaliber = !filters.caliber || 
        item.caliber?.toLowerCase().includes(filters.caliber.toLowerCase());

      return matchesQuery && matchesCategory && matchesManufacturer && matchesCaliber;
    });
  }, [inventory, query, filters]);

  const saveSearch = () => {
    if (query) {
      setSavedSearches(prev => [...new Set([...prev, query])]);
    }
  };

  const clearFilters = () => {
    setQuery('');
    setFilters({ category: '', manufacturer: '', caliber: '' });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Search className="h-5 w-5" />
          Advanced Search Engine
        </CardTitle>
        <CardDescription className="text-slate-400">
          Powerful search with fuzzy matching and multiple filters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, manufacturer, caliber, serial..."
              className="pl-10 bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <Button onClick={saveSearch} variant="outline">
            <Save className="h-4 w-4" />
          </Button>
          <Button onClick={clearFilters} variant="outline">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="bg-slate-900 border-slate-700 text-white rounded px-3 py-2"
          >
            <option value="">All Categories</option>
            <option value="firearms">Firearms</option>
            <option value="optics">Optics</option>
            <option value="ammunition">Ammunition</option>
            <option value="suppressors">Suppressors</option>
          </select>

          <Input
            value={filters.manufacturer}
            onChange={(e) => setFilters(prev => ({ ...prev, manufacturer: e.target.value }))}
            placeholder="Manufacturer"
            className="bg-slate-900 border-slate-700 text-white"
          />

          <Input
            value={filters.caliber}
            onChange={(e) => setFilters(prev => ({ ...prev, caliber: e.target.value }))}
            placeholder="Caliber"
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>

        {savedSearches.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-slate-400 text-sm">Saved:</span>
            {savedSearches.map((search, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                onClick={() => setQuery(search)}
                className="text-xs"
              >
                {search}
              </Button>
            ))}
          </div>
        )}

        <div className="border-t border-slate-700 pt-4">
          <p className="text-slate-400 text-sm mb-4">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {results.map(item => (
              <ItemCard key={item.id} item={item} onClick={() => {}} onToggleSelect={() => {}} isSelected={false} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};