import { Component, OnInit } from '@angular/core';
import { TranslatePipe } from "../../../../../shared/pipes/translate.pipe";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../../../../services/supabase.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '../../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-product-offer',
  standalone: true,
  imports: [TranslatePipe, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-offer.component.html',
  styleUrl: './product-offer.component.scss'
})
export class ProductOfferComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  messageSent = false;

  productId: string = "";
  productName: string = "";
  productImg: string = "";
  private imageErrors = new Set<string>();
  userId: string = "";

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private route: ActivatedRoute,
    private _location: Location,
    private router: Router,
    private auth: AuthService
  ) {
    this.contactForm = this.fb.group({
      message: [''],
      product: [''],
      productId: ['']
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.productId = params['productId'];
      this.productImg = params['productImg'];
      this.productName = params['productName'];

      if (!this.productId || !this.productImg || !this.productName) {
        this._location.back();
      }

      this.contactForm.patchValue({
        product: this.productName,
        productId: this.productId
      });

      this.contactForm.get('product')?.disable();
    });

    this.auth.getCurrentUser().subscribe((data) => {
      this.userId = data?.id || "";
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      const value = this.contactForm.value;
      this.supabase
        .createRecord('products_inquiry', {
          product_id: this.productId,
          user_id: this.userId,
          message: this.contactForm.get('message')?.value || ""
        })
        .then(() => {
          this.isSubmitting = false;
          this.messageSent = true;
          this.contactForm.reset();
          setTimeout(() => {
            this.messageSent = false;
          }, 5000);
        })
        .catch((error) => {
          console.error('Error sending partner contact:', error);
          this.isSubmitting = false;
          alert('Error sending message');
        });
    } else {
      // Mark all fields as touched to show validation errors
      this.contactForm.markAllAsTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getImageSrc(imagePath: string): string {
    // Ensure we have a valid image path and handle potential errors
    if (!imagePath) {
      return 'assets/images/product-placeholder.webp';
    }

    // If this image has already failed to load, return the fallback immediately
    if (this.imageErrors.has(imagePath)) {
      return 'assets/images/product-placeholder.webp';
    }

    return imagePath;
  }

  onImageError(event: any, _productId: string) {
    // Prevent infinite error loops by tracking failed images
    const originalSrc = event.target.src;

    // Add to error set to prevent retrying
    this.imageErrors.add(originalSrc);

    // Set fallback image only if it's not already the fallback
    if (!originalSrc.includes('product-placeholder.webp')) {
      event.target.src = 'assets/images/product-placeholder.webp';
    }

    // Suppress console errors by preventing default behavior
    event.preventDefault();
  }
}
