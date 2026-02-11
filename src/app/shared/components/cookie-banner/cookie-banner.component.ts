import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss']
})
export class CookieBannerComponent implements OnInit {
  showBanner = false;
  private readonly COOKIE_CONSENT_KEY = 'cookie-consent';
  private readonly COOKIE_CONSENT_ACCEPTED = 'accepted';
  private readonly COOKIE_CONSENT_REJECTED = 'rejected';

  ngOnInit(): void {
    this.checkCookieConsent();
  }

  private checkCookieConsent(): void {
    const consent = localStorage.getItem(this.COOKIE_CONSENT_KEY);
    
    // Show banner only if user hasn't made a choice yet
    if (!consent) {
      this.showBanner = true;
    }
  }

  acceptCookies(): void {
    localStorage.setItem(this.COOKIE_CONSENT_KEY, this.COOKIE_CONSENT_ACCEPTED);
    this.showBanner = false;
    
    // Enable analytics or other cookie-based features here
    this.enableCookies();
  }

  rejectCookies(): void {
    localStorage.setItem(this.COOKIE_CONSENT_KEY, this.COOKIE_CONSENT_REJECTED);
    this.showBanner = false;
    
    // Disable analytics or other cookie-based features here
    this.disableCookies();
  }

  private enableCookies(): void {
    // Enable Google Analytics, Facebook Pixel, etc.
    // This is where you would initialize your tracking scripts
    console.log('Cookies accepted - enabling tracking');
    
    // Example: Initialize Google Analytics
    // if (typeof gtag !== 'undefined') {
    //   gtag('consent', 'update', {
    //     'analytics_storage': 'granted',
    //     'ad_storage': 'granted'
    //   });
    // }
  }

  private disableCookies(): void {
    // Disable tracking scripts
    console.log('Cookies rejected - disabling tracking');
    
    // Example: Disable Google Analytics
    // if (typeof gtag !== 'undefined') {
    //   gtag('consent', 'update', {
    //     'analytics_storage': 'denied',
    //     'ad_storage': 'denied'
    //   });
    // }
  }

  // Public method to check if cookies are accepted
  static areCookiesAccepted(): boolean {
    return localStorage.getItem('cookie-consent') === 'accepted';
  }
}