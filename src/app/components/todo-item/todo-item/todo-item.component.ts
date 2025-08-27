import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Todo } from '../../../services/db.service';
import { CommonModule } from '@angular/common';
import { TodoManagerService } from '../../../services/api/manager/todo-manager.service';

@Component({
  imports:[CommonModule],
  selector: 'app-todo-item',
  template: `
    <div class="todo-item" [class.completed]="todo.completed">
      <div class="todo-content">
        <input
          type="checkbox"
          [checked]="todo.completed"
          (change)="toggleCompleted()"
          class="todo-checkbox"
        />

        <span class="todo-title">{{ todo.title }}</span>

        <div class="todo-meta">
          <small>{{ todo.createdAt | date:'short' }}</small>
          <small *ngIf="!todo.synced" class="not-synced">⏳ Pendiente sincronizar</small>
        </div>
      </div>

      <div class="todo-actions">
        <button (click)="deleteTodo()" class="delete-btn">🗑️</button>
      </div>
    </div>
  `,
  styles: [`
    .todo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: white;
    }

    .todo-item.completed {
      opacity: 0.7;
      background-color: #f8f9fa;
    }

    .todo-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .todo-checkbox {
      margin-right: 10px;
    }

    .todo-title {
      font-size: 16px;
    }

    .todo-item.completed .todo-title {
      text-decoration: line-through;
      color: #6c757d;
    }

    .todo-meta {
      display: flex;
      gap: 10px;
      font-size: 12px;
      color: #6c757d;
    }

    .not-synced {
      color: #ffc107;
      font-weight: bold;
    }

    .todo-actions {
      display: flex;
      gap: 5px;
    }

    .delete-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 5px;
    }

    .delete-btn:hover {
      color: #dc3545;
    }
  `]
})
export class TodoItemComponent {
  @Input() todo!: Todo;
  @Output() todoUpdated = new EventEmitter<void>();
  @Output() todoDeleted = new EventEmitter<void>();

  constructor(private todoManagerService: TodoManagerService) {}

  async toggleCompleted() {
    try {
      await this.todoManagerService.update(this.todo.id!, {
        completed: !this.todo.completed
      });
      this.todoUpdated.emit();
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('Error al actualizar la tarea');
    }
  }

  async deleteTodo() {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await this.todoManagerService.delete(this.todo.id!);
        this.todoDeleted.emit();
      } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Error al eliminar la tarea');
      }
    }
  }
}
