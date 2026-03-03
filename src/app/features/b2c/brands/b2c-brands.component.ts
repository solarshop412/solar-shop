import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-b2c-brands',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './b2c-brands.component.html',
  styleUrls: ['./b2c-brands.component.scss'],
})
export class B2cBrandsComponent {
  brands = [
    {
      name: 'FRONIUS',
      descriptionKey: 'b2b.products.premiumInverterSolutions',
      image: 'assets/images/fronius.jpeg',
    },
    {
      name: 'GOODWE',
      descriptionKey: 'b2b.products.reliableSolarTechnology',
      image: 'assets/images/goodwe.jpeg',
    },
    {
      name: 'HUAWEI',
      descriptionKey: 'b2b.products.smartEnergySolutions',
      image: 'assets/images/huawei.jpeg',
    },
  ];
}
