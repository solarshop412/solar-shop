import { Component, Input } from '@angular/core';
import { AnimationOptions, LottieComponent, provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { CommonModule } from '@angular/common';


export function playerFactory() {
  return player;
}

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule, LottieComponent],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  providers: [
    provideLottieOptions({
      player: () => player,
    }),
  ]
})
export class LoaderComponent {

  @Input() options: AnimationOptions;

  constructor() {
    this.options = {
      path: '/assets/loading.json',
    };
  }

}
