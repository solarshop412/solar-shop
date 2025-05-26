import { ProductCategory } from '../products.component';

export interface ProductsState {
    categories: ProductCategory[];
    isLoading: boolean;
    error: string | null;
}

export const initialProductsState: ProductsState = {
    categories: [
        {
            id: '1',
            title: 'Building Materials',
            description: 'Eco-Compatible Cements • Low Impact Mortars & Binders • Natural Thermal Insulation • Sustainable Roofing • Ecological Waterproofing • Recycled Bricks & Blocks',
            imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            backgroundGradient: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)'
        },
        {
            id: '2',
            title: 'Electrical Systems',
            description: 'Smart Electrical Systems • Certified Cables & Panels • Efficient LED Lighting • Advanced Home Automation • Sustainable Hydraulic Systems • High Efficiency Pumps • Eco-Friendly HVAC',
            imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            backgroundGradient: 'linear-gradient(135deg, #4682B4 0%, #5F9EA0 100%)'
        },
        {
            id: '3',
            title: 'Energy Solutions',
            description: 'Photovoltaic Solar Panels • Solar Thermal Panels • Heat Pumps • Energy Storage Systems • Electric Vehicle Charging Stations • High Energy Efficiency Windows',
            imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            backgroundGradient: 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)'
        },
        {
            id: '4',
            title: 'Finishes & Coatings',
            description: 'Flooring (Ceramic, Parquet, Laminate) • Wall Coverings (Paint, Wallpaper, Decorative Panels)',
            imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            backgroundGradient: 'linear-gradient(135deg, #CD853F 0%, #DEB887 100%)'
        },
        {
            id: '5',
            title: 'Tools & Accessories',
            description: 'Professional Tools • High Efficiency Power Tools • Innovative Fastening Systems • Ecological Adhesives • Certified PPE • Digital Measuring Instruments • Installation Accessories',
            imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            backgroundGradient: 'linear-gradient(135deg, #696969 0%, #808080 100%)'
        }
    ],
    isLoading: false,
    error: null,
}; 