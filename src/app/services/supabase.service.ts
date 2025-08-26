import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

export interface SupabaseTodo {
  id?: number;
  title: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // Métodos para operaciones CRUD con Supabase
  async getTodos(): Promise<SupabaseTodo[]> {
    const { data, error } = await this.supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createTodo(todo: Omit<SupabaseTodo, 'id'>): Promise<SupabaseTodo> {
    const { data, error } = await this.supabase
      .from('todos')
      .insert([todo])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTodo(id: number, updates: Partial<SupabaseTodo>): Promise<SupabaseTodo> {
    const { data, error } = await this.supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTodo(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
