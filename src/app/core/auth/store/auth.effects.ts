import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { AuthService } from '../services/auth.service';
import { CookieService } from '../services/cookie.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private cookieService: CookieService,
        private router: Router
    ) { }

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            mergeMap(({ loginRequest }) =>
                this.authService.login(loginRequest).pipe(
                    map(response => {
                        this.cookieService.setCookie('accessToken', response.accessToken);
                        return AuthActions.loginSuccess({
                            token: response.accessToken,
                            user: response.user
                        });
                    }),
                    catchError(error => of(AuthActions.loginFailure({ error })))
                )
            )
        )
    );

    register$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.register),
            mergeMap(({ registerRequest }) =>
                this.authService.register(registerRequest).pipe(
                    map(response => {
                        this.cookieService.setCookie('accessToken', response.accessToken);
                        return AuthActions.registerSuccess({
                            token: response.accessToken,
                            user: response.user
                        });
                    }),
                    catchError(error => of(AuthActions.registerFailure({ error })))
                )
            )
        )
    );

    loginSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginSuccess),
            tap(() => this.router.navigate(['/']))
        ),
        { dispatch: false }
    );

    registerSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.registerSuccess),
            tap(() => this.router.navigate(['/']))
        ),
        { dispatch: false }
    );

    logout$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.logout),
            tap(() => {
                this.cookieService.clear('accessToken');
                this.router.navigate(['/login']);
            }),
            map(() => AuthActions.logoutSuccess())
        )
    );

    loadUserProfile$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loadUserProfile),
            mergeMap(() =>
                this.authService.getUserProfile().pipe(
                    map(user => AuthActions.loadUserProfileSuccess({ user })),
                    catchError(error => of(AuthActions.loadUserProfileFailure({ error })))
                )
            )
        )
    );

    updateUserProfile$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.updateUserProfile),
            mergeMap(({ user }) =>
                this.authService.updateUserProfile(user).pipe(
                    map(updatedUser => AuthActions.updateUserProfileSuccess({ user: updatedUser })),
                    catchError(error => of(AuthActions.updateUserProfileFailure({ error })))
                )
            )
        )
    );

    checkAuthToken$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.checkAuthToken),
            mergeMap(() => {
                const token = this.cookieService.getCookie('accessToken');
                if (token) {
                    return this.authService.validateToken(token).pipe(
                        map(response => AuthActions.loginSuccess({
                            token,
                            user: response.user
                        })),
                        catchError(() => {
                            this.cookieService.clear('accessToken');
                            return of(AuthActions.clearAuthToken());
                        })
                    );
                } else {
                    return of(AuthActions.clearAuthToken());
                }
            })
        )
    );

    forgotPassword$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.sendResetPasswordEmail),
            switchMap(action =>
                this.authService.requestResetPassword(action.email).pipe(
                    map(() => AuthActions.sendResetPasswordEmailSuccess()),
                    catchError(error => of(AuthActions.sendResetPasswordEmailFailure({ error })))
                )
            )
        )
    );

    resetPassword$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.resetPasswordRequest),
            mergeMap(action =>
                this.authService.resetPassword(action.email, action.token, action.newPassword, action.isNewUser).pipe(
                    map(() => AuthActions.resetPasswordSuccess()),
                    catchError(error => of(AuthActions.resetPasswordFailure({ error })))
                )
            )
        )
    );

    resetPasswordSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.resetPasswordSuccess),
            tap(() => setTimeout(() => {
                this.router.navigate(['/login']);
            }, 3000))
        ),
        { dispatch: false }
    );
}
