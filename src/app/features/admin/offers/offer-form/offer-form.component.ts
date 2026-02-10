import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';

@Component({
  selector: 'app-offer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormComponent, TranslatePipe],
  templateUrl: './offer-form.component.html',
  styleUrls: ['./offer-form.component.scss']
})
export class OfferFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);
  translationService = inject(TranslationService);

  offerForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  offerId: string | null = null;
  categories: any[] = [];
  selectedCategory: any = null;
  categoryProducts: any[] = [];
  isLoadingCategories = false;
  isLoadingProducts = false;
  allProducts: any[] = [];
  isLoadingAllProducts = false;
  private isLoadingOfferData = false;

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.loadCategories();
    this.loadAllProducts();
    this.setupDiscountChangeListeners();
  }

  private initForm(): void {
    const now = new Date();
    const defaultStart = new Date(now.getTime());
    const defaultEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    this.offerForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      image_url: [''],
      code: ['', [Validators.required]],
      discount_type: ['', [Validators.required]],
      discount_value: [0, [Validators.required, Validators.min(0)]],
      min_order_amount: [null],
      start_date: [this.formatDateTimeLocal(defaultStart), [Validators.required]],
      end_date: [this.formatDateTimeLocal(defaultEnd)],
      max_usage: [null],
      priority: [0],
      status: ['draft', [Validators.required]],
      is_b2b: [false],
      bundle: [false],
      category_id: [null],
      apply_to_category: [false],
      products: this.fb.array([])
    });
  }

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private setupDiscountChangeListeners(): void {
    // Listen for changes to discount type and value
    this.offerForm.get('discount_type')?.valueChanges.subscribe((discountType) => {
      this.onDiscountTypeChange(discountType);
    });

    this.offerForm.get('discount_value')?.valueChanges.subscribe((discountValue) => {
      this.onDiscountValueChange(discountValue);
    });

    // Listen for changes to is_b2b to automatically set bundle to true
    this.offerForm.get('is_b2b')?.valueChanges.subscribe((isB2B) => {
      if (isB2B) {
        this.offerForm.get('bundle')?.setValue(true, { emitEvent: false });
      }
    });
  }

  private onDiscountTypeChange(discountType: string): void {
    if (this.isLoadingOfferData) {
      return;
    }

    const discountValue = Number(this.offerForm.get('discount_value')?.value || 0);

    if (this.productsArray.length > 0 && discountValue > 0) {
      this.applyDiscountTypeToAllProducts(discountType, discountValue);
    }
  }

  private onDiscountValueChange(discountValue: number): void {
    if (this.isLoadingOfferData) {
      return;
    }

    const discountType = this.offerForm.get('discount_type')?.value;

    if (this.productsArray.length > 0 && discountType && discountValue > 0) {
      this.applyDiscountTypeToAllProducts(discountType, discountValue);
    }
  }

  private applyDiscountTypeToAllProducts(discountType: string, discountValue: number): void {
    if (discountType === 'percentage') {
      // Apply percentage discount to all products
      this.productsArray.controls.forEach(productControl => {
        productControl.get('discount_percentage')?.setValue(discountValue, { emitEvent: false });
        productControl.get('discount_amount')?.setValue(0, { emitEvent: false });
        productControl.get('discount_type')?.setValue('percentage', { emitEvent: false });
      });
    } else if (discountType === 'fixed_amount') {
      // Apply fixed amount discount to all products
      this.productsArray.controls.forEach(productControl => {
        productControl.get('discount_amount')?.setValue(discountValue, { emitEvent: false });
        productControl.get('discount_percentage')?.setValue(0, { emitEvent: false });
        productControl.get('discount_type')?.setValue('fixed_amount', { emitEvent: false });
      });
    }
  }

  applyGlobalDiscountToProducts(): void {
    if (this.isLoadingOfferData) {
      return;
    }

    const discountType = this.offerForm.get('discount_type')?.value;
    const discountValue = Number(this.offerForm.get('discount_value')?.value || 0);

    if (this.productsArray.length === 0 || !discountType || discountValue <= 0) {
      return;
    }

    this.applyDiscountTypeToAllProducts(discountType, discountValue);
  }

  private checkEditMode(): void {
    this.offerId = this.route.snapshot.paramMap.get('id');
    if (this.offerId) {
      this.isEditMode = true;
      this.loadOffer();
    }
    // Set title after determining edit mode
    this.title.setTitle(this.isEditMode ? 'Edit Offer - Solar Shop Admin' : 'Create Offer - Solar Shop Admin');
  }

  private async loadOffer(): Promise<void> {
    if (!this.offerId) return;

    try {
      this.isLoadingOfferData = true;
      const data = await this.supabaseService.getTableById('offers', this.offerId);
      if (data) {
        // Convert applicable_category_ids array to category_id
        const categoryId = data.applicable_category_ids && data.applicable_category_ids.length > 0
          ? data.applicable_category_ids[0]
          : null;

        const formData = {
          ...data,
          category_id: categoryId,
          start_date: data.start_date ? this.formatDateTimeLocal(new Date(data.start_date)) : '',
          end_date: data.end_date ? this.formatDateTimeLocal(new Date(data.end_date)) : ''
        };
        this.offerForm.patchValue(formData);

        // Load offer products
        await this.loadOfferProducts();
      }
    } catch (error) {
      console.error('Error loading offer:', error);
    } finally {
      this.isLoadingOfferData = false;
    }
  }

  private async loadOfferProducts(): Promise<void> {
    if (!this.offerId) return;

    try {
      const { data, error } = await this.supabaseService.client
        .from('offer_products')
        .select(`
          *,
          products (
            id,
            name,
            sku,
            price,
            category_id,
            categories (
              name
            )
          )
        `)
        .eq('offer_id', this.offerId)
        .order('sort_order');

      if (error) throw error;

      if (data && data.length > 0) {
        // Clear existing products array
        this.productsArray.clear();

        // Add each offer product to the form
        data.forEach((offerProduct: any) => {
          const product = offerProduct.products;
          // Determine discount type based on which field has a value
          const discountType = (offerProduct.discount_amount && offerProduct.discount_amount > 0) ? 'fixed_amount' : 'percentage';
          
          const productFormGroup = this.fb.group({
            id: [product.id, Validators.required],
            name: [product.name, Validators.required],
            sku: [product.sku || ''],
            category: [product.categories?.name || ''],
            price: [product.price || 0, [Validators.required, Validators.min(0)]],
            discount_percentage: [offerProduct.discount_percentage || 0, [Validators.min(0), Validators.max(100)]],
            discount_amount: [offerProduct.discount_amount || 0, [Validators.min(0)]],
            discount_type: [discountType]
          });

          this.productsArray.push(productFormGroup);
        });
      }
    } catch (error) {
      console.error('Error loading offer products:', error);
    }
  }

  async onSubmit(formValue: any): Promise<void> {
    if (this.offerForm.invalid) return;

    this.isSubmitting = true;

    try {
      // Extract products from form array
      const products = this.productsArray.value;

      // Remove products and apply_to_category from form data to avoid saving them to offers table
      const { products: _, apply_to_category: __, category_id: ___, ...offerData } = formValue;

      // Convert category_id to applicable_category_ids array only if apply_to_category is checked
      const categoryId = formValue.category_id;
      const applyToCategory = formValue.apply_to_category;
      const applicableCategoryIds = (applyToCategory && categoryId) ? [categoryId] : [];

      // Calculate total original and discounted prices
      const totalOriginalPrice = this.getTotalOriginalPrice();
      const totalDiscountedPrice = this.getTotalDiscountedPrice();

      const finalOfferData = {
        ...offerData,
        applicable_category_ids: applicableCategoryIds,
        original_price: totalOriginalPrice,
        discounted_price: totalDiscountedPrice,
        start_date: offerData.start_date ? new Date(offerData.start_date).toISOString() : null,
        end_date: offerData.end_date ? new Date(offerData.end_date).toISOString() : null,
        max_usage: offerData.max_usage === '' || offerData.max_usage === null || offerData.max_usage === undefined ? null : Number(offerData.max_usage),
        updated_at: new Date().toISOString()
      };

      let savedOfferId: string;

      if (this.isEditMode && this.offerId) {
        await this.supabaseService.updateRecord('offers', this.offerId, finalOfferData);
        savedOfferId = this.offerId;
      } else {
        finalOfferData.created_at = new Date().toISOString();
        const result = await this.supabaseService.createRecord('offers', finalOfferData);
        if (!result) {
          throw new Error('Failed to create offer');
        }
        savedOfferId = result.id;
      }

      // Save products to offer_products table
      await this.saveOfferProducts(savedOfferId, products);

      this.router.navigate(['/admin/ponude']);
    } catch (error) {
      console.error('Error saving offer:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private async saveOfferProducts(offerId: string, products: any[]): Promise<void> {
    try {
      // First, delete existing offer products for this offer
      await this.supabaseService.client
        .from('offer_products')
        .delete()
        .eq('offer_id', offerId);

      // Then insert new offer products
      if (products.length > 0) {
        const offerProducts = products.map((product, index) => {
          const discountType = product.discount_type || 'percentage';
          const discountValue = discountType === 'percentage' 
            ? (product.discount_percentage || 0) 
            : (product.discount_amount || 0);
          
          return {
            offer_id: offerId,
            product_id: product.id,
            discount_percentage: product.discount_percentage || 0,
            discount_amount: product.discount_amount || 0,
            original_price: product.price,
            discounted_price: this.calculateDiscountedPriceByType(product.price, discountValue, discountType),
            sort_order: index
          };
        });

        await this.supabaseService.client
          .from('offer_products')
          .insert(offerProducts);
      }
    } catch (error) {
      console.error('Error saving offer products:', error);
      throw error;
    }
  }

  private async loadCategories(): Promise<void> {
    this.isLoadingCategories = true;
    try {
      const { data, error } = await this.supabaseService.client
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading categories:', error);
        // Fallback: try without is_active filter
        const { data: fallbackData, error: fallbackError } = await this.supabaseService.client
          .from('categories')
          .select('*')
          .order('name');
        
        if (fallbackError) throw fallbackError;
        this.categories = fallbackData || [];
      } else {
        this.categories = data || [];
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      this.categories = [];
    } finally {
      this.isLoadingCategories = false;
    }
  }

  async onCategoryChange(categoryId: string): Promise<void> {
    if (!categoryId) {
      this.selectedCategory = null;
      this.categoryProducts = [];
      this.offerForm.patchValue({ category_id: null });
      return;
    }

    // Check if there are products already added that don't belong to the selected category
    const existingProducts = this.getExistingProductsNotInCategory(categoryId);

    if (existingProducts.length > 0) {
      const categoryName = this.categories.find(c => c.id === categoryId)?.name || '';
      const promptMessage = this.translationService.translate('admin.offersForm.categoryChangePrompt', {
        count: existingProducts.length,
        categoryName: categoryName
      });

      const shouldClearProducts = confirm(promptMessage);

      if (shouldClearProducts) {
        // Remove products that don't belong to the selected category
        this.removeProductsNotInCategory(categoryId);
      }
    }

    this.selectedCategory = this.categories.find(c => c.id === categoryId);
    this.offerForm.patchValue({ category_id: categoryId });
    await this.loadCategoryProducts(categoryId);
  }

  private async loadCategoryProducts(categoryId: string): Promise<void> {
    this.isLoadingProducts = true;
    try {
      const { data, error } = await this.supabaseService.client
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading category products:', error);
        // Fallback: try without is_active filter
        const { data: fallbackData, error: fallbackError } = await this.supabaseService.client
          .from('products')
          .select(`
            *,
            categories (
              name
            )
          `)
          .eq('category_id', categoryId)
          .order('name');
        
        if (fallbackError) throw fallbackError;
        // Map category names for easier access
        this.categoryProducts = (fallbackData || []).map(product => ({
          ...product,
          category_name: product.categories?.name || ''
        }));
      } else {
        // Map category names for easier access
        this.categoryProducts = (data || []).map(product => ({
          ...product,
          category_name: product.categories?.name || ''
        }));
      }
    } catch (error) {
      console.error('Error loading category products:', error);
      this.categoryProducts = [];
    } finally {
      this.isLoadingProducts = false;
    }
  }

  applyDiscountToCategory(): void {
    if (!this.selectedCategory || this.categoryProducts.length === 0) return;

    // Get already added product IDs
    const alreadyAddedIds = this.getAlreadyAddedProductIds();

    // Add only products that haven't been added yet
    const productsToAdd = this.categoryProducts.filter(product => !alreadyAddedIds.includes(product.id));

    if (productsToAdd.length === 0) {
      alert(this.translationService.translate('admin.offersForm.allCategoryProductsAdded'));
      return;
    }

    // Add remaining products from the category
    productsToAdd.forEach(product => {
      this.addProductToOffer(product);
    });
  }

  private async loadAllProducts(): Promise<void> {
    this.isLoadingAllProducts = true;
    try {
      const { data, error } = await this.supabaseService.client
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading all products:', error);
        // Fallback: try without is_active filter
        const { data: fallbackData, error: fallbackError } = await this.supabaseService.client
          .from('products')
          .select(`
            *,
            categories (
              name
            )
          `)
          .order('name');
        
        if (fallbackError) throw fallbackError;
        // Map category names for easier access
        this.allProducts = (fallbackData || []).map(product => ({
          ...product,
          category_name: product.categories?.name || ''
        }));
      } else {
        // Map category names for easier access
        this.allProducts = (data || []).map(product => ({
          ...product,
          category_name: product.categories?.name || ''
        }));
      }
    } catch (error) {
      console.error('Error loading all products:', error);
      this.allProducts = [];
    } finally {
      this.isLoadingAllProducts = false;
    }
  }

  get productsArray(): FormArray {
    return this.offerForm.get('products') as FormArray;
  }

  private createProductFormGroup(product?: any): FormGroup {
    // Get the global discount to apply
    const globalDiscountType = this.offerForm.get('discount_type')?.value;
    const globalDiscountValue = Number(this.offerForm.get('discount_value')?.value || 0);
    
    let discountPercentage = 0;
    let discountAmount = 0;
    let discountType = 'percentage';

    if (product) {
      discountPercentage = product.discount_percentage || 0;
      discountAmount = product.discount_amount || 0;
      discountType = product.discount_type || 'percentage';
    } else if (globalDiscountType === 'percentage' && globalDiscountValue > 0) {
      discountPercentage = globalDiscountValue;
      discountType = 'percentage';
    } else if (globalDiscountType === 'fixed_amount') {
      discountType = 'fixed_amount';
    }

    return this.fb.group({
      id: [product?.id || '', Validators.required],
      name: [product?.name || '', Validators.required],
      sku: [product?.sku || ''],
      category: [product?.category_name || ''],
      price: [product?.price || 0, [Validators.required, Validators.min(0)]],
      discount_percentage: [discountPercentage, [Validators.min(0), Validators.max(100)]],
      discount_amount: [discountAmount, [Validators.min(0)]],
      discount_type: [discountType]
    });
  }

  addProduct(): void {
    const selectedCategoryId = this.offerForm.get('category_id')?.value;

    if (selectedCategoryId) {
      // Check if we've already added all products from this category
      const categoryProducts = this.allProducts.filter(product => product.category_id === selectedCategoryId);
      const alreadyAddedProducts = this.getAlreadyAddedProductIds();
      const availableProducts = categoryProducts.filter(product => !alreadyAddedProducts.includes(product.id));

      if (availableProducts.length === 0) {
        alert(this.translationService.translate('admin.offersForm.allCategoryProductsAdded'));
        return;
      }
    }

    const newProductGroup = this.createProductFormGroup();
    this.productsArray.push(newProductGroup);

    // Apply current global discount to the new product
    const discountType = this.offerForm.get('discount_type')?.value;
    const discountValue = Number(this.offerForm.get('discount_value')?.value || 0);

    if (discountType && discountValue > 0) {
      this.applyDiscountToProduct(newProductGroup, discountType, discountValue);
    }
  }

  private applyDiscountToProduct(productControl: any, discountType: string, discountValue: number): void {
    if (discountType === 'percentage') {
      productControl.get('discount_percentage')?.setValue(discountValue, { emitEvent: false });
      productControl.get('discount_amount')?.setValue(0, { emitEvent: false });
      productControl.get('discount_type')?.setValue('percentage', { emitEvent: false });
    } else if (discountType === 'fixed_amount') {
      productControl.get('discount_amount')?.setValue(discountValue, { emitEvent: false });
      productControl.get('discount_percentage')?.setValue(0, { emitEvent: false });
      productControl.get('discount_type')?.setValue('fixed_amount', { emitEvent: false });
    }
  }

  addProductToOffer(product: any): void {
    const existingIndex = this.productsArray.controls.findIndex(
      (control: any) => control.get('id')?.value === product.id
    );

    if (existingIndex === -1) {
      // Check if we're in category mode and if this product belongs to the selected category
      const selectedCategoryId = this.offerForm.get('category_id')?.value;
      if (selectedCategoryId && product.category_id !== selectedCategoryId) {
        alert(this.translationService.translate('admin.offersForm.productNotInSelectedCategory'));
        return;
      }

      const productFormGroup = this.createProductFormGroup(product);
      this.productsArray.push(productFormGroup);
      this.applyGlobalDiscountToProducts();
    } else {
      alert(this.translationService.translate('admin.offersForm.productAlreadyAdded'));
    }
  }

  removeProduct(index: number): void {
    this.productsArray.removeAt(index);
    this.applyGlobalDiscountToProducts();
  }

  onProductSelect(productId: string, index: number): void {
    const product = this.allProducts.find(p => p.id === productId);
    if (product) {
      const productControl = this.productsArray.at(index);

      // Apply discount based on global discount type
      const globalDiscountType = this.offerForm.get('discount_type')?.value;
      const globalDiscountValue = Number(this.offerForm.get('discount_value')?.value || 0);

      let discountPercentage = 0;
      let discountAmount = 0;
      let discountType = 'percentage';

      if (globalDiscountType === 'percentage' && globalDiscountValue > 0) {
        discountPercentage = globalDiscountValue;
        discountType = 'percentage';
      } else if (globalDiscountType === 'fixed_amount' && globalDiscountValue > 0) {
        discountAmount = globalDiscountValue;
        discountType = 'fixed_amount';
      } else if (globalDiscountType === 'fixed_amount') {
        discountType = 'fixed_amount';
      }

      productControl.patchValue({
        id: productId,
        name: product.name,
        sku: product.sku || '',
        category: product.category_name || '',
        price: product.price || 0,
        discount_percentage: discountPercentage,
        discount_amount: discountAmount,
        discount_type: discountType
      });
    } else if (productId === '') {
      // Clear the form when no product is selected
      const productControl = this.productsArray.at(index);
      productControl.patchValue({
        id: '',
        name: '',
        sku: '',
        category: '',
        price: 0,
        discount_percentage: 0,
        discount_amount: 0,
        discount_type: 'percentage'
      });
    }
  }

  getProductPrice(index: number): number {
    const product = this.productsArray.at(index);
    return product.get('price')?.value || 0;
  }

  getProductDiscount(index: number): number {
    const product = this.productsArray.at(index);
    return product.get('discount_percentage')?.value || 0;
  }

  calculateDiscountedPriceByType(originalPrice: number, discountValue: number, discountType: string): number {
    if (!discountValue || discountValue <= 0) return this.roundCurrency(originalPrice);

    if (discountType === 'percentage') {
      const discounted = originalPrice * (1 - discountValue / 100);
      return this.roundCurrency(Math.max(discounted, 0));
    } else if (discountType === 'fixed_amount') {
      return this.roundCurrency(Math.max(0, originalPrice - discountValue));
    }

    return this.roundCurrency(originalPrice);
  }

  getProductDiscountType(index: number): string {
    const product = this.productsArray.at(index);
    return product.get('discount_type')?.value || 'percentage';
  }

  setProductDiscountType(index: number, type: string): void {
    const globalDiscountType = this.offerForm.get('discount_type')?.value;
    const globalDiscountValue = Number(this.offerForm.get('discount_value')?.value || 0);

    // Enforce global discount type restriction
    if (globalDiscountType && type !== globalDiscountType) {
      alert(`Product discounts must match the global discount type: ${globalDiscountType}`);
      return;
    }

    const product = this.productsArray.at(index);
    product.get('discount_type')?.setValue(type);

    // Set the exact discount value and reset the other field
    if (type === 'percentage') {
      product.get('discount_amount')?.setValue(0);
      product.get('discount_percentage')?.setValue(globalDiscountValue);
    } else if (type === 'fixed_amount') {
      product.get('discount_percentage')?.setValue(0);
      product.get('discount_amount')?.setValue(globalDiscountValue);
    }

    // Validate to ensure exact match
    this.validateProductDiscountLimits(index);
  }

  getProductDiscountValue(index: number): number {
    const product = this.productsArray.at(index);
    const discountType = this.getProductDiscountType(index);
    
    if (discountType === 'percentage') {
      return product.get('discount_percentage')?.value || 0;
    } else {
      return product.get('discount_amount')?.value || 0;
    }
  }

  getTotalOriginalPrice(): number {
    return this.productsArray.controls.reduce((total, productControl) => {
      const price = productControl.get('price')?.value || 0;
      return total + price;
    }, 0);
  }

  getTotalDiscountedPrice(): number {
    const totalDiscounted = this.productsArray.controls.reduce((total, productControl) => {
      const price = Number(productControl.get('price')?.value || 0);
      const discountType = productControl.get('discount_type')?.value || 'percentage';
      const discountValue = discountType === 'percentage'
        ? Number(productControl.get('discount_percentage')?.value || 0)
        : Number(productControl.get('discount_amount')?.value || 0);
      const discountedPrice = this.calculateDiscountedPriceByType(price, discountValue, discountType);
      return total + discountedPrice;
    }, 0);

    return this.roundCurrency(totalDiscounted);
  }

  getFilteredProducts(): any[] {
    const selectedCategoryId = this.offerForm.get('category_id')?.value;

    let filteredProducts = this.allProducts;

    if (selectedCategoryId) {
      filteredProducts = this.allProducts.filter(product => product.category_id === selectedCategoryId);
    }

    return filteredProducts;
  }

  getExistingProductsNotInCategory(categoryId: string): any[] {
    const existingProducts = [];
    for (let i = 0; i < this.productsArray.length; i++) {
      const productControl = this.productsArray.at(i);
      const productId = productControl.get('id')?.value;
      if (productId) {
        const product = this.allProducts.find(p => p.id === productId);
        if (product && product.category_id !== categoryId) {
          existingProducts.push({ index: i, product });
        }
      }
    }
    return existingProducts;
  }

  removeProductsNotInCategory(categoryId: string): void {
    const productsToRemove = this.getExistingProductsNotInCategory(categoryId);
    // Remove from the end to avoid index shifting issues
    productsToRemove.reverse().forEach(({ index }) => {
      this.productsArray.removeAt(index);
    });
    this.applyGlobalDiscountToProducts();
  }

  getAlreadyAddedProductIds(): string[] {
    const addedIds: string[] = [];
    for (let i = 0; i < this.productsArray.length; i++) {
      const productId = this.productsArray.at(i).get('id')?.value;
      if (productId) {
        addedIds.push(productId);
      }
    }
    return addedIds;
  }

  isProductAlreadyAdded(productId: string): boolean {
    return this.getAlreadyAddedProductIds().includes(productId);
  }

  onApplyToCategoryChange(checked: boolean): void {
    if (checked && this.selectedCategory && this.categoryProducts.length > 0) {
      // Clear existing products first
      this.productsArray.clear();

      // Add all products from the category
      this.categoryProducts.forEach(product => {
        const productFormGroup = this.createProductFormGroup({
          ...product,
          category_name: product.category_name || this.selectedCategory.name
        });

        this.productsArray.push(productFormGroup);
      });

      this.applyGlobalDiscountToProducts();
    } else if (!checked) {
      // Clear all products when unchecking
      this.productsArray.clear();
      this.applyGlobalDiscountToProducts();
    }
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  validateProductDiscountLimits(index: number): void {
    const product = this.productsArray.at(index);
    const globalDiscountType = this.offerForm.get('discount_type')?.value;
    const globalDiscountValue = Number(this.offerForm.get('discount_value')?.value || 0);

    if (globalDiscountType === 'percentage') {
      // For percentage: product discount must exactly match global percentage
      const currentProductDiscount = Number(product.get('discount_percentage')?.value || 0);

      if (currentProductDiscount !== globalDiscountValue) {
        product.get('discount_percentage')?.setValue(globalDiscountValue);
        const message = this.translationService.translate('admin.offersForm.productDiscountMustMatch', { value: globalDiscountValue, type: '%' });
        alert(message);
      }
    } else if (globalDiscountType === 'fixed_amount') {
      // For fixed amount: product discount must exactly match global fixed amount
      const currentProductDiscount = Number(product.get('discount_amount')?.value || 0);

      if (currentProductDiscount !== globalDiscountValue) {
        product.get('discount_amount')?.setValue(globalDiscountValue);
        const message = this.translationService.translate('admin.offersForm.productDiscountMustMatch', { value: globalDiscountValue.toFixed(2), type: '€' });
        alert(message);
      }
    }
  }

  getTotalProductDiscountsExcludingIndex(excludeIndex: number, discountType: 'fixed_amount' | 'percentage'): number {
    let total = 0;
    for (let i = 0; i < this.productsArray.length; i++) {
      if (i !== excludeIndex) {
        const product = this.productsArray.at(i);
        if (discountType === 'fixed_amount') {
          total += Number(product.get('discount_amount')?.value || 0);
        } else {
          total += Number(product.get('discount_percentage')?.value || 0);
        }
      }
    }
    return total;
  }

  isDiscountTypeAllowed(type: 'percentage' | 'fixed_amount'): boolean {
    const globalDiscountType = this.offerForm.get('discount_type')?.value;
    return !globalDiscountType || globalDiscountType === type;
  }

  // Disable manual input for discount fields when global discount is set
  isDiscountInputDisabled(): boolean {
    const globalDiscountType = this.offerForm.get('discount_type')?.value;
    const globalDiscountValue = Number(this.offerForm.get('discount_value')?.value || 0);
    return !!(globalDiscountType && globalDiscountValue > 0);
  }
} 
