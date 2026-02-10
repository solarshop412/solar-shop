import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormComponent, TranslatePipe],
  templateUrl: './blog-form.component.html',
  styleUrls: ['./blog-form.component.scss']
})
export class BlogFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);
  translationService = inject(TranslationService);
  blogForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  blogId: string | null = null;
  categories: any[] = [];

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.checkEditMode();
  }

  private initForm(): void {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required]],
      slug: ['', [Validators.required]],
      excerpt: ['', [Validators.required]],
      content: ['', [Validators.required]],
      featured_image_url: [''],
      category_id: [''],
      reading_time: [5],
      seo_title: [''],
      seo_description: [''],
      tags: [''],
      status: ['draft', [Validators.required]],
      published_at: [''],
      is_featured: [false]
    });
  }

  private async loadCategories(): Promise<void> {
    try {
      this.categories = await this.supabaseService.getCategories(false);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  private checkEditMode(): void {
    this.blogId = this.route.snapshot.paramMap.get('id');
    if (this.blogId) {
      this.isEditMode = true;
      this.loadBlogPost();
    }
    // Set title after determining edit mode
    this.title.setTitle(this.isEditMode ? 'Edit Blog Post - Solar Shop Admin' : 'Create Blog Post - Solar Shop Admin');
  }

  private async loadBlogPost(): Promise<void> {
    if (!this.blogId) return;

    try {
      const data = await this.supabaseService.getTableById('blog_posts', this.blogId);
      if (data) {
        const formData = {
          ...data,
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
          published_at: data.published_at ? this.formatDateTimeLocal(new Date(data.published_at)) : ''
        };
        this.blogForm.patchValue(formData);
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
    }
  }

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onTitleChange(event: any): void {
    const title = event.target.value;
    const slug = this.generateSlug(title);
    this.blogForm.patchValue({ slug });

    // Auto-fill meta title if empty
    if (!this.blogForm.get('seo_title')?.value) {
      this.blogForm.patchValue({ seo_title: title });
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async onSubmit(formValue: any): Promise<void> {
    if (this.blogForm.invalid) return;

    this.isSubmitting = true;

    try {
      const blogData = {
        ...formValue,
        tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [],
        published_at: formValue.published_at ? new Date(formValue.published_at).toISOString() : null,
        updated_at: new Date().toISOString()
      };

      if (this.isEditMode && this.blogId) {
        await this.supabaseService.updateRecord('blog_posts', this.blogId, blogData);
      } else {
        blogData.created_at = new Date().toISOString();
        await this.supabaseService.createRecord('blog_posts', blogData);
      }

      this.router.navigate(['/admin/blog']);
    } catch (error) {
      console.error('Error saving blog post:', error);
    } finally {
      this.isSubmitting = false;
    }
  }
} 