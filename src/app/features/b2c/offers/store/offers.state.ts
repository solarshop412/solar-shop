import { Offer } from '../services/offers.service';

export interface OffersState {
    offers: Offer[];
    isLoading: boolean;
    error: string | null;
}

export const initialOffersState: OffersState = {
    offers: [],
    isLoading: false,
    error: null,
}; 