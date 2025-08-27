import { Injectable } from '@angular/core';
import Dexie from 'dexie';

export interface Todo {
  id?: number;
  title: string;
  completed: boolean;
  synced?: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DbService extends Dexie {
  todos!: Dexie.Table<Todo, number>;

  constructor() {
    super('OfflineAppDB');

    this.version(1).stores({
      todos: '++id, title, completed, synced, createdAt, updatedAt, deletedAt'
    });

    this.version(2).stores({
      todos: '++id, title, completed, synced, createdAt, updatedAt, deletedAt'
    }).upgrade(trans => {
      return trans.table('todos').toCollection().modify(todo => {
        todo.synced = todo.synced || false;
      });
    });
  }
}
