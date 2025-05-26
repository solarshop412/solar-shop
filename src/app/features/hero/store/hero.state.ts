export interface HeroState {
    isLoading: boolean;
    currentSlide: number;
    totalSlides: number;
}

export const initialHeroState: HeroState = {
    isLoading: false,
    currentSlide: 0,
    totalSlides: 3,
}; 