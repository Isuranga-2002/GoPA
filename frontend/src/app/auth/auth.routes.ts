import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { PrivacyPolicy } from './privacy-policy/privacy-policy';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'privacy', component: PrivacyPolicy }
];
