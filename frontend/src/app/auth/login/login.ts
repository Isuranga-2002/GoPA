import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
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
    
    // Add real-time validation to show errors immediately
    this.loginForm.valueChanges.subscribe(() => {
      // Clear error message when user starts typing
      if (this.errorMessage && !this.isLoading) {
        this.errorMessage = '';
      }
    });
  }

  onSubmit(): void {
    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';

    // Check if form is invalid
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      this.errorMessage = 'Please fill in all required fields correctly';
      return;
    }

    const { username, password } = this.loginForm.value;

    // Validate that values are not empty or null
    if (!username?.trim() || !password?.trim()) {
      this.errorMessage = 'Username and password cannot be empty';
      return;
    }

    console.log('Attempting login with:', { username, password: '***' });

    // Check for admin credentials FIRST to avoid unnecessary HTTP requests
    if (username === this.ADMIN_USERNAME && password === this.ADMIN_PASSWORD) {
      // Store admin token in localStorage
      this.successMessage = 'Admin login successful! Redirecting...';
      localStorage.setItem('authToken', 'admin-token-' + Date.now());
      localStorage.setItem('userRole', 'admin');
      setTimeout(() => this.router.navigate(['/admin']), 500);
      return;
    }

    // For student credentials, immediately check if they look valid before making HTTP request
    if (!username.includes('@') && !username.match(/^[a-zA-Z0-9]+$/)) {
      this.errorMessage = 'Please enter a valid username format';
      return;
    }

    // Send login request to backend for student credentials
    this.isLoading = true;
    const loginData = {
      username: username.trim(),
      password: password.trim()
    };

    console.log('Sending login request to:', `${environment.apiUrl}/auth/login`);
    
    // Add timeout to prevent long waits  
    this.http.post<{ message: string; token: string; user: any }>(
      `${environment.apiUrl}/auth/login`, 
      loginData,
      { 
        headers: { 'Content-Type': 'application/json' }
      }
    )
    .pipe(
      timeout(3000) // 3 second timeout for faster feedback
    )
    .subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isLoading = false;
        // Store token and role in localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userRole', response.user?.role || 'student');
        // Navigate to appropriate dashboard
        if (response.user?.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          url: error.url
        });
        
        // Clear any success messages
        this.successMessage = '';
        
        // Handle timeout errors specifically for faster feedback
        if (error.name === 'TimeoutError') {
          this.errorMessage = 'Request timed out. Server may be slow, please try again.';
          return;
        }
        
        if (error.status === 0) {
          this.errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.status === 401) {
          this.errorMessage = 'Invalid username or password. Check Caps Lock and try again.';
        } else if (error.status === 400) {
          this.errorMessage = (error.error?.message || 'Invalid request. Please check your input.');
        } else if (error.status === 404) {
          this.errorMessage = 'Login service not found. Please contact support.';
        } else if (error.status >= 500) {
          this.errorMessage = 'Server error. Please try again in a few minutes.';
        } else {
          this.errorMessage = (error.error?.message || 'Login failed. Please try again.');
        }
      }
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}

