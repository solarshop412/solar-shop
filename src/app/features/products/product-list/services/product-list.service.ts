import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Product } from '../product-list.component';

@Injectable({
    providedIn: 'root'
})
export class ProductListService {

    private mockProducts: Product[] = [
        {
            id: '1',
            name: 'VTAC Solar Panel 3.6kW High Efficiency',
            description: 'High-efficiency monocrystalline solar panel with 25-year warranty. Perfect for residential installations.',
            price: 1299,
            originalPrice: 1499,
            discount: 13,
            imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop',
            category: 'Energy Solutions',
            manufacturer: 'VTAC',
            certificates: ['ISO 14001', 'CE Certified', 'Energy Star'],
            rating: 4.8,
            reviewCount: 156,
            availability: 'available',
            featured: true,
            createdAt: new Date('2024-01-15')
        },
        {
            id: '2',
            name: 'Thermal Insulation Kit Premium',
            description: 'Complete thermal insulation solution for walls and roofs. Reduces energy consumption by up to 40%.',
            price: 899,
            imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
            category: 'Building Materials',
            manufacturer: 'EcoTherm',
            certificates: ['ISO 14001', 'Green Building'],
            rating: 4.6,
            reviewCount: 89,
            availability: 'available',
            featured: true,
            createdAt: new Date('2024-01-10')
        },
        {
            id: '3',
            name: 'Eco Heat Pump Air-Water 12kW',
            description: 'Energy-efficient heat pump system for heating and cooling. Suitable for homes up to 200m².',
            price: 3299,
            originalPrice: 3599,
            discount: 8,
            imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&h=500&fit=crop',
            category: 'Electrical Systems',
            manufacturer: 'EcoHeat',
            certificates: ['Energy Star', 'CE Certified'],
            rating: 4.7,
            reviewCount: 234,
            availability: 'limited',
            featured: false,
            createdAt: new Date('2024-01-05')
        },
        {
            id: '4',
            name: 'Smart Home System Complete',
            description: 'Comprehensive smart home automation system with energy monitoring and control features.',
            price: 2199,
            imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&h=500&fit=crop',
            category: 'Electrical Systems',
            manufacturer: 'SmartTech',
            certificates: ['CE Certified', 'IoT Certified'],
            rating: 4.5,
            reviewCount: 67,
            availability: 'available',
            featured: false,
            createdAt: new Date('2024-01-20')
        },
        {
            id: '5',
            name: 'Bamboo Flooring Sustainable Collection',
            description: 'Premium bamboo flooring with natural finish. Eco-friendly and durable for high-traffic areas.',
            price: 45,
            imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop',
            category: 'Finishes & Coatings',
            manufacturer: 'BambooFloor',
            certificates: ['FSC Certified', 'Green Building'],
            rating: 4.4,
            reviewCount: 123,
            availability: 'available',
            featured: false,
            createdAt: new Date('2024-01-12')
        },
        {
            id: '6',
            name: 'LED Lighting Kit Energy Efficient',
            description: 'Complete LED lighting solution for homes. 80% energy savings compared to traditional bulbs.',
            price: 299,
            originalPrice: 399,
            discount: 25,
            imageUrl: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=500&h=500&fit=crop',
            category: 'Electrical Systems',
            manufacturer: 'LightTech',
            certificates: ['Energy Star', 'CE Certified'],
            rating: 4.9,
            reviewCount: 445,
            availability: 'available',
            featured: true,
            createdAt: new Date('2024-01-25')
        },
        {
            id: '7',
            name: 'Recycled Steel Beams Structural',
            description: 'High-strength recycled steel beams for sustainable construction. Various sizes available.',
            price: 189,
            imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&h=500&fit=crop',
            category: 'Building Materials',
            manufacturer: 'SteelGreen',
            certificates: ['ISO 14001', 'Recycled Content'],
            rating: 4.3,
            reviewCount: 78,
            availability: 'available',
            featured: false,
            createdAt: new Date('2024-01-08')
        },
        {
            id: '8',
            name: 'Water Filtration System Advanced',
            description: 'Multi-stage water filtration system for clean, safe drinking water. Easy installation.',
            price: 799,
            imageUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&h=500&fit=crop',
            category: 'Electrical Systems',
            manufacturer: 'AquaPure',
            certificates: ['NSF Certified', 'Water Quality'],
            rating: 4.6,
            reviewCount: 156,
            availability: 'available',
            featured: false,
            createdAt: new Date('2024-01-18')
        },
        {
            id: '9',
            name: 'Cordless Drill Professional 18V',
            description: 'High-performance cordless drill with lithium battery. Perfect for construction and DIY projects.',
            price: 159,
            imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&h=500&fit=crop',
            category: 'Tools & Accessories',
            manufacturer: 'PowerTools',
            certificates: ['CE Certified'],
            rating: 4.7,
            reviewCount: 289,
            availability: 'available',
            featured: false,
            createdAt: new Date('2024-01-22')
        },
        {
            id: '10',
            name: 'Eco Paint Low VOC Interior',
            description: 'Low-VOC interior paint in various colors. Safe for indoor use and environmentally friendly.',
            price: 89,
            imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&h=500&fit=crop',
            category: 'Finishes & Coatings',
            manufacturer: 'EcoPaint',
            certificates: ['Green Seal', 'Low VOC'],
            rating: 4.2,
            reviewCount: 167,
            availability: 'available',
            featured: false,
            createdAt: new Date('2024-01-14')
        },
        {
            id: '11',
            name: 'Wind Turbine Residential 5kW',
            description: 'Small wind turbine for residential use. Generate clean energy with minimal noise.',
            price: 4599,
            imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=500&h=500&fit=crop',
            category: 'Energy Solutions',
            manufacturer: 'WindPower',
            certificates: ['IEC Certified', 'Energy Star'],
            rating: 4.1,
            reviewCount: 45,
            availability: 'limited',
            featured: false,
            createdAt: new Date('2024-01-03')
        },
        {
            id: '12',
            name: 'Smart Thermostat WiFi Enabled',
            description: 'Programmable smart thermostat with WiFi connectivity. Save up to 23% on heating and cooling.',
            price: 249,
            originalPrice: 299,
            discount: 17,
            imageUrl: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=500&h=500&fit=crop',
            category: 'Electrical Systems',
            manufacturer: 'SmartClimate',
            certificates: ['Energy Star', 'WiFi Certified'],
            rating: 4.8,
            reviewCount: 312,
            availability: 'available',
            featured: true,
            createdAt: new Date('2024-01-28')
        }
    ];

    getProducts(): Observable<Product[]> {
        // Simulate API call with delay
        return of(this.mockProducts).pipe(delay(1000));
    }

    getProductById(id: string): Observable<Product | undefined> {
        const product = this.mockProducts.find(p => p.id === id);
        return of(product).pipe(delay(500));
    }
} 