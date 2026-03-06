import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from "../../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-videos-gallery-slider',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './videos-gallery-slider.component.html',
  styleUrl: './videos-gallery-slider.component.scss'
})
export class VideosGallerySliderComponent {
  currentSlide = 0;
  totalSlides = 2;

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
  }

  prevSlide() {
    this.currentSlide =
      (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }
}
