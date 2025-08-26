import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment.prod';
import { TodoItemComponent } from '../components/todo-item/todo-item/todo-item.component';

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
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // Obtener todos los todos
  async getTodos(): Promise<SupabaseTodo[]> {
    const { data, error } = await this.supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data || [];
  }

  // Crear nuevo todo
  async createTodo(todo: Omit<SupabaseTodo, 'id'>): Promise<SupabaseTodo> {
    console.log("hey estoycreando", TodoItemComponent)
    const { data, error } = await this.supabase
      .from('todos')
      .insert([todo])
      .select()
      .single();

    console.log('heu ya cree ')

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  }

  // Actualizar todo
  async updateTodo(id: number, updates: Partial<SupabaseTodo>): Promise<SupabaseTodo> {
    const { data, error } = await this.supabase
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

  // Eliminar todo
  async deleteTodo(id: number): Promise<void> {
    const { error } = await this.supabase
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
    return this.supabase
      .channel('todos-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        callback
      )
      .subscribe();
  }
}
