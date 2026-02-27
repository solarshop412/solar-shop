import { Component, OnInit } from '@angular/core';
import { TranslatePipe } from "../../../../../shared/pipes/translate.pipe";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../../../../services/supabase.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';

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


  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private route: ActivatedRoute,
    private _location: Location,
    private router: Router
  ) {
    this.contactForm = this.fb.group({
      message: [''],
      product: [''],
      productId: ['', [Validators.required]]
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
  }

  onSubmit(): void {

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
