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
        login$ = createEffect(() => {
            return this.actions$.pipe(
                ofType(AuthActions.login),
                mergeMap(({ loginRequest }) =>
                    this.authService.login(loginRequest).pipe(
                        map(response => {
                            this.cookieService.setCookie('accessToken', response.accessToken);
                            return AuthActions.loginSuccess({ token: response.accessToken });
                        }),
                        catchError(error => of(AuthActions.loginFailure({ error })))
                    )
                )
            );
        });

    loginSuccess$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.loginSuccess),
            tap(() => this.router.navigate(['/home']))
        );
    },
        { dispatch: false }
    ); logout$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.logout),
            tap(() => {
                this.cookieService.clear('accessToken');
                this.router.navigate(['/login']);
            }),
            map(() => AuthActions.logoutSuccess())
        );
    });

    forgotPassword$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.sendResetPasswordEmail),
            switchMap(action =>
                this.authService.requestResetPassword(action.email).pipe(
                    map(() => AuthActions.sendResetPasswordEmailSuccess()),
                    catchError(error => of(AuthActions.sendResetPasswordEmailFailure({ error })))
                )
            )
        );
    }); resetPassword$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.resetPasswordRequest),
            mergeMap(action =>
                this.authService.resetPassword(action.email, action.token, action.newPassword, action.isNewUser).pipe(
                    map(() => AuthActions.resetPasswordSuccess()),
                    catchError(error => of(AuthActions.resetPasswordFailure({ error })))
                )
            )
        );
    });

    resetPasswordSuccess$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.resetPasswordSuccess),
            tap(() => setTimeout(() => {
                this.router.navigate(['/login']);
            }, 3000))
        );
    },
        { dispatch: false }
    );

    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private cookieService: CookieService,
        private router: Router) { }
}
