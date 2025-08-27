import { TestBed } from '@angular/core/testing';

import { TodoManagerService } from './todo-manager.service';

describe('TodoManagerService', () => {
  let service: TodoManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
