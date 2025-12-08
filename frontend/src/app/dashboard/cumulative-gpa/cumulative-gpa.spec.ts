import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CumulativeGpa } from './cumulative-gpa';

describe('CumulativeGpa', () => {
  let component: CumulativeGpa;
  let fixture: ComponentFixture<CumulativeGpa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CumulativeGpa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CumulativeGpa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
