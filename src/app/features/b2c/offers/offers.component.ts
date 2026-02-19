import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { OffersService } from './services/offers.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Offer } from '../../../shared/models/offer.model';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
})
export class OffersComponent implements OnInit {
  offers$: Observable<Offer[]>;
  isLoading = false;

  constructor(
    private router: Router,
    private offersService: OffersService,
  ) {
    this.offers$ = this.offersService.getFeaturedOffers(4);
  }

  ngOnInit(): void {
    this.loadOffers();
  }

  private loadOffers(): void {
    this.isLoading = true;
    this.offers$ = this.offersService.getFeaturedOffers(4);

    // Subscribe to handle loading state
    this.offers$.subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading offers:', error);
        this.isLoading = false;
      },
    });
  }

  trackByOfferId(index: number, offer: Offer): string {
    return offer.id;
  }

  navigateToOffers() {
    this.router.navigate(['/ponude']);
  }

  navigateToOfferDetails(offerId: string) {
    this.router.navigate(['/ponude', offerId]);
  }
}
