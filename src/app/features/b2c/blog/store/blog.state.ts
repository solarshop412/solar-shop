import { BlogPost } from '../blog.component';

export interface BlogState {
    posts: BlogPost[];
    selectedPostId: string | null;
    filteredCategory: string | null;
    searchQuery: string | null;
    isLoading: boolean;
    error: string | null;
}

export const initialBlogState: BlogState = {
    posts: [
        {
            id: '1',
            title: 'The Future of Sustainable Construction: Trends and Innovations for 2024',
            excerpt: 'Discover the latest trends in sustainable construction and how new technologies are revolutionizing the eco-friendly building sector.',
            content: 'Complete article content...',
            imageUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            author: {
                name: 'Mark Johnson',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
            },
            publishedAt: '2024-01-15T10:00:00Z',
            readTime: 8,
            category: 'Sustainability',
            tags: ['sustainable construction', 'innovation', 'technology', 'environment']
        },
        {
            id: '2',
            title: 'Solar Panels: Complete Guide to Selection and Installation',
            excerpt: 'A detailed guide to choosing the most suitable solar panels for your needs and maximizing your home\'s energy efficiency.',
            content: 'Complete article content...',
            imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            author: {
                name: 'Laura White',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
            },
            publishedAt: '2024-01-10T14:30:00Z',
            readTime: 12,
            category: 'Renewable Energy',
            tags: ['solar panels', 'renewable energy', 'installation', 'efficiency']
        },
        {
            id: '3',
            title: 'Ecological Insulation Materials: Comparison and Benefits',
            excerpt: 'In-depth analysis of the best ecological insulation materials available on the market and their benefits for the environment and living comfort.',
            content: 'Complete article content...',
            imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            author: {
                name: 'Joseph Green',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
            },
            publishedAt: '2024-01-05T09:15:00Z',
            readTime: 6,
            category: 'Materials',
            tags: ['insulation', 'ecological materials', 'energy efficiency', 'comfort']
        },
        {
            id: '4',
            title: 'Smart Home and Automation: Technologies for Energy Efficiency',
            excerpt: 'How smart home technologies can reduce energy consumption and improve the management of domestic systems.',
            content: 'Complete article content...',
            imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            author: {
                name: 'Anna Black',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
            },
            publishedAt: '2023-12-28T16:45:00Z',
            readTime: 10,
            category: 'Technology',
            tags: ['smart home', 'automation', 'home automation', 'energy savings']
        },
        {
            id: '5',
            title: 'Energy Certifications: Everything You Need to Know',
            excerpt: 'Complete guide to building energy certifications: requirements, procedures and benefits for owners and tenants.',
            content: 'Complete article content...',
            imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            author: {
                name: 'Robert Blue',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
            },
            publishedAt: '2023-12-20T11:20:00Z',
            readTime: 7,
            category: 'Regulations',
            tags: ['certifications', 'regulations', 'energy efficiency', 'real estate']
        },
        {
            id: '6',
            title: 'Heat Pumps: Benefits and Installation Considerations',
            excerpt: 'Everything you need to know about heat pumps: types, economic and environmental benefits, and installation tips.',
            content: 'Complete article content...',
            imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            author: {
                name: 'Frances Rose',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
            },
            publishedAt: '2023-12-15T13:10:00Z',
            readTime: 9,
            category: 'Heating',
            tags: ['heat pumps', 'heating', 'HVAC', 'energy savings']
        }
    ],
    selectedPostId: null,
    filteredCategory: null,
    searchQuery: null,
    isLoading: false,
    error: null,
}; 