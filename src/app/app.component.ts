import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, } from '@angular/router';
import { CartSidebarComponent } from './features/b2c/cart/components/cart-sidebar/cart-sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, CartSidebarComponent]
})
export class AppComponent {
  title = 'solar-shop';
}
