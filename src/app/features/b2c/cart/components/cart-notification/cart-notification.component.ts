import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter, distinctUntilChanged } from 'rxjs';
import * as CartSelectors from '../../store/cart.selectors';
import { TranslatePipe } from "../../../../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-cart-notification',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './cart-notification.component.html',
  styleUrls: ['./cart-notification.component.scss']
})
export class CartNotificationComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  showNotification = false;
  private previousItemCount = 0;
  private notificationTimeout?: number;

  constructor() {
    // Watch for cart item count changes with better debouncing
    this.store.select(CartSelectors.selectCartItemCount)
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        filter(count => count !== null && count !== undefined)
      )
      .subscribe(count => {
        // Only show notification if count actually increased
        if (count > this.previousItemCount && this.previousItemCount > 0) {
          this.showSuccessNotification();
        }
        this.previousItemCount = count;
      });
  }

  ngOnInit() {
    // Component initialization logic can go here if needed
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  }

  private showSuccessNotification() {
    // Clear any existing timeout
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    this.showNotification = true;

    // Hide notification after 3 seconds
    this.notificationTimeout = window.setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }
} 