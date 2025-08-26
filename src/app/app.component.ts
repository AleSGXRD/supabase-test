import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { DbService } from './services/db.service';
import { SyncService } from './services/sync.service';
import { ConnectionService } from './services/connection.service';
import { TodoListComponent } from './components/todo-list/todo-list/todo-list.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, TodoListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  isOnline = true;

  constructor(
    private dbService: DbService,
    private syncService: SyncService,
    private connectionService: ConnectionService
  ) {}

  ngOnInit() {
    this.connectionService.isOnline$.subscribe(online => {
      this.isOnline = online;
    });
  }

  forceSync() {
    this.syncService.forceSync();
  }

}
