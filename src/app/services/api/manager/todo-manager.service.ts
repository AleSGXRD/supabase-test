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
    console.log("OnInit TodoManager")
    this.connectionService.isOnline$.subscribe({
      next: (value)=>{
        this.isConnected$.next(value);
        console.log(this.isConnected$.value)
        this.syncData()
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
        const supabaseCreated = await this.todoSupabaseService.create(created);

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

        return supabaseUpdated
      }
      else{
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
  private localToSupabase(todo: Todo): Omit<SupabaseTodo, 'id'> {
    return {
      title: todo.title,
      completed: todo.completed,
      created_at: todo.createdAt.toISOString(),
      updated_at: todo.updatedAt.toISOString()
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
        const synced = await this.todoDexieService.update(todo.id, {synced : true})
        console.log(created, " Es vinculado a supabase", "y se ha modificaddo el local en :", synced)
      }else{
        await this.todoSupabaseService.update(todo.id,this.localToSupabase(todo))

        if(todo.synced == false){
          await this.todoDexieService.update(todo.id, {synced : true})
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
          const synced = await this.todoDexieService.update(created.id, {synced:true})
          console.log("Se vinculo desde supabase a la local este nuevo dato", created, "y se le actualizo el syncronizado y quedo asi", synced)
        }
      }
      else{
        const updated = await this.todoDexieService.update(todo.id, todo);
      }
    }

    console.log("Base de datos syncronizados con exito, o bueno eso supongo ahora mismo")
  }
}
