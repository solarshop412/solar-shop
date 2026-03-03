import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-offer-details',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './offer-details.component.html',
  styleUrls: ['./offer-details.component.scss'],
})
export class OfferDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);

  offer: any = null;
  offerProducts: any[] = [];
  offerCategory: any = null;
  error: string | null = null;
  user: any = null;
  product: any = null;

  ngOnInit(): void {
    const offerId = this.route.snapshot.paramMap.get('id');
    if (offerId) {
      this.loadOfferDetails(offerId);
    } else {
      this.error = 'No offer ID provided';
    }
  }

  private async loadOfferDetails(offerId: string): Promise<void> {
    try {
      this.offer = await this.supabaseService.getTableById('products_inquiry', offerId);
      console.log("offer", this.offer);

      if (this.offer) {
        this.title.setTitle(
          `${this.offer.title} - Offer Details - Solar Shop Admin`,
        );
        
        this.user = await this.supabaseService.getTableByNameId('profiles', 'user_id', this.offer.user_id);
        this.product = await this.supabaseService.getTableById('products', this.offer.product_id);

        console.log("user", this.user);
        console.log("product", this.product);
      } else {
        this.error = 'Offer not found';
      }
    } catch (error) {
      console.error('Error loading offer:', error);
      this.error = 'Error loading offer details';
    }
  }

  private async loadOfferProducts(offerId: string): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('offer_products')
        .select(
          `
          *,
          products (
            id,
            name,
            sku,
            price,
            stock_quantity,
            category_id,
            categories (
              name
            )
          )
        `,
        )
        .eq('offer_id', offerId)
        .order('sort_order');

      if (error) throw error;

      if (data && data.length > 0) {
        const offerProducts = data.map((offerProduct: any) => {
          // Determine discount type based on which field has a value
          const discountType =
            offerProduct.discount_amount && offerProduct.discount_amount > 0
              ? 'fixed_amount'
              : 'percentage';

          return {
            id: offerProduct.products.id,
            name: offerProduct.products.name,
            sku: offerProduct.products.sku,
            category:
              offerProduct.products.categories?.name || 'Solar Equipment',
            price: offerProduct.products.price || 0,
            discount_percentage: offerProduct.discount_percentage || 0,
            discount_amount: offerProduct.discount_amount || 0,
            discount_type: discountType,
            stock_quantity: offerProduct.products.stock_quantity || 0,
            offer_product_id: offerProduct.id,
          };
        });

        this.offerProducts = offerProducts;
      } else {
        this.offerProducts = [];
      }
    } catch (error) {
      console.error('Error loading offer products:', error);
      this.offerProducts = [];
    }
  }

  calculateDiscountedPrice(
    originalPrice: number,
    discountPercentage: number,
  ): number {
    if (!discountPercentage) return originalPrice;
    return originalPrice * (1 - discountPercentage / 100);
  }

  calculateDiscountedPriceByType(
    originalPrice: number,
    discountType: string,
    discountPercentage: number,
    discountAmount: number,
  ): number {
    if (!discountType || discountType === 'percentage') {
      return this.calculateDiscountedPrice(
        originalPrice,
        discountPercentage || 0,
      );
    } else if (discountType === 'fixed_amount') {
      return Math.max(0, originalPrice - (discountAmount || 0));
    }
    return originalPrice;
  }

  getTotalOriginalPrice(): number {
    return this.offerProducts.reduce(
      (total, product) => total + product.price,
      0,
    );
  }

  getTotalDiscountedPrice(): number {
    return this.offerProducts.reduce((total, product) => {
      return (
        total +
        this.calculateDiscountedPriceByType(
          product.price,
          product.discount_type,
          product.discount_percentage,
          product.discount_amount,
        )
      );
    }, 0);
  }

  getTotalSavings(): number {
    return this.getTotalOriginalPrice() - this.getTotalDiscountedPrice();
  }

  editOffer(): void {
    this.router.navigate(['/admin/ponude/uredi', this.offer.id]);
  }

  goBack(): void {
    this.router.navigate(['/admin/ponude']);
  }

  private async loadOfferCategory(): Promise<void> {
    if (
      !this.offer?.applicable_category_ids ||
      this.offer.applicable_category_ids.length === 0
    ) {
      this.offerCategory = null;
      return;
    }

    try {
      const categoryId = this.offer.applicable_category_ids[0];
      const { data, error } = await this.supabaseService.client
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) throw error;
      this.offerCategory = data;
    } catch (error) {
      console.error('Error loading offer category:', error);
      this.offerCategory = null;
    }
  }
}
