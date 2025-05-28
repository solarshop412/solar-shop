import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { NavbarActions } from './store/navbar.actions';
import { selectIsMobileMenuOpen, selectCurrentLanguage } from './store/navbar.selectors';
import { selectIsAuthenticated, selectCurrentUser, selectUserAvatar } from '../../../core/auth/store/auth.selectors';
import { RouterModule, Router } from '@angular/router';
import { CartButtonComponent } from '../cart/components/cart-button/cart-button.component';
import * as AuthActions from '../../../core/auth/store/auth.actions';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, CartButtonComponent],
  template: `
    <!-- Top Info Bar (Desktop) -->
    <div class="hidden lg:block bg-heyhome-dark-green text-white text-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-2">
          <!-- Contact Info -->
          <div class="flex items-center space-x-6">
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              <span>+39 3456493134</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <span>info&#64;heyhome.it</span>
            </div>
          </div>
          
          <!-- Language Selector -->
          <div class="flex items-center space-x-1 cursor-pointer" (click)="toggleLanguage()">
            <div class="flex items-center space-x-2" *ngIf="(currentLanguage$ | async) === 'en'">
              <span>English (US)</span>
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="flex items-center space-x-2" *ngIf="(currentLanguage$ | async) === 'it'">
              <div class="flex items-center space-x-1">
                <div class="w-4 h-3 flex">
                  <div class="w-1/3 h-full bg-green-600"></div>
                  <div class="w-1/3 h-full bg-white"></div>
                  <div class="w-1/3 h-full bg-red-600"></div>
                </div>
                <span>Italiano</span>
              </div>
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Top Info Bar -->
    <div class="lg:hidden bg-heyhome-medium-green text-white text-sm">
      <div class="px-5 py-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-5">
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              <span>+39 3456493134</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <span>info&#64;heyhome.it</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation -->
    <nav class="bg-white shadow-sm sticky top-0 z-50 transition-all duration-300 ease-in-out"
         [ngClass]="{
           'shadow-lg': isScrolled,
           'backdrop-blur-sm': isScrolled,
           'bg-white/95': isScrolled
         }">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16 lg:h-20">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <a routerLink="/" class="cursor-pointer">
              <img src="assets/images/logo.png" alt="SolarShop" class="h-8 lg:h-10 w-auto hover:opacity-80 transition-opacity">
            </a>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center space-x-8">
            <div class="flex items-center space-x-1 cursor-pointer hover:text-green-600 transition-colors">
              <span class="text-gray-900 font-medium">Products</span>
              <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </div>
            <a routerLink="/offers" class="text-gray-900 hover:text-green-600 font-medium transition-colors">Offers & Promotions</a>
            <a routerLink="/mission" class="text-gray-900 hover:text-green-600 font-medium transition-colors">Sustainability</a>
            <a routerLink="/blog" class="text-gray-900 hover:text-green-600 font-medium transition-colors">Blog & Guides</a>
            <a routerLink="/company" class="text-gray-900 hover:text-green-600 font-medium transition-colors">Company</a>
            <a routerLink="/contact" class="text-gray-900 hover:text-green-600 font-medium transition-colors">Contacts & Support</a>
          </div>

          <!-- Desktop Icons -->
          <div class="hidden lg:flex items-center space-x-5">
            <button class="p-2 text-gray-600 hover:text-green-600 transition-colors">
              <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
            
            <!-- Authentication Icon -->
            <div class="relative">
              <!-- Login Icon (when not authenticated) -->
              <button 
                *ngIf="!(isAuthenticated$ | async)"
                (click)="navigateToLogin()"
                class="p-2 text-gray-600 hover:text-green-600 transition-colors"
                title="Sign In">
                <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
              </button>

              <!-- Profile Icon (when authenticated) -->
              <div *ngIf="isAuthenticated$ | async" class="relative">
                <button 
                  (click)="toggleProfileMenu()"
                  class="p-2 text-gray-600 hover:text-green-600 transition-colors flex items-center space-x-2"
                  title="Profile">
                  <!-- User Avatar or Default Profile Icon -->
                  <div *ngIf="(userAvatar$ | async); else defaultProfileIcon" class="w-8 h-8 rounded-full overflow-hidden">
                    <img [src]="userAvatar$ | async" [alt]="(currentUser$ | async)?.firstName" class="w-full h-full object-cover">
                  </div>
                  <ng-template #defaultProfileIcon>
                    <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </ng-template>
                </button>

                <!-- Profile Dropdown Menu -->
                <div 
                  *ngIf="showProfileMenu"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div class="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <div class="font-medium">{{ (currentUser$ | async)?.firstName }} {{ (currentUser$ | async)?.lastName }}</div>
                    <div class="text-gray-500">{{ (currentUser$ | async)?.email }}</div>
                  </div>
                  <a 
                    routerLink="/profile" 
                    (click)="closeProfileMenu()"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      <span>Profile</span>
                    </div>
                  </a>
                  <button 
                    (click)="logout()"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            <app-cart-button></app-cart-button>
          </div>

          <!-- Mobile Menu Button and Icons -->
          <div class="lg:hidden flex items-center space-x-5">
            <button class="p-2 text-gray-600 hover:text-green-600 transition-colors">
              <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
            
            <!-- Mobile Authentication Icon -->
            <button 
              *ngIf="!(isAuthenticated$ | async)"
              (click)="navigateToLogin()"
              class="p-2 text-gray-600 hover:text-green-600 transition-colors">
              <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
            </button>
            
            <button 
              *ngIf="isAuthenticated$ | async"
              (click)="navigateToProfile()"
              class="p-2 text-gray-600 hover:text-green-600 transition-colors">
              <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>
            
            <app-cart-button></app-cart-button>
            <button 
              class="p-2 text-gray-600 hover:text-green-600 transition-colors"
              (click)="toggleMobileMenu()">
              <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div 
        class="lg:hidden bg-white border-t border-gray-200 transition-all duration-300 ease-in-out"
        [class.hidden]="!(isMobileMenuOpen$ | async)">
        <div class="px-4 py-4 space-y-4">
          <div class="flex items-center space-x-1 cursor-pointer hover:text-green-600 transition-colors">
            <span class="text-gray-900 font-medium">Products</span>
            <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>
          <a routerLink="/offers" class="block text-gray-900 hover:text-green-600 font-medium transition-colors">Offers & Promotions</a>
          <a routerLink="/mission" class="block text-gray-900 hover:text-green-600 font-medium transition-colors">Sustainability</a>
          <a routerLink="/blog" class="block text-gray-900 hover:text-green-600 font-medium transition-colors">Blog & Guides</a>
          <a routerLink="/company" class="block text-gray-900 hover:text-green-600 font-medium transition-colors">Company</a>
          <a routerLink="/contact" class="block text-gray-900 hover:text-green-600 font-medium transition-colors">Contacts & Support</a>
          
          <!-- Mobile Authentication Links -->
          <div class="border-t border-gray-200 pt-4 mt-4" *ngIf="isAuthenticated$ | async">
            <a routerLink="/profile" class="block text-gray-900 hover:text-green-600 font-medium transition-colors mb-2">Profile</a>
            <button (click)="logout()" class="block text-gray-900 hover:text-green-600 font-medium transition-colors">Sign Out</button>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);

  isMobileMenuOpen$: Observable<boolean>;
  currentLanguage$: Observable<string>;
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  userAvatar$: Observable<string | null>;
  isScrolled = false;
  showProfileMenu = false;

  constructor() {
    this.isMobileMenuOpen$ = this.store.select(selectIsMobileMenuOpen);
    this.currentLanguage$ = this.store.select(selectCurrentLanguage);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.userAvatar$ = this.store.select(selectUserAvatar);
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.isScrolled = window.pageYOffset > 10;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showProfileMenu = false;
    }
  }

  ngOnInit(): void {
    this.store.dispatch(NavbarActions.initializeNavbar());
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  toggleMobileMenu(): void {
    this.store.dispatch(NavbarActions.toggleMobileMenu());
  }

  toggleLanguage(): void {
    this.store.dispatch(NavbarActions.toggleLanguage());
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
    this.showProfileMenu = false;
    this.router.navigate(['/']);
  }
} 