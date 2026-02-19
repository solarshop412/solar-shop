import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  CategoriesService,
  ProductCategory,
} from './services/categories.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  productCategories$!: Observable<ProductCategory[]>;
  isLoading = false;

  private router = inject(Router);
  private categoriesService = inject(CategoriesService);

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.productCategories$ = this.categoriesService.getNestedCategories();

    // Subscribe to handle loading state
    this.productCategories$.subscribe({
      next: (categories) => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoading = false;
      },
    });
  }

  trackByCategoryId(index: number, category: ProductCategory): string {
    return category.id;
  }

  navigateToProductList(category: ProductCategory): void {
    // Navigate to product list with category filter
    // Use slug first, then fallback to name (URL-friendly)
    const categoryParam =
      category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Build category filter array - include parent and all subcategories
    let categoryNames: string[] = [category.name];

    // If this category has subcategories, include them all for comprehensive filtering
    if (category.subcategories && category.subcategories.length > 0) {
      const subCategoryNames = category.subcategories.map((sub) => sub.name);
      categoryNames = categoryNames.concat(subCategoryNames);
    }

    this.router.navigate(['/proizvodi'], {
      queryParams: {
        category: categoryParam,
        categories: categoryNames.join(','), // Pass parent + subcategories
      },
    });
  }

  navigateToContact(): void {
    this.router.navigate(['/kontakt']);
  }
}
