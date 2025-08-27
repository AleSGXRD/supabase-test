import { TestBed } from '@angular/core/testing';

import { TodoDexieService } from './todo-dexie.service';

describe('TodoDexieService', () => {
  let service: TodoDexieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoDexieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
