import { TestBed } from '@angular/core/testing';

import { MainStreamService } from './main-stream.service';

describe('MainStreamService', () => {
  let service: MainStreamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainStreamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
