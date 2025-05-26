import { Injectable } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { Cart, CartItem } from '../../../../shared/models/cart.model';
import { Coupon } from '../../../../shared/models/coupon.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly CART_STORAGE_KEY = 'solar_shop_cart';

    constructor() { }

    // Cart CRUD operations
    loadCart(): Observable<Cart | null> {
        // In a real app, this would make an HTTP request
        // For now, we'll use localStorage for persistence
        const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
        if (savedCart) {
            try {
                const cart = JSON.parse(savedCart);
                return of(cart).pipe(delay(500)); // Simulate network delay
            } catch (error) {
                console.error('Error parsing saved cart:', error);
                localStorage.removeItem(this.CART_STORAGE_KEY);
            }
        }
        return of(null).pipe(delay(500));
    }

    saveCart(cart: Cart): Observable<Cart> {
        // Save to localStorage and simulate API call
        localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
        return of(cart).pipe(delay(300));
    }

    clearCart(): Observable<void> {
        localStorage.removeItem(this.CART_STORAGE_KEY);
        return of(void 0).pipe(delay(300));
    }

    // Cart item operations
    addToCart(productId: string, quantity: number, variantId?: string): Observable<Cart> {
        return new Observable(observer => {
            this.loadCart().subscribe(existingCart => {
                const cart = existingCart || this.createEmptyCart();

                // Check if item already exists
                const existingItemIndex = cart.items.findIndex(
                    item => item.productId === productId && item.variantId === variantId
                );

                if (existingItemIndex >= 0) {
                    // Update existing item quantity
                    cart.items[existingItemIndex].quantity += quantity;
                    cart.items[existingItemIndex].updatedAt = new Date().toISOString();
                } else {
                    // Add new item
                    const newItem = this.createCartItem(productId, quantity, variantId);
                    cart.items.push(newItem);
                }

                // Recalculate totals
                this.recalculateCartTotals(cart);
                cart.updatedAt = new Date().toISOString();

                this.saveCart(cart).subscribe(savedCart => {
                    observer.next(savedCart);
                    observer.complete();
                });
            });
        });
    }

    updateCartItem(itemId: string, quantity: number): Observable<Cart> {
        return new Observable(observer => {
            this.loadCart().subscribe(cart => {
                if (!cart) {
                    observer.error('Cart not found');
                    return;
                }

                const itemIndex = cart.items.findIndex(item => item.id === itemId);
                if (itemIndex === -1) {
                    observer.error('Item not found in cart');
                    return;
                }

                if (quantity <= 0) {
                    // Remove item if quantity is 0 or less
                    cart.items.splice(itemIndex, 1);
                } else {
                    // Update quantity
                    cart.items[itemIndex].quantity = quantity;
                    cart.items[itemIndex].updatedAt = new Date().toISOString();
                }

                this.recalculateCartTotals(cart);
                cart.updatedAt = new Date().toISOString();

                this.saveCart(cart).subscribe(savedCart => {
                    observer.next(savedCart);
                    observer.complete();
                });
            });
        });
    }

    removeFromCart(itemId: string): Observable<Cart> {
        return new Observable(observer => {
            this.loadCart().subscribe(cart => {
                if (!cart) {
                    observer.error('Cart not found');
                    return;
                }

                const itemIndex = cart.items.findIndex(item => item.id === itemId);
                if (itemIndex === -1) {
                    observer.error('Item not found in cart');
                    return;
                }

                cart.items.splice(itemIndex, 1);
                this.recalculateCartTotals(cart);
                cart.updatedAt = new Date().toISOString();

                this.saveCart(cart).subscribe(savedCart => {
                    observer.next(savedCart);
                    observer.complete();
                });
            });
        });
    }

    // Coupon operations
    applyCoupon(code: string): Observable<Cart> {
        return new Observable(observer => {
            this.loadCart().subscribe(cart => {
                if (!cart) {
                    observer.error('Cart not found');
                    return;
                }

                // Simulate coupon validation
                this.validateCoupon(code, cart).subscribe({
                    next: (coupon) => {
                        // Check if coupon is already applied
                        const alreadyApplied = cart.appliedCoupons.some(c => c.code === code);
                        if (alreadyApplied) {
                            observer.error('Coupon already applied');
                            return;
                        }

                        // Apply coupon - only use supported types
                        const supportedTypes = ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'] as const;
                        const appliedCouponType = supportedTypes.includes(coupon.type as any)
                            ? coupon.type as 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y'
                            : 'percentage'; // fallback

                        const appliedCoupon = {
                            id: coupon.id,
                            code: coupon.code,
                            type: appliedCouponType,
                            value: coupon.value,
                            discountAmount: this.calculateCouponDiscount(coupon, cart),
                            appliedAt: new Date().toISOString(),
                            expiresAt: coupon.validUntil
                        };

                        cart.appliedCoupons.push(appliedCoupon);
                        this.recalculateCartTotals(cart);
                        cart.updatedAt = new Date().toISOString();

                        this.saveCart(cart).subscribe(savedCart => {
                            observer.next(savedCart);
                            observer.complete();
                        });
                    },
                    error: (error) => observer.error(error)
                });
            });
        });
    }

    removeCoupon(couponId: string): Observable<Cart> {
        return new Observable(observer => {
            this.loadCart().subscribe(cart => {
                if (!cart) {
                    observer.error('Cart not found');
                    return;
                }

                const couponIndex = cart.appliedCoupons.findIndex(c => c.id === couponId);
                if (couponIndex === -1) {
                    observer.error('Coupon not found');
                    return;
                }

                cart.appliedCoupons.splice(couponIndex, 1);
                this.recalculateCartTotals(cart);
                cart.updatedAt = new Date().toISOString();

                this.saveCart(cart).subscribe(savedCart => {
                    observer.next(savedCart);
                    observer.complete();
                });
            });
        });
    }

    loadAvailableCoupons(): Observable<Coupon[]> {
        // Mock available coupons
        const mockCoupons: Coupon[] = [
            {
                id: '1',
                code: 'SAVE10',
                name: '10% Off',
                description: 'Get 10% off your order',
                type: 'percentage',
                value: 10,
                currency: 'EUR',
                minimumOrderAmount: 50,
                usageCount: 0,
                isActive: true,
                isPublic: true,
                validFrom: '2024-01-01T00:00:00Z',
                validUntil: '2024-12-31T23:59:59Z',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z'
            },
            {
                id: '2',
                code: 'FREESHIP',
                name: 'Free Shipping',
                description: 'Free shipping on orders over €75',
                type: 'free_shipping',
                value: 0,
                currency: 'EUR',
                minimumOrderAmount: 75,
                usageCount: 0,
                isActive: true,
                isPublic: true,
                validFrom: '2024-01-01T00:00:00Z',
                validUntil: '2024-12-31T23:59:59Z',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z'
            }
        ];

        return of(mockCoupons).pipe(delay(500));
    }

    // Private helper methods
    private createEmptyCart(): Cart {
        const now = new Date().toISOString();
        return {
            id: this.generateId(),
            sessionId: this.generateSessionId(),
            items: [],
            subtotal: 0,
            tax: 0,
            shipping: 0,
            discount: 0,
            total: 0,
            currency: 'EUR',
            appliedCoupons: [],
            status: 'active',
            createdAt: now,
            updatedAt: now
        };
    }

    private createCartItem(productId: string, quantity: number, variantId?: string): CartItem {
        // In a real app, you'd fetch product details from a service
        const mockProduct = this.getMockProduct(productId);
        const now = new Date().toISOString();

        return {
            id: this.generateId(),
            productId,
            variantId,
            name: mockProduct.name,
            description: mockProduct.description,
            sku: mockProduct.sku,
            price: mockProduct.price,
            originalPrice: mockProduct.originalPrice,
            quantity,
            minQuantity: 1,
            maxQuantity: 10,
            image: mockProduct.image,
            category: mockProduct.category,
            brand: mockProduct.brand,
            addedAt: now,
            updatedAt: now,
            availability: {
                inStock: true,
                quantity: 100,
                stockStatus: 'in_stock',
                backorderAllowed: false
            },
            shippingInfo: {
                weight: 5,
                dimensions: { length: 30, width: 20, height: 10, unit: 'cm' },
                shippingClass: 'standard',
                freeShipping: false
            },
            taxInfo: {
                taxable: true,
                taxClass: 'standard',
                taxRate: 0.22,
                taxAmount: mockProduct.price * 0.22 * quantity
            }
        };
    }

    private getMockProduct(productId: string) {
        // Mock product data - in real app this would come from product service
        const products: { [key: string]: any } = {
            // Solar Panel Products
            '1': {
                name: 'Solar Panel 400W Monocrystalline',
                description: 'High-efficiency monocrystalline solar panel',
                sku: 'SP-400W-MONO',
                price: 299.99,
                originalPrice: 349.99,
                image: 'assets/images/solar-panel-placeholder.svg',
                category: 'Solar Panels',
                brand: 'SolarTech'
            },
            // Solar Inverter Products
            '2': {
                name: 'Solar Inverter 3000W',
                description: 'Pure sine wave solar inverter',
                sku: 'INV-3000W',
                price: 599.99,
                image: 'assets/images/inverter-placeholder.svg',
                category: 'Inverters',
                brand: 'PowerMax'
            },
            // Battery System
            '3': {
                name: 'Solar Battery System',
                description: 'High-capacity lithium battery system',
                sku: 'BAT-LITH-100',
                price: 199.99,
                image: 'assets/images/product-placeholder.svg',
                category: 'Battery Systems',
                brand: 'EnergyStore'
            },
            // Offer Products (matching offers component)
            'offer-1': {
                name: 'Premium Solar Panel Kit',
                description: 'Complete solar panel installation kit',
                sku: 'OFFER-SP-KIT',
                price: 899.99,
                originalPrice: 1199.99,
                image: 'assets/images/solar-panel-placeholder.svg',
                category: 'Solar Kits',
                brand: 'SolarPro'
            },
            'offer-2': {
                name: 'Smart Inverter System',
                description: 'Advanced smart inverter with monitoring',
                sku: 'OFFER-INV-SMART',
                price: 1299.99,
                originalPrice: 1599.99,
                image: 'assets/images/inverter-placeholder.svg',
                category: 'Smart Inverters',
                brand: 'TechSolar'
            },
            'offer-3': {
                name: 'Complete Energy Storage',
                description: 'Full home energy storage solution',
                sku: 'OFFER-STORAGE',
                price: 2499.99,
                originalPrice: 2999.99,
                image: 'assets/images/product-placeholder.svg',
                category: 'Energy Storage',
                brand: 'PowerHome'
            },
            'offer-4': {
                name: 'Solar Monitoring System',
                description: 'Real-time solar performance monitoring',
                sku: 'OFFER-MONITOR',
                price: 399.99,
                originalPrice: 499.99,
                image: 'assets/images/product-placeholder.svg',
                category: 'Monitoring',
                brand: 'SolarWatch'
            }
        };

        return products[productId] || {
            name: 'Solar Product',
            description: 'High-quality solar product',
            sku: 'SOLAR-PROD',
            price: 199.99,
            image: 'assets/images/product-placeholder.svg',
            category: 'Solar Equipment',
            brand: 'SolarShop'
        };
    }

    private recalculateCartTotals(cart: Cart): void {
        // Calculate subtotal
        cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Calculate tax
        cart.tax = cart.items.reduce((sum, item) => sum + item.taxInfo.taxAmount, 0);

        // Calculate shipping (simplified logic)
        cart.shipping = cart.subtotal > 100 ? 0 : 9.99;

        // Calculate discount from coupons
        cart.discount = cart.appliedCoupons.reduce((sum, coupon) => sum + coupon.discountAmount, 0);

        // Apply free shipping coupons
        const hasFreeShipping = cart.appliedCoupons.some(coupon => coupon.type === 'free_shipping');
        if (hasFreeShipping) {
            cart.shipping = 0;
        }

        // Calculate total
        cart.total = cart.subtotal + cart.tax + cart.shipping - cart.discount;
    }

    private validateCoupon(code: string, cart: Cart): Observable<Coupon> {
        return new Observable(observer => {
            // Simulate API call delay
            setTimeout(() => {
                this.loadAvailableCoupons().subscribe(coupons => {
                    const coupon = coupons.find(c => c.code === code && c.isActive);

                    if (!coupon) {
                        observer.error('Invalid coupon code');
                        return;
                    }

                    // Check minimum order amount
                    if (coupon.minimumOrderAmount && cart.subtotal < coupon.minimumOrderAmount) {
                        observer.error(`Minimum order amount of €${coupon.minimumOrderAmount} required`);
                        return;
                    }

                    // Check expiry
                    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
                        observer.error('Coupon has expired');
                        return;
                    }

                    observer.next(coupon);
                    observer.complete();
                });
            }, 1000);
        });
    }

    private calculateCouponDiscount(coupon: Coupon, cart: Cart): number {
        switch (coupon.type) {
            case 'percentage':
                return Math.round((cart.subtotal * coupon.value / 100) * 100) / 100;
            case 'fixed_amount':
                return Math.min(coupon.value, cart.subtotal);
            case 'free_shipping':
                return cart.shipping;
            default:
                return 0;
        }
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    private generateSessionId(): string {
        return 'session_' + Math.random().toString(36).substr(2, 16);
    }
} 