import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { NavbarActions } from './store/navbar.actions';
import { selectIsMobileMenuOpen, selectCurrentLanguage } from './store/navbar.selectors';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
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
            <img src="assets/images/logo.png" alt="HeyHome" class="h-8 lg:h-10 w-auto">
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center space-x-8">
            <div class="flex items-center space-x-1 cursor-pointer hover:text-heyhome-primary transition-colors">
              <span class="text-gray-900 font-medium">Products</span>
              <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </div>
            <a class="text-gray-900 hover:text-[#0ACF83] font-medium transition-colors" href="/offers">Offers & Promotions</a>
            <a class="text-gray-900 hover:text-[#0ACF83] font-medium transition-colors" href="/mission">Sustainability</a>
            <a class="text-gray-900 hover:text-[#0ACF83] font-medium transition-colors uppercase" href="/blog">Blog & Guides</a>
            <a class="text-gray-900 hover:text-[#0ACF83] font-medium transition-colors" href="/company">Company</a>
            <a class="text-gray-900 hover:text-[#0ACF83] font-medium transition-colors">Contacts & Support</a>
          </div>

          <!-- Desktop Icons -->
          <div class="hidden lg:flex items-center space-x-5">
            <button class="p-2 text-gray-600 hover:text-[#0ACF83] transition-colors">
              <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
            <button class="p-2 text-gray-600 hover:text-[#0ACF83] transition-colors">
              <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>
            <button class="p-2 text-gray-600 hover:text-[#0ACF83] transition-colors relative">
              <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"/>
              </svg>
            </button>
          </div>

          <!-- Mobile Menu Button and Icons -->
          <div class="lg:hidden flex items-center space-x-5">
            <button class="p-2 text-gray-600 hover:text-[#0ACF83] transition-colors">
              <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
            <button class="p-2 text-gray-600 hover:text-[#0ACF83] transition-colors">
              <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>
            <button class="p-2 text-gray-600 hover:text-[#0ACF83] transition-colors relative">
              <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"/>
              </svg>
            </button>
            <button 
              class="p-2 text-gray-600 hover:text-[#0ACF83] transition-colors"
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
          <div class="flex items-center space-x-1 cursor-pointer hover:text-[#0ACF83] transition-colors">
            <span class="text-gray-900 font-medium">Products</span>
            <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>
          <a href="/offers" class="block text-gray-900 hover:text-[#0ACF83] font-medium transition-colors">Offers & Promotions</a>
          <a href="/mission" class="block text-gray-900 hover:text-[#0ACF83] font-medium transition-colors">Sustainability</a>
          <a href="/blog" class="block text-gray-900 hover:text-[#0ACF83] font-medium transition-colors uppercase">Blog & Guides</a>
          <a href="/company" class="block text-gray-900 hover:text-[#0ACF83] font-medium transition-colors">Company</a>
          <a href="#" class="block text-gray-900 hover:text-[#0ACF83] font-medium transition-colors">Contacts & Support</a>
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

  isMobileMenuOpen$: Observable<boolean>;
  currentLanguage$: Observable<string>;
  isScrolled = false;

  constructor() {
    this.isMobileMenuOpen$ = this.store.select(selectIsMobileMenuOpen);
    this.currentLanguage$ = this.store.select(selectCurrentLanguage);
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.isScrolled = window.pageYOffset > 10;
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
} 