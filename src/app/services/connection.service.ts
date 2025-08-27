import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  public isOnline$ = new BehaviorSubject<boolean>(navigator.onLine);

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
      this.isOnline$.next(isOnline);
      console.log(this.isOnline$.value)
      console.log('Estado de conexión:', isOnline ? 'Online' : 'Offline');
    });
  }
}
