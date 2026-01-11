import { Injectable, Inject, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';

// Interfaces for SEO data
export interface OgTags {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
}

export interface TwitterTags {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  title: string;
  description: string;
  image?: string;
  site?: string;
}

export interface ProductSeoData {
  name: string;
  description: string;
  sku?: string;
  brand?: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'LimitedAvailability';
  images?: string[];
  url?: string;
  ratingValue?: number;
  reviewCount?: number;
  category?: string;
}

export interface BlogPostSeoData {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  url?: string;
  tags?: string[];
}

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

export interface OfferSeoData {
  name: string;
  description: string;
  image?: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  validFrom?: string;
  validThrough?: string;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private router = inject(Router);

  private readonly baseUrl = 'https://www.solarno.hr';
  private readonly siteName = 'Solarno.hr';
  private readonly defaultImage = 'https://www.solarno.hr/assets/images/og-image.jpg';
  private readonly logoUrl = 'https://www.solarno.hr/assets/images/logo.png';

  private readonly defaultTitle = 'SolarShop – Solarne Elektrane, Solarni Paneli, Hibridni Sustavi';
  private readonly defaultDescription = 'Solarne Elektrane, Solarni Paneli, Hibridni Sustavi i Baterije na Solarno.hr - Fronius, Huawei, GoodWe';

  constructor(@Inject(DOCUMENT) private doc: Document) {}

  // ============================================
  // Core Meta Tag Methods
  // ============================================

  /**
   * Set page title
   */
  setTitle(title: string): void {
    this.title.setTitle(title);
  }

  /**
   * Set meta description
   */
  setDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
  }

  /**
   * Set meta keywords
   */
  setKeywords(keywords: string[]): void {
    this.meta.updateTag({ name: 'keywords', content: keywords.join(', ') });
  }

  /**
   * Set canonical URL
   */
  setCanonicalUrl(url?: string): void {
    const canonicalUrl = url || `${this.baseUrl}${this.router.url}`;

    // Remove existing canonical link
    const existingCanonical = this.doc.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.setAttribute('href', canonicalUrl);
    } else {
      const link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', canonicalUrl);
      this.doc.head.appendChild(link);
    }
  }

  /**
   * Set robots meta tag
   */
  setRobots(content: string = 'index, follow'): void {
    this.meta.updateTag({ name: 'robots', content });
  }

  // ============================================
  // Open Graph Methods
  // ============================================

  /**
   * Set Open Graph tags
   */
  setOgTags(og: OgTags): void {
    this.meta.updateTag({ property: 'og:title', content: og.title });
    this.meta.updateTag({ property: 'og:description', content: og.description });
    this.meta.updateTag({ property: 'og:image', content: og.image || this.defaultImage });
    this.meta.updateTag({ property: 'og:url', content: og.url || `${this.baseUrl}${this.router.url}` });
    this.meta.updateTag({ property: 'og:type', content: og.type || 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: og.siteName || this.siteName });
    this.meta.updateTag({ property: 'og:locale', content: og.locale || 'hr_HR' });
  }

  // ============================================
  // Twitter Card Methods
  // ============================================

  /**
   * Set Twitter Card tags
   */
  setTwitterTags(twitter: TwitterTags): void {
    this.meta.updateTag({ name: 'twitter:card', content: twitter.card || 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: twitter.title });
    this.meta.updateTag({ name: 'twitter:description', content: twitter.description });
    this.meta.updateTag({ name: 'twitter:image', content: twitter.image || this.defaultImage });
    if (twitter.site) {
      this.meta.updateTag({ name: 'twitter:site', content: twitter.site });
    }
  }

  // ============================================
  // JSON-LD Schema Methods
  // ============================================

  /**
   * Set JSON-LD structured data
   */
  setJsonLd(schema: any, id: string = 'dynamic-schema'): void {
    this.removeJsonLd(id);

    const script = this.doc.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('id', id);
    script.textContent = JSON.stringify(schema);
    this.doc.head.appendChild(script);
  }

  /**
   * Remove JSON-LD structured data by ID
   */
  removeJsonLd(id: string = 'dynamic-schema'): void {
    const existingScript = this.doc.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }
  }

  /**
   * Remove all dynamic JSON-LD schemas
   */
  removeAllDynamicJsonLd(): void {
    this.removeJsonLd('product-schema');
    this.removeJsonLd('blog-schema');
    this.removeJsonLd('breadcrumb-schema');
    this.removeJsonLd('offer-schema');
    this.removeJsonLd('dynamic-schema');
  }

  // ============================================
  // Product Page SEO
  // ============================================

  /**
   * Set SEO for product detail page
   */
  setProductPage(product: ProductSeoData): void {
    const title = `${product.name} | ${this.siteName}`;
    const description = product.description?.substring(0, 160) || `Kupite ${product.name} na Solarno.hr`;
    const url = product.url || `${this.baseUrl}${this.router.url}`;
    const image = product.images?.[0] || this.defaultImage;

    // Set basic meta tags
    this.setTitle(title);
    this.setDescription(description);
    this.setCanonicalUrl(url);

    // Set OG tags
    this.setOgTags({
      title,
      description,
      image,
      url,
      type: 'product'
    });

    // Set Twitter tags
    this.setTwitterTags({
      title,
      description,
      image
    });

    // Set Product JSON-LD schema
    const productSchema = this.generateProductSchema(product, url);
    this.setJsonLd(productSchema, 'product-schema');
  }

  /**
   * Generate Product schema for JSON-LD
   */
  private generateProductSchema(product: ProductSeoData, url: string): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.name,
      'description': product.description,
      'image': product.images || [this.defaultImage],
      'url': url,
      'offers': {
        '@type': 'Offer',
        'url': url,
        'priceCurrency': product.currency || 'EUR',
        'price': product.price,
        'availability': `https://schema.org/${product.availability || 'InStock'}`,
        'seller': {
          '@type': 'Organization',
          'name': this.siteName
        }
      }
    };

    if (product.sku) {
      schema.sku = product.sku;
    }

    if (product.brand) {
      schema.brand = {
        '@type': 'Brand',
        'name': product.brand
      };
    }

    if (product.ratingValue && product.reviewCount) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        'ratingValue': product.ratingValue,
        'reviewCount': product.reviewCount,
        'bestRating': 5,
        'worstRating': 1
      };
    }

    if (product.category) {
      schema.category = product.category;
    }

    return schema;
  }

  // ============================================
  // Blog Post Page SEO
  // ============================================

  /**
   * Set SEO for blog post detail page
   */
  setBlogPostPage(post: BlogPostSeoData): void {
    const title = `${post.title} | Blog | ${this.siteName}`;
    const description = post.description?.substring(0, 160) || post.title;
    const url = post.url || `${this.baseUrl}${this.router.url}`;
    const image = post.image || this.defaultImage;

    // Set basic meta tags
    this.setTitle(title);
    this.setDescription(description);
    this.setCanonicalUrl(url);

    // Set OG tags
    this.setOgTags({
      title,
      description,
      image,
      url,
      type: 'article'
    });

    // Set Twitter tags
    this.setTwitterTags({
      title,
      description,
      image
    });

    // Set BlogPosting JSON-LD schema
    const blogSchema = this.generateBlogPostSchema(post, url);
    this.setJsonLd(blogSchema, 'blog-schema');
  }

  /**
   * Generate BlogPosting schema for JSON-LD
   */
  private generateBlogPostSchema(post: BlogPostSeoData, url: string): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': post.title,
      'description': post.description,
      'image': post.image || this.defaultImage,
      'datePublished': post.datePublished,
      'dateModified': post.dateModified || post.datePublished,
      'author': {
        '@type': 'Organization',
        'name': post.authorName || this.siteName
      },
      'publisher': {
        '@type': 'Organization',
        'name': this.siteName,
        'logo': {
          '@type': 'ImageObject',
          'url': this.logoUrl
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': url
      }
    };

    if (post.tags && post.tags.length > 0) {
      schema.keywords = post.tags.join(', ');
    }

    return schema;
  }

  // ============================================
  // Offer Page SEO
  // ============================================

  /**
   * Set SEO for offer detail page
   */
  setOfferPage(offer: OfferSeoData): void {
    const title = `${offer.name} | Ponude | ${this.siteName}`;
    const description = offer.description?.substring(0, 160) || `Pogledajte ponudu: ${offer.name}`;
    const url = offer.url || `${this.baseUrl}${this.router.url}`;
    const image = offer.image || this.defaultImage;

    // Set basic meta tags
    this.setTitle(title);
    this.setDescription(description);
    this.setCanonicalUrl(url);

    // Set OG tags
    this.setOgTags({
      title,
      description,
      image,
      url,
      type: 'product'
    });

    // Set Twitter tags
    this.setTwitterTags({
      title,
      description,
      image
    });

    // Set Offer JSON-LD schema
    const offerSchema = this.generateOfferSchema(offer, url);
    this.setJsonLd(offerSchema, 'offer-schema');
  }

  /**
   * Generate Offer schema for JSON-LD
   */
  private generateOfferSchema(offer: OfferSeoData, url: string): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Offer',
      'name': offer.name,
      'description': offer.description,
      'image': offer.image || this.defaultImage,
      'url': url,
      'priceCurrency': offer.currency || 'EUR',
      'price': offer.price,
      'seller': {
        '@type': 'Organization',
        'name': this.siteName
      }
    };

    if (offer.validFrom) {
      schema.validFrom = offer.validFrom;
    }

    if (offer.validThrough) {
      schema.validThrough = offer.validThrough;
    }

    return schema;
  }

  // ============================================
  // Breadcrumb Schema
  // ============================================

  /**
   * Set breadcrumb schema
   */
  setBreadcrumbs(items: BreadcrumbItem[]): void {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => {
        const listItem: any = {
          '@type': 'ListItem',
          'position': index + 1,
          'name': item.name
        };

        if (item.url) {
          listItem.item = item.url.startsWith('http') ? item.url : `${this.baseUrl}${item.url}`;
        }

        return listItem;
      })
    };

    this.setJsonLd(breadcrumbSchema, 'breadcrumb-schema');
  }

  // ============================================
  // Category/List Page SEO
  // ============================================

  /**
   * Set SEO for category/list pages
   */
  setCategoryPage(name: string, description?: string): void {
    const title = `${name} | ${this.siteName}`;
    const desc = description || `Pregledajte ${name} na Solarno.hr`;

    this.setTitle(title);
    this.setDescription(desc);
    this.setCanonicalUrl();

    this.setOgTags({
      title,
      description: desc,
      type: 'website'
    });

    this.setTwitterTags({
      title,
      description: desc
    });
  }

  // ============================================
  // Reset to Defaults
  // ============================================

  /**
   * Reset all SEO to default values (call on component destroy)
   */
  resetToDefaults(): void {
    this.setTitle(this.defaultTitle);
    this.setDescription(this.defaultDescription);
    this.setCanonicalUrl(this.baseUrl);

    this.setOgTags({
      title: this.defaultTitle,
      description: this.defaultDescription,
      url: this.baseUrl,
      type: 'website'
    });

    this.setTwitterTags({
      title: this.defaultTitle,
      description: this.defaultDescription
    });

    // Remove all dynamic schemas
    this.removeAllDynamicJsonLd();
  }
}
