import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConnectionService } from '../../../services/connection.service';
import { Todo } from '../../../services/db.service';
import { CommonModule } from '@angular/common';
import { TodoFormComponent } from '../../todo-form/todo-form/todo-form.component';
import { TodoItemComponent } from '../../todo-item/todo-item/todo-item.component';
import { TodoManagerService } from '../../../services/api/manager/todo-manager.service';

@Component({
  imports:[CommonModule, TodoFormComponent, TodoItemComponent],
  selector: 'app-todo-list',
  template: `
    <div class="todo-container">
      <h2>Lista de Tareas</h2>

      <div class="status" [class.online]="isOnline" [class.offline]="!isOnline">
        {{ isOnline ? '🟢 Online' : '🔴 Offline' }}
      </div>

      <app-todo-form (todoAdded)="loadTodos()"></app-todo-form>

      <div class="todos-list">
        <div *ngFor="let todo of todos" class="todo-item">
          <app-todo-item
            [todo]="todo"
            (todoUpdated)="loadTodos()"
            (todoDeleted)="loadTodos()">
          </app-todo-item>
        </div>
      </div>

      <div *ngIf="todos.length === 0" class="empty-state">
        No hay tareas. ¡Agrega una nueva!
      </div>

      <button (click)="forceSync()" [disabled]="!isOnline" class="sync-btn">
        🔄 Sincronizar
      </button>
    </div>
  `,
  styles: [`
    .todo-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    .status {
      padding: 8px;
      border-radius: 4px;
      margin-bottom: 20px;
      text-align: center;
      font-weight: bold;
    }

    .online {
      background-color: #d4edda;
      color: #155724;
    }

    .offline {
      background-color: #f8d7da;
      color: #721c24;
    }

    .todos-list {
      margin: 20px 0;
    }

    .todo-item {
      margin-bottom: 10px;
    }

    .empty-state {
      text-align: center;
      color: #6c757d;
      font-style: italic;
      margin: 40px 0;
    }

    .sync-btn {
      width: 100%;
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .sync-btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
  `]
})
export class TodoListComponent implements OnInit, OnDestroy {
  todos: Todo[] = [];
  isOnline = true;
  private subscriptions: Subscription[] = [];

  constructor(
    private todoManagerService:TodoManagerService,
    private connectionService: ConnectionService,
  ) {}

  ngOnInit() {
    this.loadTodos();

    this.subscriptions.push(
      this.connectionService.isOnline$.subscribe(online => {
        this.isOnline = online;
        if (online) {
          this.loadTodos(); // Recargar cuando se recupera conexión
        }
      })
    );
  }

  async loadTodos() {
    try{
      const todos = await this.todoManagerService.getAll();

      if(todos)
        this.todos = todos
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  }

  async forceSync() {
    if (this.isOnline) {
      await this.todoManagerService.syncData()
      this.loadTodos();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
