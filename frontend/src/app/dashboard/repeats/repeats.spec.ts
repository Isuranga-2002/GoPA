import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Repeats } from './repeats';

describe('Repeats', () => {
  let component: Repeats;
  let fixture: ComponentFixture<Repeats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Repeats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Repeats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
