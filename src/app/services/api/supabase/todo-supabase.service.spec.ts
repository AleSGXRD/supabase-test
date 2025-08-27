import { TestBed } from '@angular/core/testing';

import { TodoSupabaseService } from './todo-supabase.service';

describe('TodoSupabaseService', () => {
  let service: TodoSupabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoSupabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
