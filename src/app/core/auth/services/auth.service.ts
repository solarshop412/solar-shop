// core/auth/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from '../../../services/supabase.service';
import { LoginRequest, TokenResponse, RegisterRequest, RegisterResponse, ValidateTokenResponse } from '../../../shared/models/login.model';
import { User } from '../../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private supabase: SupabaseService) { }

  login(loginRequest: LoginRequest): Observable<TokenResponse> {
    return from(this.supabase.signIn(loginRequest.email, loginRequest.password)
      .then(response => {
        // Create a mock user for now - in real implementation, this would come from the backend
        const mockUser: User = {
          id: response.user?.id || '',
          email: response.user?.email || loginRequest.email,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: {
            id: '1',
            name: 'customer',
            permissions: [],
            isDefault: true,
            isActive: true
          },
          status: {
            isActive: true,
            isBlocked: false,
            isSuspended: false
          },
          preferences: {
            language: 'en',
            timezone: 'UTC',
            currency: 'EUR',
            theme: 'light',
            notifications: {
              email: {
                orderUpdates: true,
                promotions: true,
                newsletter: true,
                security: true,
                productUpdates: true
              },
              sms: {
                orderUpdates: true,
                security: true,
                promotions: false
              },
              push: {
                orderUpdates: true,
                promotions: false,
                reminders: true
              }
            },
            privacy: {
              profileVisibility: 'private',
              showEmail: false,
              showPhone: false,
              allowDataCollection: true,
              allowPersonalization: true,
              allowThirdPartySharing: false
            },
            marketing: {
              allowEmailMarketing: true,
              allowSmsMarketing: false,
              allowPushMarketing: true,
              interests: [],
              preferredContactTime: 'anytime'
            }
          },
          addresses: [],
          paymentMethods: [],
          socialLogins: [],
          emailVerified: true,
          phoneVerified: false,
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return {
          accessToken: response.session?.access_token || '',
          user: mockUser
        };
      }));
  }

  register(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return from(this.supabase.signUp(registerRequest.email, registerRequest.password)
      .then(response => {
        // Create a mock user for now - in real implementation, this would come from the backend
        const mockUser: User = {
          id: response.user?.id || '',
          email: response.user?.email || registerRequest.email,
          firstName: registerRequest.firstName,
          lastName: registerRequest.lastName,
          fullName: `${registerRequest.firstName} ${registerRequest.lastName}`,
          phone: registerRequest.phone,
          role: {
            id: '1',
            name: 'customer',
            permissions: [],
            isDefault: true,
            isActive: true
          },
          status: {
            isActive: true,
            isBlocked: false,
            isSuspended: false
          },
          preferences: {
            language: 'en',
            timezone: 'UTC',
            currency: 'EUR',
            theme: 'light',
            notifications: {
              email: {
                orderUpdates: true,
                promotions: true,
                newsletter: true,
                security: true,
                productUpdates: true
              },
              sms: {
                orderUpdates: true,
                security: true,
                promotions: false
              },
              push: {
                orderUpdates: true,
                promotions: false,
                reminders: true
              }
            },
            privacy: {
              profileVisibility: 'private',
              showEmail: false,
              showPhone: false,
              allowDataCollection: true,
              allowPersonalization: true,
              allowThirdPartySharing: false
            },
            marketing: {
              allowEmailMarketing: true,
              allowSmsMarketing: false,
              allowPushMarketing: true,
              interests: [],
              preferredContactTime: 'anytime'
            }
          },
          addresses: [{
            id: '1',
            type: 'both',
            isDefault: true,
            firstName: registerRequest.firstName,
            lastName: registerRequest.lastName,
            addressLine1: registerRequest.address,
            city: '',
            state: '',
            postalCode: '',
            country: 'Italy',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }],
          paymentMethods: [],
          socialLogins: [],
          emailVerified: false,
          phoneVerified: false,
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return {
          accessToken: response.session?.access_token || '',
          user: mockUser
        };
      }));
  }

  getUserProfile(): Observable<User> {
    // Mock implementation - in real app, this would fetch from backend
    return of({
      id: '1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      role: {
        id: '1',
        name: 'customer',
        permissions: [],
        isDefault: true,
        isActive: true
      },
      status: {
        isActive: true,
        isBlocked: false,
        isSuspended: false
      },
      preferences: {
        language: 'en',
        timezone: 'UTC',
        currency: 'EUR',
        theme: 'light',
        notifications: {
          email: {
            orderUpdates: true,
            promotions: true,
            newsletter: true,
            security: true,
            productUpdates: true
          },
          sms: {
            orderUpdates: true,
            security: true,
            promotions: false
          },
          push: {
            orderUpdates: true,
            promotions: false,
            reminders: true
          }
        },
        privacy: {
          profileVisibility: 'private',
          showEmail: false,
          showPhone: false,
          allowDataCollection: true,
          allowPersonalization: true,
          allowThirdPartySharing: false
        },
        marketing: {
          allowEmailMarketing: true,
          allowSmsMarketing: false,
          allowPushMarketing: true,
          interests: [],
          preferredContactTime: 'anytime'
        }
      },
      addresses: [],
      paymentMethods: [],
      socialLogins: [],
      emailVerified: true,
      phoneVerified: false,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  updateUserProfile(user: Partial<User>): Observable<User> {
    // Mock implementation - in real app, this would update in backend
    return this.getUserProfile();
  }

  validateToken(token: string): Observable<ValidateTokenResponse> {
    // Mock implementation - in real app, this would validate with backend
    return this.getUserProfile().pipe(
      map(user => ({ user, valid: true }))
    );
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