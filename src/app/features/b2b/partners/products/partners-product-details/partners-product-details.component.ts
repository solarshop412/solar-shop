import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { LucideAngularModule, ShoppingCart } from 'lucide-angular';
import { selectCurrentUser } from '../../../../../core/auth/store/auth.selectors';
import { User } from '../../../../../shared/models/user.model';
import { Company } from '../../../../../shared/models/company.model';
import { SupabaseService } from '../../../../../services/supabase.service';
import {
  ErpIntegrationService,
  StockItem,
} from '../../../../../shared/services/erp-integration.service';
import {
  getUnitName,
  filterAndCombineErpStock,
  FilteredStockItem,
} from '../../../../../shared/utils/erp-unit-names';
import * as ProductsActions from '../../../shared/store/products.actions';
import {
  selectProductsWithPricing,
  selectProductsLoading,
} from '../../../shared/store/products.selectors';
import { ProductWithPricing } from '../../../shared/store/products.actions';
import * as B2BCartActions from '../../../cart/store/b2b-cart.actions';

@Component({
  selector: 'app-partners-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslatePipe,
    LucideAngularModule,
  ],
  templateUrl: './partners-product-details.component.html',
  styleUrls: ['./partners-product-details.component.scss'],
})
export class PartnersProductDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private supabaseService = inject(SupabaseService);
  private erpService = inject(ErpIntegrationService);
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  isAuthenticated = false;
  isCompanyContact = false;
  company: Company | null = null;

  product: ProductWithPricing | null = null;
  loading = true;
  error: string | null = null;
  suggestedProducts: ProductWithPricing[] = [];

  // Collapsible state
  isDescriptionExpanded = true;
  isSpecificationsExpanded = false;

  // Lucide icons
  ShoppingCartIcon = ShoppingCart;
  isTechnicalSheetExpanded = true;

  // Image carousel state
  currentImageIndex = 0;

  // Quantity selector
  selectedQuantity = 1;

  products$: Observable<ProductWithPricing[]>;
  loading$: Observable<boolean>;

  // ERP stock information
  erpStock: StockItem[] = [];
  erpStockLoading = false;
  showStockByUnit = false; // Toggle for showing stock by unit/location
  // Filtered and combined ERP stock (only mapped units, Buzin combined)
  filteredErpStock: FilteredStockItem[] = [];

  constructor() {
    this.products$ = this.store.select(selectProductsWithPricing);
    this.loading$ = this.store.select(selectProductsLoading);
  }

  ngOnInit(): void {
    // First, get the product ID from route
    const productId = this.route.snapshot.params['id'];
    if (!productId) {
      this.error = 'Product ID not found';
      this.loading = false;
      return;
    }

    // Load user and company info first, then load products
    this.store
      .select(selectCurrentUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (user) => {
        this.currentUser = user;
        this.isAuthenticated = !!user;

        if (user) {
          // Load company info and wait for it to complete
          await this.loadCompanyInfo(user.id);

          // Now load the product with company pricing if available
          this.loadProduct(productId);
        } else {
          // No user, load product without company pricing
          this.loadProduct(productId);
        }
      });

    // Subscribe to products from store
    this.products$.pipe(takeUntil(this.destroy$)).subscribe((products) => {
      if (products && products.length > 0 && productId) {
        const foundProduct = products.find((p) => p.id === productId);
        if (foundProduct) {
          this.product = foundProduct;
          this.error = null;
          // Load suggested products
          this.loadSuggestedProducts(foundProduct.id);
          // Load ERP stock
          this.loadErpStock(foundProduct);
        } else if (!this.loading) {
          // Only set error if we're not still loading
          this.error = 'Product not found';
        }
      }
    });

    // Subscribe to loading state
    this.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      this.loading = loading;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadCompanyInfo(userId: string): Promise<void> {
    try {
      const { data: company, error } = await this.supabaseService.client
        .from('companies')
        .select('*')
        .eq('contact_person_id', userId)
        .eq('status', 'approved')
        .single();

      if (!error && company) {
        this.company = company;
        this.isCompanyContact = true;
      }
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  }

  private loadProduct(productId: string): void {
    this.loading = true;
    this.error = null;

    // Always load all products first
    this.store.dispatch(ProductsActions.loadProducts({}));

    // If we have company info, load company-specific pricing
    // Use a small delay to ensure company info is fully loaded
    if (this.isCompanyContact && this.company) {
      setTimeout(() => {
        if (this.company) {
          this.store.dispatch(
            ProductsActions.loadCompanyPricing({ companyId: this.company.id }),
          );
        }
      }, 100);
    }
  }

  hasB2BPrice(product: ProductWithPricing): boolean {
    return !!(product.company_price || product.partner_price);
  }

  getMinimumOrder(product: ProductWithPricing): number {
    // Use company-specific minimum order if available, otherwise use product default
    if (this.isCompanyContact && product.company_minimum_order !== undefined) {
      return product.company_minimum_order;
    }
    return product.minimum_order || 1;
  }

  getSpecifications(
    specs: Record<string, string>,
  ): { key: string; value: string }[] {
    return Object.entries(specs).map(([key, value]) => ({ key, value }));
  }

  addToCart(product: ProductWithPricing): void {
    if (this.isCompanyContact && this.company) {
      // Ensure quantity meets minimum order requirement
      const quantity = Math.max(
        this.selectedQuantity,
        this.getMinimumOrder(product),
      );

      this.store.dispatch(
        B2BCartActions.addToB2BCart({
          productId: product.id,
          quantity: quantity,
          companyId: this.company.id,
        }),
      );

      // Open cart sidebar after adding
      this.store.dispatch(B2BCartActions.openB2BCartSidebar());

      // Reset quantity to minimum order or 1
      this.selectedQuantity = Math.max(1, this.getMinimumOrder(product));
    }
  }

  increaseQuantity(): void {
    this.selectedQuantity++;
  }

  decreaseQuantity(): void {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }

  onQuantityChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);
    if (!isNaN(value) && value > 0) {
      this.selectedQuantity = value;
    } else {
      this.selectedQuantity = 1;
    }
  }

  requestQuote(product: ProductWithPricing): void {
    this.router.navigate(['/partneri/kontakt'], {
      queryParams: {
        subject: 'pricingInquiry',
        productId: product.id,
        productName: product.name,
        sku: product.sku,
      },
    });
  }

  getProductImageUrl(product: ProductWithPricing): string {
    // If image_url is already computed, use it
    if (product.image_url) {
      return product.image_url;
    }

    // Extract from images array
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      // Find primary image first
      const primaryImage = product.images.find((img) => img.is_primary);
      if (primaryImage) {
        return primaryImage.url;
      }

      // Fallback to first image
      return product.images[0].url;
    }

    // Return empty string to indicate no image available - will show fallback icon
    return '';
  }

  hasProductImage(product: ProductWithPricing): boolean {
    return !!this.getProductImageUrl(product);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/images/product-placeholder.svg';
    }
  }

  onThumbnailImageError(event: Event, index: number): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/images/product-placeholder.svg';
    }
  }

  onSuggestedImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/images/product-placeholder.svg';
    }
  }

  getCurrentImageUrl(): string {
    const images = this.getProductImages();
    if (images.length > 0 && this.currentImageIndex < images.length) {
      return images[this.currentImageIndex];
    }
    return 'assets/images/product-placeholder.svg';
  }

  getProductImages(): string[] {
    if (!this.product) return [];

    const images: string[] = [];

    // Add primary image from image_url if available and not empty
    if (this.product.image_url && this.product.image_url.trim()) {
      images.push(this.product.image_url);
    }

    // Add images from images array
    if (this.product.images && Array.isArray(this.product.images)) {
      this.product.images.forEach((img) => {
        if (img.url && img.url.trim() && !images.includes(img.url)) {
          images.push(img.url);
        }
      });
    }

    // Only return images if we found valid ones, otherwise return empty array
    return images;
  }

  hasMultipleImages(): boolean {
    const images = this.getProductImages();
    return images.length > 1;
  }

  getImageCount(): number {
    return this.getProductImages().length;
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  nextImage(): void {
    const imageCount = this.getImageCount();
    if (this.currentImageIndex < imageCount - 1) {
      this.currentImageIndex++;
    }
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

  getSuggestedProductImageUrl(product: ProductWithPricing): string {
    // If image_url is available and not empty, use it
    if (product.image_url && product.image_url.trim()) {
      return product.image_url;
    }

    // Extract from images array - use first image
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      // Find primary image first
      const primaryImage = product.images.find(
        (img) => img.is_primary && img.url && img.url.trim(),
      );
      if (primaryImage) {
        return primaryImage.url;
      }

      // Fallback to first image with valid url
      const firstImageWithUrl = product.images.find(
        (img) => img.url && img.url.trim(),
      );
      if (firstImageWithUrl) {
        return firstImageWithUrl.url;
      }
    }

    // Return placeholder if no valid image available
    return 'assets/images/product-placeholder.svg';
  }

  navigateToLogin(): void {
    this.router.navigate(['/prijava']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/partneri/registracija']);
  }

  toggleDescription(): void {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  toggleSpecifications(): void {
    this.isSpecificationsExpanded = !this.isSpecificationsExpanded;
  }

  toggleTechnicalSheet(): void {
    this.isTechnicalSheetExpanded = !this.isTechnicalSheetExpanded;
  }

  private async loadSuggestedProducts(productId: string): Promise<void> {
    try {
      // Reset image carousel when loading new product
      this.currentImageIndex = 0;

      // Load product relationships
      const { data: relationships, error } = await this.supabaseService.client
        .from('product_relationships')
        .select(
          `
          *,
          related_product_id,
          related_category_id
        `,
        )
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      if (relationships && relationships.length > 0) {
        // Get related product IDs
        const relatedProductIds = relationships
          .filter((r) => r.related_product_id)
          .map((r) => r.related_product_id);

        // Get products from related categories
        const relatedCategoryIds = relationships
          .filter((r) => r.related_category_id)
          .map((r) => r.related_category_id);

        // Use the existing products from store and filter
        this.products$.pipe(takeUntil(this.destroy$)).subscribe((products) => {
          this.suggestedProducts = products
            .filter((p) => {
              // Don't suggest the current product
              if (p.id === productId) return false;

              // Include if it's a directly related product
              if (relatedProductIds.includes(p.id)) return true;

              // Include if it's from a related category
              if (relatedCategoryIds.includes(p.category_id)) return true;

              return false;
            })
            .slice(0, 4); // Limit to 4 suggested products
        });
      } else {
        // If no relationships defined, show products from same category
        if (this.product?.category_id) {
          this.products$
            .pipe(takeUntil(this.destroy$))
            .subscribe((products) => {
              this.suggestedProducts = products
                .filter(
                  (p) =>
                    p.id !== productId &&
                    p.category_id === this.product?.category_id,
                )
                .slice(0, 4);
            });
        }
      }
    } catch (error) {
      console.error('Error loading suggested products:', error);
      this.suggestedProducts = [];
    }
  }

  navigateToProduct(productId: string): void {
    // Navigate to the new product and reload
    this.router.navigate(['/partneri/proizvodi', productId]).then(() => {
      // Force component reload by scrolling to top
      window.scrollTo(0, 0);
    });
  }

  getFullTechnicalSheetUrl(url: string): string {
    if (!url) return '';

    // If URL already has protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If URL starts with www., add https://
    if (url.startsWith('www.')) {
      return `https://${url}`;
    }

    // If it doesn't start with www. or protocol, assume it needs https://www.
    if (!url.includes('.')) {
      // If it doesn't contain a dot, it's probably not a valid URL
      return url;
    }

    return `https://${url}`;
  }

  navigateToCategory(category: string): void {
    // Navigate to product list with category filter
    // Use the category name to create a slug-like parameter
    const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    this.router.navigate(['/partneri/proizvodi'], {
      queryParams: {
        category: categorySlug,
        categories: category, // Pass the actual category name for filtering
      },
    });
  }

  /**
   * Load ERP stock information for the current product
   */
  private loadErpStock(product: ProductWithPricing): void {
    if (!product.sku) {
      console.warn('[B2B Product Details] No SKU available for product');
      return;
    }

    this.erpStockLoading = true;
    this.erpService
      .getStockBySku(product.sku)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.erpStock = response.data;
            // Filter and combine stock for display
            this.updateFilteredStock();
            console.log(
              '[B2B Product Details] ERP stock loaded:',
              this.erpStock,
            );
          } else {
            console.warn(
              '[B2B Product Details] Failed to load ERP stock:',
              response.error,
            );
            this.erpStock = [];
            this.filteredErpStock = [];
          }
          this.erpStockLoading = false;
        },
        error: (error) => {
          console.error(
            '[B2B Product Details] Error loading ERP stock:',
            error,
          );
          this.erpStock = [];
          this.filteredErpStock = [];
          this.erpStockLoading = false;
        },
      });
  }

  /**
   * Update filtered stock when erpStock changes
   */
  private updateFilteredStock(): void {
    this.filteredErpStock = filterAndCombineErpStock(this.erpStock);
  }

  /**
   * Get total ERP stock across all units
   */
  getTotalErpStock(): number {
    return this.filteredErpStock.reduce(
      (total, stock) => total + stock.quantity,
      0,
    );
  }

  /**
   * Get display name for a unit ID
   */
  getUnitDisplayName(unitId: string | undefined, unitName?: string): string {
    return getUnitName(unitId, unitName);
  }
}
