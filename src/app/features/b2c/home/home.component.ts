import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { HeroComponent } from '../hero/hero.component';
import { OffersComponent } from '../offers/offers.component';
import { ProductsComponent } from '../products/products.component';
import { SustainabilityComponent } from '../sustainability/sustainability.component';
import { BlogComponent } from '../blog/blog.component';
import { FooterComponent } from '../footer/footer.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroComponent, OffersComponent, SustainabilityComponent, ProductsComponent, BlogComponent],
  template: `
    <app-hero></app-hero>
    <app-offers></app-offers>
    <app-sustainability></app-sustainability>
    <app-products></app-products>
    <app-blog></app-blog>
  `,
})
export class HomeComponent {
} 