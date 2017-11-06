import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NibblesComponent } from './nibbles.component';

describe('NibblesComponent', () => {
  let component: NibblesComponent;
  let fixture: ComponentFixture<NibblesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NibblesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NibblesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
