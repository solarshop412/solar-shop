// core/auth/login.component.ts
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import * as AuthActions from '../../store/auth.actions';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { State } from '../../../../reducers';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

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
  loading$: Observable<boolean>;
  loginForm: FormGroup;

  constructor(
    private store: Store<State>,
    private fb: FormBuilder
  ) {
    this.loading$ = this.store.pipe(select(state => state.auth.loading));

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login(email: string, password: string): void {
    this.store.dispatch(AuthActions.login({ loginRequest: { email, password } }));
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;
      this.login(email, password);
    } else {
      // Mark all fields as touched to show validation errors
      this.loginForm.markAllAsTouched();
      console.error('Please fill in all required fields correctly');
    }
  }

  onSignIn(email: string, password: string): void {
    if (this.loginForm.valid) {
      this.login(email, password);
    } else {
      // Mark all fields as touched to show validation errors
      this.loginForm.markAllAsTouched();
      console.error('Please fill in all required fields correctly');
    }
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
