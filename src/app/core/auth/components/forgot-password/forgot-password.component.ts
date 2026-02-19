import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { State } from '../../../../reducers';
import { sendResetPasswordEmail } from '../../store/auth.actions';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoaderComponent,
    TranslatePipe,
    ReactiveFormsModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  loading$: Observable<boolean>;
  resetPasswordRequestSent = false;
  resetPasswordMessage: string | null = null;
  errorMessage: string | null = null;
  forgotPwdForm: FormGroup;

  constructor(
    private store: Store<State>,
    private fb: FormBuilder,
  ) {
    this.loading$ = this.store.pipe(select((state) => state.auth.loading));

    this.forgotPwdForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.forgotPwdForm.get('email');
  }

  onResetPassword(email: string): void {
    this.resetPasswordRequestSent = true;
    this.resetPasswordMessage =
      'We have sent password reset instructions to your email. Please check your inbox.';
    this.errorMessage = null; // Clear any previous errors
    this.store.dispatch(sendResetPasswordEmail({ email }));
  }
}
