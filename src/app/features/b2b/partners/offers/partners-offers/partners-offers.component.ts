import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, from } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { SupabaseService } from '../../../../../services/supabase.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from '../../../../../core/auth/store/auth.selectors';
import { addAllToB2BCartFromOffer } from '../../../cart/store/b2b-cart.actions';
import * as B2BCartActions from '../../../cart/store/b2b-cart.actions';
import {
  selectB2BCartHasCompanyId,
  selectB2BCartCompanyId,
} from '../../../cart/store/b2b-cart.selectors';
import { TranslationService } from '../../../../../shared/services/translation.service';
import { User } from '../../../../../shared/models/user.model';

@Component({
  selector: 'app-partners-offers',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './partners-offers.component.html',
  styleUrls: ['./partners-offers.component.scss'],
})
export class PartnersOffersComponent implements OnInit, OnDestroy {
  private supabaseService = inject(SupabaseService);
  private store = inject(Store);
  private toastService = inject(ToastService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  // Observables
  currentUser$: Observable<User | null> = this.store.select(selectCurrentUser);
  isAuthenticated$: Observable<boolean> = this.store.select(
    selectIsAuthenticated,
  );
  userCompanyId$: Observable<string | null> = this.store.select(
    selectB2BCartCompanyId,
  );
  hasCompanyId$: Observable<boolean> = this.store.select(
    selectB2BCartHasCompanyId,
  );

  isAuthenticated = false;
  hasCompanyId = false;
  isPartner = false;
  loading = false;
  currentUser: User | null = null;
  userCompanyId: string | null = null;

  // B2B offers loaded from database
  b2bOffers: any[] = [];

  private router = inject(Router);

  ngOnInit(): void {
    // Subscribe to auth state
    this.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
    });

    this.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
      this.isPartner =
        !!user?.companyId &&
        (user?.role?.name === 'company_admin' || user?.role?.name === 'admin');
    });

    this.hasCompanyId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((hasCompanyId) => {
        this.hasCompanyId = hasCompanyId;
      });

    this.userCompanyId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((companyId) => {
        this.userCompanyId = companyId;
        // Reload offers when company ID changes to update pricing
        if (companyId && this.b2bOffers.length > 0) {
          this.loadB2BOffers();
        }
      });

    // Load B2B offers from database
    this.loadB2BOffers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadB2BOffers(): Promise<void> {
    this.loading = true;
    try {
      // Load offers where is_b2b is true and status is active
      const offers = await this.supabaseService.getTable('offers', {
        is_b2b: true,
        status: 'active',
      });

      // Transform database offers to Offer model and calculate partner pricing
      const transformedOffers = await Promise.all(
        offers.map(async (offer) => {
          let originalPrice = offer.original_price || 0;
          const discountPercentage =
            offer.discount_type === 'percentage' ? offer.discount_value : 0;
          let discountedPrice = offer.discounted_price || 0;

          // If user has a company, calculate partner pricing
          let hasAllPartnerPricing = true;
          let hasProducts = false;
          let productCount = 0;

          if (this.userCompanyId) {
            const partnerPricing = await this.calculateOfferPartnerPricing(
              offer.id,
              this.userCompanyId,
            );
            if (partnerPricing) {
              originalPrice = partnerPricing.originalPrice;
              discountedPrice = partnerPricing.discountedPrice;
              hasAllPartnerPricing = partnerPricing.hasAllPartnerPricing;
              hasProducts = true;
              productCount = partnerPricing.productCount;
            }
          }

          // Calculate discounted price for percentage-only offers if not provided
          if (
            discountedPrice === 0 &&
            discountPercentage > 0 &&
            originalPrice > 0
          ) {
            discountedPrice = originalPrice * (1 - discountPercentage / 100);
          }

          return {
            id: offer.id,
            title: offer.title,
            originalPrice: originalPrice,
            discountedPrice: discountedPrice,
            discountPercentage: discountPercentage,
            imageUrl:
              offer.image_url ||
              'assets/images/placeholders/solar-panels-1.jpg',
            description: offer.description,
            shortDescription: offer.short_description || '',
            status: offer.status,
            couponCode: offer.code || '',
            startDate: offer.start_date,
            endDate: offer.end_date,
            featured: offer.featured || false,
            isB2B: offer.is_b2b || false,
            discount_type: offer.discount_type,
            discount_value: offer.discount_value,
            hasAllPartnerPricing: hasAllPartnerPricing,
            hasProducts: hasProducts,
            productCount: productCount,
            bundle: offer.bundle || false,
          } as any;
        }),
      );

      this.b2bOffers = transformedOffers;
    } catch (error) {
      console.error('Error loading B2B offers:', error);
    } finally {
      this.loading = false;
    }
  }

  navigateToLogin(): void {
    // Navigate to login page
    window.location.href = '/prijava';
  }

  navigateToPartnerRegistration(): void {
    // Navigate to partner registration page
    this.router.navigate(['/partneri/registracija']);
  }

  navigateToPartnerContact(): void {
    // Navigate to partner contact page
    this.router.navigate(['/partneri/kontakt']);
  }

  claimOffer(offer: any): void {
    // Check if user is authenticated and has company ID
    if (!this.isAuthenticated || !this.userCompanyId) {
      this.toastService.showError(
        this.translationService.translate('b2b.auth.pleaseLoginAsPartner'),
      );
      return;
    }

    // Check if offer is expired
    if (this.isOfferExpired(offer.endDate)) {
      this.toastService.showError(
        this.translationService.translate('b2b.offers.offerExpired'),
      );
      return;
    }

    // Load offer products and add them to cart
    this.loadOfferProducts(offer.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (products) => {
        if (!products || products.length === 0) {
          // If no products, just show success message (general offer)
          let message = this.translationService.translate(
            'b2b.offers.offerClaimed',
            { title: offer.title },
          );
          if (offer.couponCode) {
            message +=
              ' ' +
              this.translationService.translate('b2b.offers.useCouponCode', {
                code: offer.couponCode,
              });
          }
          this.toastService.showSuccess(message);
          return;
        }

        // Use the bulk add action for better performance and consistency
        await this.addOfferProductsToCartBulk(products, offer);
      });
  }

  private loadOfferProducts(offerId: string): Observable<any[]> {
    return from(
      this.supabaseService.client
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
            images
          )
        `,
        )
        .eq('offer_id', offerId)
        .order('sort_order'),
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) {
          console.error('Error loading offer products:', error);
          return [];
        }
        return [data || []];
      }),
    );
  }

  private async addOfferProductsToCartBulk(
    offerProducts: any[],
    offer: any,
  ): Promise<void> {
    if (!this.userCompanyId) {
      this.toastService.showError(
        this.translationService.translate('b2b.auth.companyIdNotFound'),
      );
      return;
    }

    // First, fetch partner pricing for all products
    const productsWithPricing = await this.getProductsWithPartnerPricing(
      offerProducts.map((op) => op.products.id),
      this.userCompanyId,
    );

    // Filter and prepare products for bulk add with partner pricing and individual discounts
    const availableProducts = offerProducts
      .filter((offerProduct) => {
        const product = offerProduct.products;
        return product && product.stock_quantity > 0;
      })
      .map((offerProduct) => {
        // Get partner pricing for this product
        const productWithPricing = productsWithPricing.find(
          (p) => p.id === offerProduct.products.id,
        );
        const partnerPrice =
          productWithPricing?.partner_price ||
          productWithPricing?.company_price;
        const retailPrice = offerProduct.products.price;

        // Determine individual discount type and value
        const hasIndividualDiscount =
          (offerProduct.discount_percentage &&
            offerProduct.discount_percentage > 0) ||
          (offerProduct.discount_amount && offerProduct.discount_amount > 0);

        return {
          productId: offerProduct.products.id,
          quantity: 1,
          individualDiscount: hasIndividualDiscount
            ? offerProduct.discount_percentage || offerProduct.discount_amount
            : undefined,
          individualDiscountType: hasIndividualDiscount
            ? ((offerProduct.discount_amount > 0
                ? 'fixed_amount'
                : 'percentage') as 'percentage' | 'fixed_amount')
            : undefined,
          originalPrice: partnerPrice || retailPrice, // Use partner price as base, fall back to retail price if no partner pricing
        };
      });

    if (availableProducts.length === 0) {
      this.toastService.showWarning(
        this.translationService.translate('b2b.offers.allProductsOutOfStock'),
      );
      return;
    }

    // Get offer details for the bulk action
    const offerType = (offer.discount_type || 'percentage') as
      | 'percentage'
      | 'fixed_amount'
      | 'tier_based'
      | 'bundle';
    const discountValue = offer.discount_value || offer.discountPercentage || 0;

    // Get all product IDs from this offer for bundle tracking
    const allProductIds = offerProducts.map((op) => op.products.id);

    // Dispatch the bulk add action
    this.store.dispatch(
      addAllToB2BCartFromOffer({
        products: availableProducts,
        companyId: this.userCompanyId,
        partnerOfferId: offer.id,
        partnerOfferName: offer.title,
        partnerOfferType: offerType,
        partnerOfferDiscount: discountValue,
        partnerOfferValidUntil: offer.endDate,
        isBundle: offer.bundle || false,
        bundleProductIds: offer.bundle ? allProductIds : undefined,
      }),
    );

    // Open cart sidebar
    this.store.dispatch(B2BCartActions.openB2BCartSidebar());

    // Show immediate feedback for skipped products
    const skippedCount = offerProducts.length - availableProducts.length;
    if (skippedCount > 0) {
      this.toastService.showWarning(
        this.translationService.translate('b2b.offers.productsOutOfStock', {
          count: skippedCount,
        }),
      );
    }
  }

  viewOfferDetails(offer: any): void {
    this.router.navigate(['/partneri/ponude', offer.id]);
  }

  copyCouponCode(couponCode: string): void {
    navigator.clipboard
      .writeText(couponCode)
      .then(() => {
        this.toastService.showSuccess(
          this.translationService.translate('b2b.offers.couponCopied'),
        );
      })
      .catch((err) => {
        console.error('Failed to copy coupon code:', err);
        this.toastService.showError(
          this.translationService.translate('b2b.offers.failedToCopyCoupon'),
        );
      });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  isOfferExpired(endDate?: string): boolean {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  }

  /**
   * Calculate partner pricing for an offer based on its products
   */
  private async calculateOfferPartnerPricing(
    offerId: string,
    companyId: string,
  ): Promise<{
    originalPrice: number;
    discountedPrice: number;
    hasAllPartnerPricing: boolean;
    productCount: number;
  } | null> {
    try {
      // Get offer products
      const { data: offerProducts, error: offerError } =
        await this.supabaseService.client
          .from('offer_products')
          .select(
            `
          *,
          products (
            id,
            name,
            price
          )
        `,
          )
          .eq('offer_id', offerId);

      if (offerError || !offerProducts?.length) {
        return null;
      }

      // Get partner pricing for these products
      const productIds = offerProducts.map((op) => op.products.id);
      const productsWithPricing = await this.getProductsWithPartnerPricing(
        productIds,
        companyId,
      );

      // Calculate sum of partner prices (not average)
      let totalPartnerPrice = 0;
      let productsWithValidPricing = 0;
      const totalProducts = offerProducts.length;

      offerProducts.forEach((offerProduct) => {
        const productWithPricing = productsWithPricing.find(
          (p) => p.id === offerProduct.products.id,
        );
        const partnerPrice = productWithPricing?.partner_price;

        if (partnerPrice) {
          totalPartnerPrice += partnerPrice;
          productsWithValidPricing++;
        }
      });

      // Check if all products have partner pricing
      const hasAllPartnerPricing = productsWithValidPricing === totalProducts;

      if (productsWithValidPricing === 0) {
        return null;
      }

      // Get the offer details to calculate discount
      const { data: offer } = await this.supabaseService.client
        .from('offers')
        .select('discount_type, discount_value')
        .eq('id', offerId)
        .single();

      let discountedPrice = totalPartnerPrice;

      if (offer) {
        if (offer.discount_type === 'percentage' && offer.discount_value) {
          discountedPrice =
            totalPartnerPrice * (1 - offer.discount_value / 100);
        } else if (
          offer.discount_type === 'fixed_amount' &&
          offer.discount_value
        ) {
          discountedPrice = Math.max(
            0,
            totalPartnerPrice - offer.discount_value,
          );
        }
      }

      return {
        originalPrice: totalPartnerPrice, // Sum of partner prices
        discountedPrice: discountedPrice, // Sum of discounted partner prices
        hasAllPartnerPricing,
        productCount: totalProducts,
      };
    } catch (error) {
      console.error('Error calculating offer partner pricing:', error);
      return null;
    }
  }

  /**
   * Get products with partner pricing for a specific company
   */
  private async getProductsWithPartnerPricing(
    productIds: string[],
    companyId: string,
  ): Promise<any[]> {
    try {
      const { data: products, error } = await this.supabaseService.client
        .from('products')
        .select(
          `
          id,
          name,
          price,
          company_pricing!left (
            price_tier_1,
            price,
            company_id
          )
        `,
        )
        .in('id', productIds);

      if (error) {
        console.error('Error fetching products with partner pricing:', error);
        return [];
      }

      return (products || []).map((product) => {
        // Find the company-specific pricing
        const companyPricing = product.company_pricing?.find(
          (cp: any) => cp.company_id === companyId,
        );

        return {
          ...product,
          partner_price: companyPricing?.price_tier_1 || companyPricing?.price,
          company_price: companyPricing?.price_tier_1 || companyPricing?.price,
          has_partner_pricing: !!companyPricing,
        };
      });
    } catch (error) {
      console.error('Error in getProductsWithPartnerPricing:', error);
      return [];
    }
  }
}
