import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss'],
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  orderNumber: string = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.orderNumber = params['orderNumber'] || '';
    });
  }

  goToHome(): void {
    this.router.navigate(['/proizvodi']);
  }

  goToProfile(): void {
    this.router.navigate(['/profil']);
  }
}
