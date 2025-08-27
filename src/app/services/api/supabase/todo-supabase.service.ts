import { Injectable } from '@angular/core';
import { SupabaseService } from '../../supabase.service';

export interface SupabaseTodo {
  id?: number;
  title: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string; // Opcional si usas autenticación
}

@Injectable({
  providedIn: 'root'
})
export class TodoSupabaseService {

  constructor(
    private supabaseService:SupabaseService
  ) { }

  async getAll(){
    const { data, error } = await this.supabaseService.supabaseConnection
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data || [];
  }

  async create(todo : SupabaseTodo){
    const { data, error } = await this.supabaseService.supabaseConnection
      .from('todos')
      .insert([todo])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  }

  async update(id:number, updates: Partial<SupabaseTodo>){
    const { data, error } = await this.supabaseService.supabaseConnection
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  }

  async delete(id:number){
    const { error } = await this.supabaseService.supabaseConnection
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  }

  // Suscribirse a cambios en tiempo real (opcional)
  subscribeToTodos(callback: (payload: any) => void) {
    return this.supabaseService.supabaseConnection
      .channel('todos-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        callback
      )
      .subscribe();
  }
}
