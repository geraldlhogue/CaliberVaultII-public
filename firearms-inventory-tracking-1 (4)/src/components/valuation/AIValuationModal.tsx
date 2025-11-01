import React, { useState } from 'react';
import { X, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AIValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any;
}

export function AIValuationModal({ isOpen, onClose, item }: AIValuationModalProps) {
  const [loading, setLoading] = useState(false);
  const [valuation, setValuation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValuation = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: funcError } = await supabase.functions.invoke('ai-valuation', {
        body: {
          itemType: item?.category || 'Firearm',
          manufacturer: item?.manufacturer || 'Unknown',
          model: item?.model || 'Unknown',
          condition: item?.condition || 'Good',
          yearManufactured: item?.year_manufactured,
          caliber: item?.caliber,
          accessories: item?.accessories,
          itemId: item?.id,
          saveHistory: true
        }
      });

      if (funcError) {
        console.error('Edge function error:', funcError);
        throw new Error(funcError.message || 'Failed to get valuation');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Valuation failed');
      }

      // Save to valuation_history
      const estimatedValue = data.results?.valuation?.estimatedValue || 0;
      await supabase.from('valuation_history').insert({
        user_id: user.id,
        item_id: item?.id,
        estimated_value: estimatedValue,
        confidence_level: data.results?.valuation?.confidenceLevel || 'medium',
        valuation_source: 'ai',
        market_data: data.results?.valuation?.marketData || null,
        notes: data.results?.valuation?.notes || null
      });

      setValuation(data.results.valuation);
      toast.success('Valuation complete and saved to history!');
    } catch (err: any) {
      console.error('Valuation error:', err);
      const errorMsg = err.message || 'Failed to generate valuation';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            AI Valuation
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Item Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-slate-400">Manufacturer:</span> <span className="text-white">{item?.manufacturer}</span></div>
              <div><span className="text-slate-400">Model:</span> <span className="text-white">{item?.model}</span></div>
            </div>
          </div>

          {error && (
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}

          {!valuation && (
            <button
              onClick={handleValuation}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Get AI Valuation'}
            </button>
          )}

          {valuation && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-center">
                <div className="text-white/80 text-sm mb-1">Estimated Value</div>
                <div className="text-4xl font-bold text-white">${valuation.estimatedValue?.toLocaleString()}</div>
              </div>
              <button onClick={() => setValuation(null)} className="w-full bg-slate-700 text-white py-2 rounded-lg">
                Get New Valuation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
