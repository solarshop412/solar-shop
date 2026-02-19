import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { HeroActions } from './store/hero.actions';
import { selectIsLoading } from './store/hero.selectors';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { OffersService } from '../offers/services/offers.service';
import { Offer } from '../../../shared/models/offer.model';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private offersService = inject(OffersService);
  private supabaseService = inject(SupabaseService);

  isLoading$: Observable<boolean>;
  featuredOffers: Offer[] = [];
  offersLoading = true;
  currentOfferIndex = 0;
  private autoSlideInterval: any;
  private offerProducts: { [offerId: string]: any[] } = {}; // Store products for each offer
  private currentProducts: any[] = []; // Currently displayed offer's products

  constructor(private router: Router) {
    this.isLoading$ = this.store.select(selectIsLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(HeroActions.initializeHero());
    this.loadFeaturedOffers();
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  private loadFeaturedOffers(): void {
    this.offersLoading = true;
    this.offersService.getActiveOffers(6).subscribe({
      next: async (offers) => {
        this.featuredOffers = offers;
        // Load related products for each offer
        await this.loadOfferProducts();
        this.offersLoading = false;
        this.setupAutoSlide();
      },
      error: (error) => {
        console.error('Error loading featured offers:', error);
        this.offersLoading = false;
      },
    });
  }

  private async loadOfferProducts(): Promise<void> {
    const productPromises = this.featuredOffers.map((offer) =>
      this.getRelatedProducts(offer),
    );
    const allProducts = await Promise.all(productPromises);

    this.featuredOffers.forEach((offer, index) => {
      this.offerProducts[offer.id] = allProducts[index];
    });

    // Set current products to the first offer's products
    if (this.featuredOffers.length > 0) {
      this.currentProducts =
        this.offerProducts[this.featuredOffers[0].id] || [];
    }
  }

  private async getRelatedProducts(offer: Offer): Promise<any[]> {
    try {
      const { data: offerProducts, error } = await this.supabaseService.client
        .from('offer_products')
        .select(
          `
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
        `,
        )
        .eq('offer_id', offer.id)
        .order('sort_order');

      if (error) {
        console.error('Error fetching related products:', error);
        return [];
      }

      if (offerProducts && offerProducts.length > 0) {
        // Map offer products to the expected format including discount information
        const products = offerProducts.map((op: any) => {
          // Determine discount type based on which field has a value
          const discountType =
            op.discount_amount && op.discount_amount > 0
              ? 'fixed_amount'
              : 'percentage';

          const productResult = {
            id: op.products.id,
            name: op.products.name,
            description: op.products.description,
            price: op.products.price,
            availability: this.getProductAvailability(
              op.products.stock_quantity,
            ),
            images: op.products.images || [],
            category: op.products.categories?.name,
            stock_quantity: op.products.stock_quantity || 0,
            discount_percentage: op.discount_percentage || 0,
            discount_amount: op.discount_amount || 0,
            discount_type: discountType,
          };

          return productResult;
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

  private getProductAvailability(stockQuantity: number): string {
    if (stockQuantity > 10) return 'in_stock';
    if (stockQuantity > 0) return 'low_stock';
    return 'out_of_stock';
  }

  private setupAutoSlide(): void {
    // Clear any existing interval
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }

    // Auto-slide every 8 seconds (increased from 5 seconds)
    this.autoSlideInterval = setInterval(() => {
      if (this.featuredOffers.length > 1) {
        this.nextOffer();
      }
    }, 8000);
  }

  nextOffer(): void {
    if (this.currentOfferIndex < this.featuredOffers.length - 1) {
      this.currentOfferIndex++;
    } else {
      this.currentOfferIndex = 0; // Loop back to start
    }
    // Update current products for the new offer
    if (this.featuredOffers[this.currentOfferIndex]) {
      this.currentProducts =
        this.offerProducts[this.featuredOffers[this.currentOfferIndex].id] ||
        [];
    }
  }

  previousOffer(): void {
    if (this.currentOfferIndex > 0) {
      this.currentOfferIndex--;
    } else {
      this.currentOfferIndex = this.featuredOffers.length - 1; // Go to end
    }
    // Update current products for the new offer
    if (this.featuredOffers[this.currentOfferIndex]) {
      this.currentProducts =
        this.offerProducts[this.featuredOffers[this.currentOfferIndex].id] ||
        [];
    }
  }

  goToOffer(index: number): void {
    this.currentOfferIndex = index;
    // Update current products for the new offer
    if (this.featuredOffers[index]) {
      this.currentProducts =
        this.offerProducts[this.featuredOffers[index].id] || [];
    }
    // Reset auto-slide timer when manually navigating
    this.setupAutoSlide();
  }

  viewOffer(offerId: string): void {
    this.router.navigate(['/ponude', offerId]);
  }

  calculateDiscountedPrice(
    originalPrice: number,
    offer: Offer,
    product?: any,
  ): number {
    // If we have product-specific discount information, use that
    if (
      product &&
      (product.discount_percentage > 0 || product.discount_amount > 0)
    ) {
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
      const totalOriginalPrice = this.getTotalOriginalPrice();
      const fixedDiscountAmount = offer.discount_value || 0;
      if (totalOriginalPrice > 0) {
        const proportionalDiscount =
          (originalPrice / totalOriginalPrice) * fixedDiscountAmount;
        return Math.max(0, originalPrice - proportionalDiscount);
      }
    }
    return originalPrice;
  }

  calculateTotalDiscountedPrice(offer: Offer): number {
    // Calculate total using individual product discounts
    return this.currentProducts.reduce((total, product) => {
      return (
        total + this.calculateDiscountedPrice(product.price, offer, product)
      );
    }, 0);
  }

  getTotalOriginalPrice(): number {
    return this.currentProducts.reduce(
      (total, product) => total + product.price,
      0,
    );
  }

  getTotalSavings(offer: Offer): number {
    return (
      this.getTotalOriginalPrice() - this.calculateTotalDiscountedPrice(offer)
    );
  }

  onExploreProducts(): void {
    this.router.navigate(['/proizvodi'], {
      state: { fromHero: true, clearFilters: true },
    });
  }

  onExploreOffers(): void {
    this.router.navigate(['/ponude']);
  }
}
