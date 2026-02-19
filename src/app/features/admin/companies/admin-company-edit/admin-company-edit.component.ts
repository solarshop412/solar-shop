import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import {
  takeUntil,
  filter,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  first,
} from 'rxjs/operators';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Company } from '../../../../shared/models/company.model';
import { SupabaseService } from '../../../../services/supabase.service';
import * as CompaniesActions from '../store/companies.actions';
import {
  selectCompaniesLoading,
  selectCompaniesError,
  selectCompanyById,
} from '../store/companies.selectors';

@Component({
  selector: 'app-admin-company-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-company-edit.component.html',
  styleUrls: ['./admin-company-edit.component.scss'],
})
export class AdminCompanyEditComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private supabaseService = inject(SupabaseService);
  private destroy$ = new Subject<void>();

  companyForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  isEditMode = false;
  companyId: string | null = null;

  constructor() {
    this.loading$ = this.store.select(selectCompaniesLoading);
    this.error$ = this.store.select(selectCompaniesError);

    this.companyForm = this.fb.group({
      companyName: ['', [Validators.required]],
      taxNumber: ['', [Validators.required], [this.taxNumberValidator()]],
      businessType: ['', [Validators.required]],
      yearsInBusiness: [null, [Validators.required, Validators.min(0)]],
      numberOfEmployees: [null],
      annualRevenue: [null],
      contactPersonName: ['', [Validators.required]],
      companyEmail: ['', [Validators.required, Validators.email]],
      companyPhone: ['', [Validators.required]],
      website: [''],
      companyAddress: ['', [Validators.required]],
      description: [''],
      status: ['pending'],
      // Fields for contact person creation (only for new companies)
      firstName: [''],
      lastName: [''],
      email: [''],
      phoneNumber: [''],
    });
  }

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.companyId;

    if (this.isEditMode && this.companyId) {
      // Load company data for editing
      this.store.dispatch(CompaniesActions.loadCompanies());

      this.store
        .select(selectCompanyById(this.companyId))
        .pipe(
          filter((company) => !!company),
          takeUntil(this.destroy$),
        )
        .subscribe((company) => {
          if (company) {
            this.populateForm(company);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private populateForm(company: Company): void {
    this.companyForm.patchValue({
      companyName: company.companyName,
      taxNumber: company.taxNumber,
      businessType: company.businessType,
      yearsInBusiness: company.yearsInBusiness,
      numberOfEmployees: company.numberOfEmployees,
      annualRevenue: company.annualRevenue,
      contactPersonName: company.contactPersonName,
      companyEmail: company.companyEmail,
      companyPhone: company.companyPhone,
      website: company.website,
      companyAddress: company.companyAddress,
      description: company.description,
      status: company.status,
    });
  }

  saveCompany(): void {
    if (this.companyForm.valid) {
      const formData = this.companyForm.value;

      if (this.isEditMode && this.companyId) {
        // Update existing company
        this.store.dispatch(
          CompaniesActions.updateCompany({
            companyId: this.companyId,
            company: formData,
          }),
        );
      } else {
        // Create new company
        this.store.dispatch(
          CompaniesActions.createCompany({
            company: formData,
          }),
        );
      }

      // Navigate back after action is dispatched
      // The effects will handle success/error states
      this.goBack();
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.companyForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/tvrtke']);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // You could show a toast notification here if you have one
        console.log('Company UUID copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy Company UUID: ', err);
      });
  }

  /**
   * Async validator to check if tax number already exists
   */
  private taxNumberValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return new Observable((observer) => {
          observer.next(null);
          observer.complete();
        });
      }

      return control.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(() => {
          // If editing, check if tax number belongs to current company
          const taxNumberToCheck = control.value;

          return this.supabaseService.client
            .from('companies')
            .select('id, tax_number')
            .eq('tax_number', taxNumberToCheck)
            .then(({ data, error }) => {
              if (error) {
                console.error('Error checking tax number:', error);
                return null;
              }

              // If no company found with this tax number, it's available
              if (!data || data.length === 0) {
                return null;
              }

              // If editing and tax number belongs to current company, it's valid
              if (
                this.isEditMode &&
                this.companyId &&
                data[0].id === this.companyId
              ) {
                return null;
              }

              // Tax number already exists for another company
              return { taxNumberExists: true };
            });
        }),
        first(),
      );
    };
  }
}
