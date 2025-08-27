import { Injectable } from '@angular/core';
import { DbService, Todo } from '../../db.service';

@Injectable({
  providedIn: 'root'
})
export class TodoDexieService {

  constructor(
    private dbService:DbService
  ) { }

  getAll() : Promise<Todo[]> {
    return this.dbService.todos.toArray();
  }

  async create(todo : Omit<Todo, 'id'| 'synced' | 'createdAt' | 'updatedAt'>){
     const newTodo: Omit<Todo, 'id'> = {
      ...todo,
      synced: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const id = await this.dbService.todos.add(newTodo);

    const resultTodo = await this.dbService.todos.get(id)

    return resultTodo;
  }

  async update(id:number, updates:Partial<Todo>){
    console.log(updates.synced)
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    await this.dbService.todos.update(id, updateData);

    const resultData = await this.dbService.todos.get(id)
    return resultData
  }

  async delete(id:number){
    const exists = await this.dbService.todos.get(id)
    if(exists){
      await this.dbService.todos.update(id, { deletedAt : new Date() })
    }
  }
}
