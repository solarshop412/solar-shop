// core/auth/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { LoginRequest, TokenResponse } from '../../../shared/models/login.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private supabase: SupabaseService) { }

  login(loginRequest: LoginRequest): Observable<TokenResponse> {
    return from(this.supabase.signIn(loginRequest.email, loginRequest.password)
      .then(response => ({
        accessToken: response.session?.access_token || ''
      })));
  }

  requestResetPassword(email: string): Observable<void> {
    return from(this.supabase.resetPassword(email).then(() => undefined));
  }

  resetPassword(email: string, token: string, newPassword: string, isNewUser: boolean): Observable<boolean> {
    // Note: Supabase handles password reset differently
    // This implementation might need to be adjusted based on your specific requirements
    return from(this.supabase.signIn(email, newPassword)
      .then(() => true)
      .catch(() => false));
  }

  logout(): Observable<void> {
    return from(this.supabase.signOut().then(() => undefined));
  }
}