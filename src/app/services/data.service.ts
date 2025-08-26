import { Injectable } from '@angular/core';
import { DbService, Todo } from './db.service';
import { SyncService } from './sync.service';
import { ConnectionService } from './connection.service';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(
    private dbService: DbService,
    private syncService: SyncService,
    private connectionService: ConnectionService
  ) {}

  // Obtener todos los todos
  getTodos(): Observable<Todo[]> {
    return this.connectionService.isOnline$.pipe(
      switchMap(isOnline => {
        if (isOnline) {
          // Si está online, sincronizar primero y luego obtener de local
          return from(this.syncService.syncData()).pipe(
            switchMap(() => from(this.dbService.todos.toArray()))
          );
        } else {
          // Si está offline, obtener solo de local
          return from(this.dbService.todos.toArray());
        }
      })
    );
  }

  // Crear nuevo todo
  async createTodo(todoData: Omit<Todo, 'id' | 'synced' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
    const newTodo: Omit<Todo, 'id'> = {
      ...todoData,
      synced: this.connectionService.isOnline,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const id = await this.dbService.todos.add(newTodo as Todo);
    const createdTodo = await this.dbService.todos.get(id);

    // Si está online, intentar sincronizar
    if (this.connectionService.isOnline) {
      this.syncService.syncData().catch(error => {
        console.error('Error sincronizando después de crear:', error);
      });
    }

    return createdTodo!;
  }

  // Actualizar todo
  async updateTodo(id: number, updates: Partial<Todo>): Promise<void> {
    const updateData = {
      ...updates,
      synced: this.connectionService.isOnline,
      updatedAt: new Date()
    };

    await this.dbService.todos.update(id, updateData);

    // Si está online, intentar sincronizar
    if (this.connectionService.isOnline) {
      this.syncService.syncData().catch(error => {
        console.error('Error sincronizando después de actualizar:', error);
      });
    }
  }

  // Eliminar todo
  async deleteTodo(id: number): Promise<void> {
    // Primero marcar como no sincronizado si estaba sincronizado
    const todo = await this.dbService.todos.get(id);
    if (todo && todo.synced) {
      // En una implementación real, podrías querer manejar esto diferente
      // tal vez mantener un registro de eliminaciones pendientes
      await this.dbService.todos.update(id, { synced: false });
    } else {
      await this.dbService.todos.delete(id);
    }

    // Si está online, intentar sincronizar
    if (this.connectionService.isOnline) {
      this.syncService.syncData().catch(error => {
        console.error('Error sincronizando después de eliminar:', error);
      });
    }
  }

  // Obtener todo por ID
  getTodoById(id: number): Promise<Todo | undefined> {
    return this.dbService.todos.get(id);
  }
}
