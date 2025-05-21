import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private store: Store<{ auth: { user: any } }>,
        private router: Router
    ) { }

    canActivate(): Observable<boolean | UrlTree> {
        return this.store.select(state => state.auth.user).pipe(
            take(1),
            map(user => {
                if (user) {
                    return true;
                }
                return this.router.createUrlTree(['/login']);
            })
        );
    }
} 