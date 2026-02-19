import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ShopLocation } from '../../../shared/models/shop-location.model';
import { FAQItem } from '../../../shared/models/faq-item.model';
import { SHOP_LOCATIONS } from '../../../shared/data/shop-locations.data';
import { FAQS } from '../../../shared/data/faqs.data';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  messageSent = false;
  constructor(private sanitizer: DomSanitizer) {}

  locations: ShopLocation[] = SHOP_LOCATIONS;
  faqs: FAQItem[] = FAQS;

  toggleFaq(faqId: string): void {
    const faq = this.faqs.find((f) => f.id === faqId);
    if (faq) {
      faq.isOpen = !faq.isOpen;
    }
  }

  trackByFaqId(index: number, faq: FAQItem): string {
    return faq.id;
  }

  getMapEmbedUrl(location: ShopLocation): SafeResourceUrl {
    // Using OpenStreetMap with marker - zoom level 16 for good detail
    // The marker parameter ensures a red pin is displayed at the location
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.003}%2C${location.latitude - 0.003}%2C${location.longitude + 0.003}%2C${location.latitude + 0.003}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getMapLink(location: ShopLocation): string {
    return location.mapRedirect;
  }

  getPhoneHref(location: ShopLocation): string {
    return `tel:${location.phoneLink}`;
  }
}
