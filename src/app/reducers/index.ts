import { isDevMode } from '@angular/core';
import {
  ActionReducerMap,
  MetaReducer
} from '@ngrx/store';
import { authReducer } from '../core/auth/store/auth.reducer';
import { AuthState } from '../core/auth/store/auth.state';
import { navbarReducer } from '../features/navbar/store/navbar.reducer';
import { NavbarState } from '../features/navbar/store/navbar.state';
import { heroReducer } from '../features/hero/store/hero.reducer';
import { HeroState } from '../features/hero/store/hero.state';
import { offersReducer } from '../features/offers/store/offers.reducer';
import { OffersState } from '../features/offers/store/offers.state';
import { productsReducer } from '../features/products/store/products.reducer';
import { ProductsState } from '../features/products/store/products.state';
import { sustainabilityReducer } from '../features/sustainability/store/sustainability.reducer';
import { SustainabilityState } from '../features/sustainability/store/sustainability.state';
import { blogReducer } from '../features/blog/store/blog.reducer';
import { BlogState } from '../features/blog/store/blog.state';
import { footerReducer } from '../features/footer/store/footer.reducer';
import { FooterState } from '../features/footer/store/footer.state';

export interface State {
  auth: AuthState;
  navbar: NavbarState;
  hero: HeroState;
  offers: OffersState;
  products: ProductsState;
  sustainability: SustainabilityState;
  blog: BlogState;
  footer: FooterState;
}

export const reducers: ActionReducerMap<State> = {
  auth: authReducer,
  navbar: navbarReducer,
  hero: heroReducer,
  offers: offersReducer,
  products: productsReducer,
  sustainability: sustainabilityReducer,
  blog: blogReducer,
  footer: footerReducer,
};

export const metaReducers: MetaReducer<State>[] = isDevMode() ? [] : [];