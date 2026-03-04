import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  map,
  take,
  skip,
} from 'rxjs/operators';
import {
  ProductListUrlStateService,
  ProductListUrlState,
} from './services/product-list-url-state.service';
import { ProductListActions } from './store/product-list.actions';
import {
  selectProducts,
  selectFilteredProducts,
  selectPaginatedProducts,
  selectIsLoading,
  selectFilters,
  selectSortOption,
  selectManufacturers,
  selectCertificates,
  selectSearchQuery,
  selectPaginationInfo,
  selectCurrentPage,
  selectItemsPerPage,
  selectTotalPages,
  selectCachedPages,
  selectLastQuery,
  selectAllManufacturers,
  selectCategoryCounts,
  selectManufacturerCounts,
  selectManufacturersLoading,
  selectCategoryCountsLoading,
  selectManufacturerCountsLoading,
} from './store/product-list.selectors';
import { AddToCartButtonComponent } from '../../cart/components/add-to-cart-button/add-to-cart-button.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import {
  ProductCategory,
  CategoriesService,
} from '../services/categories.service';
import { selectProductCategories } from '../store/products.selectors';
import { ProductsActions } from '../store/products.actions';
import { SearchSuggestionsService } from '../../../../shared/services/search-suggestions.service';
import {
  SortOptionsService,
  SortOptionDisplay,
} from '../../../../shared/services/sort-options.service';
import { SeoService } from '../../../../shared/services/seo.service';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  imageUrl: string;
  category: string;
  categories?: Array<{ name: string; isPrimary: boolean }>;
  manufacturer: string;
  model?: string;
  weight?: number;
  dimensions?: string;
  certificates: string[];
  specifications?: { [key: string]: string };
  features?: string[];
  rating: number;
  reviewCount: number;
  availability: 'available' | 'limited' | 'out-of-stock';
  featured: boolean;
  createdAt: Date;
  sku?: string;
  isOnSale?: boolean;
  images?: any[];
  technical_sheet?: string;
}

export interface ProductFilters {
  categories: string[];
  priceRange: { min: number; max: number };
  certificates: string[];
  manufacturers: string[];
}

export interface CategoryExpansionState {
  [categoryId: string]: boolean;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

// Dynamic sort option - accepts any string code from the database
export type SortOption = string;

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AddToCartButtonComponent,
    TranslatePipe,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private urlStateService = inject(ProductListUrlStateService);
  private seoService = inject(SeoService);
  private destroy$ = new Subject<void>();

  products$: Observable<Product[]>;
  filteredProducts$: Observable<Product[]>;
  isLoading$: Observable<boolean>;
  filters$: Observable<ProductFilters>;
  sortOption$: Observable<SortOption>;
  categories$: Observable<ProductCategory[]>;
  manufacturers$: Observable<string[]>;
  allManufacturers$!: Observable<string[]>;
  categoryCounts$!: Observable<{ [categoryName: string]: number }>;
  manufacturerCounts$!: Observable<{ [manufacturerName: string]: number }>;
  manufacturersLoading$!: Observable<boolean>;
  categoryCountsLoading$!: Observable<boolean>;
  manufacturerCountsLoading$!: Observable<boolean>;
  certificates$: Observable<string[]>;
  searchQuery$: Observable<string>;
  enabledSortOptions$: Observable<SortOptionDisplay[]>;

  // Category expansion state
  categoryExpansionState: CategoryExpansionState = {};
  nestedCategories: ProductCategory[] = [];

  // Pagination observables from NgRx store
  paginatedProducts$: Observable<Product[]>;
  paginationInfo$: Observable<any>;
  currentPage$: Observable<number>;
  itemsPerPage$: Observable<number>;
  totalPages$: Observable<number>;
  itemsPerPageOptions = [12, 30, 60];

  filtersOpen = window.innerWidth >= 1024;

  private searchSubject = new Subject<string>();

  constructor(
    private categoriesService: CategoriesService,
    private searchSuggestionsService: SearchSuggestionsService,
    private sortOptionsService: SortOptionsService,
  ) {
    this.products$ = this.store.select(selectProducts);
    this.filteredProducts$ = this.store.select(selectFilteredProducts);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.filters$ = this.store.select(selectFilters);
    this.sortOption$ = this.store.select(selectSortOption);
    this.categories$ = this.store.select(selectProductCategories);
    this.manufacturers$ = this.store.select(selectManufacturers);
    this.allManufacturers$ = this.store.select(selectAllManufacturers);
    this.categoryCounts$ = this.store.select(selectCategoryCounts);
    this.manufacturerCounts$ = this.store.select(selectManufacturerCounts);
    this.manufacturersLoading$ = this.store.select(selectManufacturersLoading);
    this.categoryCountsLoading$ = this.store.select(
      selectCategoryCountsLoading,
    );
    this.manufacturerCountsLoading$ = this.store.select(
      selectManufacturerCountsLoading,
    );
    this.certificates$ = this.store.select(selectCertificates);
    this.searchQuery$ = this.store.select(selectSearchQuery);

    // Initialize pagination observables
    this.paginatedProducts$ = this.store.select(selectPaginatedProducts);
    this.paginationInfo$ = this.store.select(selectPaginationInfo);
    this.currentPage$ = this.store.select(selectCurrentPage);
    this.itemsPerPage$ = this.store.select(selectItemsPerPage);
    this.totalPages$ = this.store.select(selectTotalPages);

    // Initialize sort options from service
    this.enabledSortOptions$ = this.sortOptionsService.enabledSortOptions$;
  }

  ngOnInit(): void {
    // Set SEO for products list page
    this.seoService.setCategoryPage(
      'Proizvodi',
      'Pregledajte našu ponudu solarnih panela, invertera, baterija i opreme za solarne elektrane. Fronius, Huawei, GoodWe i drugi vodeći proizvođači.',
    );

    this.store.dispatch(ProductsActions.loadProductCategories());

    // Load all manufacturers for filter sidebar
    this.store.dispatch(ProductListActions.loadAllManufacturers());

    // Load nested categories for hierarchical display
    this.loadNestedCategories();

    // Check if we should clear filters based on navigation source
    this.checkAndClearFiltersIfNeeded();

    // Set default sort option from database if no sort is specified in URL
    this.setDefaultSortOptionIfNeeded();

    // Handle URL state restoration FIRST
    this.restoreStateFromUrl();

    // Handle debounced search input (for user typing)
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        // Save non-empty searches to suggestions
        if (query && query.trim()) {
          this.searchSuggestionsService.addSearchSuggestion(
            'search',
            query.trim(),
          );
        }

        // Update the store
        this.store.dispatch(ProductListActions.searchProducts({ query }));
        // URL update will be handled by the state change subscription
      });

    // Setup reactive product loading
    this.setupProductReloading();

    // Setup URL state synchronization
    this.setupUrlStateSynchronization();
  }

  toggleFilters(): void {
    this.filtersOpen = !this.filtersOpen;
  }

  private loadNestedCategories(): void {
    this.categoriesService
      .getNestedCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe((categories) => {
        this.nestedCategories = categories;
        // Initialize expansion state for parent categories (collapsed by default)
        categories.forEach((category) => {
          if (category.subcategories && category.subcategories.length > 0) {
            this.categoryExpansionState[category.id] = false;
          }
        });
      });
  }

  /**
   * Set default sort option from database if no sort is specified in URL
   */
  private setDefaultSortOptionIfNeeded(): void {
    const currentParams = this.route.snapshot.queryParams;
    // Only set default if no sort is specified in URL
    // Don't set a default sort option - let it fall back to display_order sorting
    // if (!currentParams['sort']) {
    //   // Wait for sort options to be loaded, then set the default
    //   this.sortOptionsService.enabledSortOptions$.pipe(
    //     filter(options => options.length > 0),
    //     take(1),
    //     takeUntil(this.destroy$)
    //   ).subscribe(options => {
    //     const defaultOption = options.find(opt => opt.isDefault);
    //     if (defaultOption) {
    //       this.store.dispatch(ProductListActions.updateSortOption({
    //         sortOption: defaultOption.code
    //       }));
    //     }
    //   });
    // }
  }

  ngOnDestroy(): void {
    // Clear filters when leaving the product list page to ensure clean state
    this.store.dispatch(ProductListActions.clearFilters());
    this.store.dispatch(ProductListActions.searchProducts({ query: '' }));

    // Reset SEO to defaults
    this.seoService.resetToDefaults();

    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }

  private checkAndClearFiltersIfNeeded(): void {
    // Get navigation state to check if coming from navbar search or hero explore
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;

    // Check if this navigation came from navbar search or hero explore buttons
    // Don't clear filters if coming from products page (category navigation) or if URL has state to restore
    const currentParams = this.route.snapshot.queryParams;
    const hasUrlState = !this.urlStateService.isCleanState(currentParams);

    // Only clear filters if navigation state explicitly requests it AND there's no URL state to restore
    if (
      !hasUrlState &&
      (state?.['clearFilters'] === true || state?.['fromHero'] === true)
    ) {
      // Clear all existing filters when navigating from hero explore
      this.store.dispatch(ProductListActions.clearFilters());
      this.store.dispatch(ProductListActions.searchProducts({ query: '' }));
    } else if (!hasUrlState && state?.['fromNavbar'] === true) {
      // Clear only non-search filters when coming from navbar search
      this.store.dispatch(ProductListActions.clearFilters());
      // Don't clear search query as it will be set from query params
    }
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value;

    // Use the subject to debounce the search
    this.searchSubject.next(query);
  }

  onCategoryChange(category: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    // Save category selection as suggestion when enabled
    if (isChecked) {
      this.searchSuggestionsService.addSearchSuggestion(
        'category',
        category,
        category,
      );
    }

    // Toggle the specific child category only
    this.store.dispatch(
      ProductListActions.toggleCategoryFilter({ category, checked: isChecked }),
    );
  }

  onPriceRangeChange(type: 'min' | 'max', event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value) || 0;
    this.store.dispatch(
      ProductListActions.updatePriceRange({ rangeType: type, value }),
    );
  }

  onCertificateChange(certificate: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.store.dispatch(
      ProductListActions.toggleCertificateFilter({
        certificate,
        checked: target.checked,
      }),
    );
  }

  onManufacturerChange(manufacturer: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.store.dispatch(
      ProductListActions.toggleManufacturerFilter({
        manufacturer,
        checked: target.checked,
      }),
    );
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const sortOption = target.value as SortOption;
    this.store.dispatch(ProductListActions.updateSortOption({ sortOption }));
  }

  clearFilters(): void {
    this.store.dispatch(ProductListActions.clearFilters());
    this.store.dispatch(ProductListActions.searchProducts({ query: '' }));
    // URL update will be handled by the state change subscription
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  getAvailabilityText(availability: string): string {
    switch (availability) {
      case 'available':
        return 'productDetails.inStock';
      case 'limited':
        return 'productDetails.limitedStock';
      case 'out-of-stock':
        return 'productDetails.outOfStock';
      default:
        return '';
    }
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

  getProductImageUrl(product: Product): string {
    // First check if product has images array with valid URLs
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      // Check if it's a string URL or an object with url property
      if (typeof firstImage === 'string' && firstImage.trim()) {
        return firstImage;
      } else if (
        typeof firstImage === 'object' &&
        firstImage.url &&
        firstImage.url.trim()
      ) {
        return firstImage.url;
      }
    }

    // Fallback to imageUrl if it exists and is not empty
    if (product.imageUrl && product.imageUrl.trim()) {
      return product.imageUrl;
    }

    // Only return placeholder if no valid image found
    return 'assets/images/product-placeholder.webp';
  }

  onProductImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/product-placeholder.webp';
    }
  }

  // Category expansion methods
  toggleCategoryExpansion(categoryId: string): void {
    this.categoryExpansionState[categoryId] =
      !this.categoryExpansionState[categoryId];
  }

  isCategoryExpanded(categoryId: string): boolean {
    return this.categoryExpansionState[categoryId] || false;
  }

  onParentCategoryChange(parentCategory: ProductCategory, event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    if (isChecked) {
      // Save parent category selection as suggestion
      this.searchSuggestionsService.addSearchSuggestion(
        'category',
        parentCategory.name,
        parentCategory.name,
      );

      // Always include the parent category itself
      this.store.dispatch(
        ProductListActions.toggleCategoryFilter({
          category: parentCategory.name,
          checked: true,
        }),
      );

      // When parent is selected, also select all its subcategories
      if (
        parentCategory.subcategories &&
        parentCategory.subcategories.length > 0
      ) {
        parentCategory.subcategories.forEach((subCategory) => {
          // Save subcategory suggestions too
          this.searchSuggestionsService.addSearchSuggestion(
            'category',
            subCategory.name,
            subCategory.name,
          );

          this.store.dispatch(
            ProductListActions.toggleCategoryFilter({
              category: subCategory.name,
              checked: true,
            }),
          );
        });
      }
    } else {
      // When parent is deselected, deselect parent and all subcategories
      this.store.dispatch(
        ProductListActions.toggleCategoryFilter({
          category: parentCategory.name,
          checked: false,
        }),
      );

      if (
        parentCategory.subcategories &&
        parentCategory.subcategories.length > 0
      ) {
        parentCategory.subcategories.forEach((subCategory) => {
          this.store.dispatch(
            ProductListActions.toggleCategoryFilter({
              category: subCategory.name,
              checked: false,
            }),
          );
        });
      }
    }
  }

  onSubCategoryChange(
    parentCategory: ProductCategory,
    subCategoryName: string,
    event: Event,
  ): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    // Save subcategory selection as suggestion when enabled
    if (isChecked) {
      this.searchSuggestionsService.addSearchSuggestion(
        'category',
        subCategoryName,
        subCategoryName,
      );
    }

    // Toggle the specific subcategory
    this.store.dispatch(
      ProductListActions.toggleCategoryFilter({
        category: subCategoryName,
        checked: isChecked,
      }),
    );
  }

  isParentCategorySelected(parentCategory: ProductCategory): boolean {
    // Get current filters synchronously using store selector
    let isSelected = false;
    this.filters$.pipe(take(1)).subscribe((filters) => {
      if (
        parentCategory.subcategories &&
        parentCategory.subcategories.length > 0
      ) {
        // Parent is considered selected if the parent itself OR ANY of its subcategories are selected
        const parentSelected =
          filters?.categories?.includes(parentCategory.name) || false;
        const anySubcategorySelected = parentCategory.subcategories.some(
          (sub) => filters?.categories?.includes(sub.name) || false,
        );
        isSelected = parentSelected || anySubcategorySelected;
      } else {
        // For categories without subcategories, check if directly selected
        isSelected =
          filters?.categories?.includes(parentCategory.name) || false;
      }
    });
    return isSelected;
  }

  getTotalProductCount(parentCategory: ProductCategory): number {
    // For parent categories: shows distinct count of products that will be displayed when filtering
    // This ensures the number shown in the category matches exactly what users see when they click it
    // Products that appear in multiple subcategories are only counted once
    return parentCategory.productCount || 0;
  }

  // Pagination methods using NgRx
  onPageChange(page: number): void {
    this.store.dispatch(ProductListActions.setCurrentPage({ page }));
  }

  onPreviousPage(): void {
    this.currentPage$
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((currentPage) => {
        if (currentPage > 1) {
          this.onPageChange(currentPage - 1);
        }
      });
  }

  onNextPage(): void {
    this.currentPage$
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((currentPage) => {
        this.totalPages$
          .pipe(takeUntil(this.destroy$), take(1))
          .subscribe((totalPages) => {
            if (currentPage < totalPages) {
              this.onPageChange(currentPage + 1);
            }
          });
      });
  }

  onLastPage(): void {
    this.totalPages$
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((totalPages) => {
        if (totalPages > 0) {
          this.onPageChange(totalPages);
        }
      });
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const itemsPerPage = +target.value;
    this.store.dispatch(ProductListActions.setItemsPerPage({ itemsPerPage }));
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
          totalPages,
        };
      }),
    );
  }

  private loadProductsWithCurrentState(): void {
    // Combine current state values
    combineLatest([
      this.filters$,
      this.searchQuery$,
      this.sortOption$,
      this.currentPage$,
      this.itemsPerPage$,
      this.store.select(selectCachedPages),
      this.store.select(selectLastQuery),
    ])
      .pipe(
        take(1), // Only take initial values
      )
      .subscribe(
        ([
          filters,
          searchQuery,
          sortOption,
          currentPage,
          itemsPerPage,
          cachedPages,
          lastQuery,
        ]) => {
          const query = {
            page: currentPage,
            itemsPerPage: itemsPerPage,
            searchQuery: searchQuery,
            categories: filters.categories,
            manufacturers: filters.manufacturers,
            certificates: filters.certificates,
            priceRange: filters.priceRange,
            sortOption: sortOption,
          };

          // Check if we have this page cached
          const currentQueryKey = JSON.stringify({
            searchQuery,
            filters,
            sortOption,
            itemsPerPage,
          });
          const pageKey = `${currentQueryKey}_page_${currentPage}`;
          const cachedPage = cachedPages[pageKey];

          // Use cache if available and not too old (5 minutes)
          if (
            cachedPage &&
            cachedPage.query === currentQueryKey &&
            Date.now() - cachedPage.timestamp < 5 * 60 * 1000
          ) {
            this.store.dispatch(
              ProductListActions.loadProductsFromCache({
                products: cachedPage.products,
                currentPage,
              }),
            );
          } else {
            this.store.dispatch(ProductListActions.loadProducts({ query }));
          }
        },
      );
  }

  private setupProductReloading(): void {
    let previousPage = 1; // Track previous page to detect page changes

    // React to filter and pagination changes
    combineLatest([
      this.filters$,
      this.searchQuery$,
      this.sortOption$,
      this.currentPage$,
      this.itemsPerPage$,
      this.store.select(selectCachedPages),
    ])
      .pipe(
        skip(1), // Skip initial emission
        debounceTime(300), // Debounce rapid changes
        takeUntil(this.destroy$),
      )
      .subscribe(
        ([
          filters,
          searchQuery,
          sortOption,
          currentPage,
          itemsPerPage,
          cachedPages,
        ]) => {
          const query = {
            page: currentPage,
            itemsPerPage: itemsPerPage,
            searchQuery: searchQuery,
            categories: filters.categories,
            manufacturers: filters.manufacturers,
            certificates: filters.certificates,
            priceRange: filters.priceRange,
            sortOption: sortOption,
          };

          // Check if we have this page cached
          const currentQueryKey = JSON.stringify({
            searchQuery,
            filters,
            sortOption,
            itemsPerPage,
          });
          const pageKey = `${currentQueryKey}_page_${currentPage}`;
          const cachedPage = cachedPages[pageKey];

          // Use cache if available and not too old (5 minutes)
          if (
            cachedPage &&
            cachedPage.query === currentQueryKey &&
            Date.now() - cachedPage.timestamp < 5 * 60 * 1000
          ) {
            this.store.dispatch(
              ProductListActions.loadProductsFromCache({
                products: cachedPage.products,
                currentPage,
              }),
            );
          } else {
            this.store.dispatch(ProductListActions.loadProducts({ query }));
          }

          // Load category counts with current filters (regardless of cache)
          this.store.dispatch(
            ProductListActions.loadCategoryCounts({
              filters: {
                searchQuery: searchQuery,
                manufacturers: filters.manufacturers,
                priceRange: filters.priceRange,
              },
            }),
          );

          // Load manufacturer counts with current filters (regardless of cache)
          this.store.dispatch(
            ProductListActions.loadManufacturerCounts({
              filters: {
                searchQuery: searchQuery,
                categories: filters.categories,
                priceRange: filters.priceRange,
              },
            }),
          );

          // Only scroll to top when the page actually changes
          if (currentPage !== previousPage) {
            this.scrollToTop();
            previousPage = currentPage;
          }
        },
      );
  }

  private scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  // Current state for URL preservation
  getCurrentStateParams(): any {
    let params: any = {};

    // Get current values synchronously from store
    this.filters$.pipe(take(1)).subscribe((filters) => {
      if (filters) {
        if (filters.categories?.length > 0)
          params['categories'] = filters.categories.join(',');
        if (filters.manufacturers?.length > 0)
          params['manufacturers'] = filters.manufacturers.join(',');
        if (filters.certificates?.length > 0)
          params['certificates'] = filters.certificates.join(',');
        if (filters.priceRange?.min > 0)
          params['priceMin'] = filters.priceRange.min.toString();
        if (filters.priceRange?.max > 0)
          params['priceMax'] = filters.priceRange.max.toString();
      }
    });

    this.searchQuery$.pipe(take(1)).subscribe((query) => {
      if (query?.trim()) params['search'] = query.trim();
    });

    this.sortOption$.pipe(take(1)).subscribe((sort) => {
      if (sort && sort !== 'featured') params['sort'] = sort;
    });

    this.currentPage$.pipe(take(1)).subscribe((page) => {
      if (page && page > 1) params['page'] = page.toString();
    });

    this.itemsPerPage$.pipe(take(1)).subscribe((itemsPerPage) => {
      if (itemsPerPage && itemsPerPage !== 12)
        params['itemsPerPage'] = itemsPerPage.toString();
    });

    return params;
  }

  /**
   * Restore state from URL query parameters
   */
  private restoreStateFromUrl(): void {
    this.route.queryParams
      .pipe(
        takeUntil(this.destroy$),
        // Removed take(1) to allow continuous listening to query param changes
      )
      .subscribe((params) => {
        const urlState =
          this.urlStateService.deserializeFromQueryParams(params);

        // Apply restored state to store
        if (urlState.searchQuery !== undefined) {
          this.store.dispatch(
            ProductListActions.searchProducts({
              query: urlState.searchQuery,
            }),
          );
        }

        if (urlState.filters) {
          // Clear existing filters first
          this.store.dispatch(ProductListActions.clearFilters());

          // Apply categories
          if (
            urlState.filters.categories &&
            urlState.filters.categories.length > 0
          ) {
            urlState.filters.categories.forEach((category) => {
              this.store.dispatch(
                ProductListActions.toggleCategoryFilter({
                  category,
                  checked: true,
                }),
              );
            });
          }

          // Apply manufacturers
          if (
            urlState.filters.manufacturers &&
            urlState.filters.manufacturers.length > 0
          ) {
            urlState.filters.manufacturers.forEach((manufacturer) => {
              this.store.dispatch(
                ProductListActions.toggleManufacturerFilter({
                  manufacturer,
                  checked: true,
                }),
              );
            });
          }

          // Apply certificates
          if (
            urlState.filters.certificates &&
            urlState.filters.certificates.length > 0
          ) {
            urlState.filters.certificates.forEach((certificate) => {
              this.store.dispatch(
                ProductListActions.toggleCertificateFilter({
                  certificate,
                  checked: true,
                }),
              );
            });
          }

          // Apply price range
          if (
            urlState.filters.priceRange.min > 0 ||
            urlState.filters.priceRange.max > 0
          ) {
            if (urlState.filters.priceRange.min > 0) {
              this.store.dispatch(
                ProductListActions.updatePriceRange({
                  rangeType: 'min',
                  value: urlState.filters.priceRange.min,
                }),
              );
            }
            if (urlState.filters.priceRange.max > 0) {
              this.store.dispatch(
                ProductListActions.updatePriceRange({
                  rangeType: 'max',
                  value: urlState.filters.priceRange.max,
                }),
              );
            }
          }
        }

        // Apply sort option
        if (urlState.sortOption) {
          this.store.dispatch(
            ProductListActions.updateSortOption({
              sortOption: urlState.sortOption,
            }),
          );
        }

        // Apply pagination
        if (urlState.itemsPerPage) {
          this.store.dispatch(
            ProductListActions.setItemsPerPage({
              itemsPerPage: urlState.itemsPerPage,
            }),
          );
        }

        if (urlState.currentPage) {
          this.store.dispatch(
            ProductListActions.setCurrentPage({
              page: urlState.currentPage,
            }),
          );
        }

        // Load products with restored state
        setTimeout(() => {
          this.loadProductsWithCurrentState();
        }, 0);
      });
  }

  /**
   * Setup URL state synchronization - update URL when state changes
   */
  private setupUrlStateSynchronization(): void {
    // Combine all state observables
    combineLatest([
      this.filters$,
      this.searchQuery$,
      this.sortOption$,
      this.currentPage$,
      this.itemsPerPage$,
    ])
      .pipe(
        // Skip initial emission to avoid overriding URL on load
        skip(1),
        // Debounce to avoid too many URL updates
        debounceTime(100),
        takeUntil(this.destroy$),
      )
      .subscribe(
        ([filters, searchQuery, sortOption, currentPage, itemsPerPage]) => {
          const currentState: ProductListUrlState = {
            filters,
            searchQuery,
            sortOption,
            currentPage,
            itemsPerPage,
          };

          const queryParams =
            this.urlStateService.serializeToQueryParams(currentState);

          // Update URL without triggering navigation
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams,
            queryParamsHandling: 'replace',
            replaceUrl: true,
          });
        },
      );
  }
}
