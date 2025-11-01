import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, Search } from 'lucide-react';
import { SearchService } from '@/services/search/SearchService';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchHistoryPanelProps {
  onSelectSearch: (query: string, filters: any) => void;
}

export const SearchHistoryPanel: React.FC<SearchHistoryPanelProps> = ({ onSelectSearch }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await SearchService.getSearchHistory(20);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load search history:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await SearchService.clearSearchHistory();
      setHistory([]);
      toast.success('Search history cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading history...</div>;
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          Recent Searches
        </CardTitle>
        {history.length > 0 && (
          <Button onClick={clearHistory} variant="ghost" size="sm">
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {history.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No search history yet</p>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectSearch(item.query, item.filters)}
                  className="w-full text-left p-2 rounded hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-3 w-3 text-slate-400" />
                    <span className="text-white text-sm">{item.query || 'Advanced search'}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {item.result_count} results • {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
