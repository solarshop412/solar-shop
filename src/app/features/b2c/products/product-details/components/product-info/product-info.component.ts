import { Component, Input, inject, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, take } from 'rxjs/operators';
import { Product } from '../../../product-list/product-list.component';
import { TranslatePipe } from '../../../../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { TranslationService } from '../../../../../../shared/services/translation.service';
import { StockItem } from '../../../../../../shared/services/erp-integration.service';
import { getUnitName, filterAndCombineErpStock, FilteredStockItem } from '../../../../../../shared/utils/erp-unit-names';
import * as WishlistActions from '../../../../../b2c/wishlist/store/wishlist.actions';
import {
  selectIsProductInWishlist,
  selectAddingToWishlist,
  selectRemovingFromWishlist
} from '../../../../../b2c/wishlist/store/wishlist.selectors';
import { selectCurrentUser } from '../../../../../../core/auth/store/auth.selectors';
import * as CartActions from '../../../../../b2c/cart/store/cart.actions';
import {
  selectAverageRating,
  selectReviewCount
} from '../../store/product-details.selectors';
import { LucideAngularModule, Star, StarHalf, ShoppingCart } from 'lucide-angular';

@Component({
  selector: 'app-product-info',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TranslatePipe, 
    LucideAngularModule
  ],
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.scss']
})
export class ProductInfoComponent implements OnInit, OnDestroy, OnChanges {
  @Input() product!: Product;
  @Input() isCompanyPricing: boolean = false;
  @Input() erpStock: StockItem[] = []; // Receive ERP stock from parent component
  @Input() erpStockLoading: boolean = false; // Receive loading state from parent

  // Filtered and combined ERP stock (only mapped units, Buzin combined)
  filteredErpStock: FilteredStockItem[] = [];

  quantity: number = 1;

  // Partner discount percentage (additional discount for company pricing)
  readonly COMPANY_DISCOUNT_PERCENTAGE = 15;

  readonly StarIcon = Star;
  readonly StarHalfIcon = StarHalf;
  readonly ShoppingCartIcon = ShoppingCart;

  private store = inject(Store);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private translationService = inject(TranslationService);

  private destroy$ = new Subject<void>();

  // Combined wishlist state observable for template
  wishlistState$!: Observable<{
    isInWishlist: boolean;
    addingToWishlist: boolean;
    removingFromWishlist: string | null;
  }>;

  // Product reviews observables
  averageRating$ = this.store.select(selectAverageRating);
  reviewCount$ = this.store.select(selectReviewCount);

  // Collapsible sections - all collapsed by default
  descriptionOpen = false;
  productDetailsOpen = false;
  certificatesOpen = false;
  specificationsOpen = false;
  featuresOpen = false;
  technicalSheetOpen = false;
  stockInformationOpen = false;

  ngOnInit(): void {
    // Create combined observable for template
    this.wishlistState$ = combineLatest([
      this.store.select(selectIsProductInWishlist(this.product.id)),
      this.store.select(selectAddingToWishlist),
      this.store.select(selectRemovingFromWishlist)
    ]).pipe(
      map(([isInWishlist, addingToWishlist, removingFromWishlist]) => ({
        isInWishlist,
        addingToWishlist,
        removingFromWishlist
      }))
    );

    // Load wishlist data
    this.store.dispatch(WishlistActions.loadWishlist());

    // Filter and combine ERP stock
    this.updateFilteredStock();
  }

  ngOnChanges(): void {
    // Update filtered stock when erpStock input changes
    this.updateFilteredStock();
  }

  private updateFilteredStock(): void {
    this.filteredErpStock = filterAndCombineErpStock(this.erpStock);
  }

  /**
   * Get total stock across all filtered units
   */
  getTotalStock(): number {
    return this.filteredErpStock.reduce((total, stock) => total + stock.quantity, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getStarArray(rating: number): number[] {
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

  getAvailabilityText(availability: string): string {
    switch (availability) {
      case 'available': return 'productDetails.inStock';
      case 'limited': return 'productDetails.limitedStock';
      case 'out-of-stock': return 'productDetails.outOfStock';
      default: return '';
    }
  }

  increaseQuantity(): void {
    if (this.quantity < 99) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    this.store.dispatch(CartActions.addToCart({ productId: this.product.id, quantity: this.quantity }));
  }

  toggleWishlist(): void {
    // Check authentication first
    this.store.select(selectCurrentUser).pipe(
      takeUntil(this.destroy$),
      take(1)
    ).subscribe(user => {
      if (!user) {
        this.toastService.showError(this.translationService.translate('productDetails.loginRequiredForWishlist'));
        return;
      }

      // Get current wishlist state and toggle
      this.store.select(selectIsProductInWishlist(this.product.id)).pipe(
        take(1)
      ).subscribe(isInWishlist => {
        if (isInWishlist) {
          this.store.dispatch(WishlistActions.removeFromWishlist({ productId: this.product.id }));
        } else {
          this.store.dispatch(WishlistActions.addToWishlist({ productId: this.product.id }));
        }
      });
    });
  }

  getCompanyPrice(): number {
    return this.product.price * (1 - this.COMPANY_DISCOUNT_PERCENTAGE / 100);
  }

  getCompanySavings(): number {
    return this.product.price - this.getCompanyPrice();
  }

  getSpecificationsArray(): { key: string; value: string }[] {
    if (!this.product.specifications) {
      return [];
    }
    return Object.entries(this.product.specifications).map(([key, value]) => ({
      key,
      value: String(value)
    }));
  }

  formatSpecificationKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
  }

  hasSpecifications(): boolean {
    return !!(this.product.specifications && Object.keys(this.product.specifications).length > 0);
  }

  hasFeatures(): boolean {
    return !!(this.product.features && this.product.features.length > 0);
  }

  hasCertifications(): boolean {
    return !!(this.product.certificates && this.product.certificates.length > 0);
  }

  hasTechnicalSheet(): boolean {
    return !!(this.product.technical_sheet && this.product.technical_sheet.trim().length > 0);
  }

  toggleDescription() {
    this.descriptionOpen = !this.descriptionOpen;
  }

  toggleProductDetails() {
    this.productDetailsOpen = !this.productDetailsOpen;
  }

  toggleCertificates() {
    this.certificatesOpen = !this.certificatesOpen;
  }

  toggleSpecifications() {
    this.specificationsOpen = !this.specificationsOpen;
  }

  toggleFeatures() {
    this.featuresOpen = !this.featuresOpen;
  }

  toggleTechnicalSheet() {
    this.technicalSheetOpen = !this.technicalSheetOpen;
  }

  toggleStockInformation() {
    this.stockInformationOpen = !this.stockInformationOpen;
  }

  scrollToReviews() {
    const reviewsElement = document.getElementById('reviews');
    if (reviewsElement) {
      reviewsElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
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

  navigateToCategory(categoryName: string) {
    // Navigate to product list with category filter
    // Use the category name to create a slug-like parameter
    const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    this.router.navigate(['/proizvodi'], {
      queryParams: {
        category: categorySlug,
        categories: categoryName // Pass the actual category name for filtering
      }
    });
  }
} 
