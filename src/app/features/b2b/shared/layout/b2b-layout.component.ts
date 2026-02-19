import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { B2bNavbarComponent } from '../navbar/b2b-navbar.component';
import { PartnersFooterComponent } from '../footer/partners-footer.component';
import { B2BCartSidebarComponent } from '../../cart/components/b2b-cart-sidebar/b2b-cart-sidebar.component';

@Component({
  selector: 'app-b2b-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    B2bNavbarComponent,
    PartnersFooterComponent,
    B2BCartSidebarComponent,
  ],
  templateUrl: './b2b-layout.component.html',
  styleUrls: ['./b2b-layout.component.scss'],
})
export class B2bLayoutComponent {}
