import { Offer } from '../offers.component';

export interface OffersState {
    offers: Offer[];
    isLoading: boolean;
    error: string | null;
}

export const initialOffersState: OffersState = {
    offers: [
        {
            id: '1',
            title: 'VTAC Solar Panel 3.6kW',
            originalPrice: 1090.00,
            discountedPrice: 872.00,
            discountPercentage: 20,
            imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
        },
        {
            id: '2',
            title: 'Thermal Insulation Kit',
            originalPrice: 850.00,
            discountedPrice: 680.00,
            discountPercentage: 20,
            imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
        },
        {
            id: '3',
            title: 'Eco Heat Pump',
            originalPrice: 2500.00,
            discountedPrice: 1875.00,
            discountPercentage: 25,
            imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
        },
        {
            id: '4',
            title: 'Smart Home System',
            originalPrice: 1200.00,
            discountedPrice: 960.00,
            discountPercentage: 20,
            imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
        }
    ],
    isLoading: false,
    error: null,
}; 