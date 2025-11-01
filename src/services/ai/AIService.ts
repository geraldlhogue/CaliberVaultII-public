import { supabase } from '@/lib/supabase';

export interface AIPrediction {
  id: string;
  prediction_type: 'price' | 'maintenance' | 'duplicate' | 'category' | 'market_trend';
  confidence_score: number;
  prediction_data: any;
  status: 'pending' | 'confirmed' | 'rejected' | 'expired';
  created_at: string;
}

export interface DuplicateDetection {
  id: string;
  item_id_1: string;
  item_id_2: string;
  similarity_score: number;
  match_reasons: any;
  status: 'pending' | 'merged' | 'not_duplicate' | 'ignored';
  created_at: string;
}

export interface Recommendation {
  id: string;
  recommendation_type: 'maintenance' | 'accessory' | 'build' | 'market_insight' | 'organization';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  action_url?: string;
  related_item_ids?: string[];
  status: 'active' | 'completed' | 'dismissed' | 'expired';
  created_at: string;
}

export class AIService {
  static async detectDuplicates(items: any[]): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { action: 'detect_duplicates', items }
      });

      if (error) {
        console.error('AI Service Error:', error);
        // Return mock data if edge function not available
        return { duplicates: [] };
      }
      
      // Validate response is JSON
      if (typeof data === 'string' && data.includes('<!DOCTYPE')) {
        console.warn('AI edge function not deployed, using fallback');
        return { duplicates: [] };
      }
      
      return data;
    } catch (err) {
      console.error('AI Service Exception:', err);
      return { duplicates: [] };
    }
  }

  static async generateRecommendations(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { action: 'generate_recommendations', userId }
      });

      if (error) {
        console.error('AI Service Error:', error);
        return { recommendations: [] };
      }
      
      if (typeof data === 'string' && data.includes('<!DOCTYPE')) {
        console.warn('AI edge function not deployed, using fallback');
        return { recommendations: [] };
      }
      
      return data;
    } catch (err) {
      console.error('AI Service Exception:', err);
      return { recommendations: [] };
    }
  }

  static async predictPrice(itemId: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { action: 'predict_price', itemId }
      });

      if (error) {
        console.error('AI Service Error:', error);
        return { price: null, confidence: 0 };
      }
      
      if (typeof data === 'string' && data.includes('<!DOCTYPE')) {
        console.warn('AI edge function not deployed, using fallback');
        return { price: null, confidence: 0 };
      }
      
      return data;
    } catch (err) {
      console.error('AI Service Exception:', err);
      return { price: null, confidence: 0 };
    }
  }

  static async getRecommendations(): Promise<Recommendation[]> {
    try {
      const { data, error } = await supabase
        .from('smart_recommendations')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error fetching recommendations:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Exception fetching recommendations:', err);
      return [];
    }
  }

  static async dismissRecommendation(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('smart_recommendations')
        .update({ status: 'dismissed' })
        .eq('id', id);

      if (error) {
        console.error('Error dismissing recommendation:', error);
      }
    } catch (err) {
      console.error('Exception dismissing recommendation:', err);
    }
  }
}
