import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ProductsActions } from './store/products.actions';
import { selectProductCategories, selectIsLoading } from './store/products.selectors';

export interface ProductCategory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  backgroundGradient: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Products Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <h2 class="text-4xl lg:text-5xl font-bold text-heyhome-dark-green font-['Poppins'] mb-4">
            Products
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto font-['DM_Sans']">
            Discover our wide range of products for sustainable and energy-efficient construction
          </p>
        </div>

        <!-- Products Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            *ngFor="let category of productCategories$ | async; trackBy: trackByCategoryId"
            class="relative h-[500px] rounded-3xl overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
          >
            <!-- Background Image -->
            <div class="absolute inset-0">
              <img 
                [src]="category.imageUrl" 
                [alt]="category.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              >
              <!-- Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>

            <!-- Content -->
            <div class="relative z-10 h-full flex flex-col justify-end p-8">
              <div class="text-white">
                <h3 class="text-3xl font-bold mb-4 font-['Poppins'] group-hover:text-[#0ACF83] transition-colors duration-300">
                  {{ category.title }}
                </h3>
                
                <p class="text-base leading-relaxed mb-6 opacity-90 font-['DM_Sans'] line-clamp-3">
                  {{ category.description }}
                </p>
                
                <!-- Learn More Button -->
                <button class="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0ACF83] transition-all duration-300 group-hover:bg-[#0ACF83] border border-white/30">
                  <span>Learn More</span>
                  <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading$ | async" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-heyhome-primary border-t-transparent"></div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProductsComponent implements OnInit {
  private store = inject(Store);

  productCategories$: Observable<ProductCategory[]>;
  isLoading$: Observable<boolean>;

  constructor() {
    this.productCategories$ = this.store.select(selectProductCategories);
    this.isLoading$ = this.store.select(selectIsLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(ProductsActions.loadProductCategories());
  }

  trackByCategoryId(index: number, category: ProductCategory): string {
    return category.id;
  }
} 