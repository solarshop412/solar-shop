import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';
import { SupabaseService } from '../../../../services/supabase.service';
import { selectCurrentUser } from '../../../../core/auth/store/auth.selectors';
import { selectB2BCartTotalItems } from '../../cart/store/b2b-cart.selectors';
import * as B2BCartActions from '../../cart/store/b2b-cart.actions';
import { Subject, takeUntil, switchMap, from, catchError, of } from 'rxjs';
import { LucideAngularModule, ShoppingCart } from 'lucide-angular';

@Component({
  selector: 'app-b2b-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, LucideAngularModule],
  templateUrl: './b2b-navbar.component.html',
  styleUrls: ['./b2b-navbar.component.scss'],
})
export class B2bNavbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private supabaseService = inject(SupabaseService);
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  showMobileMenu = false;
  showUserMenu = false;
  isAuthenticated = false;
  currentUser: any = null;
  isCompanyContact = false; // Flag to check if user is a company contact person
  company: any = null;

  currentUser$: Observable<any>;
  cartItemsCount$: Observable<number>;

  // Lucide Icons
  readonly ShoppingCartIcon = ShoppingCart;

  constructor() {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.cartItemsCount$ = this.store.select(selectB2BCartTotalItems);
  }

  ngOnInit(): void {
    // Initialize authentication state and user data
    this.supabaseService
      .getCurrentUser()
      .pipe(
        takeUntil(this.destroy$),
        switchMap((user) => {
          this.isAuthenticated = !!user;
          this.currentUser = user;

          if (user?.id) {
            // Check if user is a company contact person
            return from(
              this.supabaseService.client
                .from('companies')
                .select('id, status')
                .eq('contact_person_id', user.id)
                .single(),
            ).pipe(catchError(() => of({ data: null, error: null })));
          }
          return of({ data: null, error: null });
        }),
      )
      .subscribe(({ data }) => {
        this.isCompanyContact = !!data && data.status === 'approved';
        this.company = data;

        // Load cart items if user is company contact
        if (this.isCompanyContact && this.company) {
          this.store.dispatch(
            B2BCartActions.loadB2BCart({ companyId: this.company.id }),
          );
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    this.showUserMenu = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showMobileMenu = false;
  }

  signOut(): void {
    this.supabaseService.signOut().then(() => {
      this.showUserMenu = false;
      this.isAuthenticated = false;
      this.isCompanyContact = false;
      this.currentUser = null;
      this.router.navigate(['/partneri']);
    });
  }

  toggleCart(): void {
    this.store.dispatch(B2BCartActions.toggleB2BCartSidebar());
  }

  // Close dropdowns when clicking outside
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showUserMenu = false;
    }
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }
}
