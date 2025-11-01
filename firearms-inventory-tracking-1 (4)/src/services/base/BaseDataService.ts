import { supabase } from '@/lib/supabase';

export interface DataOperation<T> {
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  get(id: string): Promise<T | null>;
  list(filters?: Record<string, any>): Promise<T[]>;
}

export abstract class BaseDataService<T> implements DataOperation<T> {
  protected tableName: string;
  protected logPrefix: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.logPrefix = `[${tableName}Service]`;
  }

  async create(data: Partial<T>): Promise<T> {
    console.log(`${this.logPrefix} Creating:`, data);
    
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error(`${this.logPrefix} Create error:`, error);
      throw error;
    }

    console.log(`${this.logPrefix} Created successfully:`, result);
    return result as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    console.log(`${this.logPrefix} Updating ${id}:`, data);
    
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`${this.logPrefix} Update error:`, error);
      throw error;
    }

    console.log(`${this.logPrefix} Updated successfully:`, result);
    return result as T;
  }

  async delete(id: string): Promise<void> {
    console.log(`${this.logPrefix} Deleting ${id}`);
    
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`${this.logPrefix} Delete error:`, error);
      throw error;
    }

    console.log(`${this.logPrefix} Deleted successfully`);
  }

  async get(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`${this.logPrefix} Get error:`, error);
      return null;
    }

    return data as T;
  }

  async list(filters?: Record<string, any>): Promise<T[]> {
    let query = supabase.from(this.tableName).select('*');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error(`${this.logPrefix} List error:`, error);
      return [];
    }

    return (data as T[]) || [];
  }
}
