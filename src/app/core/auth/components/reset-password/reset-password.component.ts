import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthState } from '../../store/auth.state';
import { Store, select } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { resetPasswordRequest } from '../../store/auth.actions';
import { selectAuthError, selectAuthLoading, selectPasswordResetSuccessMessage } from '../../store/auth.selectors';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, LoaderComponent, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  token!: string;
  email!: string;
  isNewUser = false;
  loading$!: Observable<boolean>;
  passwordResetSuccessMessage$!: Observable<string | null>;
  error$!: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private store: Store<AuthState>
  ) {
  }

  ngOnInit(): void {
    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
    this.passwordResetSuccessMessage$ = this.store.select(selectPasswordResetSuccessMessage);

    this.route.queryParams.subscribe(params => {
      if (params['new'] != null) {
        this.isNewUser = params['new'] === 'true';
      }
      this.token = params['token'];
      this.email = params['email'];
    });

    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  get password() {
    return this.resetPasswordForm.get('password');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { 'mismatch': true };
  }

  onResetPassword() {
    if (this.resetPasswordForm.valid) {
      const password = this.password?.value;
      this.store.dispatch(resetPasswordRequest({ email: this.email, token: this.token, newPassword: password, isNewUser: this.isNewUser }));
    }
  }
}
