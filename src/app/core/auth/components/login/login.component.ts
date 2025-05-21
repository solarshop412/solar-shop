// core/auth/login.component.ts
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as AuthActions from '../../store/auth.actions';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { State } from '../../../../reducers';
import { LoaderComponent } from '../../../../shared/models/components/loader/loader.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  imports: [CommonModule, RouterModule, LoaderComponent],
  providers: [],
})
export class LoginComponent {
  showPassword = false;
  loading$: Observable<boolean>;

  constructor(private store: Store<State>) {
    this.loading$ = this.store.pipe(select(state => state.auth.loading));
  }

  login(email: string, password: string): void {
    this.store.dispatch(AuthActions.login({ loginRequest: { email, password } }));
  }

  onSignIn(email: string, password: string): void {
    if (email && password) {
      this.login(email, password);
    } else {
      // Handle form validation error
      console.error('Username and password are required');
    }
  }
}
