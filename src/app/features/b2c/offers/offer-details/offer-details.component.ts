import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, from, of } from 'rxjs';
import { takeUntil, switchMap, map, catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { OffersService } from '../services/offers.service';
import { AddToCartButtonComponent } from '../../cart/components/add-to-cart-button/add-to-cart-button.component';
import { SupabaseService } from '../../../../services/supabase.service';
import { Offer } from '../../../../shared/models/offer.model';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { addAllToCartFromOffer } from '../../cart/store/cart.actions';
import { ToastService } from '../../../../shared/services/toast.service';
import { TranslationService } from '../../../../shared/services/translation.service';
import { SeoService } from '../../../../shared/services/seo.service';

@Component({
  selector: 'app-offer-details',
  standalone: true,
  imports: [CommonModule, AddToCartButtonComponent, TranslatePipe],
  templateUrl: './offer-details.component.html',
  styleUrls: ['./offer-details.component.scss']
})
export class OfferDetailsComponent implements OnInit, OnDestroy {
  offer$: Observable<Offer | null>;
  relatedProducts$: Observable<any[]>;
  copiedCoupon = false;
  private destroy$ = new Subject<void>();
  private currentProducts: any[] = [];
  isBundle = false;
  currentOffer: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offersService: OffersService,
    private supabaseService: SupabaseService,
    private store: Store,
    private toastService: ToastService,
    private translationService: TranslationService,
    private seoService: SeoService
  ) {
    this.offer$ = this.route.params.pipe(
      switchMap(params => this.offersService.getOfferById(params['id'])),
      takeUntil(this.destroy$)
    );

    this.relatedProducts$ = this.offer$.pipe(
      switchMap(offer => {
        if (!offer) return [];
        return this.getRelatedProducts(offer);
      }),
      map(products => {
        this.currentProducts = products;
        return products;
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnInit(): void {
    // Scroll to top when component loads
    window.scrollTo(0, 0);

    // Load offer data and check if it's a bundle
    this.offer$.subscribe(async offer => {
      if (offer) {
        this.currentOffer = offer;

        // Set SEO for offer page
        this.setOfferSeo(offer);

        // Fetch full offer details from database to get bundle flag
        try {
          const fullOffer = await this.supabaseService.getTableById('offers', offer.id);
          if (fullOffer) {
            this.isBundle = fullOffer.bundle || false;
          }
        } catch (error) {
          console.error('Error loading full offer details:', error);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.seoService.resetToDefaults();
  }

  private getRelatedProducts(offer: Offer): Observable<any[]> {
    return from(
      this.supabaseService.client
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
        .order('sort_order')
    ).pipe(
      switchMap(({ data: offerProducts, error }) => {
        console.log('Raw offer products from database:', offerProducts);

        if (error) {
          console.error('Error fetching related products:', error);
          // Fallback to featured products on error
          return from(this.supabaseService.getProducts({ featured: true, limit: 3 }));
        }

        if (offerProducts && offerProducts.length > 0) {
          // Map offer products to the expected format including discount information
          const products = offerProducts.map((op: any) => {
            // Determine discount type based on which field has a value
            const discountType = (op.discount_amount && op.discount_amount > 0) ? 'fixed_amount' : 'percentage';
            
            const productResult = {
              id: op.products.id,
              name: op.products.name,
              description: op.products.description,
              price: op.products.price,
              availability: this.getProductAvailability(op.products.stock_quantity),
              images: op.products.images || [],
              category: op.products.categories?.name,
              stock_quantity: op.products.stock_quantity || 0,
              discount_percentage: op.discount_percentage || 0,
              discount_amount: op.discount_amount || 0,
              discount_type: discountType
            };

            console.log('Offer Details - Product with discount info:', {
              productId: productResult.id,
              price: productResult.price,
              discount_percentage: productResult.discount_percentage,
              discount_amount: productResult.discount_amount,
              discount_type: productResult.discount_type,
              raw_op: op
            });

            return productResult;
          });
          return of(products);
        } else {
          // If no specific products, fallback to featured products
          return from(this.supabaseService.getProducts({ featured: true, limit: 6 }));
        }
      }),
      map(products => products || []),
      catchError((error: any) => {
        console.error('Error fetching fallback products:', error);
        return of([]);
      })
    );
  }

  private getProductAvailability(stockQuantity: number): string {
    if (stockQuantity > 10) return 'in_stock';
    if (stockQuantity > 0) return 'low_stock';
    return 'out_of_stock';
  }



  getProductImage(product: any): string {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0].url || product.images[0];
    }
    return 'assets/images/product-placeholder.svg';
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
      const totalOriginalPrice = this.getTotalOriginalPrice();
      const fixedDiscountAmount = offer.discount_value || 0;
      if (totalOriginalPrice > 0) {
        const proportionalDiscount = (originalPrice / totalOriginalPrice) * fixedDiscountAmount;
        return Math.max(0, originalPrice - proportionalDiscount);
      }
    }
    return originalPrice;
  }

  calculateTotalDiscountedPrice(offer: Offer): number {
    // Calculate total using individual product discounts
    return this.currentProducts.reduce((total, product) => {
      return total + this.calculateDiscountedPrice(product.price, offer, product);
    }, 0);
  }

  copyCouponCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedCoupon = true;
      setTimeout(() => {
        this.copiedCoupon = false;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy coupon code:', err);
    });
  }

  trackByProductId(_index: number, product: any): string {
    return product.id;
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/proizvodi', productId]);
  }

  navigateToProducts(): void {
    this.router.navigate(['/proizvodi']);
  }

  getTotalOriginalPrice(): number {
    return this.currentProducts.reduce((total, product) => total + product.price, 0);
  }


  getTotalSavings(offer: Offer): number {
    return this.getTotalOriginalPrice() - this.calculateTotalDiscountedPrice(offer);
  }

  hasProductSpecificDiscount(product: any): boolean {
    return (product.discount_percentage && product.discount_percentage > 0) ||
           (product.discount_amount && product.discount_amount > 0);
  }

  async addAllToCart(): Promise<void> {
    if (!this.currentProducts || this.currentProducts.length === 0) {
      this.toastService.showWarning(this.translationService.translate('offers.noProductsToAdd'));
      return;
    }

    // Get current offer to pass offer information
    this.offer$.pipe(takeUntil(this.destroy$)).subscribe(async offer => {
      if (!offer) {
        this.toastService.showError(this.translationService.translate('offers.offerNotFound'));
        return;
      }

      // Filter out out-of-stock products
      const availableProducts = this.currentProducts.filter(product =>
        product.availability !== 'out_of_stock' && product.stock_quantity > 0
      );

      if (availableProducts.length === 0) {
        this.toastService.showWarning(this.translationService.translate('offers.allProductsOutOfStock'));
        return;
      }

      // Prepare products for the action with individual discounts
      const products = availableProducts.map(product => {
        // Get the correct individual discount based on type
        let individualDiscount;
        if (product.discount_type === 'fixed_amount' && product.discount_amount > 0) {
          individualDiscount = product.discount_amount;
        } else if (product.discount_type === 'percentage' && product.discount_percentage > 0) {
          individualDiscount = product.discount_percentage;
        } else {
          individualDiscount = undefined;
        }

        const productData = {
          productId: product.id,
          quantity: 1,
          variantId: undefined,
          individualDiscount: individualDiscount,
          individualDiscountType: product.discount_type || undefined,
          originalPrice: product.price
        };

        console.log('Offer Details - Sending product to cart:', {
          productId: productData.productId,
          individualDiscount: productData.individualDiscount,
          individualDiscountType: productData.individualDiscountType,
          originalPrice: productData.originalPrice,
          product_discount_amount: product.discount_amount,
          product_discount_percentage: product.discount_percentage,
          product_discount_type: product.discount_type
        });

        return productData;
      });

      // Get the original offer from database to get discount_value and bundle flag
      let discountValue = offer.discountPercentage || 0;
      let isBundle = false;
      let totalProductsInOffer = this.currentProducts.length;

      try {
        const originalOffer = await this.supabaseService.getTableById('offers', offer.id);
        if (originalOffer) {
          discountValue = originalOffer.discount_value || offer.discountPercentage || 0;
          isBundle = originalOffer.bundle || false;
        }
      } catch (error) {
        console.error('Error fetching original offer data:', error);
      }

      // Dispatch the offer-based add all to cart action
      const actionPayload = {
        products,
        offerId: offer.id,
        offerName: offer.title,
        offerType: (offer.discount_type || 'percentage') as 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle',
        offerDiscount: discountValue,
        offerValidUntil: offer.endDate,
        isBundle: isBundle,
        bundleProductIds: isBundle ? this.currentProducts.map(p => p.id) : undefined
      };

      console.log('Offer Details - Dispatching cart action:', {
        offerType: actionPayload.offerType,
        offerDiscount: actionPayload.offerDiscount,
        products: actionPayload.products
      });

      this.store.dispatch(addAllToCartFromOffer(actionPayload));

      // Show success message
      this.toastService.showSuccess(
        this.translationService.translate('offers.addedProductsToCart', { count: availableProducts.length })
      );

      // Show warning for out-of-stock products if any
      const outOfStockCount = this.currentProducts.length - availableProducts.length;
      if (outOfStockCount > 0) {
        this.toastService.showWarning(
          this.translationService.translate('offers.productsOutOfStock', { count: outOfStockCount })
        );
      }
    });
  }

  /**
   * Set SEO tags for the offer page
   */
  private setOfferSeo(offer: Offer): void {
    // Calculate discounted price for SEO
    const originalPrice = this.getTotalOriginalPrice() || offer.originalPrice || 0;
    const discountedPrice = offer.discountedPrice || this.calculateTotalDiscountedPrice(offer);

    // Set offer page SEO
    this.seoService.setOfferPage({
      name: offer.title,
      description: offer.description || offer.shortDescription || `Posebna ponuda: ${offer.title}`,
      image: offer.imageUrl,
      price: discountedPrice,
      originalPrice: originalPrice,
      currency: 'EUR',
      validFrom: offer.startDate ? new Date(offer.startDate).toISOString() : undefined,
      validThrough: offer.endDate ? new Date(offer.endDate).toISOString() : undefined
    });

    // Set breadcrumbs schema
    this.seoService.setBreadcrumbs([
      { name: 'Početna', url: '/' },
      { name: 'Ponude', url: '/ponude' },
      { name: offer.title }
    ]);
  }
} 