import {
  Component,
  OnInit,
  inject,
  OnDestroy,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';
import * as CompanyPricingActions from '../store/company-pricing.actions';
import * as CompanyPricingSelectors from '../store/company-pricing.selectors';
import { Company, Product } from '../store/company-pricing.actions';
import { ProductWithCustomPrice } from '../../../../shared/models/product-with-custom-price.model';

@Component({
  selector: 'app-company-pricing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe],
  templateUrl: './company-pricing-form.component.html',
  styleUrls: ['./company-pricing-form.component.scss'],
})
export class CompanyPricingFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supabase = inject(SupabaseService);
  private title = inject(Title);
  private store = inject(Store);
  private translationService = inject(TranslationService);
  private elementRef = inject(ElementRef);
  private destroy$ = new Subject<void>();

  companies$: Observable<Company[]> = this.store.select(
    CompanyPricingSelectors.selectCompanies,
  );
  products$: Observable<Product[]> = this.store.select(
    CompanyPricingSelectors.selectProducts,
  );
  loading$: Observable<boolean> = this.store.select(
    CompanyPricingSelectors.selectCompanyPricingLoading,
  );

  companies: Company[] = [];
  products: Product[] = [];
  filteredProducts: ProductWithCustomPrice[] = [];
  selectedCompanyId = '';
  selectedCompany: Company | null = null;
  productSearchTerm = '';
  selectedCategories: string[] = [];
  availableCategories: string[] = [];
  showCategoryDropdown = false;
  existingPricing: any[] = [];
  bulkDiscountPercentage = 0;
  showBulkPricing = false;

  ngOnInit(): void {
    console.log('Company Pricing Form: ngOnInit called');

    // Dispatch actions to load data
    console.log('Company Pricing Form: Dispatching loadCompanies action');
    this.store.dispatch(CompanyPricingActions.loadCompanies());
    console.log('Company Pricing Form: Dispatching loadProducts action');
    this.store.dispatch(CompanyPricingActions.loadProducts());

    // Subscribe to data
    this.companies$.pipe(takeUntil(this.destroy$)).subscribe((companies) => {
      console.log('Company Pricing Form: Companies received:', companies);
      this.companies = companies;
      // Check edit mode after companies are loaded
      if (companies.length > 0) {
        this.checkEditMode();
      }
    });

    this.products$.pipe(takeUntil(this.destroy$)).subscribe((products) => {
      console.log('Company Pricing Form: Products received:', products);
      this.products = products;

      // Extract unique categories from all products
      const categoriesSet = new Set<string>();
      products.forEach((product) => {
        if (product.categories && product.categories.length > 0) {
          product.categories.forEach((category) => categoriesSet.add(category));
        }
      });
      this.availableCategories = Array.from(categoriesSet).sort();

      this.updateFilteredProducts();
      // If we have a selected company but products weren't loaded yet, trigger the selection again
      if (
        this.selectedCompanyId &&
        this.selectedCompany &&
        products.length > 0
      ) {
        this.loadExistingPricing();
        this.updateFilteredProducts();
      }
    });
    this.title.setTitle('Company Pricing - Solar Shop Admin');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = this.elementRef.nativeElement.contains(target);

    // Check if the click is outside the dropdown area
    if (
      !clickedInside ||
      (!target.closest('.category-dropdown') && this.showCategoryDropdown)
    ) {
      // Only close if we didn't click on the dropdown button or its contents
      const isDropdownButton =
        target
          .closest('button[type="button"]')
          ?.textContent?.includes('kategorij') ||
        target
          .closest('button[type="button"]')
          ?.textContent?.includes('categor');
      if (!isDropdownButton) {
        this.showCategoryDropdown = false;
      }
    }
  }

  private checkEditMode(): void {
    const companyId = this.route.snapshot.queryParamMap.get('companyId');
    if (companyId) {
      this.selectedCompanyId = companyId;
      this.onCompanySelected(companyId);
    }
  }

  onCompanySelected(companyId: string): void {
    console.log(
      'Company Pricing Form: onCompanySelected called with:',
      companyId,
    );
    this.selectedCompany =
      this.companies.find((c) => c.id === companyId) || null;
    console.log(
      'Company Pricing Form: Selected company:',
      this.selectedCompany,
    );

    if (this.selectedCompany) {
      this.loadExistingPricing();
    }
    this.updateFilteredProducts();
  }

  private async loadExistingPricing(): Promise<void> {
    if (!this.selectedCompany) {
      console.log(
        'Company Pricing Form: loadExistingPricing - no selected company',
      );
      return;
    }

    console.log(
      'Company Pricing Form: Loading existing pricing for company:',
      this.selectedCompany.id,
    );

    try {
      const { data, error } = await this.supabase.client
        .from('company_pricing')
        .select('*, minimum_order')
        .eq('company_id', this.selectedCompany.id);

      if (error) {
        console.error('Error loading existing pricing:', error);
        return;
      }

      this.existingPricing = data || [];
      console.log(
        'Company Pricing Form: Loaded existing pricing:',
        this.existingPricing,
      );
      this.updateFilteredProducts();
    } catch (error) {
      console.error('Error loading existing pricing:', error);
    }
  }

  private updateFilteredProducts(): void {
    console.log(
      'Company Pricing Form: updateFilteredProducts called, products count:',
      this.products.length,
    );
    if (!this.products.length) {
      console.log(
        'Company Pricing Form: No products available, skipping update',
      );
      return;
    }

    let filtered = this.products.map((product) => {
      const existingPrice = this.existingPricing.find(
        (p) => p.product_id === product.id,
      );
      const minimumOrder = existingPrice ? existingPrice.minimum_order || 1 : 1;

      // Handle quantity-based pricing tiers
      const quantityTier1 = existingPrice?.quantity_tier_1 || 1;
      const priceTier1 = existingPrice
        ? parseFloat(existingPrice.price_tier_1)
        : product.price;
      const quantityTier2 = existingPrice?.quantity_tier_2;
      const priceTier2 = existingPrice?.price_tier_2
        ? parseFloat(existingPrice.price_tier_2)
        : undefined;
      const quantityTier3 = existingPrice?.quantity_tier_3;
      const priceTier3 = existingPrice?.price_tier_3
        ? parseFloat(existingPrice.price_tier_3)
        : undefined;

      return {
        ...product,
        customPrice: priceTier1, // For backward compatibility
        hasCustomPrice:
          !!existingPrice &&
          (priceTier1 !== product.price || !!priceTier2 || !!priceTier3),
        minimumOrder: minimumOrder,
        quantityTier1,
        priceTier1,
        quantityTier2,
        priceTier2,
        quantityTier3,
        priceTier3,
      };
    });

    // Apply search term filter
    if (this.productSearchTerm) {
      const searchTerm = this.productSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.sku.toLowerCase().includes(searchTerm),
      );
    }

    // Apply category filter (multi-select - product must have at least one of the selected categories)
    if (this.selectedCategories.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.categories &&
          product.categories.some((cat) =>
            this.selectedCategories.includes(cat),
          ),
      );
    }

    this.filteredProducts = filtered;
  }

  filterProducts(): void {
    this.updateFilteredProducts();
  }

  toggleCategory(category: string): void {
    const index = this.selectedCategories.indexOf(category);
    if (index === -1) {
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories.splice(index, 1);
    }
    this.filterProducts();
  }

  removeCategory(category: string): void {
    const index = this.selectedCategories.indexOf(category);
    if (index !== -1) {
      this.selectedCategories.splice(index, 1);
      this.filterProducts();
    }
  }

  clearCategories(): void {
    this.selectedCategories = [];
    this.filterProducts();
  }

  updateCustomPrice(product: ProductWithCustomPrice, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    if (!isNaN(value) && value > 0) {
      product.customPrice = value;
      product.priceTier1 = value;
      product.hasCustomPrice = value !== product.price;
    } else {
      product.customPrice = product.price;
      product.priceTier1 = product.price;
      product.hasCustomPrice = false;
    }
  }

  updateQuantityTier(
    product: ProductWithCustomPrice,
    tier: number,
    event: Event,
  ): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);

    if (tier === 1) {
      product.quantityTier1 = !isNaN(value) && value > 0 ? value : 1;
    } else if (tier === 2) {
      if (!isNaN(value) && value > product.quantityTier1) {
        product.quantityTier2 = value;
      } else {
        product.quantityTier2 = undefined;
        product.priceTier2 = undefined;
        // Also clear tier 3 if tier 2 is cleared
        product.quantityTier3 = undefined;
        product.priceTier3 = undefined;
      }
    } else if (tier === 3) {
      if (
        !isNaN(value) &&
        product.quantityTier2 &&
        value > product.quantityTier2
      ) {
        product.quantityTier3 = value;
      } else {
        product.quantityTier3 = undefined;
        product.priceTier3 = undefined;
      }
    }

    this.updateHasCustomPrice(product);
  }

  updatePriceTier(
    product: ProductWithCustomPrice,
    tier: number,
    event: Event,
  ): void {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    if (tier === 1) {
      if (!isNaN(value) && value > 0) {
        product.priceTier1 = value;
        product.customPrice = value; // For backward compatibility
      } else {
        product.priceTier1 = product.price;
        product.customPrice = product.price;
      }
    } else if (tier === 2) {
      if (!isNaN(value) && value > 0 && product.quantityTier2) {
        product.priceTier2 = value;
      } else {
        product.priceTier2 = undefined;
      }
    } else if (tier === 3) {
      if (!isNaN(value) && value > 0 && product.quantityTier3) {
        product.priceTier3 = value;
      } else {
        product.priceTier3 = undefined;
      }
    }

    this.updateHasCustomPrice(product);
  }

  private updateHasCustomPrice(product: ProductWithCustomPrice): void {
    product.hasCustomPrice =
      product.priceTier1 !== product.price ||
      !!product.priceTier2 ||
      !!product.priceTier3;
  }

  updateMinimumOrder(product: ProductWithCustomPrice, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);

    if (!isNaN(value) && value > 0) {
      product.minimumOrder = value;
    } else {
      product.minimumOrder = 1;
    }
  }

  removeCustomPrice(product: ProductWithCustomPrice): void {
    product.customPrice = product.price;
    product.hasCustomPrice = false;
    product.minimumOrder = 1;
    // Reset all pricing tiers
    product.quantityTier1 = 1;
    product.priceTier1 = product.price;
    product.quantityTier2 = undefined;
    product.priceTier2 = undefined;
    product.quantityTier3 = undefined;
    product.priceTier3 = undefined;
  }

  getProductsWithCustomPricing(): ProductWithCustomPrice[] {
    return this.filteredProducts.filter(
      (p) => p.hasCustomPrice || p.minimumOrder !== 1,
    );
  }

  hasChanges(): boolean {
    return this.getProductsWithCustomPricing().length > 0;
  }

  async saveChanges(): Promise<void> {
    if (!this.selectedCompany) return;

    const productsToSave = this.getProductsWithCustomPricing();
    // const existingProductIds = this.existingPricing.map(p => p.product_id);

    try {
      // Create new pricing records
      for (const product of productsToSave) {
        const existingPricing = this.existingPricing.find(
          (p) => p.product_id === product.id,
        );

        if (existingPricing) {
          // Update existing
          const { error } = await this.supabase.client
            .from('company_pricing')
            .update({
              price_tier_1: product.priceTier1,
              quantity_tier_1: product.quantityTier1,
              price_tier_2: product.priceTier2 || null,
              quantity_tier_2: product.quantityTier2 || null,
              price_tier_3: product.priceTier3 || null,
              quantity_tier_3: product.quantityTier3 || null,
              minimum_order: product.minimumOrder,
            })
            .eq('id', existingPricing.id);

          if (error) throw error;
        } else {
          // Create new - only create if there's a custom price or minimum order different from default
          if (product.hasCustomPrice || product.minimumOrder !== 1) {
            const { error } = await this.supabase.client
              .from('company_pricing')
              .insert({
                company_id: this.selectedCompany.id,
                product_id: product.id,
                price_tier_1: product.priceTier1,
                quantity_tier_1: product.quantityTier1,
                price_tier_2: product.priceTier2 || null,
                quantity_tier_2: product.quantityTier2 || null,
                price_tier_3: product.priceTier3 || null,
                quantity_tier_3: product.quantityTier3 || null,
                minimum_order: product.minimumOrder,
              });

            if (error) throw error;
          }
        }
      }

      // Remove pricing for products that no longer have custom pricing or minimum order requirements
      const currentProductIds = productsToSave.map((p) => p.id);
      const toRemove = this.existingPricing.filter(
        (p) => !currentProductIds.includes(p.product_id),
      );

      for (const pricing of toRemove) {
        const { error } = await this.supabase.client
          .from('company_pricing')
          .delete()
          .eq('id', pricing.id);

        if (error) throw error;
      }

      // Navigate back
      this.router.navigate(['/admin/cijene-tvrtki']);
    } catch (error) {
      console.error('Error saving company pricing:', error);
      const errorMessage = this.translationService.translate(
        'admin.companyPricingForm.errorSavingPricing',
      );
      alert(errorMessage);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/cijene-tvrtki']);
  }

  toggleBulkPricing(): void {
    this.showBulkPricing = !this.showBulkPricing;
  }

  applyBulkDiscount(): void {
    if (
      !this.bulkDiscountPercentage ||
      this.bulkDiscountPercentage <= 0 ||
      this.bulkDiscountPercentage > 100
    ) {
      return;
    }

    const confirmMessage = this.translationService.translate(
      'admin.companyPricingForm.confirmBulkDiscountCompany',
      {
        percentage: this.bulkDiscountPercentage.toString(),
      },
    );
    if (confirm(confirmMessage)) {
      this.applyBulkDiscountConfirmed();
    }
  }

  private applyBulkDiscountConfirmed(): void {
    const discount = this.bulkDiscountPercentage / 100;

    // Apply discount to all products
    this.filteredProducts = this.products.map((product) => {
      const discountedPrice = product.price * (1 - discount);
      const quantityTier1 = 1;
      const priceTier1 = Math.round(discountedPrice * 100) / 100; // Round to 2 decimal places

      return {
        ...product,
        customPrice: priceTier1,
        hasCustomPrice: true,
        minimumOrder: 1,
        quantityTier1,
        priceTier1,
        quantityTier2: undefined,
        priceTier2: undefined,
        quantityTier3: undefined,
        priceTier3: undefined,
      };
    });

    // Show notification
    const message = this.translationService.translate(
      'admin.companyPricingForm.bulkDiscountAppliedAll',
      {
        percentage: this.bulkDiscountPercentage.toString(),
        count: this.products.length.toString(),
      },
    );
    alert(message);
  }

  applyBulkDiscountToFiltered(): void {
    if (
      !this.bulkDiscountPercentage ||
      this.bulkDiscountPercentage <= 0 ||
      this.bulkDiscountPercentage > 100
    ) {
      return;
    }

    const confirmMessage = this.translationService.translate(
      'admin.companyPricingForm.confirmBulkDiscountFiltered',
      {
        percentage: this.bulkDiscountPercentage.toString(),
        count: this.filteredProducts.length.toString(),
      },
    );
    if (!confirm(confirmMessage)) {
      return;
    }

    const discount = this.bulkDiscountPercentage / 100;

    // Apply discount only to currently filtered/visible products
    this.filteredProducts = this.filteredProducts.map((product) => {
      const discountedPrice = product.price * (1 - discount);
      const quantityTier1 = product.quantityTier1 || 1;
      const priceTier1 = Math.round(discountedPrice * 100) / 100;

      return {
        ...product,
        customPrice: priceTier1,
        hasCustomPrice: true,
        minimumOrder: 1,
        quantityTier1,
        priceTier1,
        quantityTier2: undefined,
        priceTier2: undefined,
        quantityTier3: undefined,
        priceTier3: undefined,
      };
    });

    const message = this.translationService.translate(
      'admin.companyPricingForm.bulkDiscountAppliedFiltered',
      {
        percentage: this.bulkDiscountPercentage.toString(),
        count: this.filteredProducts.length.toString(),
      },
    );
    alert(message);
  }

  applyPresetDiscount(percentage: number): void {
    this.bulkDiscountPercentage = percentage;
  }

  clearAllCustomPricing(): void {
    const confirmMessage = this.translationService.translate(
      'admin.companyPricingForm.confirmClearAllPricing',
    );
    if (!confirm(confirmMessage)) {
      return;
    }

    // Clear all custom pricing
    this.filteredProducts = this.filteredProducts.map((product) => ({
      ...product,
      customPrice: product.price,
      hasCustomPrice: false,
      minimumOrder: 1,
      quantityTier1: 1,
      priceTier1: product.price,
      quantityTier2: undefined,
      priceTier2: undefined,
      quantityTier3: undefined,
      priceTier3: undefined,
    }));

    const message = this.translationService.translate(
      'admin.companyPricingForm.allPricingCleared',
    );
    alert(message);
  }
}
