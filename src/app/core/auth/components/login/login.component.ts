// core/auth/login.component.ts
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../services/supabase.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { LoginRequest } from '../../../../shared/models/auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  imports: [CommonModule, RouterModule, LoaderComponent, ReactiveFormsModule],
  providers: [],
})
export class LoginComponent {
  showPassword = false;
  loading = false;
  errorMessage = '';
  loginForm: FormGroup;

  constructor(
    private supabaseService: SupabaseService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const loginRequest: LoginRequest = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      try {
        const response = await this.supabaseService.signIn(loginRequest);

        if (response.error) {
          this.errorMessage = response.error;
        } else if (response.user) {
          // Redirect to dashboard or home page
          this.router.navigate(['/']);
        }
      } catch (error: any) {
        this.errorMessage = error.message || 'An error occurred during login';
      } finally {
        this.loading = false;
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.loginForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return 'Password must be at least 6 characters long';
      }
    }
    return '';
  }
}
