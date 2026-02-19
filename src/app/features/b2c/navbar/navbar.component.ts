import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { NavbarActions } from './store/navbar.actions';
import {
  selectIsMobileMenuOpen,
  selectCurrentLanguage,
} from './store/navbar.selectors';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectUserAvatar,
  selectIsAdmin,
} from '../../../core/auth/store/auth.selectors';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CartButtonComponent } from '../cart/components/cart-button/cart-button.component';
import * as AuthActions from '../../../core/auth/store/auth.actions';
import { User } from '../../../shared/models/user.model';
import { filter, take } from 'rxjs/operators';
import { TranslationService } from '../../../shared/services/translation.service';
import {
  SearchSuggestionsService,
  SearchSuggestion,
} from '../../../shared/services/search-suggestions.service';
import { AdminNotificationsService } from '../../admin/shared/services/admin-notifications.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Search,
  User as UserIcon,
  CircleUserRound,
  Mail,
  Phone,
  Clock,
  TrendingUp,
  Tag,
} from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CartButtonComponent,
    TranslatePipe,
    FormsModule,
    LucideAngularModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private searchSuggestionsService = inject(SearchSuggestionsService);
  private adminNotificationsService = inject(AdminNotificationsService);
  private destroy$ = new Subject<void>();

  isMobileMenuOpen$: Observable<boolean>;
  currentLanguage$: Observable<string>;
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  userAvatar$: Observable<string | null>;
  isAdmin$: Observable<boolean>;
  showProfileMenu = false;
  showSearchOverlay = false;
  searchQuery = '';
  currentRoute = '';

  // Search suggestions
  recentSuggestions: SearchSuggestion[] = [];
  popularSuggestions: SearchSuggestion[] = [];
  defaultSuggestions: SearchSuggestion[] = [];
  displaySuggestions: SearchSuggestion[] = [];

  // Lucide Icons
  readonly SearchIcon = Search;
  readonly UserIcon = UserIcon;
  readonly RoundUserIcon = CircleUserRound;
  readonly PhoneIcon = Phone;
  readonly MailIcon = Mail;
  readonly ClockIcon = Clock;
  readonly TrendingUpIcon = TrendingUp;
  readonly TagIcon = Tag;

  constructor() {
    this.isMobileMenuOpen$ = this.store.select(selectIsMobileMenuOpen);
    this.currentLanguage$ = this.store.select(selectCurrentLanguage);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.userAvatar$ = this.store.select(selectUserAvatar);
    this.isAdmin$ = this.store.select(selectIsAdmin);

    // Track route changes for active highlighting
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });

    // Update search suggestions when language changes
    this.currentLanguage$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateSearchSuggestions();
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showProfileMenu = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.showSearchOverlay) {
      this.cancelSearch();
    }
  }

  ngOnInit(): void {
    this.store.dispatch(NavbarActions.initializeNavbar());
    this.updateSearchSuggestions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMobileMenu(): void {
    this.store.dispatch(NavbarActions.toggleMobileMenu());
  }

  toggleLanguage(): void {
    this.store.dispatch(NavbarActions.toggleLanguage());
  }

  navigateToLogin(): void {
    this.router.navigate(['/prijava']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profil']);
  }

  navigateToAdmin(): void {
    this.adminNotificationsService.refreshCounts();
    this.router.navigate(['/admin']);
    this.closeProfileMenu();
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }

  closeMobileMenu(): void {
    this.store.dispatch(NavbarActions.toggleMobileMenu());
  }

  openSearchOverlay(): void {
    this.showSearchOverlay = true;

    // Refresh search suggestions when overlay opens
    this.updateSearchSuggestions();

    // Close mobile menu if it's open - use take(1) to get current value only
    this.isMobileMenuOpen$
      .pipe(
        take(1),
        filter(Boolean), // Only proceed if menu is open
      )
      .subscribe(() => {
        this.closeMobileMenu();
      });
    // Don't reset searchQuery here to preserve any existing value
    // Focus the input after a short delay to ensure it's rendered
    setTimeout(() => {
      const searchInput = document.querySelector(
        'input[name="searchQuery"]',
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        // Select all text if there's a value to allow easy replacement
        if (this.searchQuery) {
          searchInput.select();
        }
      }
    }, 100);
  }

  closeSearchOverlay(): void {
    this.showSearchOverlay = false;
    // Don't automatically clear search query when closing overlay
  }

  cancelSearch(): void {
    this.searchQuery = '';
    this.closeSearchOverlay();
  }

  clearSearch(): void {
    this.searchQuery = '';
    const searchInput = document.querySelector(
      'input[name="searchQuery"]',
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }

  selectSearchSuggestion(suggestion: string, suggestionType?: string): void {
    // If this is a category suggestion, navigate with category filter instead of search
    if (suggestionType === 'category') {
      this.closeSearchOverlay();
      this.router.navigate(['/proizvodi'], {
        queryParams: { categories: suggestion },
        state: { fromNavbar: true, clearFilters: true },
      });
    } else {
      // Regular search suggestion
      this.searchQuery = suggestion;
      this.performSearch();
    }
  }

  performSearch(): void {
    if (this.searchQuery && this.searchQuery.trim()) {
      const trimmedQuery = this.searchQuery.trim();

      // Save the search to suggestions
      this.searchSuggestionsService.addSearchSuggestion('search', trimmedQuery);

      // Update suggestions immediately
      this.updateSearchSuggestions();

      this.closeSearchOverlay();
      this.router.navigate(['/proizvodi'], {
        queryParams: { search: trimmedQuery },
        state: { fromNavbar: true, clearFilters: true },
      });
    }
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
    this.showProfileMenu = false;
    this.router.navigate(['/']);
  }

  isRouteActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  async updateSearchSuggestions(): Promise<void> {
    // Get suggestions from database and localStorage
    try {
      this.recentSuggestions =
        await this.searchSuggestionsService.getRecentSuggestions(4);
      this.popularSuggestions =
        await this.searchSuggestionsService.getPopularSuggestions(4);
      this.defaultSuggestions =
        this.searchSuggestionsService.getDefaultCategorySuggestions();

      // Combine all suggestions for display logic
      this.displaySuggestions = [
        ...this.recentSuggestions,
        ...this.popularSuggestions,
        ...this.defaultSuggestions,
      ];

      // Clean up old suggestions periodically
      this.searchSuggestionsService.clearOldSuggestions();
    } catch (error) {
      console.error('Error loading search suggestions:', error);
      // Fallback to default suggestions only
      this.defaultSuggestions =
        this.searchSuggestionsService.getDefaultCategorySuggestions();
      this.displaySuggestions = [...this.defaultSuggestions];
    }
  }
}
