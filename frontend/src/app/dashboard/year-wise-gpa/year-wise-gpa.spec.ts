import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearWiseGpa } from './year-wise-gpa';

describe('YearWiseGpa', () => {
  let component: YearWiseGpa;
  let fixture: ComponentFixture<YearWiseGpa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearWiseGpa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YearWiseGpa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
