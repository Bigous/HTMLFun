import { TestBed, inject } from '@angular/core/testing';

import { LevelsService } from './levels.service';

describe('LevelsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LevelsService]
    });
  });

  it('should be created', inject([LevelsService], (service: LevelsService) => {
    expect(service).toBeTruthy();
  }));
});
