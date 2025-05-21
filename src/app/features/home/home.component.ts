import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-1/10 bg-main-bg text-main-fg flex items-center px-12 py-8 font-sans">
    <h1 class="text-left text-xl font-bold">Solar shop</h1>
</div>
<div class="w-full h-full bg-second-bg font-sans">

</div>
  `,
})
export class HomeComponent {

} 