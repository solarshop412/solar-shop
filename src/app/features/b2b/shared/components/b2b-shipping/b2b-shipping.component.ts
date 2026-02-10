import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { B2BShippingInfo } from '../../../cart/models/b2b-cart.model';
import { selectCurrentUser } from '../../../../../core/auth/store/auth.selectors';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-b2b-shipping',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './b2b-shipping.component.html',
  styleUrls: ['./b2b-shipping.component.scss']
})
export class B2BShippingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  shippingForm!: FormGroup;
  currentUser$ = this.store.select(selectCurrentUser);

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadUserAndCompanyData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.shippingForm = this.fb.group({
      companyName: [{ value: '', disabled: true }],
      companyEmail: [{ value: '', disabled: true }],
      contactPersonName: ['', [Validators.required]],
      contactPersonEmail: ['', [Validators.required, Validators.email]],
      deliveryAddress: ['', [Validators.required]],
      deliveryCity: ['', [Validators.required]],
      deliveryPostalCode: ['', [Validators.required]],
      deliveryCountry: ['HR', [Validators.required]],
      shippingMethod: ['standard', [Validators.required]]
    });
  }

  private loadUserAndCompanyData(): void {
    this.currentUser$.pipe(
      filter(user => !!user),
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        const mockCompanyData = {
          companyName: 'Solar Innovations d.o.o.',
          companyEmail: 'orders@solarinnovations.hr'
        };

        this.shippingForm.patchValue({
          ...mockCompanyData,
          contactPersonName: `${user.firstName} ${user.lastName}`,
          contactPersonEmail: user.email
        });
      }
    });
  }

  onSubmit(): void {
    if (this.shippingForm.valid) {
      // Save shipping info to localStorage for the payment step
      const shippingData = this.shippingForm.value;
      localStorage.setItem('b2b_shipping_info', JSON.stringify(shippingData));

      // Navigate to payment step
      if (typeof window !== 'undefined') {
        window.location.href = '/partneri/checkout/payment';
      }
    } else {
      Object.keys(this.shippingForm.controls).forEach(key => {
        this.shippingForm.get(key)?.markAsTouched();
      });
    }
  }
} 