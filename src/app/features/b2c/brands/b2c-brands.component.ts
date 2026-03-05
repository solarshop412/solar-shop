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
      image: 'fronius-logo.webp',
    },
    {
      name: 'FUJI SOLAR',
      image: 'fuji.webp',
    },
    {
      name: 'GROWATT',
      image: 'growatt-logo.png',
    },
    {
      name: 'LONGI SOLAR',
      image: 'longi.webp'
    },
    {
      name: 'RISEN',
      image: 'risen.webp'
    },
    {
      name: 'SMA',
      image: 'sma-logo.webp'
    },
    {
      name: 'SOLIS',
      image: 'solis-logo.png'
    },
    {
      name: 'Tongwei',
      image: 'tongwei.webp'
    }, 
    {
      name: 'Trina Solar',
      image: 'trina-solar-logo.webp'
    }
  ];
}
