import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { Product } from '../product-list/product-list.component';
import { ProductDetailsActions } from './store/product-details.actions';
import { selectProduct, selectIsLoading, selectError } from './store/product-details.selectors';
import { ProductPhotosComponent } from './components/product-photos/product-photos.component';
import { ProductInfoComponent } from './components/product-info/product-info.component';
import { ProductReviewsComponent } from './components/product-reviews/product-reviews.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { OffersService } from '../../offers/services/offers.service';
import { Offer } from '../../../../shared/models/offer.model';
import { ProductsService } from '../services/products.service';
import { ErpIntegrationService, StockItem } from '../../../../shared/services/erp-integration.service';
import { getUnitName } from '../../../../shared/utils/erp-unit-names';
import { SeoService } from '../../../../shared/services/seo.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductPhotosComponent,
    ProductInfoComponent,
    ProductReviewsComponent,
    TranslatePipe
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private offersService = inject(OffersService);
  private productsService = inject(ProductsService);
  private erpService = inject(ErpIntegrationService);
  private seoService = inject(SeoService);
  private destroy$ = new Subject<void>();

  product$: Observable<Product | null>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  isCompanyPricing = false;

  // Collapsible sections - collapsed by default
  bundlesOffersOpen = false;

  // Offers data
  productOffers: Offer[] = [];
  offersLoading = false;

  // Related products data
  relatedProducts: Product[] = [];
  relatedProductsLoading = false;

  // ERP stock information
  erpStock: StockItem[] = [];
  erpStockLoading = false;
  showStockByUnit = false; // Toggle for showing stock by unit/location

  constructor() {
    this.product$ = this.store.select(selectProduct);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.error$ = this.store.select(selectError);
  }

  ngOnInit(): void {
    // Check if this is company pricing mode
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(queryParams => {
      this.isCompanyPricing = queryParams['companyPricing'] === 'true';
    });

    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.store.dispatch(ProductDetailsActions.loadProduct({ productId }));
        this.loadProductOffers(productId);
        this.loadRelatedProducts(productId);
      } else {
        this.router.navigate(['/proizvodi']);
      }
    });

    // Subscribe to product changes to load ERP stock and set SEO
    this.product$.pipe(
      filter(product => !!product),
      takeUntil(this.destroy$)
    ).subscribe(product => {
      if (product) {
        // Set SEO for product page
        this.setProductSeo(product);

        // Load ERP stock if SKU available
        if (product.sku) {
          this.loadErpStock(product);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(ProductDetailsActions.clearProduct());
    this.seoService.resetToDefaults();
  }

  /**
   * Set SEO tags for the product page
   */
  private setProductSeo(product: Product): void {
    // Get product images
    const images: string[] = [];
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (typeof img === 'string' && img.trim()) {
          images.push(img);
        } else if (typeof img === 'object' && img.url && img.url.trim()) {
          images.push(img.url);
        }
      });
    } else if (product.imageUrl && product.imageUrl.trim()) {
      images.push(product.imageUrl);
    }

    // Set product page SEO
    this.seoService.setProductPage({
      name: product.name,
      description: product.description || `Kupite ${product.name} na Solarno.hr`,
      sku: product.sku,
      brand: product.manufacturer,
      price: product.price,
      currency: 'EUR',
      availability: product.availability === 'available' ? 'InStock' :
                    product.availability === 'limited' ? 'LimitedAvailability' : 'OutOfStock',
      images: images.length > 0 ? images : undefined,
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      category: product.category
    });

    // Set breadcrumbs schema
    this.seoService.setBreadcrumbs([
      { name: 'Početna', url: '/' },
      { name: 'Proizvodi', url: '/proizvodi' },
      { name: product.name }
    ]);
  }

  toggleBundlesOffers(): void {
    this.bundlesOffersOpen = !this.bundlesOffersOpen;
  }

  hasOffersForProduct(): boolean {
    return this.productOffers.length > 0;
  }

  private loadProductOffers(productId: string): void {
    this.offersLoading = true;
    this.offersService.getActiveOffers(3).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (offers) => {
        this.productOffers = offers;
        this.offersLoading = false;
      },
      error: (error) => {
        console.error('Error loading offers:', error);
        this.productOffers = [];
        this.offersLoading = false;
      }
    });
  }

  viewOffer(offerId: string): void {
    this.router.navigate(['/ponude', offerId]);
  }

  claimOffer(offerId: string): void {
    this.router.navigate(['/ponude', offerId]);
  }

  public trackByOfferId(_index: number, offer: Offer): string {
    return offer.id;
  }

  public onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/product-placeholder.svg';
    }
  }

  public onRelatedProductImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/product-placeholder.svg';
    }
  }

  private loadRelatedProducts(productId: string): void {
    this.relatedProductsLoading = true;
    
    this.product$.pipe(
      takeUntil(this.destroy$),
      filter(product => product !== null)
    ).subscribe(product => {
      if (product) {
        // Get products from same categories
        const categoryNames = product.categories?.map(cat => cat.name) || [product.category];
        
        this.productsService.getProductsByCategories(categoryNames, productId, 4).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (products) => {
            this.relatedProducts = products;
            this.relatedProductsLoading = false;
          },
          error: (error) => {
            console.error('Error loading related products:', error);
            this.relatedProducts = [];
            this.relatedProductsLoading = false;
          }
        });
      }
    });
  }

  public getProductImageUrl(product: Product): string {
    // First check if product has images array with valid URLs
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      // Check if it's a string URL or an object with url property
      if (typeof firstImage === 'string' && firstImage.trim()) {
        return firstImage;
      } else if (typeof firstImage === 'object' && firstImage.url && firstImage.url.trim()) {
        return firstImage.url;
      }
    }
    
    // Fallback to imageUrl if it exists and is not empty
    if (product.imageUrl && product.imageUrl.trim()) {
      return product.imageUrl;
    }
    
    // Only return placeholder if no valid image found
    return 'assets/images/product-placeholder.svg';
  }

  public trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  public getAvailabilityText(availability: string): string {
    switch (availability) {
      case 'available': return 'productDetails.inStock';
      case 'limited': return 'productDetails.limitedStock';
      case 'out-of-stock': return 'productDetails.outOfStock';
      default: return '';
    }
  }

  /**
   * Load ERP stock information for the current product
   */
  private loadErpStock(product: Product): void {
    if (!product.sku) {
      console.warn('[B2C Product Details] No SKU available for product');
      return;
    }

    this.erpStockLoading = true;
    this.erpService.getStockBySku(product.sku)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.erpStock = response.data;
            console.log('[B2C Product Details] ERP stock loaded:', this.erpStock);
          } else {
            console.warn('[B2C Product Details] Failed to load ERP stock:', response.error);
            this.erpStock = [];
          }
          this.erpStockLoading = false;
        },
        error: (error) => {
          console.error('[B2C Product Details] Error loading ERP stock:', error);
          this.erpStock = [];
          this.erpStockLoading = false;
        }
      });
  }

  /**
   * Get total ERP stock across all units
   */
  getTotalErpStock(): number {
    return this.erpStock.reduce((total, stock) => total + stock.quantity, 0);
  }

  /**
   * Get display name for a unit ID
   */
  getUnitDisplayName(unitId: string | undefined, unitName?: string): string {
    return getUnitName(unitId, unitName);
  }

  public getStarArray(rating: number): number[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(1);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(0.5);
    }

    // Add empty stars to complete 5 stars
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(0);
    }

    return stars;
  }
} 