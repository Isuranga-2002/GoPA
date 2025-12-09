import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  // Admin credentials
  private readonly ADMIN_USERNAME = 'admin1@gopa';
  private readonly ADMIN_PASSWORD = 'qrs%253QT!#@$';

  constructor() {
    this.initializeForm();
  }

  initializeForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    // Clear previous error message
    this.errorMessage = '';

    // Check if form is invalid
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    const { username, password } = this.loginForm.value;

    // Check for admin credentials
    if (username === this.ADMIN_USERNAME && password === this.ADMIN_PASSWORD) {
      // Store admin token in localStorage
      localStorage.setItem('authToken', 'admin-token-' + Date.now());
      localStorage.setItem('userRole', 'admin');
      this.router.navigate(['/admin']);
      return;
    }

    // Send login request to backend for student credentials
    this.isLoading = true;
    this.http.post<{ message: string; token: string; user: any }>(`${environment.apiUrl}/auth/login`, {
      username,
      password
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Store token and role in localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userRole', 'student');
        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      }
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}

