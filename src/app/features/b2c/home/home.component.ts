import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../hero/hero.component';
import { ProductsComponent } from '../products/products.component';
import { SustainabilityComponent } from '../sustainability/sustainability.component';
import { BlogHomeComponent } from '../blog/blog-home.component';
import { SeoService } from '../../../shared/services/seo.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroComponent, SustainabilityComponent, ProductsComponent, BlogHomeComponent],
  template: `
    <app-hero></app-hero>
    <app-products></app-products>
    <app-blog-home></app-blog-home>
    <app-sustainability></app-sustainability>
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    // Set homepage SEO - using defaults from the service
    this.seoService.resetToDefaults();
    this.seoService.setCanonicalUrl('https://www.solarno.hr');
  }

  ngOnDestroy(): void {
    this.seoService.removeAllDynamicJsonLd();
  }
} 