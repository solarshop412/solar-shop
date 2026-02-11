import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCurrentUser } from '../../../core/auth/store/auth.selectors';
import { User } from '../../../shared/models/user.model';
import * as AuthActions from '../../../core/auth/store/auth.actions';
import { TranslationService, SupportedLanguage } from '../../../shared/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AdminNotificationsService, NotificationCounts } from '../shared/services/admin-notifications.service';
import { SettingsService } from '../../../shared/services/settings.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, TranslatePipe],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  private store = inject(Store);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private notificationsService = inject(AdminNotificationsService);
  private settingsService = inject(SettingsService);

  currentUser$: Observable<User | null>;
  notificationCounts$: Observable<NotificationCounts>;
  currentLanguage: SupportedLanguage = 'hr';
  showEmailTest = false;
  creditCardPaymentEnabled = true;
  orderingEnabled = true;

  constructor() {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.notificationCounts$ = this.notificationsService.getNotificationCounts();
    this.currentLanguage = this.translationService.getCurrentLanguage();

    // Subscribe to settings changes
    this.settingsService.settings$.subscribe(settings => {
      this.creditCardPaymentEnabled = settings.credit_card_payment_enabled;
      this.orderingEnabled = settings.ordering_enabled;
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Show Email Test option when Shift+L is pressed
    if (event.shiftKey && event.key === 'L' && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      this.showEmailTest = !this.showEmailTest;
      console.log('Email Test visibility toggled:', this.showEmailTest);
    }
  }

  viewSite(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  onLanguageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const language = target.value as SupportedLanguage;
    this.translationService.setLanguage(language);
    this.currentLanguage = language;
  }

  refreshNotifications(): void {
    this.notificationsService.refreshCounts();
  }

  async toggleCreditCardPayment(): Promise<void> {
    const newValue = !this.creditCardPaymentEnabled;
    const success = await this.settingsService.updateCreditCardPaymentEnabled(newValue);

    if (success) {
      console.log('[Admin] Credit card payment toggled:', newValue);
    } else {
      console.error('[Admin] Failed to toggle credit card payment');
    }
  }

  async toggleOrdering(): Promise<void> {
    const newValue = !this.orderingEnabled;
    const success = await this.settingsService.updateOrderingEnabled(newValue);

    if (success) {
      console.log('[Admin] Ordering toggled:', newValue);
    } else {
      console.error('[Admin] Failed to toggle ordering');
    }
  }
} 