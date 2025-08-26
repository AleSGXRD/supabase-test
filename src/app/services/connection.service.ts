import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public isOnline$ = this.isOnlineSubject.asObservable();

  constructor() {
    this.setupConnectionMonitoring();
  }

  private setupConnectionMonitoring(): void {
    // Monitorear eventos de conexión/desconexión
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false)),
      of(navigator.onLine)
    ).subscribe((isOnline) => {
      this.isOnlineSubject.next(isOnline);
      console.log('Estado de conexión:', isOnline ? 'Online' : 'Offline');
    });
  }

  public get isOnline(): boolean {
    return this.isOnlineSubject.value;
  }
}
