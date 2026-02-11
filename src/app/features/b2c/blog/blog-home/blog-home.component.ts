import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BlogPost } from '../../../../shared/models/blog.model';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';
import { BlogActions } from '../store/blog.actions';
import {
  selectBlogPosts,
  selectBlogIsLoading,
  selectBlogError,
  selectFeaturedPosts
} from '../store/blog.selectors';

@Component({
  selector: 'app-blog-home',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './blog-home.component.html',
  styleUrls: ['./blog-home.component.scss']
})
export class BlogHomeComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private store = inject(Store);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  // NgRx Observables
  blogPosts$: Observable<BlogPost[]>;
  featuredPosts$: Observable<BlogPost[]>;
  displayPosts$: Observable<BlogPost[]>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor() {
    // Initialize observables from store
    this.blogPosts$ = this.store.select(selectBlogPosts);
    this.featuredPosts$ = this.store.select(selectFeaturedPosts);
    this.isLoading$ = this.store.select(selectBlogIsLoading);
    this.error$ = this.store.select(selectBlogError);

    // Display posts: prioritize featured posts, then recent posts, limit to 6 total
    this.displayPosts$ = this.blogPosts$.pipe(
      map(posts => {
        if (!posts || posts.length === 0) return [];

        // Create a copy of the array before sorting to avoid mutating the original
        const sortedPosts = [...posts]
          .sort((a, b) => {
            // First, prioritize featured posts
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;

            // Then sort by updatedAt (most recent first)
            const aDate = new Date(a.updatedAt || a.publishedAt).getTime();
            const bDate = new Date(b.updatedAt || b.publishedAt).getTime();
            return bDate - aDate;
          });

        // Return up to 3 posts for the home page
        return sortedPosts.slice(0, 3);
      })
    );
  }

  ngOnInit() {
    this.loadBlogPosts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBlogPosts() {
    this.store.dispatch(BlogActions.loadBlogPosts());
  }

  navigateToPost(postId: string) {
    this.store.dispatch(BlogActions.selectPost({ postId }));
    this.router.navigate(['/blog', postId]);
  }

  navigateToBlog() {
    this.router.navigate(['/blog']);
  }

  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const currentLang = this.translationService.getCurrentLanguage();
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    return dateObj.toLocaleDateString(currentLang === 'hr' ? 'hr-HR' : 'en-US', options);
  }
} 