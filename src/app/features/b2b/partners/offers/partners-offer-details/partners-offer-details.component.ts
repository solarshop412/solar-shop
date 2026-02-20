import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import * as B2BCartActions from '../../../cart/store/b2b-cart.actions';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { SupabaseService } from '../../../../../services/supabase.service';
import {
  applyB2BCoupon,
  addAllToB2BCartFromOffer,
  addAllToB2BCartFromOfferSuccess,
} from '../../../cart/store/b2b-cart.actions';
import {
  selectB2BCartHasCompanyId,
  selectB2BCartCompanyId,
} from '../../../cart/store/b2b-cart.selectors';
import { ToastService } from '../../../../../shared/services/toast.service';
import { TranslationService } from '../../../../../shared/services/translation.service';
import { B2BCartService } from '../../../cart/services/b2b-cart.service';
import { PartnerOffer } from '../../../../../shared/models/partner-offer.model';
import { PartnerProduct } from '../../../../../shared/models/partner-product.model';

@Component({
  selector: 'app-partners-offer-details',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './partners-offer-details.component.html',
  styleUrls: ['./partners-offer-details.component.scss'],
})
export class PartnersOfferDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private store = inject(Store);
  private actions$ = inject(Actions);
  private toastService = inject(ToastService);
  private translationService = inject(TranslationService);
  private b2bCartService = inject(B2BCartService);

  offer: PartnerOffer | null = null;
  products: PartnerProduct[] = [];
  copiedCoupon = false;
  isLoading = true;
  isCategoryOffer = false;
  offerCategoryName = '';
  hasPartnerPricing = false;
  totalPartnerPrice = 0;
  totalDiscountedPrice = 0;
  totalSavings = 0;
  totalDiscountPercentage = 0;

  private destroy$ = new Subject<void>();
  private offerProductsData: any[] = [];

  // Observables
  userCompanyId$ = this.store.select(selectB2BCartCompanyId);
  hasCompanyId$ = this.store.select(selectB2BCartHasCompanyId);

  // Helper methods for discount type checking
  isPercentageDiscount(): boolean {
    return (
      !this.offer?.discount_type || this.offer.discount_type === 'percentage'
    );
  }

  isFixedAmountDiscount(): boolean {
    return this.offer?.discount_type === 'fixed_amount';
  }

  async ngOnInit(): Promise<void> {
    const offerId = this.route.snapshot.params['id'];
    await this.loadOfferData(offerId);
    window.scrollTo(0, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadOfferData(offerId: string): Promise<void> {
    try {
      this.isLoading = true;

      // Load offer
      await this.loadOffer(offerId);

      if (!this.offer) {
        return;
      }

      // Get company ID
      const companyId = await firstValueFrom(this.userCompanyId$);

      // Load products
      await this.loadProducts(offerId, companyId);

      // Determine if this is a category offer
      this.isCategoryOffer =
        this.products.length === 0 &&
        !!this.offer.applicable_category_ids &&
        this.offer.applicable_category_ids.length > 0;

      // Calculate totals if fixed amount discount
      if (this.isFixedAmountDiscount() && this.products.length > 0) {
        this.calculateTotals();
      }
    } catch (error) {
      console.error('Error loading offer data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadOffer(offerId: string): Promise<void> {
    try {
      const offer = await this.supabaseService.getTableById('offers', offerId);

      if (!offer || !offer.is_b2b) {
        console.error('Offer not found or not a B2B offer');
        return;
      }

      const originalPrice = offer.original_price || 0;
      const discountPercentage =
        offer.discount_type === 'percentage' || !offer.discount_type
          ? offer.discount_value
          : 0;
      let discountedPrice = offer.discounted_price || 0;

      if (discountedPrice === 0 && originalPrice > 0) {
        if (
          (offer.discount_type === 'percentage' || !offer.discount_type) &&
          offer.discount_value > 0
        ) {
          discountedPrice = originalPrice * (1 - offer.discount_value / 100);
        } else if (
          offer.discount_type === 'fixed_amount' &&
          offer.discount_value > 0
        ) {
          discountedPrice = Math.max(0, originalPrice - offer.discount_value);
        }
      }

      this.offer = {
        id: offer.id,
        title: offer.title,
        originalPrice: originalPrice,
        discountedPrice: discountedPrice,
        discountPercentage: discountPercentage,
        discount_type: offer.discount_type,
        discount_value: offer.discount_value,
        imageUrl: offer.image_url || 'assets/images/product-placeholder.webp',
        description: offer.description || '',
        shortDescription: offer.short_description || '',
        type: 'partner-exclusive',
        status: offer.status || 'active',
        couponCode: offer.code,
        startDate: offer.start_date || '',
        endDate: offer.end_date || '',
        featured: offer.featured || false,
        isB2B: offer.is_b2b,
        applicable_category_ids: offer.applicable_category_ids || [],
        bundle: offer.bundle || false,
      };

      // Load category name if applicable
      if (
        this.offer.applicable_category_ids &&
        this.offer.applicable_category_ids.length > 0
      ) {
        await this.loadOfferCategoryName(this.offer.applicable_category_ids[0]);
      }
    } catch (error) {
      console.error('Error loading offer:', error);
    }
  }

  private async loadOfferCategoryName(categoryId: string): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();

      if (data && !error) {
        this.offerCategoryName = data.name;
      }
    } catch (error) {
      console.error('Error loading category name:', error);
    }
  }

  private async loadProducts(
    offerId: string,
    companyId: string | null,
  ): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.client
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
        .eq('offer_id', offerId)
        .order('sort_order');

      if (error) {
        console.error('Error loading offer products:', error);
        return;
      }

      this.offerProductsData = data || [];

      if (!data || data.length === 0) {
        this.products = [];
        return;
      }

      // Process products with partner pricing
      this.products = await Promise.all(
        data.map(async (offerProduct: any) => {
          const productId = offerProduct.products.id;
          let partnerPrice = 0;
          let hasPartnerPricing = false;

          // Check partner pricing if company ID exists
          if (companyId) {
            try {
              const partnerPricing =
                await this.b2bCartService.getPartnerPricingDetails(
                  productId,
                  companyId,
                );
              if (partnerPricing && partnerPricing.price_tier_1 > 0) {
                partnerPrice = partnerPricing.price_tier_1;
                hasPartnerPricing = true;
              }
            } catch (error) {
              console.warn(
                `Error getting partner pricing for product ${productId}:`,
                error,
              );
            }
          }

          // Calculate discounted price
          let partnerDiscountedPrice = partnerPrice;
          if (hasPartnerPricing && this.offer) {
            if (this.isPercentageDiscount()) {
              partnerDiscountedPrice =
                partnerPrice * (1 - (this.offer.discount_value || 0) / 100);
            } else if (this.isFixedAmountDiscount()) {
              partnerDiscountedPrice = Math.max(
                0,
                partnerPrice - (this.offer.discount_value || 0),
              );
            }
          }

          const savings = hasPartnerPricing
            ? offerProduct.products.price - partnerDiscountedPrice
            : 0;

          return {
            id: productId,
            name: offerProduct.products.name,
            description: offerProduct.products.description,
            imageUrl: this.getProductImageUrl(offerProduct.products.images),
            price: offerProduct.products.price || 0,
            category:
              offerProduct.products.categories?.name || 'Solar Equipment',
            sku: offerProduct.products.sku || '',
            stock_quantity: offerProduct.products.stock_quantity || 0,
            discount_percentage: offerProduct.discount_percentage || 0,
            discount_amount: offerProduct.discount_amount || 0,
            has_partner_pricing: hasPartnerPricing,
            partner_price: partnerPrice,
            partner_discounted_price: partnerDiscountedPrice,
            partner_savings: savings,
          };
        }),
      );

      // Calculate hasPartnerPricing - true only if ALL products have partner pricing
      const productsWithPricing = this.products.filter(
        (p) => p.has_partner_pricing,
      );
      this.hasPartnerPricing =
        this.products.length > 0 &&
        productsWithPricing.length === this.products.length;
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  private calculateTotals(): void {
    const productsWithPricing = this.products.filter(
      (p) => p.has_partner_pricing,
    );

    // hasPartnerPricing should be true only if ALL products have partner pricing
    this.hasPartnerPricing =
      this.products.length > 0 &&
      productsWithPricing.length === this.products.length;

    if (this.hasPartnerPricing) {
      this.totalPartnerPrice = productsWithPricing.reduce(
        (sum, p) => sum + (p.partner_price || 0),
        0,
      );
      this.totalDiscountedPrice = productsWithPricing.reduce(
        (sum, p) => sum + (p.partner_discounted_price || 0),
        0,
      );
      this.totalSavings = this.totalPartnerPrice - this.totalDiscountedPrice;
      this.totalDiscountPercentage =
        this.totalPartnerPrice > 0
          ? Math.round((this.totalSavings / this.totalPartnerPrice) * 100)
          : 0;
    }
  }

  private getProductImageUrl(images: any): string {
    if (images && Array.isArray(images) && images.length > 0) {
      return images[0].url || images[0];
    }
    return 'assets/images/product-placeholder.webp';
  }

  copyCouponCode(code: string): void {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        this.copiedCoupon = true;
        setTimeout(() => {
          this.copiedCoupon = false;
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy coupon code:', err);
      });
  }

  claimOffer(offer: PartnerOffer): void {
    this.userCompanyId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((companyId) => {
        if (!companyId) {
          this.toastService.showError(
            this.translationService.translate('b2b.auth.pleaseLoginAsPartner'),
          );
          return;
        }

        if (this.isOfferExpired(offer.endDate)) {
          this.toastService.showError(
            this.translationService.translate('b2b.offers.offerExpired'),
          );
          return;
        }

        if (this.products.length === 0) {
          // Category offer
          let message = this.translationService.translate(
            'b2b.offers.offerClaimed',
            { title: offer.title },
          );
          if (offer.couponCode) {
            message +=
              ' ' +
              this.translationService.translate(
                'b2b.offers.couponAppliedAutomatically',
                { code: offer.couponCode },
              );
            this.applyCouponCode(offer.couponCode, companyId);
          }
          this.toastService.showSuccess(message);
          return;
        }

        // Product offer
        this.addOfferProductsToCart(this.products, offer, companyId);

        if (offer.couponCode) {
          // Wait for cart items to be successfully added before applying coupon
          this.actions$
            .pipe(
              ofType(addAllToB2BCartFromOfferSuccess),
              filter((action) => action.addedCount > 0),
              takeUntil(this.destroy$),
            )
            .subscribe(() => {
              this.applyCouponCode(offer.couponCode!, companyId);
            });
        }
      });
  }

  private addOfferProductsToCart(
    products: PartnerProduct[],
    offer: PartnerOffer,
    companyId: string,
  ): void {
    const availableProducts = products.filter(
      (product) =>
        (product.stock_quantity || 0) > 0 && product.has_partner_pricing,
    );

    if (availableProducts.length === 0) {
      this.toastService.showWarning(
        this.translationService.translate('b2b.offers.allProductsOutOfStock'),
      );
      return;
    }

    const productsToAdd = availableProducts.map((product) => {
      const offerProduct = this.offerProductsData?.find(
        (op) => op.products.id === product.id,
      );
      const hasIndividualDiscount =
        offerProduct &&
        ((offerProduct.discount_percentage &&
          offerProduct.discount_percentage > 0) ||
          (offerProduct.discount_amount && offerProduct.discount_amount > 0));

      return {
        productId: product.id,
        quantity: 1,
        individualDiscount: hasIndividualDiscount
          ? offerProduct.discount_percentage || offerProduct.discount_amount
          : undefined,
        individualDiscountType: hasIndividualDiscount
          ? ((offerProduct.discount_amount > 0
              ? 'fixed_amount'
              : 'percentage') as 'percentage' | 'fixed_amount')
          : undefined,
        originalPrice: product.partner_price || product.price, // Use partner price as the base, fall back to retail price if no partner pricing
      };
    });

    const offerType = (offer.discount_type || 'percentage') as
      | 'percentage'
      | 'fixed_amount'
      | 'tier_based'
      | 'bundle';
    const discountValue = offer.discount_value || offer.discountPercentage || 0;

    this.store.dispatch(
      addAllToB2BCartFromOffer({
        products: productsToAdd,
        companyId,
        partnerOfferId: offer.id,
        partnerOfferName: offer.title,
        partnerOfferType: offerType,
        partnerOfferDiscount: discountValue,
        partnerOfferValidUntil: offer.endDate,
        isBundle: offer.bundle || false,
        bundleProductIds: offer.bundle
          ? this.products.map((p: PartnerProduct) => p.id)
          : undefined,
      }),
    );

    // Open cart sidebar
    this.store.dispatch(B2BCartActions.openB2BCartSidebar());

    let message = this.translationService.translate(
      'b2b.offers.offerClaimedWithProducts',
      {
        title: offer.title,
        count: availableProducts.length,
      },
    );

    if (offer.couponCode) {
      message +=
        ' ' +
        this.translationService.translate(
          'b2b.offers.couponAppliedAutomatically',
          { code: offer.couponCode },
        );
    }

    const outOfStockCount = products.length - availableProducts.length;
    if (outOfStockCount > 0) {
      message +=
        ' ' +
        this.translationService.translate('b2b.offers.itemsOutOfStock', {
          count: outOfStockCount,
        });
    }

    this.toastService.showSuccess(message);
  }

  addToCart(product: PartnerProduct): void {
    this.userCompanyId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((companyId) => {
        if (!companyId) {
          this.toastService.showError(
            this.translationService.translate('b2b.auth.pleaseLoginAsPartner'),
          );
          return;
        }

        if ((product.stock_quantity || 0) <= 0) {
          this.toastService.showWarning(
            this.translationService.translate('b2b.offers.productsOutOfStock', {
              count: 1,
            }),
          );
          return;
        }

        if (!this.offer) {
          this.toastService.showError(
            this.translationService.translate('b2b.offers.offerNotFound'),
          );
          return;
        }

        const offerProduct = this.offerProductsData?.find(
          (op) => op.products.id === product.id,
        );
        const hasIndividualDiscount =
          offerProduct &&
          ((offerProduct.discount_percentage &&
            offerProduct.discount_percentage > 0) ||
            (offerProduct.discount_amount && offerProduct.discount_amount > 0));

        const productPayload = {
          productId: product.id,
          quantity: 1,
          individualDiscount: hasIndividualDiscount
            ? offerProduct.discount_percentage || offerProduct.discount_amount
            : undefined,
          individualDiscountType: hasIndividualDiscount
            ? ((offerProduct.discount_amount > 0
                ? 'fixed_amount'
                : 'percentage') as 'percentage' | 'fixed_amount')
            : undefined,
          originalPrice: product.partner_price || product.price, // Use partner price as the base, fall back to retail price if no partner pricing
        };

        const offerType = (this.offer.discount_type || 'percentage') as
          | 'percentage'
          | 'fixed_amount'
          | 'tier_based'
          | 'bundle';
        const discountValue =
          this.offer.discount_value || this.offer.discountPercentage || 0;

        this.store.dispatch(
          addAllToB2BCartFromOffer({
            products: [productPayload],
            companyId,
            partnerOfferId: this.offer.id,
            partnerOfferName: this.offer.title,
            partnerOfferType: offerType,
            partnerOfferDiscount: discountValue,
            partnerOfferValidUntil: this.offer.endDate,
            isBundle: this.offer.bundle || false,
            bundleProductIds: this.offer.bundle
              ? this.products.map((p: PartnerProduct) => p.id)
              : undefined,
          }),
        );

        // Open cart sidebar
        this.store.dispatch(B2BCartActions.openB2BCartSidebar());

        this.toastService.showSuccess(
          this.translationService.translate('cart.itemAddedToCart'),
        );
      });
  }

  async addAllToCart(): Promise<void> {
    if (!this.offer) {
      this.toastService.showError(
        this.translationService.translate('b2b.offers.offerNotFound'),
      );
      return;
    }

    this.userCompanyId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((companyId) => {
        if (!companyId) {
          this.toastService.showError(
            this.translationService.translate('b2b.auth.pleaseLoginAsPartner'),
          );
          return;
        }

        if (!this.products.length) {
          this.toastService.showWarning(
            this.translationService.translate('b2b.offers.noProductsToAdd'),
          );
          return;
        }

        const availableProducts = this.products.filter(
          (product) =>
            (product.stock_quantity || 0) > 0 && product.has_partner_pricing,
        );

        if (availableProducts.length === 0) {
          this.toastService.showWarning(
            this.translationService.translate(
              'b2b.offers.allProductsOutOfStock',
            ),
          );
          return;
        }

        const productsToAdd = availableProducts.map((product) => {
          const offerProduct = this.offerProductsData.find(
            (op) => op.products.id === product.id,
          );
          const hasIndividualDiscount =
            offerProduct &&
            ((offerProduct.discount_percentage &&
              offerProduct.discount_percentage > 0) ||
              (offerProduct.discount_amount &&
                offerProduct.discount_amount > 0));

          return {
            productId: product.id,
            quantity: 1,
            individualDiscount: hasIndividualDiscount
              ? offerProduct.discount_percentage || offerProduct.discount_amount
              : undefined,
            individualDiscountType: hasIndividualDiscount
              ? ((offerProduct.discount_amount > 0
                  ? 'fixed_amount'
                  : 'percentage') as 'percentage' | 'fixed_amount')
              : undefined,
            originalPrice: product.partner_price || product.price, // Use partner price as the base, fall back to retail price if no partner pricing
          };
        });

        const offerType = (this.offer!.discount_type || 'percentage') as
          | 'percentage'
          | 'fixed_amount'
          | 'tier_based'
          | 'bundle';
        const discountValue =
          this.offer!.discount_value || this.offer!.discountPercentage || 0;

        this.store.dispatch(
          addAllToB2BCartFromOffer({
            products: productsToAdd,
            companyId,
            partnerOfferId: this.offer!.id,
            partnerOfferName: this.offer!.title,
            partnerOfferType: offerType,
            partnerOfferDiscount: discountValue,
            partnerOfferValidUntil: this.offer!.endDate,
            isBundle: this.offer!.bundle || false,
            bundleProductIds: this.offer!.bundle
              ? this.products.map((p: PartnerProduct) => p.id)
              : undefined,
          }),
        );

        // Open cart sidebar
        this.store.dispatch(B2BCartActions.openB2BCartSidebar());

        this.toastService.showSuccess(
          this.translationService.translate('offers.addedProductsToCart', {
            count: availableProducts.length,
          }),
        );

        const outOfStockCount = this.products.length - availableProducts.length;
        if (outOfStockCount > 0) {
          this.toastService.showWarning(
            this.translationService.translate('b2b.offers.productsOutOfStock', {
              count: outOfStockCount,
            }),
          );
        }
      });
  }

  isOfferExpired(endDate?: string): boolean {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  }

  trackByProductId(_index: number, product: PartnerProduct): string {
    return product.id;
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/partneri/proizvodi', productId]);
  }

  navigateToProducts(): void {
    this.router.navigate(['/partneri/proizvodi']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private applyCouponCode(couponCode: string, companyId: string): void {
    this.store.dispatch(
      applyB2BCoupon({
        code: couponCode,
        companyId: companyId,
      }),
    );
  }

  contactSupport(): void {
    // Navigate to contact page or open contact modal
    this.router.navigate(['/partneri/kontakt']);
  }
}
