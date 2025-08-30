import { Injectable } from '@angular/core';
import { ConnectionService } from '../../connection.service';
import { TodoSupabaseService } from '../supabase/todo-supabase.service';
import { TodoDexieService } from '../dexie/todo-dexie.service';
import { BehaviorSubject } from 'rxjs';
import { Todo } from '../../db.service';
import { SupabaseTodo } from '../../supabase.service';

@Injectable({
  providedIn: 'root'
})
export class TodoManagerService {

  private isConnected$ : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private connectionService : ConnectionService,
    private todoSupabaseService: TodoSupabaseService,
    private todoDexieService: TodoDexieService
  ) {
    this.connectionService.isOnline$.subscribe({
      next: (value)=>{
        this.isConnected$.next(value);
      },
      error : (err)=>{
        console.error(err);
      }
    })
  }

  async getAll(){
    const todos = await this.todoDexieService.getAll();

    return todos;
  }

  async create(todo: Omit<Todo, 'id' | 'synced' | 'createdAt' | 'updatedAt'>){
    const created = await this.todoDexieService.create(todo);

    if(created){
      if(this.isConnected$.value == true){
        const supabaseCreated = await this.todoSupabaseService.create(this.localToSupabase(created));

        return supabaseCreated
      }
      else{
        return created
      }
    }
  }

  async update(id:number, updates:Partial<Todo>){
    const updated = await this.todoDexieService.update(id, updates);

    if(updated){
      if(this.isConnected$.value == true){
        const supabaseUpdated = await this.todoSupabaseService.update(id, this.localToSupabase(updated))
        await this.markAsSynced(id, true)

        return supabaseUpdated
      }
      else{
        await this.markAsSynced(id, false)

        return updated
      }
    }
  }

  async delete(id:number){
    await this.todoDexieService.delete(id);

    if(this.isConnected$.value == true){
      await this.todoSupabaseService.delete(id);
    }
  }

  async markAsSynced(id:number, synced:boolean){
    await this.todoDexieService.update(id, { synced : synced })
  }

  private localToSupabase(todo: Todo): Omit<SupabaseTodo, 'id'> {
    return {
      title: todo.title,
      completed: todo.completed,
      created_at: todo.createdAt.toISOString(),
      updated_at: todo.updatedAt.toISOString()
    };
  }

  private SupabaseToLocal(todo: SupabaseTodo): Omit<Todo, 'id'> {
    return {
      title: todo.title,
      completed: todo.completed,
      createdAt: todo.created_at ? new Date(todo.created_at) : new Date(),
      updatedAt: todo.updated_at ? new Date(todo.updated_at) : new Date()
    };
  }

  async syncData(){
    console.log(this.isConnected$.value);
    if(this.isConnected$.value == false) return;

    const todosLocal = await this.todoDexieService.getAll();
    const todosSupabase = await this.todoSupabaseService.getAll();
    console.log("todos offline: ", todosLocal, ' \n todos online: ', todosSupabase)
    for(const todo of todosLocal){
      if(!todo.id) continue;
      console.log("Todo local:",todo);

      const todoFound = todosSupabase.find(value => value.id == todo.id);
      if(!todoFound){
        console.log("Va a vincularse")
        const created = await this.todoSupabaseService.create(this.localToSupabase(todo))
        await this.markAsSynced(todo.id, true)
        console.log(created, " Es vinculado a supabase", "y se ha modificaddo el local en")
      }else{
        await this.todoSupabaseService.update(todo.id,this.localToSupabase(todo))

        if(todo.synced == false){
          await this.markAsSynced(todo.id, true)
        }
      }
    }

    for(const todo of todosSupabase){
      if(!todo.id) continue;
      console.log("Todo supabase:",todo);

      const todoFound = todosLocal.find(value => value.id == todo.id)
      if(!todoFound){
        const created = await this.todoDexieService.create(todo)
        if(created && created.id){
          await this.markAsSynced(created.id, true)
        }
      }
      else{
        const todoLocal = this.SupabaseToLocal(todo)
        if(todoFound.updatedAt.getTime() < todoLocal.updatedAt.getTime()){
          await this.todoDexieService.update(todo.id, todo);
        }
      }
    }

    console.log("Base de datos syncronizados con exito, o bueno eso supongo ahora mismo")
  }
}
