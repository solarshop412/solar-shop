export interface NavbarState {
    isMobileMenuOpen: boolean;
    currentLanguage: 'en' | 'it';
}

export const initialNavbarState: NavbarState = {
    isMobileMenuOpen: false,
    currentLanguage: 'en',
}; 