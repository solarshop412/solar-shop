import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { selectCurrentUser } from '../../../../../core/auth/store/auth.selectors';
import { SupabaseService } from '../../../../../services/supabase.service';
import { User } from '../../../../../shared/models/user.model';
import { Company } from '../../../../../shared/models/company.model';

@Component({
  selector: 'app-b2b-shipping',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './b2b-shipping.component.html',
  styleUrls: ['./b2b-shipping.component.scss']
})
export class B2bShippingComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(Store);
  private supabaseService = inject(SupabaseService);
  private destroy$ = new Subject<void>();

  shippingForm: FormGroup;
  currentUser: User | null = null;
  company: Company | null = null;

  constructor() {
    this.shippingForm = this.fb.group({
      contactName: ['', [Validators.required]],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required]],
      deliveryAddress: ['', [Validators.required]],
      deliveryCity: ['', [Validators.required]],
      deliveryPostalCode: ['', [Validators.required]],
      deliveryCountry: ['', [Validators.required]],
      deliveryInstructions: [''],
      shippingMethod: ['pickup', [Validators.required]]
    });
  }

  async ngOnInit(): Promise<void> {
    // Subscribe to current user and load company information
    this.store.select(selectCurrentUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (user) => {
        this.currentUser = user;
        if (user?.id) {
          await this.loadCompanyInfo(user.id);
          // Pre-populate contact information
          this.shippingForm.patchValue({
            contactName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            contactEmail: user.email,
            contactPhone: user.phone || ''
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadCompanyInfo(userId: string): Promise<void> {
    try {
      const { data: companies, error } = await this.supabaseService.client
        .from('companies')
        .select('*')
        .eq('contact_person_id', userId)
        .eq('status', 'approved')
        .single();

      if (!error && companies) {
        // Map database fields to Company interface
        this.company = {
          id: companies.id,
          contactPersonId: companies.contact_person_id,
          contactPersonName: companies.contact_person_name,
          companyName: companies.company_name,
          taxNumber: companies.tax_number,
          companyAddress: companies.company_address,
          companyPhone: companies.company_phone,
          companyEmail: companies.company_email,
          website: companies.website,
          businessType: companies.business_type,
          yearsInBusiness: companies.years_in_business,
          annualRevenue: companies.annual_revenue,
          numberOfEmployees: companies.number_of_employees,
          description: companies.description,
          status: companies.status,
          approved: companies.approved,
          approvedAt: companies.approved_at ? new Date(companies.approved_at) : undefined,
          approvedBy: companies.approved_by,
          rejectedAt: companies.rejected_at ? new Date(companies.rejected_at) : undefined,
          rejectedBy: companies.rejected_by,
          rejectionReason: companies.rejection_reason,
          createdAt: new Date(companies.created_at),
          updatedAt: new Date(companies.updated_at)
        };
      }
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  }

  onSubmit() {
    // Ensure cart items are still available for checkout
    const checkoutItems = localStorage.getItem('b2bCheckoutItems');
    if (!checkoutItems) {
      console.error('No B2B checkout items found. Redirecting to cart.');
      this.router.navigate(['/partneri/blagajna/pregled-narudzbe']);
      return;
    }

    // Save shipping information to localStorage for payment step
    const shippingData = {
      ...this.shippingForm.value,
      company: this.company
    };
    localStorage.setItem('b2bShippingInfo', JSON.stringify(shippingData));

    this.router.navigate(['/partneri/blagajna/placanje']);
  }

  goBack() {
    this.router.navigate(['/partneri/blagajna/pregled-narudzbe']);
  }
} 