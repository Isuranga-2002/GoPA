import { Routes } from '@angular/router';
import { Results } from './results/results';
import { YearWiseGpa } from './year-wise-gpa/year-wise-gpa';
import { CumulativeGpa } from './cumulative-gpa/cumulative-gpa';
import { Repeats } from './repeats/repeats';

export const DASHBOARD_ROUTES: Routes = [
  { path: 'results', component: Results },
  { path: 'year-wise-gpa', component: YearWiseGpa },
  { path: 'cumulative-gpa', component: CumulativeGpa },
  { path: 'repeats', component: Repeats }
  // Note: Profile component will be added when created
  // { path: 'profile', component: Profile }
];
