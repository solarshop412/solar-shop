import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-partners-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './partners-contact.component.html',
  styleUrls: ['./partners-contact.component.scss']
})
export class PartnersContactComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  messageSent = false;

  // Properties for product quote requests
  productId: string | null = null;
  productName: string | null = null;
  productSku: string | null = null;

  private translationService = inject(TranslationService);

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private route: ActivatedRoute
  ) {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      company: [''],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Check for query parameters from product quote requests
    this.route.queryParams.subscribe(params => {
      if (params['subject'] === 'pricingInquiry') {
        this.contactForm.patchValue({
          subject: 'pricingInquiry'
        });

        // Set product information
        this.productId = params['productId'] || null;
        this.productName = params['productName'] || null;
        this.productSku = params['sku'] || null;

        // Pre-fill the message with product details
        if (this.productName && this.productSku) {
          const message = this.translationService.translate('b2b.contact.pricingInquiryMessage', {
            productName: this.productName,
            productSku: this.productSku
          });
          this.contactForm.patchValue({
            message: message
          });
        }
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      const value = this.contactForm.value;
      this.supabase.createRecord('contacts', {
        first_name: value.firstName,
        last_name: value.lastName,
        email: value.email,
        phone: value.phone,
        company: value.company,
        subject: value.subject,
        message: value.message,
        is_newsletter: false
      }).then(() => {
        this.isSubmitting = false;
        this.messageSent = true;
        this.contactForm.reset();
        setTimeout(() => { this.messageSent = false; }, 5000);
      }).catch(error => {
        console.error('Error sending partner contact:', error);
        this.isSubmitting = false;
        alert('Error sending message');
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.contactForm.markAllAsTouched();
    }
  }
} 
