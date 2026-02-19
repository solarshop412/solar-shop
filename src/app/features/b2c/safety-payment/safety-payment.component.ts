import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-safety-payment',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './safety-payment.component.html',
  styleUrls: ['./safety-payment.component.scss'],
})
export class SafetyPaymentComponent {}
