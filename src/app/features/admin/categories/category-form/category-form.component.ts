import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';
import { Category } from '../../../../shared/models/category.model';


@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormComponent, TranslatePipe],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
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
