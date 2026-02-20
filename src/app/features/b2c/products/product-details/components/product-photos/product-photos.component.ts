import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  HostListener,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../product-list/product-list.component';
import { TranslatePipe } from '../../../../../../shared/pipes/translate.pipe';
import { ImagePlaceholders } from '../../../../../../core/data/image-placeholders.data';

@Component({
  selector: 'app-product-photos',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './product-photos.component.html',
  styleUrls: ['./product-photos.component.scss'],
})
export class ProductPhotosComponent implements OnInit, OnDestroy, OnChanges {
  @Input() product!: Product;

  selectedImage: string = '';
  productImages: string[] = [];
  isZoomOpen: boolean = false;
  isImageAvailable = true;

  ngOnInit(): void {
    this.resetForProduct();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.resetForProduct();
    }
  }

  private resetForProduct(): void {
    // close modal if switching products
    if (this.isZoomOpen) {
      this.isZoomOpen = false;
      document.body.style.overflow = 'auto';
    }

    this.isImageAvailable = true;

    this.extractProductImages();
    this.selectedImage = this.productImages[0] ?? this.placeholderImage;
  }

  private extractProductImages(): void {
    if (this.product?.images && Array.isArray(this.product.images)) {
      this.productImages = this.product.images
        .map((img: any) => (typeof img === 'string' ? img : img?.url ?? img))
        .filter((url: string) => !!url);
    } else if (this.product?.imageUrl) {
      this.productImages = [this.product.imageUrl];
    } else {
      this.productImages = [this.placeholderImage || 'assets/images/product-placeholder.webp'];
    }
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  getCurrentImageIndex(): number {
    return this.productImages.indexOf(this.selectedImage);
  }

  openZoom(): void {
    if(this.isImageAvailable) {
      this.isZoomOpen = true;

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }    
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
    const prevIndex =
      currentIndex === 0 ? this.productImages.length - 1 : currentIndex - 1;
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

  get placeholderImage(): string {
    const placeholder = ImagePlaceholders.find(p => p.id === 'product');

    return placeholder?.url || 'assets/images/product-placeholder.webp';
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.placeholderImage;

    this.isImageAvailable = false;
  }
}
