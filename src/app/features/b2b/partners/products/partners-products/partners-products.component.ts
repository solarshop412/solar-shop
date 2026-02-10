import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, Subject } from 'rxjs';
import { map, filter, switchMap, takeUntil, debounceTime, distinctUntilChanged, take, skip } from 'rxjs/operators';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../../shared/services/translation.service';
import { LucideAngularModule, ShoppingCart } from 'lucide-angular';
import { selectCurrentUser } from '../../../../../core/auth/store/auth.selectors';
import { User } from '../../../../../shared/models/user.model';
import { Company } from '../../../../../shared/models/company.model';
import { SupabaseService } from '../../../../../services/supabase.service';
import * as B2BCartActions from '../../../cart/store/b2b-cart.actions';
import { selectB2BCartTotalItems } from '../../../cart/store/b2b-cart.selectors';
import * as ProductsActions from '../../../shared/store/products.actions';
import { selectProductsWithPricing, selectProductsLoading, selectCategories, selectCategoriesLoading, selectFilteredProducts, selectFilters, selectPaginatedProducts, selectPaginationInfo, selectCurrentPage, selectItemsPerPage, selectTotalPages, selectAllManufacturers, selectCategoryCounts, selectManufacturersLoading, selectCategoryCountsLoading, selectManufacturerCounts, selectManufacturerCountsLoading } from '../../../shared/store/products.selectors';
import { ProductWithPricing, Category } from '../../../shared/store/products.actions';
import { ProductCategory, CategoriesService } from '../../../../b2c/products/services/categories.service';
import { B2BProductsUrlStateService, B2BProductListUrlState } from '../services/b2b-products-url-state.service';
import { SortOptionsService, SortOptionDisplay } from '../../../../../shared/services/sort-options.service';

@Component({
  selector: 'app-partners-products',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    TranslatePipe, 
    LucideAngularModule
  ],
  templateUrl: './partners-products.component.html',
  styleUrls: ['./partners-products.component.scss']
})
export class PartnersProductsComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);
  private translateService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  currentUser$: Observable<User | null>;
  cartItemsCount$: Observable<number>;
  products$: Observable<ProductWithPricing[]>;
  filteredProducts$: Observable<ProductWithPricing[]>;
  paginatedProducts$: Observable<ProductWithPricing[]>;
  categories$: Observable<Category[]>;
  loading$: Observable<boolean>;
  categoriesLoading$: Observable<boolean>;
  filters$: Observable<any>;

  // Pagination observables
  paginationInfo$: Observable<any>;
  currentPage$: Observable<number>;
  itemsPerPage$: Observable<number>;
  totalPages$: Observable<number>;
  itemsPerPageOptions = [12, 30, 60];

  // Dynamic filter observables
  allManufacturers$: Observable<string[]>;
  categoryCounts$: Observable<{ [categoryName: string]: number }>;
  manufacturersLoading$: Observable<boolean>;
  categoryCountsLoading$: Observable<boolean>;
  manufacturerCounts$: Observable<{ [manufacturerName: string]: number }>;
  manufacturerCountsLoading$: Observable<boolean>;

  // Dynamic sort options
  enabledSortOptions$: Observable<SortOptionDisplay[]>;
  defaultSortCode: string = ''; // No default sort - use display_order from admin
  currentSortBy: string = '';

  isAuthenticated = false;
  isCompanyContact = false;
  company: Company | null = null;

  gridView = 'grid';
  showMobileFilters = false;

  // Lucide icons
  ShoppingCartIcon = ShoppingCart;

  // Category expansion state
  categoryExpansionState: { [categoryId: string]: boolean } = {};
  nestedCategories: ProductCategory[] = [];
  searchQuery: string = '';

  private searchSubject = new Subject<string>();

  constructor(
    private categoriesService: CategoriesService,
    private urlStateService: B2BProductsUrlStateService,
    private sortOptionsService: SortOptionsService
  ) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.cartItemsCount$ = this.store.select(selectB2BCartTotalItems);
    this.products$ = this.store.select(selectProductsWithPricing);
    this.filteredProducts$ = this.store.select(selectFilteredProducts);
    this.paginatedProducts$ = this.store.select(selectPaginatedProducts);
    this.categories$ = this.store.select(selectCategories);
    this.loading$ = this.store.select(selectProductsLoading);
    this.categoriesLoading$ = this.store.select(selectCategoriesLoading);
    this.filters$ = this.store.select(selectFilters);

    // Initialize pagination observables
    this.paginationInfo$ = this.store.select(selectPaginationInfo);
    this.currentPage$ = this.store.select(selectCurrentPage);
    this.itemsPerPage$ = this.store.select(selectItemsPerPage);
    this.totalPages$ = this.store.select(selectTotalPages);

    // Dynamic filter observables
    this.allManufacturers$ = this.store.select(selectAllManufacturers);
    this.categoryCounts$ = this.store.select(selectCategoryCounts);
    this.manufacturersLoading$ = this.store.select(selectManufacturersLoading);
    this.categoryCountsLoading$ = this.store.select(selectCategoryCountsLoading);
    this.manufacturerCounts$ = this.store.select(selectManufacturerCounts);
    this.manufacturerCountsLoading$ = this.store.select(selectManufacturerCountsLoading);

    // Initialize sort options from service
    this.enabledSortOptions$ = this.sortOptionsService.enabledSortOptions$;
    // Don't set default sort code - use display_order from admin
    // this.defaultSortCode = this.sortOptionsService.getDefaultSortOptionCode();
  }

  ngOnInit(): void {
    // Load categories first
    this.store.dispatch(ProductsActions.loadCategories());

    // Load all manufacturers and initial counts
    this.store.dispatch(ProductsActions.loadAllManufacturers());
    this.store.dispatch(ProductsActions.loadCategoryCounts({ filters: {} }));
    this.store.dispatch(ProductsActions.loadManufacturerCounts({ filters: {} }));

    // Load nested categories for hierarchical display
    this.loadNestedCategories();

    // Subscribe to sortBy changes to update the select binding
    this.filters$.pipe(takeUntil(this.destroy$)).subscribe(filters => {
      this.currentSortBy = filters.sortBy || '';
    });

    // Subscribe to user changes
    this.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(async (user) => {
      this.isAuthenticated = !!user;

      if (user) {
        await this.loadUserAndCompanyInfo(user);

        // Load company pricing if user is company contact
        if (this.isCompanyContact && this.company) {
          this.store.dispatch(ProductsActions.loadCompanyPricing({ companyId: this.company.id }));
        }
      }
    });

    // Handle debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.store.dispatch(ProductsActions.setSearchQuery({ query }));
    });

    // Handle URL state restoration FIRST (before loading products)
    this.activatedRoute.queryParams.pipe(
      take(1), // Only take the initial params to avoid loops
      takeUntil(this.destroy$)
    ).subscribe(params => {
      // Restore state from URL parameters
      const urlState = this.urlStateService.deserializeFromQueryParams(params);
      
      if (Object.keys(urlState).length > 0) {
        console.log('🔄 B2B Restoring state from URL:', urlState);
        
        // Clear existing filters first
        this.store.dispatch(ProductsActions.clearFilters());
        
        // Restore filters
        if (urlState.filters) {
          // Apply search query
          if (urlState.filters.searchQuery) {
            this.store.dispatch(ProductsActions.setSearchQuery({ 
              query: urlState.filters.searchQuery 
            }));
            this.searchQuery = urlState.filters.searchQuery; // Update component property
          }
          
          // Apply category filters
          if (urlState.filters.categories && urlState.filters.categories.length > 0) {
            urlState.filters.categories.forEach(categoryName => {
              this.store.dispatch(ProductsActions.toggleCategoryFilter({
                category: categoryName,
                checked: true
              }));
            });
          }
          
          // Apply manufacturer filters
          if (urlState.filters.manufacturers && urlState.filters.manufacturers.length > 0) {
            urlState.filters.manufacturers.forEach(manufacturer => {
              this.store.dispatch(ProductsActions.toggleManufacturerFilter({
                manufacturer: manufacturer,
                checked: true
              }));
            });
          }
          
          // Apply availability filter
          if (urlState.filters.availability) {
            this.store.dispatch(ProductsActions.setAvailabilityFilter({ 
              availability: urlState.filters.availability 
            }));
          }
          
          // Apply sort option
          if (urlState.filters.sortBy) {
            this.store.dispatch(ProductsActions.setSortOption({ 
              sortBy: urlState.filters.sortBy 
            }));
          }
        }
        
        // Restore pagination
        if (urlState.currentPage && urlState.currentPage > 1) {
          this.store.dispatch(ProductsActions.setCurrentPage({ 
            page: urlState.currentPage 
          }));
        }
        
        if (urlState.itemsPerPage && urlState.itemsPerPage !== 12) {
          this.store.dispatch(ProductsActions.setItemsPerPage({ 
            itemsPerPage: urlState.itemsPerPage 
          }));
        }
      }
      
      // Handle legacy category parameter for backwards compatibility
      if (params['category'] && !urlState.filters?.categories?.length) {
        console.log('🏷️ B2B Legacy category param found:', params['category']);
        
        // Wait for categories to be loaded, then find the matching category
        this.categories$.pipe(
          takeUntil(this.destroy$),
          filter((categories): categories is Category[] => categories !== null && categories.length > 0)
        ).subscribe((categories) => {
          const matchingCategory = categories.find((cat) =>
            cat.slug === params['category'] ||
            cat.id === params['category'] ||
            cat.name.toLowerCase() === params['category'].toLowerCase()
          );

          if (matchingCategory) {
            console.log('✅ B2B Applying matched category filter:', matchingCategory.name);
            this.store.dispatch(ProductsActions.toggleCategoryFilter({
              category: matchingCategory.name,
              checked: true
            }));
          }
        });
      }
      
      // Load initial products AFTER processing query params
      // Use setTimeout to ensure all filters are applied first
      setTimeout(() => {
        this.loadProductsWithCurrentState();
      }, 0);
    });

    // Subscribe to filter and pagination changes to reload products
    this.setupProductReloading();

    // Subscribe to filter changes to update counts
    this.filters$.pipe(
      skip(1),
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(filters => {
      // Load dynamic counts based on current filters
      const categoryFilters = {
        searchQuery: filters.searchQuery,
        manufacturers: filters.manufacturers,
        availability: filters.availability
      };
      const manufacturerFilters = {
        searchQuery: filters.searchQuery,
        categories: filters.categories,
        availability: filters.availability
      };
      
      this.store.dispatch(ProductsActions.loadCategoryCounts({ filters: categoryFilters }));
      this.store.dispatch(ProductsActions.loadManufacturerCounts({ filters: manufacturerFilters }));
    });

    // Set up URL state synchronization - sync store state to URL
    this.setupUrlStateSynchronization();
  }

  /**
   * Set up automatic URL state synchronization
   */
  private setupUrlStateSynchronization(): void {
    // Combine relevant store selectors for state changes
    combineLatest([
      this.filters$,
      this.currentPage$,
      this.itemsPerPage$
    ]).pipe(
      skip(1), // Skip initial emission
      debounceTime(300), // Debounce to avoid too many URL updates
      takeUntil(this.destroy$)
    ).subscribe(([filters, currentPage, itemsPerPage]) => {
      const currentState: B2BProductListUrlState = {
        filters,
        currentPage: currentPage || 1,
        itemsPerPage: itemsPerPage || 12
      };

      // Update URL with current state
      const queryParams = this.urlStateService.serializeToQueryParams(currentState);
      
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true // Use replaceUrl to avoid creating history entries
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadUserAndCompanyInfo(user: User): Promise<void> {
    // Check if user is a company contact person
    try {
      const { data: companies, error } = await this.supabaseService.client
        .from('companies')
        .select('*')
        .eq('contact_person_id', user.id)
        .eq('status', 'approved')
        .single();

      if (!error && companies) {
        this.company = companies;
        this.isCompanyContact = true;
      } else {
        this.isCompanyContact = false;
        this.company = null;
      }
    } catch (error) {
      console.error('Error checking company status:', error);
      this.isCompanyContact = false;
    }
  }

  /**
   * Check if product has any B2B pricing (company or partner price)
   */
  hasB2BPrice(product: ProductWithPricing): boolean {
    return !!(product.company_price || product.partner_price);
  }

  /**
   * Get minimum order for a product, using company-specific minimum order if available
   */
  getMinimumOrder(product: ProductWithPricing): number {
    // Use company-specific minimum order if available, otherwise use product default
    if (this.isCompanyContact && product.company_minimum_order !== undefined) {
      return product.company_minimum_order;
    }
    return product.minimum_order || 1;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return this.translateService.translate('b2b.products.pendingApproval');
      case 'approved':
        return this.translateService.translate('b2b.products.approvedPartner');
      case 'rejected':
        return this.translateService.translate('b2b.products.rejected');
      default:
        return status;
    }
  }

  private loadNestedCategories(): void {
    this.categoriesService.getNestedCategories().pipe(
      takeUntil(this.destroy$)
    ).subscribe(categories => {
      this.nestedCategories = categories;
      // Initialize expansion state for parent categories (collapsed by default)
      categories.forEach(category => {
        if (category.subcategories && category.subcategories.length > 0) {
          this.categoryExpansionState[category.id] = false;
        }
      });
    });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  onCategoryChange(category: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.store.dispatch(ProductsActions.toggleCategoryFilter({ category, checked: target.checked }));
  }

  onParentCategoryChange(parentCategory: ProductCategory, event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;
    
    if (isChecked) {
      // Always include the parent category itself
      this.store.dispatch(ProductsActions.toggleCategoryFilter({
        category: parentCategory.name,
        checked: true
      }));

      // When parent is selected, also select all its subcategories
      if (parentCategory.subcategories && parentCategory.subcategories.length > 0) {
        parentCategory.subcategories.forEach(subCategory => {
          this.store.dispatch(ProductsActions.toggleCategoryFilter({
            category: subCategory.name,
            checked: true
          }));
        });
      }
    } else {
      // When parent is deselected, deselect parent and all subcategories
      this.store.dispatch(ProductsActions.toggleCategoryFilter({
        category: parentCategory.name,
        checked: false
      }));

      if (parentCategory.subcategories && parentCategory.subcategories.length > 0) {
        parentCategory.subcategories.forEach(subCategory => {
          this.store.dispatch(ProductsActions.toggleCategoryFilter({
            category: subCategory.name,
            checked: false
          }));
        });
      }
    }
  }

  onSubCategoryChange(parentCategory: ProductCategory, subCategoryName: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;
    
    // Toggle the specific subcategory
    this.store.dispatch(ProductsActions.toggleCategoryFilter({
      category: subCategoryName,
      checked: isChecked
    }));
  }

  onManufacturerChange(manufacturer: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.store.dispatch(ProductsActions.toggleManufacturerFilter({ manufacturer, checked: target.checked }));
  }

  isManufacturerSelected(manufacturer: string): boolean {
    let isSelected = false;
    this.filters$.pipe(take(1)).subscribe(filters => {
      isSelected = filters?.manufacturers?.includes(manufacturer) || false;
    });
    return isSelected;
  }

  onAvailabilityChange(availability: string): void {
    this.store.dispatch(ProductsActions.setAvailabilityFilter({ availability }));
  }

  onSortChange(sortBy: string): void {
    this.store.dispatch(ProductsActions.setSortOption({ sortBy }));
  }

  // Helper methods for improved category filtering
  isParentCategorySelected(parentCategory: ProductCategory): boolean {
    // Get current filters synchronously using store selector
    let isSelected = false;
    this.filters$.pipe(
      take(1)
    ).subscribe(filters => {
      if (parentCategory.subcategories && parentCategory.subcategories.length > 0) {
        // Parent is considered selected if the parent itself OR ANY of its subcategories are selected
        const parentSelected = filters?.categories?.includes(parentCategory.name) || false;
        const anySubcategorySelected = parentCategory.subcategories.some(sub => 
          filters?.categories?.includes(sub.name) || false
        );
        isSelected = parentSelected || anySubcategorySelected;
      } else {
        // For categories without subcategories, check if directly selected
        isSelected = filters?.categories?.includes(parentCategory.name) || false;
      }
    });
    return isSelected;
  }

  getTotalProductCount(parentCategory: ProductCategory): number {
    // Get count from dynamic counts observable
    let count = 0;
    this.categoryCounts$.pipe(take(1)).subscribe(counts => {
      count = counts?.[parentCategory.name] || 0;
    });
    return count;
  }

  // Legacy expansion methods (kept for compatibility)
  toggleCategoryExpansion(categoryId: string): void {
    this.categoryExpansionState[categoryId] = !this.categoryExpansionState[categoryId];
  }

  isCategoryExpanded(categoryId: string): boolean {
    return this.categoryExpansionState[categoryId] || false;
  }

  navigateToLogin(): void {
    this.router.navigate(['/prijava']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/partneri/register']);
  }

  addToCart(product: ProductWithPricing, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.isAuthenticated && this.isCompanyContact && this.company) {
      this.store.dispatch(B2BCartActions.addToB2BCart({
        productId: product.id,
        quantity: 1,
        companyId: this.company.id
      }));

      // Open cart sidebar
      this.store.dispatch(B2BCartActions.openB2BCartSidebar());
    }
  }

  requestQuote(product: ProductWithPricing, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    // Navigate to partner contact page
    this.router.navigate(['/partneri/kontakt'], {
      queryParams: {
        subject: 'pricingInquiry',
        productId: product.id,
        productName: product.name,
        sku: product.sku
      }
    });
  }

  viewDetails(product: ProductWithPricing, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    // Get current state for URL preservation
    combineLatest([
      this.filters$,
      this.currentPage$,
      this.itemsPerPage$
    ]).pipe(take(1)).subscribe(([filters, currentPage, itemsPerPage]) => {
      const currentState: B2BProductListUrlState = {
        filters,
        currentPage: currentPage || 1,
        itemsPerPage: itemsPerPage || 12
      };

      // Create query parameters to preserve current state
      const queryParams = this.urlStateService.createStatePreservingParams(currentState);
      
      // Navigate to B2B product details with preserved state
      this.router.navigate(['/partneri/proizvodi', product.id], {
        queryParams
      });
    });
  }

  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
  }

  toggleGridView(): void {
    this.gridView = this.gridView === 'grid' ? 'list' : 'grid';
  }

  toggleListView(): void {
    this.gridView = 'list';
  }

  clearFilters(): void {
    this.store.dispatch(ProductsActions.clearFilters());
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/images/product-placeholder.svg';
    }
  }

  getProductImageUrl(product: ProductWithPricing): string {
    // If image_url is already computed and not empty, use it
    if (product.image_url && product.image_url.trim()) {
      return product.image_url;
    }

    // Extract from images array - use first image
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Find primary image first
      const primaryImage = product.images.find(img => img.is_primary && img.url && img.url.trim());
      if (primaryImage) {
        return primaryImage.url;
      }

      // Fallback to first image with valid url
      const firstImageWithUrl = product.images.find(img => img.url && img.url.trim());
      if (firstImageWithUrl) {
        return firstImageWithUrl.url;
      }
    }

    // Return placeholder SVG as fallback only if no valid images found
    return 'assets/images/product-placeholder.svg';
  }

  hasProductImage(product: ProductWithPricing): boolean {
    return !!this.getProductImageUrl(product);
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.store.dispatch(ProductsActions.setCurrentPage({ page }));
  }

  onPreviousPage(): void {
    combineLatest([this.currentPage$, this.totalPages$]).pipe(
      takeUntil(this.destroy$),
      take(1)
    ).subscribe(([currentPage, totalPages]) => {
      if (currentPage > 1) {
        this.onPageChange(currentPage - 1);
      }
    });
  }

  onNextPage(): void {
    combineLatest([this.currentPage$, this.totalPages$]).pipe(
      takeUntil(this.destroy$),
      take(1)
    ).subscribe(([currentPage, totalPages]) => {
      if (currentPage < totalPages) {
        this.onPageChange(currentPage + 1);
      }
    });
  }

  onLastPage(): void {
    this.totalPages$.pipe(
      takeUntil(this.destroy$),
      take(1)
    ).subscribe(totalPages => {
      if (totalPages > 0) {
        this.onPageChange(totalPages);
      }
    });
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const itemsPerPage = +target.value;
    this.store.dispatch(ProductsActions.setItemsPerPage({ itemsPerPage }));
  }

  // Helper method for smart pagination display
  getSmartPageNumbers(): Observable<{
    visiblePages: number[];
    showFirstPage: boolean;
    showLastPage: boolean;
    showFirstEllipsis: boolean;
    showLastEllipsis: boolean;
    totalPages: number;
  }> {
    return combineLatest([this.currentPage$, this.totalPages$]).pipe(
      map(([currentPage, totalPages]) => {
        const visiblePages: number[] = [];
        let showFirstPage = false;
        let showLastPage = false;
        let showFirstEllipsis = false;
        let showLastEllipsis = false;
        
        // Calculate visible page range (current page + 1 adjacent page on each side)
        const startPage = Math.max(1, currentPage - 1);
        const endPage = Math.min(totalPages, currentPage + 1);
        
        // Add visible pages
        for (let i = startPage; i <= endPage; i++) {
          visiblePages.push(i);
        }
        
        // Show first page if not in visible range
        if (startPage > 1) {
          showFirstPage = true;
          showFirstEllipsis = startPage > 2;
        }
        
        // Show last page if not in visible range
        if (endPage < totalPages) {
          showLastPage = true;
          showLastEllipsis = endPage < totalPages - 1;
        }
        
        return {
          visiblePages,
          showFirstPage,
          showLastPage,
          showFirstEllipsis,
          showLastEllipsis,
          totalPages
        };
      })
    );
  }

  private loadProductsWithCurrentState(): void {
    combineLatest([
      this.filters$,
      this.currentPage$,
      this.itemsPerPage$
    ]).pipe(
      take(1) // Only take the initial values
    ).subscribe(([filters, currentPage, itemsPerPage]) => {
      const query = {
        page: currentPage,
        itemsPerPage: itemsPerPage,
        searchQuery: filters.searchQuery,
        categories: filters.categories,
        manufacturers: filters.manufacturers,
        availability: filters.availability,
        sortBy: filters.sortBy
      };
      
      this.store.dispatch(ProductsActions.loadProducts({ query }));
    });
  }

  private setupProductReloading(): void {
    let previousPage = 1; // Track previous page to detect page changes
    
    // React to filter changes (skip initial values)
    combineLatest([
      this.filters$,
      this.currentPage$,
      this.itemsPerPage$
    ]).pipe(
      skip(1), // Skip initial emission
      debounceTime(300), // Debounce rapid changes
      takeUntil(this.destroy$)
    ).subscribe(([filters, currentPage, itemsPerPage]: [any, number, number]) => {
      const query = {
        page: currentPage,
        itemsPerPage: itemsPerPage,
        searchQuery: filters.searchQuery,
        categories: filters.categories,
        manufacturers: filters.manufacturers,
        availability: filters.availability,
        sortBy: filters.sortBy
      };
      
      this.store.dispatch(ProductsActions.loadProducts({ query }));
      
      // Only scroll to top when the page actually changes
      if (currentPage !== previousPage) {
        this.scrollToTop();
        previousPage = currentPage;
      }
    });
  }

  private scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}