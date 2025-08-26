import { Injectable } from '@angular/core';
import { DbService, Todo } from './db.service';
import { SupabaseService, SupabaseTodo } from './supabase.service';
import { ConnectionService } from './connection.service';
import { switchMap, catchError } from 'rxjs/operators';
import { of, from, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private isSyncing = false;

  constructor(
    private dbService: DbService,
    private supabaseService: SupabaseService,
    private connectionService: ConnectionService
  ) {
    // Sincronizar automáticamente cuando se recupera la conexión
    this.connectionService.isOnline$.pipe(
      switchMap(isOnline => {
        if (isOnline && !this.isSyncing) {
          return from(this.syncData());
        }
        return of(null);
      })
    ).subscribe();
  }

  // Convertir entre formatos de base de datos
  private localToSupabase(todo: Todo): Omit<SupabaseTodo, 'id'> {
    return {
      title: todo.title,
      completed: todo.completed,
      created_at: todo.createdAt.toISOString(),
      updated_at: todo.updatedAt.toISOString()
    };
  }

  private supabaseToLocal(todo: SupabaseTodo): Omit<Todo, 'id'> {
    return {
      title: todo.title,
      completed: todo.completed,
      synced: true,
      createdAt: new Date(todo.created_at!),
      updatedAt: new Date(todo.updated_at!)
    };
  }

  // Sincronizar datos
  async syncData(): Promise<void> {
    if (this.isSyncing) return;

    this.isSyncing = true;
    console.log('Iniciando sincronización...');

    try {
      // Corrección en la consulta de Dexie
      const unsyncedTodos = await this.dbService.todos
        .filter(todo => todo.synced === false)
        .toArray();

      // 2. Sincronizar cada todo no sincronizado
      for (const localTodo of unsyncedTodos) {
        try {
          if (localTodo.id) {
            // Si ya existe un ID, es una actualización
            await this.supabaseService.updateTodo(
              localTodo.id,
              this.localToSupabase(localTodo)
            );
          } else {
            // Si no tiene ID, es un nuevo todo
            const supabaseTodo = await this.supabaseService.createTodo(
              this.localToSupabase(localTodo)
            );

            // Actualizar el todo local con el ID de Supabase
            await this.dbService.todos.update(localTodo.id!, {
              id: supabaseTodo.id,
              synced: true,
              updatedAt: new Date()
            });
          }
        } catch (error) {
          console.error('Error sincronizando todo:', error);
        }
      }

      // 3. Obtener todos de Supabase y actualizar local
      const supabaseTodos = await this.supabaseService.getTodos();
      for (const supabaseTodo of supabaseTodos) {
        const existingTodo = await this.dbService.todos
          .where('id')
          .equals(supabaseTodo.id!)
          .first();

        if (existingTodo) {
          // Actualizar todo existente
          await this.dbService.todos.update(supabaseTodo.id!, {
            ...this.supabaseToLocal(supabaseTodo),
            id: supabaseTodo.id
          });
        } else {
          // Insertar nuevo todo
          await this.dbService.todos.add({
            ...this.supabaseToLocal(supabaseTodo),
            id: supabaseTodo.id
          });
        }
      }

      console.log('Sincronización completada');
    } catch (error) {
      console.error('Error en la sincronización:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Forzar sincronización manual
  async forceSync(): Promise<void> {
    if (this.connectionService.isOnline) {
      await this.syncData();
    }
  }
}
