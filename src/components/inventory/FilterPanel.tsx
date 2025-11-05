import React, { useEffect, useState } from 'react';
import { ItemCategory } from '@/types/inventory';
import { ActiveFilters } from '@/types/filters';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

interface FilterPanelProps {
  filters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
  onSavePreset: () => void;
  uniqueCalibers: string[];
  uniqueManufacturers: string[];
  maxPrice: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function FilterPanel({ filters, onFiltersChange, onSavePreset, uniqueCalibers, uniqueManufacturers, maxPrice }: FilterPanelProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const toggleCategory = (slug: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(slug as ItemCategory)
      ? currentCategories.filter(c => c !== slug)
      : [...currentCategories, slug as ItemCategory];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-bold text-lg">Filters</h3>
        <Button onClick={onSavePreset} size="sm" variant="outline">
          <Save className="w-4 h-4 mr-2" />
          Save Preset
        </Button>
      </div>

      {/* Categories */}
      <div>
        <Label className="text-white mb-3 block">Categories</Label>
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-2">
              <Checkbox
                id={cat.slug}
                checked={filters.categories?.includes(cat.slug as ItemCategory) || false}
                onCheckedChange={() => toggleCategory(cat.slug)}
              />
              <label htmlFor={cat.slug} className="text-slate-300 cursor-pointer">{cat.name}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-white mb-3 block">
          Price Range: ${filters.priceMin || 0} - ${filters.priceMax || maxPrice}
        </Label>
        <Slider
          min={0}
          max={maxPrice}
          step={50}
          value={[filters.priceMin || 0, filters.priceMax || maxPrice]}
          onValueChange={([min, max]) => onFiltersChange({ ...filters, priceMin: min, priceMax: max })}
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-white mb-2 block">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateStart ? format(new Date(filters.dateStart), 'PP') : 'Pick date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.dateStart ? new Date(filters.dateStart) : undefined}
                onSelect={(date) => onFiltersChange({ ...filters, dateStart: date?.toISOString() })}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label className="text-white mb-2 block">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateEnd ? format(new Date(filters.dateEnd), 'PP') : 'Pick date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.dateEnd ? new Date(filters.dateEnd) : undefined}
                onSelect={(date) => onFiltersChange({ ...filters, dateEnd: date?.toISOString() })}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
