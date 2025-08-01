import { FooterData } from '../footer.component';

export interface FooterState {
    data: FooterData | null;
    error: string | null;
    newsletterSubscriptionStatus: 'idle' | 'loading' | 'success' | 'error';
    newsletterMessage: string | null;
}

export const initialFooterState: FooterState = {
    data: {
        sections: [
            {
                title: 'Products',
                links: [
                    { label: 'Building Materials', url: '/proizvodi/building-materials' },
                    { label: 'Electrical Systems', url: '/proizvodi/electrical-systems' },
                    { label: 'Energy Solutions', url: '/proizvodi/energy-solutions' },
                    { label: 'Finishes & Coatings', url: '/proizvodi/finishes-coatings' },
                    { label: 'Tools & Accessories', url: '/proizvodi/tools-accessories' },
                ]
            },
            {
                title: 'Services',
                links: [
                    { label: 'Energy Consulting', url: '/usluge/energy-consulting' },
                    { label: 'Installation', url: '/usluge/installation' },
                    { label: 'Maintenance', url: '/usluge/maintenance' },
                    { label: 'Certifications', url: '/usluge/certifications' },
                    { label: 'Technical Support', url: '/usluge/technical-support' },
                ]
            },
            {
                title: 'Company',
                links: [
                    { label: 'About Us', url: '/tvrtka' },
                    { label: 'Our Mission', url: '/misija' },
                    { label: 'Offers & Promotions', url: '/ponude' },
                    { label: 'Blog & Guides', url: '/blog' },
                    { label: 'Contact', url: '/kontakt' },
                ]
            }
        ],
        socialLinks: [
            {
                platform: 'Facebook',
                url: 'https://www.facebook.com/solarno.hr',
                icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>'
            },
            {
                platform: 'Instagram',
                url: 'https://www.instagram.com/solarshophr',
                icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/></svg>'
            },
            {
                platform: 'LinkedIn',
                url: 'https://linkedin.com/company/hvaljen-budi-d-o-o-solar-shop',
                icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>'
            },
            {
                platform: 'YouTube',
                url: 'https://www.youtube.com/@SolarShopHR',
                icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
            }
        ],
        contactInfo: {
            address: 'Zagreb, Croatia',
            phone: '+385 (1) 6407 715',
            email: 'info@solarni-paneli.hr',
            hours: 'Mon-Fri: 8:00-18:00, Sat: 9:00-13:00'
        },
        newsletter: {
            title: 'Newsletter',
            description: 'Get the latest news on sustainable products, energy efficiency tips and exclusive offers.'
        }
    },
    error: null,
    newsletterSubscriptionStatus: 'idle',
    newsletterMessage: null,
}; 