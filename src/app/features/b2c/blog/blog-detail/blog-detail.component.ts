import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, catchError, finalize, of, takeUntil, from } from 'rxjs';
import { BlogPost } from '../../../../shared/models/blog.model';
import { SupabaseService } from '../../../../services/supabase.service';
import {
  BlogDataMapperService,
  SupabaseBlogPost,
} from '../../../../services/blog-data-mapper.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';
import { SeoService } from '../../../../shared/services/seo.service';
import { ImagePlaceholders } from '../../../../core/data/image-placeholders.data';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss'],
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private blogMapper = inject(BlogDataMapperService);
  private translationService = inject(TranslationService);
  private seoService = inject(SeoService);
  private destroy$ = new Subject<void>();

  blogPost: BlogPost | null = null;
  relatedPosts: BlogPost[] = [];
  postId: string | null = null;
  loading = true;
  error: string | null = null;
  imageVisible = true;

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.postId = params.get('id');
      if (this.postId) {
        this.loadBlogPost(this.postId);
        // Scroll to top when navigating to a new blog post
        window.scrollTo(0, 0);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.seoService.resetToDefaults();
  }

  private loadBlogPost(id: string) {
    this.loading = true;
    this.error = null;

    from(this.supabaseService.getBlogPostById(id))
      .pipe(
        catchError((error: any) => {
          console.error('Error loading blog post:', error);
          this.error = 'Article not found or could not be loaded.';
          return of(null);
        }),
        finalize(() => (this.loading = false)),
        takeUntil(this.destroy$),
      )
      .subscribe((data: any) => {
        if (data) {
          this.blogPost = this.blogMapper.mapSupabaseToBlogPost(
            data as SupabaseBlogPost,
          );
          this.loadRelatedPosts(this.blogPost.category.id, this.blogPost.id);

          // Set SEO for blog post
          this.setBlogPostSeo(this.blogPost);

          // Increment view count
          from(this.supabaseService.incrementBlogPostViews(id)).subscribe({
            error: (error: any) =>
              console.warn('Failed to increment view count:', error),
          });
        }
      });
  }

  private loadRelatedPosts(categoryId: string, excludeId: string) {
    from(this.supabaseService.getRelatedBlogPosts(categoryId, excludeId, 3))
      .pipe(
        catchError((error: any) => {
          console.error('Error loading related posts:', error);
          return of([]);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((data: any[]) => {
        this.relatedPosts = this.blogMapper.mapSupabaseToBlogPosts(
          data as SupabaseBlogPost[],
        );
      });
  }

  navigateToPost(postId: string) {
    this.router.navigate(['/blog', postId]);
  }

  formatDate(date: string | Date, format: 'full' | 'short' = 'full'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const currentLang = this.translationService.getCurrentLanguage();

    const options: Intl.DateTimeFormatOptions =
      format === 'short'
        ? { month: 'short', day: 'numeric' }
        : { year: 'numeric', month: 'short', day: 'numeric' };

    return dateObj.toLocaleDateString(
      currentLang === 'hr' ? 'hr-HR' : 'en-US',
      options,
    );
  }

  get placeholderImage(): string {
    const placeholder = ImagePlaceholders.find(p => p.id === 'news');

    return placeholder?.url || '';
  }

  onImageError(event: Event): void {
    this.imageVisible = false;
  }

  /**
   * Set SEO tags for the blog post page
   */
  private setBlogPostSeo(post: BlogPost): void {
    // Set blog post page SEO
    this.seoService.setBlogPostPage({
      title: post.title,
      description: post.excerpt || post.title,
      image: post.imageUrl,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || undefined,
      tags: post.tags?.map((tag) => tag.name),
    });

    // Set breadcrumbs schema
    this.seoService.setBreadcrumbs([
      { name: 'Početna', url: '/' },
      { name: 'Blog', url: '/blog' },
      { name: post.title },
    ]);
  }
}
