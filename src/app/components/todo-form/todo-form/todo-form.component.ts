import { Component, Output, EventEmitter } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  imports:[CommonModule, ReactiveFormsModule, FormsModule],
  selector: 'app-todo-form',
  template: `
    <div class="todo-form">
      <input
        type="text"
        [(ngModel)]="newTodoTitle"
        placeholder="Nueva tarea..."
        (keyup.enter)="addTodo()"
        class="todo-input"
      />
      <button (click)="addTodo()" [disabled]="!newTodoTitle.trim()" class="add-btn">
        ➕ Agregar
      </button>
    </div>
  `,
  styles: [`
    .todo-form {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .todo-input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }

    .add-btn {
      padding: 10px 20px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .add-btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
  `]
})
export class TodoFormComponent {
  @Output() todoAdded = new EventEmitter<void>();
  newTodoTitle = '';

  constructor(private dataService: DataService) {}

  async addTodo() {
    if (!this.newTodoTitle.trim()) return;

    try {
      await this.dataService.createTodo({
        title: this.newTodoTitle.trim(),
        completed: false
      });

      this.newTodoTitle = '';
      this.todoAdded.emit();
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('Error al agregar la tarea');
    }
  }
}
