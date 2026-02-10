import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable, Subject, firstValueFrom } from 'rxjs';
import { takeUntil, take, map } from 'rxjs/operators';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslationService } from '../../../../shared/services/translation.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../../shared/services/toast.service';
import { getUnitName, filterAndCombineErpStock, FilteredStockItem } from '../../../../shared/utils/erp-unit-names';
import {
  loadProducts,
  loadCategories,
  loadErpStock,
  clearErpStock,
  filterErpStockByUnit,
  ErpStockItem
} from '../../../b2b/shared/store/products.actions';
import {
  selectProducts,
  selectCategories,
  selectProductsLoading,
  selectErpStockLoading,
  selectErpStockError,
  selectErpStock
} from '../../../b2b/shared/store/products.selectors';
import { Product, Category } from '../../../b2b/shared/store/products.actions';


interface ProductRelationship {
  id?: string;
  product_id: string;
  related_product_id?: string;
  related_category_id?: string;
  relationship_type: string;
  sort_order: number;
  is_active: boolean;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminFormComponent, TranslatePipe],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);
  private store = inject(Store);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();
  translationService = inject(TranslationService);

  productForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  productId: string | null = null;
  categories$: Observable<Category[]>;
  products$: Observable<Product[]>;
  loading$: Observable<boolean>;
  categories: Category[] = [];
  organizedCategories: Category[] = [];
  products: Product[] = [];
  relationships: ProductRelationship[] = [];
  availableProducts: Product[] = [];
  selectedCategoryIds: string[] = [];
  primaryCategoryId: string | null = null;
  newRelationship: Partial<ProductRelationship> = {
    relationship_type: 'suggested',
    related_product_id: undefined,
    related_category_id: undefined,
    sort_order: 0,
    is_active: true
  };

  // ERP Stock Management (NgRx)
  erpStockByUnit$: Observable<ErpStockItem[]>;
  erpStockFiltered$: Observable<FilteredStockItem[]>;
  erpStockLoading$: Observable<boolean>;
  erpStockError$: Observable<string | null>;
  erpStockTotalQuantity$: Observable<number>;
  searchUnitId = '';

  constructor() {
    this.initForm();
    this.categories$ = this.store.select(selectCategories);
    this.products$ = this.store.select(selectProducts);
    this.loading$ = this.store.select(selectProductsLoading);

    // ERP Stock observables - Apply filtering and combining
    this.erpStockByUnit$ = this.store.select(selectErpStock);
    this.erpStockFiltered$ = this.erpStockByUnit$.pipe(
      map(stockItems => filterAndCombineErpStock(stockItems))
    );
    this.erpStockLoading$ = this.store.select(selectErpStockLoading);
    this.erpStockError$ = this.store.select(selectErpStockError);
    this.erpStockTotalQuantity$ = this.erpStockFiltered$.pipe(
      map(stockItems => stockItems.reduce((total, item) => total + item.quantity, 0))
    );
  }

  ngOnInit(): void {
    this.loadCategoriesAndProducts();
    this.checkEditMode();
    this.subscribeToStoreData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Clear ERP stock when leaving the component
    this.store.dispatch(clearErpStock());
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      slug: ['', [Validators.required]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0.01)]],
      compare_at_price: [''],
      sku: ['', [Validators.required]],
      brand: [''],
      model: [''],
      images: [''],
      stock_quantity: [0, [Validators.required, Validators.min(0)]],
      weight: [null],
      dimensions: [''],
      is_active: [true],
      is_featured: [false],
      is_on_sale: [false],
      specifications: [''],
      features: [''],
      certifications: [''],
      technical_sheet: ['']
    });
  }

  private loadCategoriesAndProducts(): void {
    this.store.dispatch(loadCategories());
    this.store.dispatch(loadProducts({}));
  }

  private subscribeToStoreData(): void {
    this.categories$.pipe(takeUntil(this.destroy$)).subscribe(categories => {
      this.categories = categories;
      this.organizeCategories();
    });

    this.products$.pipe(takeUntil(this.destroy$)).subscribe(products => {
      this.products = products;
      this.updateAvailableProducts();
    });
  }

  private organizeCategories(): void {
    // Organize categories hierarchically: parent categories first, then their children
    const parentCategories = this.categories.filter(cat => !cat.parent_id);
    const childCategories = this.categories.filter(cat => cat.parent_id);
    
    this.organizedCategories = [];
    
    // Add each parent category followed by its children
    parentCategories.forEach(parent => {
      this.organizedCategories.push(parent);
      const children = childCategories.filter(child => child.parent_id === parent.id);
      this.organizedCategories.push(...children);
    });
    
    // Add any orphaned child categories at the end
    const parentIds = parentCategories.map(p => p.id);
    const orphanedChildren = childCategories.filter(child => !parentIds.includes(child.parent_id || ''));
    this.organizedCategories.push(...orphanedChildren);
  }

  private checkEditMode(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      this.loadProduct();
      this.loadProductRelationships();
    }
    // Set title after determining edit mode
    this.title.setTitle(this.isEditMode ? 'Edit Product - Solar Shop Admin' : 'Create Product - Solar Shop Admin');
  }

  private async loadProduct(): Promise<void> {
    if (!this.productId) return;

    try {
      const data = await this.supabaseService.getTableById('products', this.productId);

      if (data) {
        // Map database fields to form fields
        const productName = data.name || '';
        const formData = {
          name: productName,
          slug: (data as any).slug || this.generateSlug(productName),
          description: data.description || '',
          price: Number(data.price) || 0,
          compare_at_price: (data as any).compare_at_price || data.original_price || '',
          sku: data.sku || '',
          brand: data.brand || '',
          model: data.model || '',
          stock_quantity: Number(data.stock_quantity) || 0,
          weight: data.weight ? Number(data.weight) : null,
          dimensions: data.dimensions || '',
          is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
          is_featured: data.is_featured !== undefined ? Boolean(data.is_featured) : false,
          is_on_sale: data.is_on_sale !== undefined ? Boolean(data.is_on_sale) : false,
          images: this.formatImages(data),
          specifications: this.formatSpecifications(data.specifications),
          features: this.formatFeatures(data.features),
          certifications: this.formatCertifications(data.certifications),
          technical_sheet: data.technical_sheet || ''
        };

        this.productForm.patchValue(formData);
        this.loadProductCategories();
        this.updateAvailableProducts();

        // Auto-load ERP stock if SKU exists
        if (data.sku) {
          console.log('[Product Form] Auto-loading ERP stock for SKU:', data.sku);
          this.store.dispatch(loadErpStock({ sku: data.sku }));
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
    }
  }

  private formatImages(data: any): string {
    // Handle JSONB images array format from database
    if (data.images && Array.isArray(data.images)) {
      return data.images.map((img: any) => img.url || img).join('\n');
    } else if (typeof data.images === 'string') {
      return data.images;
    }
    return '';
  }

  private formatSpecifications(specifications: any): string {
    if (!specifications) {
      return '';
    }

    try {
      // If it's already a string, return it
      if (typeof specifications === 'string') {
        return specifications;
      }

      // If it's an object, convert to line-separated format
      if (typeof specifications === 'object') {
        return Object.entries(specifications)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      }

      return '';
    } catch (error) {
      console.error('Error formatting specifications:', error);
      return '';
    }
  }

  private formatFeatures(features: any): string {
    if (!features) {
      return '';
    }

    try {
      // If it's already a string, return it
      if (typeof features === 'string') {
        return features;
      }

      // If it's an array, join with newlines
      if (Array.isArray(features)) {
        return features.join('\n');
      }

      return '';
    } catch (error) {
      console.error('Error formatting features:', error);
      return '';
    }
  }

  private formatCertifications(certifications: any): string {
    if (!certifications) {
      return '';
    }

    try {
      // If it's already a string, return it
      if (typeof certifications === 'string') {
        return certifications;
      }

      // If it's an array, join with newlines
      if (Array.isArray(certifications)) {
        return certifications.join('\n');
      }

      return '';
    } catch (error) {
      console.error('Error formatting certifications:', error);
      return '';
    }
  }

  onNameChange(event: any): void {
    const name = event.target.value;
    const slug = this.generateSlug(name);
    this.productForm.patchValue({ slug });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async onSubmit(formValue: any): Promise<void> {
    if (this.productForm.invalid) return;

    // Validate that at least one category is selected
    if (this.selectedCategoryIds.length === 0) {
      this.toastService.showError('Please select at least one category for the product.');
      return;
    }

    this.isSubmitting = true;

    try {
      // Process images - convert from text input to JSONB array format
      const imageUrls = formValue.images ? formValue.images.split('\n').filter((url: string) => url.trim()) : [];
      const imagesArray = imageUrls.map((url: string, index: number) => ({
        url: url.trim(),
        alt: `${formValue.name} - Image ${index + 1}`,
        is_primary: index === 0,
        order: index,
        type: index === 0 ? 'main' : 'gallery'
      }));

      // Parse specifications line-separated format to object
      let specificationsObj: { [key: string]: string } = {};
      if (formValue.specifications && formValue.specifications.trim()) {
        try {
          const specs = formValue.specifications.trim().split('\n');
          specs.forEach((spec: string) => {
            const [key, ...valueParts] = spec.split(':');
            if (key && valueParts.length > 0) {
              const value = valueParts.join(':').trim();
              if (value) {
                specificationsObj[key.trim()] = value;
              }
            }
          });
        } catch (error) {
          console.error('Error parsing specifications:', error);
          // Continue with empty specifications if parsing fails
        }
      }

      // Parse features string to array
      let featuresArray: string[] = [];
      if (formValue.features && formValue.features.trim()) {
        featuresArray = formValue.features.split('\n')
          .map((feature: string) => feature.trim())
          .filter((feature: string) => feature.length > 0);
      }

      // Parse certifications string to array
      let certificationsArray: string[] = [];
      if (formValue.certifications && formValue.certifications.trim()) {
        certificationsArray = formValue.certifications.split('\n')
          .map((certification: string) => certification.trim())
          .filter((certification: string) => certification.length > 0);
      }

      // Get current ERP stock total quantity
      const currentErpStock = await firstValueFrom(this.erpStockTotalQuantity$.pipe(take(1)));

      // Map form fields to database fields
      const productData: any = {
        name: formValue.name,
        slug: formValue.slug,
        description: formValue.description,
        short_description: formValue.description, // Use description as short_description if not provided
        price: Number(formValue.price),
        currency: 'EUR', // Default currency
        sku: formValue.sku,
        brand: formValue.brand,
        model: formValue.model,
        stock_quantity: Number(formValue.stock_quantity),
        weight: formValue.weight ? Number(formValue.weight) : undefined,
        dimensions: formValue.dimensions || '',
        is_active: Boolean(formValue.is_active),
        is_featured: Boolean(formValue.is_featured),
        is_on_sale: Boolean(formValue.is_on_sale),
        images: imagesArray, // Use JSONB array format
        specifications: specificationsObj,
        features: featuresArray,
        certifications: certificationsArray,
        technical_sheet: formValue.technical_sheet || null,
        tags: [], // Default empty tags
        stock_status: Number(formValue.stock_quantity) > 0 ? 'in_stock' as const : 'out_of_stock' as const,
        category_id: this.primaryCategoryId, // Set primary category for legacy support
        updated_at: new Date().toISOString()
      };

      // If we have ERP stock data, include it in the update
      if (typeof currentErpStock === 'number' && currentErpStock > 0) {
        productData.erp_stock = currentErpStock;
        productData.erp_stock_updated_at = new Date().toISOString();
      }

      // Explicitly handle original_price to ensure it's always included in the payload
      if (formValue.compare_at_price && formValue.compare_at_price !== '' && formValue.compare_at_price !== null) {
        productData.original_price = Number(formValue.compare_at_price);
      } else {
        productData.original_price = null; // Explicitly set to null to clear the field
      }

      let savedProductId: string;
      if (this.isEditMode && this.productId) {
        await this.supabaseService.updateRecord('products', this.productId, productData);
        savedProductId = this.productId;
      } else {
        (productData as any).created_at = new Date().toISOString();
        console.log('Creating product with data:', productData);
        
        const result = await this.supabaseService.createRecord('products', productData);
        console.log('Create product result:', result);
        
        if (!result) {
          throw new Error('Failed to create product - no result returned');
        }
        if (!result.id) {
          throw new Error('Failed to create product - no ID in result');
        }
        savedProductId = result.id;
      }

      // Save product categories
      await this.saveProductCategories(savedProductId);

      this.router.navigate(['/admin/proizvodi']);
    } catch (error: any) {
      console.error('Error saving product:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      });
      
      // Show user-friendly error message
      if (error.message) {
        this.toastService.showError(`Failed to save product: ${error.message}`);
      } else {
        this.toastService.showError('Failed to save product. Please check the console for details.');
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  // Product Relationships Methods
  private async loadProductRelationships(): Promise<void> {
    if (!this.productId) return;

    try {
      const { data, error } = await this.supabaseService.client
        .from('product_relationships')
        .select('*')
        .eq('product_id', this.productId)
        .order('sort_order');

      if (error) {
        console.error('Error loading product relationships:', error);
        this.relationships = [];
        return;
      }

      this.relationships = data || [];
    } catch (error) {
      console.error('Error loading product relationships:', error);
      this.relationships = [];
    }
  }

  private updateAvailableProducts(): void {
    // Filter out the current product and already related products
    const relatedProductIds = this.relationships
      .filter(r => r.related_product_id)
      .map(r => r.related_product_id);

    this.availableProducts = this.products.filter(product =>
      product.id !== this.productId &&
      !relatedProductIds.includes(product.id)
    );
  }

  onRelationshipTypeChange(type: string): void {
    this.newRelationship.relationship_type = type;
  }

  onRelatedProductChange(productId: string): void {
    // Convert empty string to undefined
    this.newRelationship.related_product_id = productId || undefined;
    // Clear the other selection if this one has a value
    if (productId) {
      this.newRelationship.related_category_id = undefined;
    }
  }

  onRelatedCategoryChange(categoryId: string): void {
    // Convert empty string to undefined
    this.newRelationship.related_category_id = categoryId || undefined;
    // Clear the other selection if this one has a value
    if (categoryId) {
      this.newRelationship.related_product_id = undefined;
    }
  }

  canAddRelationship(): boolean {
    const hasType = !!this.newRelationship.relationship_type;
    const hasRelatedProduct = !!this.newRelationship.related_product_id;
    const hasRelatedCategory = !!this.newRelationship.related_category_id;
    const hasRelation = hasRelatedProduct || hasRelatedCategory;

    return hasType && hasRelation;
  }

  async addRelationship(): Promise<void> {
    if (!this.canAddRelationship() || !this.productId) return;

    try {
      const relationshipData = {
        product_id: this.productId,
        related_product_id: this.newRelationship.related_product_id || null,
        related_category_id: this.newRelationship.related_category_id || null,
        relationship_type: this.newRelationship.relationship_type || 'suggested',
        sort_order: this.newRelationship.sort_order || 0,
        is_active: true
      };

      const { error } = await this.supabaseService.client
        .from('product_relationships')
        .insert(relationshipData);

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to create relationship: ${error.message}`);
      }

      // Create bidirectional relationship if it's a product relationship
      if (this.newRelationship.related_product_id) {
        const reverseRelationshipData = {
          product_id: this.newRelationship.related_product_id,
          related_product_id: this.productId,
          related_category_id: null,
          relationship_type: this.newRelationship.relationship_type || 'suggested',
          sort_order: this.newRelationship.sort_order || 0,
          is_active: true
        };

        const { error: reverseError } = await this.supabaseService.client
          .from('product_relationships')
          .insert(reverseRelationshipData);

        if (reverseError) {
          console.error('Database error creating reverse relationship:', reverseError);
          // Don't throw here, the main relationship was already created successfully
        }
      }

      // Reset form and reload relationships
      this.newRelationship = {
        relationship_type: 'suggested',
        related_product_id: undefined,
        related_category_id: undefined,
        sort_order: 0,
        is_active: true
      };

      await this.loadProductRelationships();
      this.updateAvailableProducts();

      // Show success message
      this.toastService.showSuccess('Product relationship added successfully!');
    } catch (error: any) {
      console.error('Error adding relationship:', error);

      // Check if it's an RLS policy error
      if (error.message && error.message.includes('row-level security policy')) {
        this.toastService.showError('Permission denied: You may not have sufficient privileges to add product relationships. Please contact your administrator.');
      } else {
        this.toastService.showError(`Error adding relationship: ${error.message || 'Please try again.'}`);
      }
    }
  }

  async removeRelationship(relationship: ProductRelationship): Promise<void> {
    if (!relationship.id) return;

    try {
      const { error } = await this.supabaseService.client
        .from('product_relationships')
        .delete()
        .eq('id', relationship.id);

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to delete relationship: ${error.message}`);
      }

      await this.loadProductRelationships();
      this.updateAvailableProducts();

      // Show success message
      this.toastService.showSuccess('Product relationship removed successfully!');
    } catch (error: any) {
      console.error('Error removing relationship:', error);
      this.toastService.showError(`Error removing relationship: ${error.message || 'Please try again.'}`);
    }
  }

  async toggleRelationshipStatus(relationship: ProductRelationship): Promise<void> {
    if (!relationship.id) return;

    try {
      const { error } = await this.supabaseService.client
        .from('product_relationships')
        .update({ is_active: !relationship.is_active })
        .eq('id', relationship.id);

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to update relationship: ${error.message}`);
      }

      await this.loadProductRelationships();

      // Show success message
      const statusText = relationship.is_active ? 'deactivated' : 'activated';
      this.toastService.showSuccess(`Product relationship ${statusText} successfully!`);
    } catch (error: any) {
      console.error('Error toggling relationship status:', error);
      this.toastService.showError(`Error updating relationship status: ${error.message || 'Please try again.'}`);
    }
  }

  getRelationshipTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      suggested: this.translationService.translate('admin.productRelationshipsSuggested'),
      complementary: this.translationService.translate('admin.productRelationshipsComplementary'),
      alternative: this.translationService.translate('admin.productRelationshipsAlternative'),
      bundle: this.translationService.translate('admin.productRelationshipsBundle')
    };
    return labels[type] || type;
  }

  getProductName(productId: string): string {
    const product = this.products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  }

  trackByRelationshipId(index: number, relationship: ProductRelationship): string {
    return relationship.id || index.toString();
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // You could show a toast notification here if you have one
      console.log('UUID copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy UUID: ', err);
    });
  }

  // ERP Stock Management Methods (NgRx)
  loadErpStock(): void {
    const sku = this.productForm.get('sku')?.value;

    if (!sku) {
      this.toastService.showError('Molimo unesite šifru artikla prije pretraživanja zaliha');
      return;
    }

    this.store.dispatch(loadErpStock({ sku }));
  }

  filterErpStockByUnit(): void {
    this.store.dispatch(filterErpStockByUnit({ unitId: this.searchUnitId }));
  }

  syncStockFromErp(): void {
    this.erpStockTotalQuantity$.pipe(takeUntil(this.destroy$)).subscribe(totalStock => {
      this.productForm.patchValue({ stock_quantity: totalStock });
      this.toastService.showSuccess(`Zaliha sinkronizirana iz ERP sustava: ${totalStock} jedinica`);
    }).unsubscribe();
  }

  clearErpStockError(): void {
    this.store.dispatch(clearErpStock());
  }

  /**
   * Get display name for a unit ID
   */
  getUnitDisplayName(unitId: string | undefined, unitName?: string): string {
    return getUnitName(unitId, unitName);
  }

  /**
   * Get display with both unit ID and name
   */
  getUnitDisplayWithId(unitId: string | undefined, unitName?: string): string {
    if (!unitId) return unitName || '';
    const displayName = getUnitName(unitId, unitName);
    return `${unitId} - ${displayName}`;
  }

  // Category selection methods
  onCategorySelectionChange(categoryId: string, event: any): void {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      // Add category to selected list
      if (!this.selectedCategoryIds.includes(categoryId)) {
        this.selectedCategoryIds.push(categoryId);
      }
      
      // If this is the first category selected, make it primary
      if (this.selectedCategoryIds.length === 1) {
        this.primaryCategoryId = categoryId;
      }
    } else {
      // Remove category from selected list
      this.selectedCategoryIds = this.selectedCategoryIds.filter(id => id !== categoryId);
      
      // If this was the primary category, set a new primary (first in the list)
      if (this.primaryCategoryId === categoryId) {
        this.primaryCategoryId = this.selectedCategoryIds.length > 0 ? this.selectedCategoryIds[0] : null;
      }
    }
  }

  setPrimaryCategory(categoryId: string): void {
    if (this.selectedCategoryIds.includes(categoryId)) {
      this.primaryCategoryId = categoryId;
    }
  }


  private async loadProductCategories(): Promise<void> {
    if (!this.productId) return;

    try {
      // Load product categories from the product_categories junction table
      const { data: productCategories } = await this.supabaseService.client
        .from('product_categories')
        .select(`
          category_id,
          is_primary,
          categories!inner(id, name)
        `)
        .eq('product_id', this.productId);

      if (productCategories && productCategories.length > 0) {
        this.selectedCategoryIds = productCategories.map((pc: any) => pc.category_id);
        
        // Find the primary category
        const primaryCategory = productCategories.find((pc: any) => pc.is_primary);
        this.primaryCategoryId = primaryCategory ? primaryCategory.category_id : this.selectedCategoryIds[0];
      } else {
        // Fallback: check if there's a legacy category_id in the product record
        const productData = await this.supabaseService.getTableById('products', this.productId);
        if (productData && productData.category_id) {
          this.selectedCategoryIds = [productData.category_id];
          this.primaryCategoryId = productData.category_id;
        }
      }
    } catch (error) {
      console.error('Error loading product categories:', error);
    }
  }

  private async saveProductCategories(productId: string): Promise<void> {
    if (this.selectedCategoryIds.length === 0) {
      console.log('No categories selected, skipping product_categories save');
      return;
    }

    try {
      // First, delete existing product_categories entries for this product
      await this.supabaseService.client
        .from('product_categories')
        .delete()
        .eq('product_id', productId);

      // Then, insert new entries
      const productCategoryEntries = this.selectedCategoryIds.map((categoryId) => ({
        product_id: productId,
        category_id: categoryId,
        is_primary: categoryId === this.primaryCategoryId
      }));

      const { error } = await this.supabaseService.client
        .from('product_categories')
        .insert(productCategoryEntries);

      if (error) {
        throw error;
      }

      console.log('Successfully saved product categories:', productCategoryEntries);
    } catch (error: any) {
      console.error('Error saving product categories:', error);
      console.error('Product categories error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
  }
}