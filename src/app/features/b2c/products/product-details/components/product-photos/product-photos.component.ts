import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../product-list/product-list.component';
import { TranslatePipe } from '../../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-product-photos',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './product-photos.component.html',
  styleUrls: ['./product-photos.component.scss']
})
export class ProductPhotosComponent implements OnInit, OnDestroy {
  @Input() product!: Product;

  selectedImage: string = '';
  productImages: string[] = [];
  isZoomOpen: boolean = false;

  ngOnInit(): void {
    // Get images from product data
    this.extractProductImages();
    this.selectedImage = this.productImages[0];
  }

  private extractProductImages(): void {
    // Check if product has images array (new format)
    if (this.product.images && Array.isArray(this.product.images)) {
      this.productImages = this.product.images.map((img: any) => {
        // Handle both object format {url: string} and string format
        return typeof img === 'string' ? img : img.url || img;
      }).filter(url => url); // Filter out empty urls
    } 
    // Fallback to single imageUrl (legacy format)
    else if (this.product.imageUrl) {
      this.productImages = [this.product.imageUrl];
    } 
    // Default placeholder if no images
    else {
      this.productImages = ['assets/images/product-placeholder.svg'];
    }
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  getCurrentImageIndex(): number {
    return this.productImages.indexOf(this.selectedImage);
  }

  openZoom(): void {
    this.isZoomOpen = true;
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeZoom(): void {
    this.isZoomOpen = false;
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }

  nextImage(): void {
    const currentIndex = this.getCurrentImageIndex();
    const nextIndex = (currentIndex + 1) % this.productImages.length;
    this.selectedImage = this.productImages[nextIndex];
  }

  previousImage(): void {
    const currentIndex = this.getCurrentImageIndex();
    const prevIndex = currentIndex === 0 ? this.productImages.length - 1 : currentIndex - 1;
    this.selectedImage = this.productImages[prevIndex];
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!this.isZoomOpen) return;

    switch (event.key) {
      case 'Escape':
        this.closeZoom();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.previousImage();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextImage();
        break;
    }
  }

  ngOnDestroy(): void {
    // Ensure body scroll is restored if component is destroyed while zoom is open
    if (this.isZoomOpen) {
      document.body.style.overflow = 'auto';
    }
  }
} 