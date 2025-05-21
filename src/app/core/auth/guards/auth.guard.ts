import { Injectable } from "@angular/core";
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Store, select } from "@ngrx/store";
import { CookieService } from "../services/cookie.service";
import { getLoggedIn, getToken } from "../store/auth.selectors";

@Injectable({ providedIn: 'root' })
export class AuthGuard {

  loggedIn$!: Observable<boolean>;

  constructor(
    private store$: Store,
    private readonly router: Router,
    private cookieService: CookieService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const token = this.cookieService.getCookie('accessToken');
    return this.store$.select(getToken).pipe(
      map(stateToken => {
        const tokenToCheck = stateToken || token;
        if (tokenToCheck) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }

}