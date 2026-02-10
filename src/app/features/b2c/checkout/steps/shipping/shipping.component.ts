import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { selectCurrentUser } from '../../../../../core/auth/store/auth.selectors';
import { User } from '../../../../../shared/models/user.model';

@Component({
  selector: 'app-shipping',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss']
})
export class ShippingComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  shippingForm: FormGroup;
  currentUser: User | null = null;

  constructor() {
    this.shippingForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      country: ['', [Validators.required]],
      shippingOption: ['pickup_at_storage', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Subscribe to current user and pre-populate form fields if logged in
    this.store.select(selectCurrentUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.shippingForm.patchValue({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || ''
          });
          // Disable email field for authenticated users
          if (user.email) {
            this.shippingForm.get('email')?.disable();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    // Ensure cart items are still available for checkout
    const checkoutItems = localStorage.getItem('checkoutItems');
    if (!checkoutItems) {
      console.error('No checkout items found. Redirecting to cart.');
      this.router.navigate(['/blagajna/pregled-narudzbe']);
      return;
    }

    // Save shipping information to localStorage for payment step
    const shippingData = this.shippingForm.value;
    localStorage.setItem('shippingInfo', JSON.stringify(shippingData));

    this.router.navigate(['/blagajna/placanje']);
  }

  goBack() {
    this.router.navigate(['/blagajna/pregled-narudzbe']);
  }
} 