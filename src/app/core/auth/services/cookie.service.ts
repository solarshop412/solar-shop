import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CookieService {
    constructor(@Inject(DOCUMENT) private document: Document) { }

    getCookie(cookieName: string): string {
        const name = cookieName + '=';
        const decodedCookie = decodeURIComponent(this.document.cookie);
        const ca = decodedCookie.split(';');
        for (let c of ca) {
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    }

    hasCookie(cookieName: string): any {
        const hasCookie = !!this.getCookie(cookieName);
        return of(hasCookie);
    }

    setCookie(cookieName: string, value: string, expiresInMinutes: number | null = null): void {
        if (value === null || value === undefined || value === '') {
            this.clear(cookieName);
            return;
        }

        const withExpiration = expiresInMinutes ? true : false;
        const expiresInMiliseconds = !expiresInMinutes ? 0 : expiresInMinutes * 60 * 1000;

        let cookie = `${encodeURIComponent(cookieName)}=${encodeURIComponent(value)};path=/;`;
        if (withExpiration) {
            const expiringDate = new Date(Date.now() + expiresInMiliseconds);
            cookie += `expires=${expiringDate.toString()};`;
        }
        if (environment.production) {
            cookie += 'secure';
        }
        this.document.cookie = cookie;
    }


    clear(cookieName: string): void {
        if (this.hasCookie(cookieName)) {
            const expires = `expires=${new Date().toUTCString()}`;
            this.document.cookie = `${encodeURIComponent(cookieName)}=${''}; ${expires}`;
        }
    }
}