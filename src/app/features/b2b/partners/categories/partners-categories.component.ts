import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CategoriesService, ProductCategory } from '../../../b2c/products/services/categories.service';
import { CategoryItem } from '../../../../shared/models/category-item.model';


@Component({
  selector: 'app-partners-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './partners-categories.component.html',
  styleUrls: ['./partners-categories.component.scss']
})
export class PartnersCategoriesComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private categoriesService = inject(CategoriesService);

  categories: CategoryItem[] = [];
  nestedCategories: ProductCategory[] = [];

  // Sample categories data with icons
  private sampleCategories: CategoryItem[] = [
    {
      id: '1',
      name: 'Solar Panels',
      slug: 'solar-panels',
      imageUrl: '',
      icon: 'solar-panel',
      productCount: 24
    },
    {
      id: '2',
      name: 'Inverters',
      slug: 'inverters',
      imageUrl: '',
      icon: 'inverter',
      productCount: 12
    },
    {
      id: '3',
      name: 'Batteries',
      slug: 'batteries',
      imageUrl: '',
      icon: 'battery',
      productCount: 8
    },
    {
      id: '4',
      name: 'Mounting Systems',
      slug: 'mounting',
      imageUrl: '',
      icon: 'mounting',
      productCount: 15
    },
    {
      id: '5',
      name: 'Monitoring',
      slug: 'accessories',
      imageUrl: '',
      icon: 'monitoring',
      productCount: 6
    },
    {
      id: '6',
      name: 'Cables & Wiring',
      slug: 'cables',
      imageUrl: '',
      icon: 'cables',
      productCount: 18
    },
    {
      id: '7',
      name: 'Tools & Equipment',
      slug: 'tools',
      imageUrl: '',
      icon: 'tools',
      productCount: 9
    },
    {
      id: '8',
      name: 'Safety Equipment',
      slug: 'safety',
      imageUrl: '',
      icon: 'safety',
      productCount: 7
    }
  ];

  private sanitizer = inject(DomSanitizer);

  ngOnInit() {
    // Use CategoriesService to load nested categories for consistency
    this.categoriesService.getNestedCategories().subscribe(nestedCategories => {
      if (nestedCategories && nestedCategories.length > 0) {
        // Store the nested categories for later reference
        this.nestedCategories = nestedCategories;
        
        // Map ProductCategory to CategoryItem interface
        this.categories = nestedCategories
          .slice(0, 8)
          .map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug || this.createSlug(cat.name),
            imageUrl: cat.imageUrl || '',
            icon: this.getIconForCategory(cat.name),
            productCount: cat.productCount || 0 // Use the already calculated count from CategoriesService
          }));
      } else {
        // Fallback to sample data if no categories available
        this.categories = this.sampleCategories.slice(0, 8);
      }
    });
  }

  navigateToProducts(categorySlug: string): void {
    // Find the category to check if it has subcategories
    const category = this.categories.find(cat => cat.slug === categorySlug);
    if (!category) {
      // Navigate to products page with category filter applied
      this.router.navigate(['/partneri/proizvodi'], {
        queryParams: { category: categorySlug }
      });
      return;
    }

    // Build category filter array - include parent and all subcategories from nested categories
    let categoryNames: string[] = [category.name];
    
    // Find the corresponding nested category to get subcategories
    const nestedCategory = this.nestedCategories.find((nc: ProductCategory) => nc.name === category.name);
    if (nestedCategory && nestedCategory.subcategories && nestedCategory.subcategories.length > 0) {
      const subCategoryNames = nestedCategory.subcategories.map((sub: ProductCategory) => sub.name);
      categoryNames = categoryNames.concat(subCategoryNames);
    }

    // Navigate to products page with category filter applied
    this.router.navigate(['/partneri/proizvodi'], {
      queryParams: { 
        category: categorySlug,
        categories: categoryNames.join(',') // Pass parent + subcategories
      }
    });
  }

  getCategoryIcon(iconType: string): SafeHtml {
    const icons: { [key: string]: string } = {
      'solar-panel': `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="2" stroke-width="2"/>
          <rect x="4" y="4" width="4" height="4" rx="0.5" fill="currentColor"/>
          <rect x="10" y="4" width="4" height="4" rx="0.5" fill="currentColor"/>
          <rect x="16" y="4" width="4" height="4" rx="0.5" fill="currentColor"/>
          <rect x="4" y="10" width="4" height="4" rx="0.5" fill="currentColor"/>
          <rect x="10" y="10" width="4" height="4" rx="0.5" fill="currentColor"/>
          <rect x="16" y="10" width="4" height="4" rx="0.5" fill="currentColor"/>
          <rect x="4" y="16" width="4" height="4" rx="0.5" fill="currentColor"/>
          <rect x="10" y="16" width="4" height="4" rx="0.5" fill="currentColor"/>
          <rect x="16" y="16" width="4" height="4" rx="0.5" fill="currentColor"/>
        </svg>
      `,
      'inverter': `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke-width="2"/>
          <circle cx="7" cy="9" r="1" fill="currentColor"/>
          <circle cx="7" cy="15" r="1" fill="currentColor"/>
          <rect x="11" y="8" width="8" height="2" rx="1" fill="currentColor"/>
          <rect x="11" y="14" width="6" height="2" rx="1" fill="currentColor"/>
          <path d="M9 12l2-2v4l-2-2z" stroke-width="2"/>
        </svg>
      `,
      'battery': `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="7" width="12" height="10" rx="2" stroke-width="2"/>
          <path d="M17 9v6" stroke-width="2"/>
          <path d="M7 10v4" stroke-width="2"/>
          <path d="M10 10v4" stroke-width="2"/>
        </svg>
      `,
      'mounting': `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M3 21h18" stroke-width="2"/>
          <path d="M5 21V7l5-4 5 4v14" stroke-width="2"/>
          <path d="M9 9h6" stroke-width="2"/>
          <path d="M9 12h6" stroke-width="2"/>
          <path d="M9 15h6" stroke-width="2"/>
        </svg>
      `,
      'monitoring': `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke-width="2"/>
          <path d="M8 21h8" stroke-width="2"/>
          <path d="M12 17v4" stroke-width="2"/>
          <path d="M7 8l3 3 3-3 3 3" stroke-width="2"/>
        </svg>
      `,
      'cables': `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 6h16" stroke-width="2"/>
          <path d="M4 10h16" stroke-width="2"/>
          <path d="M4 14h16" stroke-width="2"/>
          <path d="M4 18h16" stroke-width="2"/>
          <circle cx="6" cy="8" r="1" fill="currentColor"/>
          <circle cx="6" cy="12" r="1" fill="currentColor"/>
          <circle cx="6" cy="16" r="1" fill="currentColor"/>
          <circle cx="18" cy="8" r="1" fill="currentColor"/>
          <circle cx="18" cy="12" r="1" fill="currentColor"/>
          <circle cx="18" cy="16" r="1" fill="currentColor"/>
        </svg>
      `,
      'tools': `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke-width="2"/>
        </svg>
      `,
      'safety': `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-width="2"/>
          <path d="M9 12l2 2 4-4" stroke-width="2"/>
        </svg>
      `
    };

    const iconSvg = icons[iconType] || icons['solar-panel'];
    return this.sanitizer.bypassSecurityTrustHtml(iconSvg);
  }

  private createSlug(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }


  private getIconForCategory(categoryName: string): string {
    const name = categoryName.toLowerCase();
    if (name.includes('solar') || name.includes('panel')) return 'solar-panel';
    if (name.includes('inverter')) return 'inverter';
    if (name.includes('battery') || name.includes('storage')) return 'battery';
    if (name.includes('mount') || name.includes('rack')) return 'mounting';
    if (name.includes('monitor') || name.includes('accessory')) return 'monitoring';
    if (name.includes('cable') || name.includes('wire')) return 'cables';
    if (name.includes('tool') || name.includes('equipment')) return 'tools';
    if (name.includes('safety') || name.includes('protection')) return 'safety';
    return 'solar-panel';
  }
}
