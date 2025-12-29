import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private cdr = inject(ChangeDetectorRef);

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
    
    // Debug current state
    console.log('🚀 Register component initialized');
    this.logCurrentState();
  }

  // Debug method to log current state
  logCurrentState(): void {
    console.log('📊 Current State:', {
      currentStep: this.currentStep,
      isLoading: this.isLoading,
      otpSent: this.otpSent,
      otpVerified: this.otpVerified,
      privacyAgreed: this.privacyAgreed,
      userEmail: this.userEmail,
      errorMessage: this.errorMessage,
      successMessage: this.successMessage
    });
  }

  // Debug method to force step change (remove after fixing)
  forceStepChange(step: number): void {
    console.log('🔧 Forcing step change to:', step);
    this.currentStep = step;
    this.cdr.detectChanges();
    this.logCurrentState();
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
    // if (!email.endsWith('@std.foc.sab.ac.lk')) {
    //   return { invalidEmailDomain: true };
    // }
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
    console.log('🚀 Starting form submission...');
    this.logCurrentState();
    
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
    this.isLoading = true;

    console.log('📧 Sending OTP to:', email);

    // Send OTP to email
    this.http.post<{ message: string }>('http://localhost:3000/api/auth/send-otp', { email }).subscribe({
      next: (response) => {
        console.log('✅ OTP sent successfully:', response);
        
        // Update state immediately
        this.isLoading = false;
        this.otpSent = true;
        this.errorMessage = '';
        this.successMessage = response.message || 'OTP sent to your email. Please check your inbox.';
        
        // Force step change
        this.currentStep = 2;
        console.log('✅ Step changed to:', this.currentStep);
        this.logCurrentState();
        
        // Multiple change detection attempts
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        
        // Also try with microtask
        Promise.resolve().then(() => {
          this.cdr.detectChanges();
          console.log('🔄 After Promise resolve - Current step:', this.currentStep);
        });
      },
      error: (error) => {
        console.error('❌ Error sending OTP:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to send OTP. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  // Step 2: Verify OTP
  verifyOtp(): void {
    console.log('🔍 Starting OTP verification...');
    this.errorMessage = '';
    this.successMessage = '';

    if (this.otpForm.invalid) {
      this.errorMessage = 'Please enter a valid OTP.';
      return;
    }

    const { otp } = this.otpForm.value;
    console.log('📧 Verifying OTP:', otp, 'for email:', this.userEmail);

    this.isLoading = true;
    this.http.post<{ message: string }>('http://localhost:3000/api/auth/verify-otp', { 
      email: this.userEmail, 
      otp 
    }).subscribe({
      next: (response) => {
        console.log('✅ OTP Verified:', response.message);
        this.isLoading = false;
        this.verifyStudentCredentials();
      },
      error: (error) => {
        console.error('❌ OTP verification error:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Invalid OTP. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  // Verify student index and email in the system
  verifyStudentCredentials(): void {
    console.log('🔍 Verifying student credentials...');
    this.isLoading = true;
    
    this.http.post<{ message: string }>('http://localhost:3000/api/auth/verify-student', { 
      index: this.userIndex,
      email: this.userEmail 
    }).subscribe({
      next: (response) => {
        console.log('✅ Student verified:', response.message);
        this.isLoading = false;
        this.otpVerified = true;
        this.currentStep = 3;
        this.successMessage = response.message + 
          ' Please agree to the Privacy Policy to complete registration.';
        
        // Clear any previous errors
        this.errorMessage = '';
        
        // Force UI update with timeout
        setTimeout(() => {
          this.cdr.detectChanges();
          console.log('✅ Current step updated to:', this.currentStep);
        }, 100);
      },
      error: (error) => {
        console.error('❌ Student verification error:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Your credentials are not authorized for registration.';
        this.cdr.detectChanges();
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
