import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { HighlightOffer } from '../../../../shared/models/highlight-offer.model';

@Component({
  selector: 'app-partners-highlights',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './partners-highlights.component.html',
  styleUrls: ['./partners-highlights.component.scss'],
})
export class PartnersHighlightsComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  highlights: HighlightOffer[] = [];

  async ngOnInit() {
    await this.loadB2BOffers();
  }

  private async loadB2BOffers() {
    try {
      // Try to load B2B offers from database using the dedicated method
      const offers = await this.supabase.getB2BOffers({ limit: 4 });

      console.log('B2B Offers loaded:', offers); // Debug log

      if (offers && offers.length > 0) {
        this.highlights = offers.map((offer: any) => {
          const originalPrice = offer.original_price || 0;
          const discountPercentage = offer.discount_value || 0;
          let discountedPrice = offer.discounted_price || 0;

          // Calculate discounted price for percentage-only offers if not provided
          if (
            discountedPrice === 0 &&
            discountPercentage > 0 &&
            originalPrice > 0
          ) {
            discountedPrice = originalPrice * (1 - discountPercentage / 100);
          }

          return {
            id: offer.id,
            title: offer.title,
            description: offer.description || '',
            shortDescription:
              offer.short_description || offer.description || '',
            imageUrl:
              offer.image_url ||
              'assets/images/placeholders/solar-panels-1.jpg',
            originalPrice: originalPrice,
            discountedPrice: discountedPrice,
            discountPercentage: discountPercentage,
            type: offer.type || 'general',
            status: offer.status || 'active',
            featured: offer.featured || false,
            isB2B: offer.is_b2b || false,
            endDate: offer.end_date,
          };
        });

        console.log('Mapped highlights:', this.highlights); // Debug log
      } else {
        console.warn('No B2B offers found in database.');
        // Let's try to create a sample offer to test the component
        this.highlights = [
          {
            id: 'sample-1',
            title: 'Premium Inverter Bundle - Limited Time',
            description:
              'High-efficiency inverter package with smart monitoring system. Perfect for commercial installations requiring maximum reliability.',
            shortDescription: 'Premium inverter with smart monitoring',
            imageUrl: 'assets/images/placeholders/solar-energy-landscape.jpg',
            originalPrice: 8500,
            discountedPrice: 6800,
            discountPercentage: 20,
            type: 'bundle_deal',
            status: 'active',
            featured: true,
            isB2B: true,
            endDate: '2024-12-25',
          },
        ];
      }
    } catch (error) {
      console.error('Error loading B2B offers from database:', error);
      console.warn(
        'Using fallback sample data. Please ensure the offers table exists and the migration has been run.',
      );

      // Fallback sample data
      this.highlights = [
        {
          id: 'sample-1',
          title: 'Premium Inverter Bundle - Limited Time',
          description:
            'High-efficiency inverter package with smart monitoring system. Perfect for commercial installations requiring maximum reliability.',
          shortDescription: 'Premium inverter with smart monitoring',
          imageUrl: 'assets/images/placeholders/solar-energy-landscape.jpg',
          originalPrice: 8500,
          discountedPrice: 6800,
          discountPercentage: 20,
          type: 'bundle_deal',
          status: 'active',
          featured: true,
          isB2B: true,
          endDate: '2024-12-25',
        },
      ];
    }
  }

  navigateToOffer(offerId: string): void {
    this.router.navigate(['/partneri/ponude', offerId]);
  }

  isOfferEndingSoon(endDate: string): boolean {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilEnd = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilEnd <= 7 && daysUntilEnd > 0;
  }
}
