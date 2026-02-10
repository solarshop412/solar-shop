import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { OffersActions } from '../store/offers.actions';
import { selectOffers, selectIsLoading } from '../store/offers.selectors';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Offer } from '../../../../shared/models/offer.model';
import { FooterActions } from '../../footer/store/footer.actions';
import { selectNewsletterState } from '../../footer/store/footer.selectors';
import { SupabaseService } from '../../../../services/supabase.service';
import { SeoService } from '../../../../shared/services/seo.service';

@Component({
  selector: 'app-offers-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './offers-page.component.html',
  styleUrls: ['./offers-page.component.scss']
})
export class OffersPageComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private seoService = inject(SeoService);

  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('newsletterForm') newsletterForm!: NgForm;

  offers$: Observable<Offer[]>;
  isLoading$: Observable<boolean>;
  newsletterState$: Observable<{ loading: boolean; success: boolean; error: string | null }>;
  private offerProducts: { [offerId: string]: any[] } = {}; // Store products for each offer

  constructor() {
    this.offers$ = this.store.select(selectOffers);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.newsletterState$ = this.store.select(selectNewsletterState);
  }

  ngOnInit(): void {
    // Set SEO for offers list page
    this.seoService.setCategoryPage(
      'Ponude',
      'Pregledajte naše posebne ponude i akcije na solarne panele, invertere i opremu za solarne elektrane. Uštedite na kvalitetnoj solarnoj opremi.'
    );

    this.store.dispatch(OffersActions.loadOffers());

    // Load product data for accurate pricing calculations
    this.offers$.subscribe(async (offers) => {
      if (offers && offers.length > 0) {
        await this.loadOfferProducts(offers);
      }
    });
  }

  ngOnDestroy(): void {
    this.seoService.resetToDefaults();
  }

  private async loadOfferProducts(offers: Offer[]): Promise<void> {
    const productPromises = offers.map(offer => this.getRelatedProducts(offer));
    const allProducts = await Promise.all(productPromises);

    offers.forEach((offer, index) => {
      this.offerProducts[offer.id] = allProducts[index];
    });
  }

  private async getRelatedProducts(offer: Offer): Promise<any[]> {
    try {
      const { data: offerProducts, error } = await this.supabaseService.client
        .from('offer_products')
        .select(`
          *,
          products (
            id,
            name,
            description,
            price,
            sku,
            stock_quantity,
            images,
            category_id,
            categories (
              name
            )
          )
        `)
        .eq('offer_id', offer.id)
        .order('sort_order');

      if (error) {
        console.error('Error fetching related products:', error);
        return [];
      }

      if (offerProducts && offerProducts.length > 0) {
        const products = offerProducts.map((op: any) => {
          const discountType = (op.discount_amount && op.discount_amount > 0) ? 'fixed_amount' : 'percentage';

          return {
            id: op.products.id,
            name: op.products.name,
            description: op.products.description,
            price: op.products.price,
            images: op.products.images || [],
            category: op.products.categories?.name,
            stock_quantity: op.products.stock_quantity || 0,
            discount_percentage: op.discount_percentage || 0,
            discount_amount: op.discount_amount || 0,
            discount_type: discountType
          };
        });
        return products;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error in getRelatedProducts:', error);
      return [];
    }
  }

  trackByOfferId(index: number, offer: Offer): string {
    return offer.id;
  }

  navigateToOfferDetails(offerId: string) {
    this.router.navigate(['/ponude', offerId]);
  }

  navigateToProducts(): void {
    this.router.navigate(['/proizvodi']);
  }

  onNewsletterSubmit(event: Event, form: NgForm): void {
    event.preventDefault();

    if (form.valid) {
      const emailValue = this.emailInput.nativeElement.value;
      console.log('Submitting newsletter from offers page with email:', emailValue); // Debug log

      this.store.dispatch(FooterActions.subscribeNewsletter({ email: emailValue }));
      form.resetForm();

      // Reset success state after 3 seconds
      setTimeout(() => {
        this.store.dispatch(FooterActions.resetNewsletterState());
      }, 3000);
    }
  }

  getTotalSavings(offer: Offer): number {
    return this.getTotalOriginalPrice(offer) - this.calculateTotalDiscountedPrice(offer);
  }

  calculateDiscountedPrice(originalPrice: number, offer: Offer, product?: any): number {
    // If we have product-specific discount information, use that
    if (product && (product.discount_percentage > 0 || product.discount_amount > 0)) {
      if (product.discount_type === 'fixed_amount') {
        return Math.max(0, originalPrice - (product.discount_amount || 0));
      } else {
        return originalPrice * (1 - (product.discount_percentage || 0) / 100);
      }
    }

    // Fallback to offer-level discount calculation
    if (!offer.discount_type || offer.discount_type === 'percentage') {
      const discountPercentage = offer.discountPercentage || 0;
      return originalPrice * (1 - discountPercentage / 100);
    } else if (offer.discount_type === 'fixed_amount') {
      // For fixed amount discounts, calculate proportional discount per product
      const totalOriginalPrice = this.getTotalOriginalPrice(offer);
      const fixedDiscountAmount = offer.discount_value || 0;
      if (totalOriginalPrice > 0) {
        const proportionalDiscount = (originalPrice / totalOriginalPrice) * fixedDiscountAmount;
        return Math.max(0, originalPrice - proportionalDiscount);
      }
    }
    return originalPrice;
  }

  calculateTotalDiscountedPrice(offer: Offer): number {
    const products = this.offerProducts[offer.id] || [];
    return products.reduce((total, product) => {
      return total + this.calculateDiscountedPrice(product.price, offer, product);
    }, 0);
  }

  getTotalOriginalPrice(offer: Offer): number {
    const products = this.offerProducts[offer.id] || [];
    return products.reduce((total, product) => total + product.price, 0);
  }

  getDiscountDisplay(offer: Offer): string {
    // For specific products: show total discount amount
    // For categories/general: show original discount value
    // For percentage: show percentage

    if (offer.discount_type === 'percentage') {
      return `-${offer.discountPercentage}%`;
    } else if (offer.discount_type === 'fixed_amount') {
      // Show total savings (sum of all product discounts)
      const totalSavings = this.getTotalSavings(offer);
      return `€${totalSavings.toFixed(0)}`;
    } else {
      // Fallback to percentage
      return `-${offer.discountPercentage}%`;
    }
  }

  isSpecificProductOffer(offer: Offer): boolean {
    // This would need to be determined from the offer data structure
    // For now, we'll assume fixed_amount offers are specific product offers
    return offer.discount_type === 'fixed_amount';
  }

  getSavingsAmount(offer: Offer): string {
    const savingsAmount = (offer.originalPrice || 0) - (offer.discountedPrice || 0);
    return savingsAmount.toFixed(2);
  }

  getSavingsAmountFormatted(offer: Offer): string {
    const originalPrice = Number(offer.originalPrice) || 0;
    const discountedPrice = Number(offer.discountedPrice) || 0;
    const savingsAmount = originalPrice - discountedPrice;
    
    console.log('Debug savings calculation:', {
      offer: offer.title,
      originalPrice,
      discountedPrice,
      savingsAmount
    });
    
    if (savingsAmount <= 0) {
      return '0,00 €';
    }
    
    try {
      const formatted = new Intl.NumberFormat('hr-HR', { 
        style: 'currency', 
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(savingsAmount);
      console.log('Formatted result:', formatted);
      return formatted;
    } catch (error) {
      // Fallback formatting if Intl fails
      console.log('Intl formatting failed, using fallback');
      return `${savingsAmount.toFixed(2)} €`;
    }
  }
} 