import { Injectable } from "@angular/core";
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { CookieService } from "../services/cookie.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class LoginGuard {

  constructor(private readonly cookieService: CookieService,
    private readonly router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkLoginState();
  }

  private checkLoginState(): Observable<boolean> {
    return this.cookieService.hasCookie('accessToken').pipe(
      map(hasToken => {
        if (hasToken) {
          this.router.navigate(['']);
          return false;
        } else {
          return true;
        }
      })
    );
  }
}