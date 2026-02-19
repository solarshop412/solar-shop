import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PartnersHeroComponent } from './hero/partners-hero.component';
import { PartnersHighlightsComponent } from './highlights/partners-highlights.component';
import { PartnersCategoriesComponent } from './categories/partners-categories.component';
import { PartnersBrandsComponent } from './brands/partners-brands.component';
import { PartnersCtaComponent } from './cta/partners-cta.component';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PartnersHeroComponent,
    PartnersHighlightsComponent,
    PartnersCategoriesComponent,
    PartnersBrandsComponent,
    PartnersCtaComponent,
  ],
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss'],
})
export class PartnersComponent {}
