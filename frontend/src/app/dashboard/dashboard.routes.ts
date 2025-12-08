import { Routes } from '@angular/router';
import { Results } from './results/results';
import { YearWiseGpa } from './year-wise-gpa/year-wise-gpa';
import { CumulativeGpa } from './cumulative-gpa/cumulative-gpa';
import { Repeats } from './repeats/repeats';

export const DASHBOARD_ROUTES: Routes = [
  { path: '', redirectTo: 'results', pathMatch: 'full' },
  { path: 'results', component: Results },
  { path: 'year-gpa', component: YearWiseGpa },
  { path: 'cumulative', component: CumulativeGpa },
  { path: 'repeats', component: Repeats }
];
