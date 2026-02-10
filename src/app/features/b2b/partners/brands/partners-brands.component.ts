import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-partners-brands',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './partners-brands.component.html',
  styleUrls: ['./partners-brands.component.scss']
})
export class PartnersBrandsComponent {
  brands = [
    {
      name: 'FRONIUS',
      descriptionKey: 'b2b.products.premiumInverterSolutions',
      image: 'assets/images/fronius.jpeg'
    },
    {
      name: 'GOODWE',
      descriptionKey: 'b2b.products.reliableSolarTechnology',
      image: 'assets/images/goodwe.jpeg'
    },
    {
      name: 'HUAWEI',
      descriptionKey: 'b2b.products.smartEnergySolutions',
      image: 'assets/images/huawei.jpeg'
    }
  ];
}
