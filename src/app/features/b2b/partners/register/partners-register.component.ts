import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CompanyRegistrationData } from '../../../../shared/models/company.model';
import { PartnerRegistrationService } from '../services/partner-registration.service';

@Component({
  selector: 'app-partners-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './partners-register.component.html',
  styleUrls: ['./partners-register.component.scss'],
})
export class PartnersRegisterComponent {
  currentStep = 1;
  isSubmitting = false;
  registrationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private registrationService: PartnerRegistrationService,
  ) {
    this.registrationForm = this.fb.group(
      {
        // Personal Information
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', [Validators.required]],
        address: [''],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],

        // Company Information
        companyName: ['', [Validators.required]],
        taxNumber: ['', [Validators.required]],
        companyAddress: ['', [Validators.required]],
        companyPhone: ['', [Validators.required]],
        companyEmail: ['', [Validators.required, Validators.email]],
        website: [''],
        businessType: ['', [Validators.required]],
        yearsInBusiness: ['', [Validators.required, Validators.min(0)]],
        annualRevenue: [''],
        numberOfEmployees: [''],
        description: [''],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }

    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isStep1Valid(): boolean {
    const step1Fields = [
      'firstName',
      'lastName',
      'email',
      'password',
      'confirmPassword',
    ];
    return step1Fields.every((field) => {
      const control = this.registrationForm.get(field);
      return control && control.valid;
    });
  }

  nextStep(): void {
    if (this.isStep1Valid()) {
      this.currentStep = 2;
    } else {
      // Mark step 1 fields as touched to show validation errors
      const step1Fields = [
        'firstName',
        'lastName',
        'email',
        'password',
        'confirmPassword',
      ];
      step1Fields.forEach((field) => {
        this.registrationForm.get(field)?.markAsTouched();
      });
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.isSubmitting = true;

      const formData = this.registrationForm.value as CompanyRegistrationData;

      // Convert empty strings to null for optional numeric fields
      const processedData = {
        ...formData,
        annualRevenue:
          formData.annualRevenue &&
          formData.annualRevenue.toString().trim() !== ''
            ? Number(formData.annualRevenue)
            : undefined,
        numberOfEmployees:
          formData.numberOfEmployees &&
          formData.numberOfEmployees.toString().trim() !== ''
            ? Number(formData.numberOfEmployees)
            : undefined,
        yearsInBusiness: Number(formData.yearsInBusiness), // Required field, should always have a value
      };

      this.registrationService.registerPartner(processedData).then((result) => {
        this.isSubmitting = false;
        if (!result.error) {
          this.currentStep = 3;
        } else {
          console.error('Partner registration failed:', result.error);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.registrationForm.markAllAsTouched();
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/prijava']);
  }

  navigateToAbout(): void {
    this.router.navigate(['/partneri/o-nama']);
  }
}
