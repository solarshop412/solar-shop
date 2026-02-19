import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-b2b-checkout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TranslatePipe],
  templateUrl: './b2b-checkout.component.html',
  styleUrls: ['./b2b-checkout.component.scss'],
})
export class B2bCheckoutComponent implements OnInit, OnDestroy {
  currentStep = 1;
  private destroy$ = new Subject<void>();

  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    // Listen to route changes to update current step
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event: NavigationEnd) => {
        console.log('B2B Checkout: Navigation to:', event.url);
        this.updateCurrentStep(event.url);
        this.cdr.detectChanges();
      });

    // Set initial step based on current URL
    this.updateCurrentStep(this.router.url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateCurrentStep(url: string): void {
    console.log('B2B Checkout: Updating step for URL:', url);

    let newStep = 1; // Default to step 1

    if (
      url.includes('/order-review') ||
      url.endsWith('/checkout') ||
      url.includes('/b2b-checkout')
    ) {
      newStep = 1;
    } else if (url.includes('/shipping')) {
      newStep = 2;
    } else if (url.includes('/payment')) {
      newStep = 3;
    }

    if (this.currentStep !== newStep) {
      console.log(
        'B2B Checkout: Step changed from',
        this.currentStep,
        'to',
        newStep,
      );
      this.currentStep = newStep;
    }
  }

  getStepClass(step: number): string {
    if (this.currentStep > step) {
      return 'bg-green-600 text-white'; // Completed
    } else if (this.currentStep === step) {
      return 'bg-solar-500 text-white'; // Current
    } else {
      return 'bg-gray-300 text-gray-600'; // Upcoming
    }
  }

  getStepTextClass(step: number): string {
    if (this.currentStep > step) {
      return 'text-green-600'; // Completed
    } else if (this.currentStep === step) {
      return 'text-solar-600'; // Current
    } else {
      return 'text-gray-600'; // Upcoming
    }
  }

  getConnectorClass(step: number): string {
    if (this.currentStep > step) {
      return 'bg-green-600'; // Completed
    } else {
      return 'bg-gray-300'; // Not completed
    }
  }
}
