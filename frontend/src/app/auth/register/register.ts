import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  // Form groups for each step
  registrationForm!: FormGroup;
  otpForm!: FormGroup;
  
  // State management
  currentStep: number = 1; // 1: Registration, 2: OTP, 3: Privacy Policy
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  otpSent: boolean = false;
  otpVerified: boolean = false;
  privacyAgreed: boolean = false;
  
  // Store user data between steps
  userEmail: string = '';
  userIndex: string = '';
  userName: string = '';
  userPassword: string = '';
  
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    this.initializeRegistrationForm();
    this.initializeOtpForm();
  }

  initializeRegistrationForm(): void {
    this.registrationForm = this.fb.group({
      username: ['', [Validators.required]],
      indexNumber: ['', [Validators.required, Validators.pattern(/^21cse0/i)]],
      email: ['', [Validators.required, this.emailValidator.bind(this)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  initializeOtpForm(): void {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Custom validator for university email domain
  emailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (!email) {
      return null;
    }
    if (!email.endsWith('@std.foc.sab.ac.lk')) {
      return { invalidEmailDomain: true };
    }
    return null;
  }

  // Validator to check if passwords match
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // Step 1: Submit registration form and send OTP
  submitRegistrationForm(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registrationForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    const { username, indexNumber, email, password } = this.registrationForm.value;
    
    // Store user data for later steps
    this.userName = username;
    this.userIndex = indexNumber;
    this.userEmail = email;
    this.userPassword = password;

    // Send OTP to email
    this.isLoading = true;
    this.http.post('http://localhost:3000/api/auth/send-otp', { email }).subscribe({
      next: () => {
        this.isLoading = false;
        this.otpSent = true;
        this.currentStep = 2;
        this.successMessage = 'OTP sent to your email. Please check your inbox.';
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error sending OTP:', error);
        this.errorMessage = 'Failed to send OTP. Please try again.';
      }
    });
  }

  // Step 2: Verify OTP
  verifyOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.otpForm.invalid) {
      this.errorMessage = 'Please enter a valid OTP.';
      return;
    }

    const { otp } = this.otpForm.value;

    this.isLoading = true;
    this.http.post('http://localhost:3000/api/auth/verify-otp', { 
      email: this.userEmail, 
      otp 
    }).subscribe({
      next: () => {
        this.isLoading = false;
        // Verify student credentials
        this.verifyStudentCredentials();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('OTP verification error:', error);
        this.errorMessage = 'Invalid OTP. Please try again.';
      }
    });
  }

  // Verify student index and email in the system
  verifyStudentCredentials(): void {
    this.isLoading = true;
    this.http.post('http://localhost:3000/api/auth/verify-student', { 
      index: this.userIndex,
      email: this.userEmail 
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.otpVerified = true;
        this.currentStep = 3;
        this.successMessage = 'OTP verified successfully! Please agree to the Privacy Policy to complete registration.';
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Student verification error:', error);
        this.errorMessage = 'Your credentials are not authorized for registration.';
      }
    });
  }

  // Step 3: Complete registration
  completeRegistration(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.privacyAgreed) {
      this.errorMessage = 'Please agree to the Privacy and Policy Agreement to continue.';
      return;
    }

    this.isLoading = true;
    this.http.post('http://localhost:3000/api/auth/register', {
      username: this.userName,
      index: this.userIndex,
      email: this.userEmail,
      password: this.userPassword
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = 'Registration successful! Redirecting to dashboard...';
        
        // Store token and auto-login
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('userRole', 'student');
        }

        // Redirect to dashboard after short delay
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        this.errorMessage = 'Registration failed. Please try again.';
      }
    });
  }

  // Utility getters for template
  get username() {
    return this.registrationForm.get('username');
  }

  get indexNumber() {
    return this.registrationForm.get('indexNumber');
  }

  get email() {
    return this.registrationForm.get('email');
  }

  get password() {
    return this.registrationForm.get('password');
  }

  get confirmPassword() {
    return this.registrationForm.get('confirmPassword');
  }

  get otp() {
    return this.otpForm.get('otp');
  }

  // Go back to previous step
  goBack(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.currentStep > 1) {
      this.currentStep--;
      if (this.currentStep === 1) {
        this.otpSent = false;
        this.otpVerified = false;
      }
    }
  }
}
