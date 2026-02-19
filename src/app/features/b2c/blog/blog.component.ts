import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { BlogPost } from '../../../shared/models/blog.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../shared/services/translation.service';
import { SeoService } from '../../../shared/services/seo.service';
import { BlogActions } from './store/blog.actions';
import {
  selectBlogPosts,
  selectBlogIsLoading,
  selectBlogError,
  selectFilteredPosts,
  selectPostCategories,
  selectFilteredCategory,
} from './store/blog.selectors';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
})
export class BlogComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private store = inject(Store);
  private translationService = inject(TranslationService);
  private seoService = inject(SeoService);
  private destroy$ = new Subject<void>();

  // NgRx Observables
  blogPosts$: Observable<BlogPost[]>;
  filteredPosts$: Observable<BlogPost[]>;
  categories$: Observable<any[]>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  selectedCategory$: Observable<string | null>;

  constructor() {
    // Initialize observables from store
    this.blogPosts$ = this.store.select(selectBlogPosts);
    this.filteredPosts$ = this.store.select(selectFilteredPosts);
    this.categories$ = this.store.select(selectPostCategories);
    this.isLoading$ = this.store.select(selectBlogIsLoading);
    this.error$ = this.store.select(selectBlogError);
    this.selectedCategory$ = this.store.select(selectFilteredCategory);

    // Debug the selected category changes
    this.selectedCategory$.subscribe((category) => {
      console.log('Selected category changed to:', category);
    });
  }

  ngOnInit() {
    // Set SEO for blog list page
    this.seoService.setCategoryPage(
      'Blog',
      'Pročitajte najnovije vijesti i savjete o solarnim elektranama, energetskoj učinkovitosti i obnovljivim izvorima energije.',
    );

    this.loadBlogPosts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.seoService.resetToDefaults();
  }

  loadBlogPosts() {
    this.store.dispatch(BlogActions.loadBlogPosts());
  }

  filterByCategory(categoryId: string | null) {
    console.log('filterByCategory called with:', categoryId);
    this.store.dispatch(BlogActions.filterByCategory({ category: categoryId }));
  }

  searchPosts(query: string) {
    this.store.dispatch(BlogActions.searchPosts({ query }));
  }

  navigateToPost(postId: string) {
    this.store.dispatch(BlogActions.selectPost({ postId }));
    this.router.navigate(['/blog', postId]);
  }

  navigateToBlog() {
    // Already on blog page
  }

  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const currentLang = this.translationService.getCurrentLanguage();

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return dateObj.toLocaleDateString(
      currentLang === 'hr' ? 'hr-HR' : 'en-US',
      options,
    );
  }
}
