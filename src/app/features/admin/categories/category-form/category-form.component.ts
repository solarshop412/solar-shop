import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';

interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormComponent, TranslatePipe],
  template: `
    <app-admin-form
      [title]="isEditMode ? translationService.translate('admin.categoriesForm.updateCategory') : translationService.translate('admin.categoriesForm.createCategory')"
      [subtitle]="isEditMode ? translationService.translate('admin.categoriesForm.updateCategoryInformation') : translationService.translate('admin.categoriesForm.addNewCategoryToStore')"
      [form]="categoryForm"
      [isEditMode]="isEditMode"
      [isSubmitting]="isSubmitting"
      [backRoute]="'/admin/categories'"
      (formSubmit)="onSubmit($event)"
    >
      <div [formGroup]="categoryForm" class="space-y-8">
        <!-- Category Basic Info -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            {{ 'admin.basicInformation' | translate }}
          </h3>

          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
            <input
              type="text"
              id="name"
              formControlName="name"
              (input)="onNameChange($event)"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Category Name"
              >
              <label for="name" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.common.name' | translate }} *
              </label>
              <div *ngIf="categoryForm.get('name')?.invalid && categoryForm.get('name')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              {{ 'admin.common.nameRequired' | translate }}
            </div>
          </div>

            <div class="relative">
            <input
              type="text"
              id="slug"
              formControlName="slug"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="URL Slug"
              >
              <label for="slug" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.common.slug' | translate }} *
              </label>
              <div *ngIf="categoryForm.get('slug')?.invalid && categoryForm.get('slug')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              {{ 'admin.common.slugRequired' | translate }}
            </div>
          </div>

          <div class="relative">
            <select
              id="parent_id"
              formControlName="parent_id"
              class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200"
            >
              <option [value]="null">{{ 'admin.categoriesForm.selectParentCategory' | translate }}</option>
              <option *ngFor="let category of getAvailableParentCategories()" [value]="category.id">
                {{ category.name }}
              </option>
            </select>
            <label for="parent_id" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
              {{ 'admin.categoriesForm.parentCategory' | translate }}
            </label>
          </div>
        </div>

          <div class="mt-6">
            <div class="relative">
          <textarea
            id="description"
            formControlName="description"
            rows="3"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none"
                placeholder="Category Description"
          ></textarea>
              <label for="description" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.common.description' | translate }}
              </label>
            </div>
          </div>
        </div>

        <!-- Media & Settings -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {{ 'admin.categoriesForm.mediaAndConfiguration' | translate }}
          </h3>

          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Image Upload -->
            <div class="lg:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'admin.common.categoryImage' | translate }}</label>

              <!-- Current Image Preview -->
              <div *ngIf="currentImageUrl" class="mb-4">
                <div class="relative inline-block">
                  <img
                    [src]="currentImageUrl"
                    alt="Category image"
                    class="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                    (error)="onImageError($event)"
                  >
                  <button
                    type="button"
                    (click)="removeImage()"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Upload Area -->
              <div
                class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                (click)="fileInput.click()"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)"
                [class.border-blue-400]="isDragOver"
                [class.bg-blue-50]="isDragOver"
              >
                <input
                  #fileInput
                  type="file"
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  class="hidden"
                >

                <div *ngIf="!isUploading">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <p class="mt-2 text-sm text-gray-600">
                    <span class="font-medium text-blue-600 hover:text-blue-500">{{ 'admin.common.clickToUpload' | translate }}</span>
                    {{ 'admin.common.orDragAndDrop' | translate }}
                  </p>
                  <p class="mt-1 text-xs text-gray-500">PNG, JPG, WEBP {{ 'admin.common.upTo' | translate }} 5MB</p>
                </div>

                <div *ngIf="isUploading" class="flex flex-col items-center">
                  <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p class="mt-2 text-sm text-gray-600">{{ 'admin.common.uploading' | translate }}...</p>
                </div>
              </div>

              <!-- Upload Error -->
              <div *ngIf="uploadError" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ uploadError }}
              </div>
            </div>

            <div class="relative">
            <input
              type="number"
              id="sort_order"
              formControlName="sort_order"
              min="0"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
              placeholder="0"
            >
              <label for="sort_order" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'admin.common.sortOrder' | translate }}
              </label>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ 'admin.common.status' | translate }}
          </h3>

          <label class="relative flex items-center p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors duration-200">
              <input
                id="is_active"
                type="checkbox"
                formControlName="is_active"
              class="sr-only"
            >
            <span class="flex items-center">
              <span class="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded mr-3 transition-colors duration-200"
                    [class.bg-blue-600]="categoryForm.get('is_active')?.value"
                    [class.border-blue-600]="categoryForm.get('is_active')?.value">
                <svg *ngIf="categoryForm.get('is_active')?.value" class="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </span>
              <div>
                <span class="text-sm font-medium text-gray-700">{{ 'admin.common.active' | translate }}</span>
                <p class="text-sm text-gray-500">{{ 'admin.categoriesForm.enableCategory' | translate }}</p>
            </div>
            </span>
          </label>
        </div>
      </div>
    </app-admin-form>
  `
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);
  translationService = inject(TranslationService);

  categoryForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  categoryId: string | null = null;
  availableCategories: Category[] = [];

  // Image upload properties
  currentImageUrl: string | null = null;
  isUploading = false;
  isDragOver = false;
  uploadError: string | null = null;

  private readonly BUCKET_NAME = 'solar-shop';
  private readonly CATEGORY_IMAGES_PATH = 'categories';

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadAvailableCategories();
    this.checkEditMode();
  }

  private initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      slug: ['', [Validators.required]],
      description: [''],
      image_url: [''],
      sort_order: [0, [Validators.min(0)]],
      is_active: [true],
      parent_id: [null]
    });
  }

  private checkEditMode(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    if (this.categoryId) {
      this.isEditMode = true;
      this.loadCategory();
    }
    // Set title after determining edit mode
    this.title.setTitle(this.isEditMode ? 'Edit Category - Solar Shop Admin' : 'Create Category - Solar Shop Admin');
  }

  private async loadCategory(): Promise<void> {
    if (!this.categoryId) return;

    try {
      const data = await this.supabaseService.getTableById('categories', this.categoryId);
      if (data) {
        this.categoryForm.patchValue(data);
        // Set current image URL if exists
        if (data.image_url) {
          this.currentImageUrl = data.image_url;
        }
      }
    } catch (error) {
      console.error('Error loading category:', error);
    }
  }

  onNameChange(event: any): void {
    const name = event.target.value;
    const slug = this.generateSlug(name);
    this.categoryForm.patchValue({ slug });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Image upload methods
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadImage(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.uploadImage(event.dataTransfer.files[0]);
    }
  }

  private async uploadImage(file: File): Promise<void> {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.uploadError = 'Invalid file type. Please upload a JPG, PNG, WEBP, or GIF image.';
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.uploadError = 'File is too large. Maximum size is 5MB.';
      return;
    }

    this.isUploading = true;
    this.uploadError = null;

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${this.CATEGORY_IMAGES_PATH}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await this.supabaseService.client.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabaseService.client.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      // Update form and preview
      this.currentImageUrl = publicUrl;
      this.categoryForm.patchValue({ image_url: publicUrl });

      console.log('Image uploaded successfully:', publicUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      this.uploadError = error.message || 'Failed to upload image. Please try again.';
    } finally {
      this.isUploading = false;
    }
  }

  removeImage(): void {
    this.currentImageUrl = null;
    this.categoryForm.patchValue({ image_url: '' });
    this.uploadError = null;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/product-placeholder.svg';
  }

  async onSubmit(formValue: any): Promise<void> {
    if (this.categoryForm.invalid) return;

    this.isSubmitting = true;

    try {
      const categoryData = {
        ...formValue,
        updated_at: new Date().toISOString()
      };

      if (this.isEditMode && this.categoryId) {
        await this.supabaseService.updateRecord('categories', this.categoryId, categoryData);
      } else {
        categoryData.created_at = new Date().toISOString();
        await this.supabaseService.createRecord('categories', categoryData);
      }

      // Navigate back to categories list
      this.router.navigate(['/admin/categories']);
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private async loadAvailableCategories(): Promise<void> {
    try {
      const categories = await this.supabaseService.getTable('categories');
      this.availableCategories = categories || [];
    } catch (error) {
      console.error('Error loading categories:', error);
      this.availableCategories = [];
    }
  }

  getAvailableParentCategories(): Category[] {
    if (this.isEditMode && this.categoryId) {
      return this.availableCategories.filter(cat => cat.id !== this.categoryId);
    }
    return this.availableCategories;
  }
}
