import { SustainabilityFeature } from '../sustainability.component';

export interface SustainabilityState {
    features: SustainabilityFeature[];
    isLoading: boolean;
    error: string | null;
}

export const initialSustainabilityState: SustainabilityState = {
    features: [
        {
            id: '1',
            title: 'Energy Efficiency Tips',
            description: 'Practical advice to reduce waste and optimize consumption of systems and renewable energy.',
            icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
            color: 'linear-gradient(135deg, #0ACF83 0%, #0ACFAC 100%)'
        },
        {
            id: '2',
            title: 'Green Certifications & Standards',
            description: 'Products certified according to the highest environmental standards (LEED, BREEAM, ISO 14001, etc.).',
            icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
            color: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)'
        },
        {
            id: '3',
            title: 'Low Environmental Impact Products',
            description: 'Selection of innovative sustainable solutions to reduce environmental impact and emissions.',
            icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.66c.03-.08.06-.17.09-.25C6.84 17.25 9.5 14.9 12 13.5c2.5 1.4 5.16 3.75 5.25 5.59.03.08.06.17.09.25l.95 2.66 1.89-.66C18.1 16.17 16 10 17 8z"/></svg>',
            color: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)'
        },
        {
            id: '4',
            title: 'Sustainable Materials',
            description: 'Certified low environmental impact products for eco-friendly construction.',
            icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
            color: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)'
        }
    ],
    isLoading: false,
    error: null,
}; 