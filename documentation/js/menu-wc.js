'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">solar-shop documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AddToCartButtonComponent.html" data-type="entity-link" >AddToCartButtonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminBlogComponent.html" data-type="entity-link" >AdminBlogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminCategoriesComponent.html" data-type="entity-link" >AdminCategoriesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminCompaniesComponent.html" data-type="entity-link" >AdminCompaniesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminCompanyEditComponent.html" data-type="entity-link" >AdminCompanyEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminCompanyPricingComponent.html" data-type="entity-link" >AdminCompanyPricingComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminContactsComponent.html" data-type="entity-link" >AdminContactsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminDashboardComponent.html" data-type="entity-link" >AdminDashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminFormComponent.html" data-type="entity-link" >AdminFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminLayoutComponent.html" data-type="entity-link" >AdminLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminOffersComponent.html" data-type="entity-link" >AdminOffersComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminOrdersComponent.html" data-type="entity-link" >AdminOrdersComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminOrdersPartnersComponent.html" data-type="entity-link" >AdminOrdersPartnersComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminProductsComponent.html" data-type="entity-link" >AdminProductsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminReviewsComponent.html" data-type="entity-link" >AdminReviewsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminUsersComponent.html" data-type="entity-link" >AdminUsersComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminWishlistComponent.html" data-type="entity-link" >AdminWishlistComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AuthCallbackComponent.html" data-type="entity-link" >AuthCallbackComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/B2BCartSidebarComponent.html" data-type="entity-link" >B2BCartSidebarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/B2bCheckoutComponent.html" data-type="entity-link" >B2bCheckoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/B2bLayoutComponent.html" data-type="entity-link" >B2bLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/B2bNavbarComponent.html" data-type="entity-link" >B2bNavbarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/B2bOrderDetailsComponent.html" data-type="entity-link" >B2bOrderDetailsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/B2bOrderReviewComponent.html" data-type="entity-link" >B2bOrderReviewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/B2bPaymentComponent.html" data-type="entity-link" >B2bPaymentComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/B2bShippingComponent.html" data-type="entity-link" >B2bShippingComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/B2BShippingComponent.html" data-type="entity-link" >B2BShippingComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BlogComponent.html" data-type="entity-link" >BlogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BlogDetailComponent.html" data-type="entity-link" >BlogDetailComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BlogFormComponent.html" data-type="entity-link" >BlogFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BlogHomeComponent.html" data-type="entity-link" >BlogHomeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CartButtonComponent.html" data-type="entity-link" >CartButtonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CartNotificationComponent.html" data-type="entity-link" >CartNotificationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CartSidebarComponent.html" data-type="entity-link" >CartSidebarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CategoryFormComponent.html" data-type="entity-link" >CategoryFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CheckoutComponent.html" data-type="entity-link" >CheckoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CompanyApprovalModalComponent.html" data-type="entity-link" >CompanyApprovalModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CompanyComponent.html" data-type="entity-link" >CompanyComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CompanyPricingFormComponent.html" data-type="entity-link" >CompanyPricingFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ComplaintsComponent.html" data-type="entity-link" >ComplaintsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ConfirmationComponent.html" data-type="entity-link" >ConfirmationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ContactComponent.html" data-type="entity-link" >ContactComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CookieBannerComponent.html" data-type="entity-link" >CookieBannerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CookiePolicyComponent.html" data-type="entity-link" >CookiePolicyComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DataTableComponent.html" data-type="entity-link" >DataTableComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DeleteConfirmationModalComponent.html" data-type="entity-link" >DeleteConfirmationModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EmailTestComponent.html" data-type="entity-link" >EmailTestComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FooterComponent.html" data-type="entity-link" >FooterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ForgotPasswordComponent.html" data-type="entity-link" >ForgotPasswordComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeroComponent.html" data-type="entity-link" >HeroComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HomeComponent.html" data-type="entity-link" >HomeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoaderComponent.html" data-type="entity-link" >LoaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginComponent.html" data-type="entity-link" >LoginComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MissionComponent.html" data-type="entity-link" >MissionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NavbarComponent.html" data-type="entity-link" >NavbarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NotFoundComponent.html" data-type="entity-link" >NotFoundComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OfferDetailsComponent.html" data-type="entity-link" >OfferDetailsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OfferDetailsComponent-1.html" data-type="entity-link" >OfferDetailsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OfferFormComponent.html" data-type="entity-link" >OfferFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OffersComponent.html" data-type="entity-link" >OffersComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OffersPageComponent.html" data-type="entity-link" >OffersPageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OrderConfirmationComponent.html" data-type="entity-link" >OrderConfirmationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OrderDetailsComponent.html" data-type="entity-link" >OrderDetailsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OrderDetailsComponent-1.html" data-type="entity-link" >OrderDetailsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OrderFormComponent.html" data-type="entity-link" >OrderFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OrderReviewComponent.html" data-type="entity-link" >OrderReviewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PageLayoutComponent.html" data-type="entity-link" >PageLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PartnerProfileComponent.html" data-type="entity-link" >PartnerProfileComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PartnersAboutComponent.html" data-type="entity-link" >PartnersAboutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PartnersBrandsComponent.html" data-type="entity-link" >PartnersBrandsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PartnersCategoriesComponent.html" data-type="entity-link" >PartnersCategoriesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PartnersComponent.html" data-type="entity-link" >PartnersComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PartnersContactComponent.html" data-type="entity-link" >PartnersContactComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PartnersCtaComponent.html" data-type="entity-link" >PartnersCtaComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PartnersFooterComponent.html" data-type="entity-link" >PartnersFooterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PartnersHeroComponent.html" data-type="entity-link" >PartnersHeroComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PartnersHighlightsComponent.html" data-type="entity-link" >PartnersHighlightsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PartnersOfferDetailsComponent.html" data-type="entity-link" >PartnersOfferDetailsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PartnersOffersComponent.html" data-type="entity-link" >PartnersOffersComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PartnersProductDetailsComponent.html" data-type="entity-link" >PartnersProductDetailsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PartnersProductsComponent.html" data-type="entity-link" >PartnersProductsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PartnersRegisterComponent.html" data-type="entity-link" >PartnersRegisterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PaymentCallbackComponent.html" data-type="entity-link" >PaymentCallbackComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PaymentComponent.html" data-type="entity-link" >PaymentComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PrivacyPolicyComponent.html" data-type="entity-link" >PrivacyPolicyComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductDetailsComponent.html" data-type="entity-link" >ProductDetailsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductFormComponent.html" data-type="entity-link" >ProductFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductInfoComponent.html" data-type="entity-link" >ProductInfoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductListComponent.html" data-type="entity-link" >ProductListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductPhotosComponent.html" data-type="entity-link" >ProductPhotosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductReviewsComponent.html" data-type="entity-link" >ProductReviewsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductsComponent.html" data-type="entity-link" >ProductsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProfileComponent.html" data-type="entity-link" >ProfileComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RegisterComponent.html" data-type="entity-link" >RegisterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ResetPasswordComponent.html" data-type="entity-link" >ResetPasswordComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SafetyPaymentComponent.html" data-type="entity-link" >SafetyPaymentComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ShippingComponent.html" data-type="entity-link" >ShippingComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SortOptionsManagementComponent.html" data-type="entity-link" >SortOptionsManagementComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SuccessModalComponent.html" data-type="entity-link" >SuccessModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SustainabilityComponent.html" data-type="entity-link" >SustainabilityComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TermsOfServiceComponent.html" data-type="entity-link" >TermsOfServiceComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ToastComponent.html" data-type="entity-link" >ToastComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserFormComponent.html" data-type="entity-link" >UserFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/WriteReviewModalComponent.html" data-type="entity-link" >WriteReviewModalComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AdminNotificationsService.html" data-type="entity-link" >AdminNotificationsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthEffects.html" data-type="entity-link" >AuthEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthPersistenceService.html" data-type="entity-link" >AuthPersistenceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/B2BCartEffects.html" data-type="entity-link" >B2BCartEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/B2BCartService.html" data-type="entity-link" >B2BCartService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/B2BProductsUrlStateService.html" data-type="entity-link" >B2BProductsUrlStateService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BlogDataMapperService.html" data-type="entity-link" >BlogDataMapperService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BlogEffects.html" data-type="entity-link" >BlogEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BlogService.html" data-type="entity-link" >BlogService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CartEffects.html" data-type="entity-link" >CartEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CartService.html" data-type="entity-link" >CartService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CategoriesService.html" data-type="entity-link" >CategoriesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CompaniesEffects.html" data-type="entity-link" >CompaniesEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CompaniesService.html" data-type="entity-link" >CompaniesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CompanyPricingEffects.html" data-type="entity-link" >CompanyPricingEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CouponValidationService.html" data-type="entity-link" >CouponValidationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EmailService.html" data-type="entity-link" >EmailService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ErpIntegrationService.html" data-type="entity-link" >ErpIntegrationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FooterEffects.html" data-type="entity-link" >FooterEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MonriPaymentService.html" data-type="entity-link" >MonriPaymentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NavbarEffects.html" data-type="entity-link" >NavbarEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OffersEffects.html" data-type="entity-link" >OffersEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OffersService.html" data-type="entity-link" >OffersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OrdersEffects.html" data-type="entity-link" >OrdersEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PartnerRegistrationService.html" data-type="entity-link" >PartnerRegistrationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductDetailsEffects.html" data-type="entity-link" >ProductDetailsEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductListEffects.html" data-type="entity-link" >ProductListEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductListService.html" data-type="entity-link" >ProductListService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductListUrlStateService.html" data-type="entity-link" >ProductListUrlStateService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductsEffects.html" data-type="entity-link" >ProductsEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductsEffects-1.html" data-type="entity-link" >ProductsEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductsService.html" data-type="entity-link" >ProductsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReviewsEffects.html" data-type="entity-link" >ReviewsEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SearchSuggestionsService.html" data-type="entity-link" >SearchSuggestionsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SelectivePreloadingStrategy.html" data-type="entity-link" >SelectivePreloadingStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SeoService.html" data-type="entity-link" >SeoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SettingsService.html" data-type="entity-link" >SettingsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SortOptionsService.html" data-type="entity-link" >SortOptionsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SupabaseService.html" data-type="entity-link" >SupabaseService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ToastService.html" data-type="entity-link" >ToastService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TranslationService.html" data-type="entity-link" >TranslationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/WishlistEffects.html" data-type="entity-link" >WishlistEffects</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AdminGuard.html" data-type="entity-link" >AdminGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/AuthGuard.html" data-type="entity-link" >AuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/CompanyApprovedGuard.html" data-type="entity-link" >CompanyApprovedGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Address.html" data-type="entity-link" >Address</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AddToB2BCartPayload.html" data-type="entity-link" >AddToB2BCartPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AddToCartOptions.html" data-type="entity-link" >AddToCartOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AdminCategoriesState.html" data-type="entity-link" >AdminCategoriesState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AdminCompaniesState.html" data-type="entity-link" >AdminCompaniesState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AdminCompanyPricingState.html" data-type="entity-link" >AdminCompanyPricingState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AdminOrdersState.html" data-type="entity-link" >AdminOrdersState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AdminProductsState.html" data-type="entity-link" >AdminProductsState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AdminReviewsState.html" data-type="entity-link" >AdminReviewsState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AdminState.html" data-type="entity-link" >AdminState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AdminUsersState.html" data-type="entity-link" >AdminUsersState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AppliedCoupon.html" data-type="entity-link" >AppliedCoupon</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AppliedCoupon-1.html" data-type="entity-link" >AppliedCoupon</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AppSettings.html" data-type="entity-link" >AppSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AttributeOption.html" data-type="entity-link" >AttributeOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AttributeValidation.html" data-type="entity-link" >AttributeValidation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthError.html" data-type="entity-link" >AuthError</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthResponse.html" data-type="entity-link" >AuthResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthSession.html" data-type="entity-link" >AuthSession</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthState.html" data-type="entity-link" >AuthState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthUser.html" data-type="entity-link" >AuthUser</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/B2BAppliedCoupon.html" data-type="entity-link" >B2BAppliedCoupon</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/B2BCartItem.html" data-type="entity-link" >B2BCartItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/B2BCartState.html" data-type="entity-link" >B2BCartState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/B2BCartSummary.html" data-type="entity-link" >B2BCartSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/B2BProductListUrlState.html" data-type="entity-link" >B2BProductListUrlState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/B2BShippingInfo.html" data-type="entity-link" >B2BShippingInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BankDetails.html" data-type="entity-link" >BankDetails</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BillingAddress.html" data-type="entity-link" >BillingAddress</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BlogCategory.html" data-type="entity-link" >BlogCategory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BlogComment.html" data-type="entity-link" >BlogComment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BlogFacets.html" data-type="entity-link" >BlogFacets</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BlogFilter.html" data-type="entity-link" >BlogFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BlogFilters.html" data-type="entity-link" >BlogFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BlogPost.html" data-type="entity-link" >BlogPost</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BlogPost-1.html" data-type="entity-link" >BlogPost</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BlogPostSeoData.html" data-type="entity-link" >BlogPostSeoData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BlogSearchResult.html" data-type="entity-link" >BlogSearchResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BlogState.html" data-type="entity-link" >BlogState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BlogStats.html" data-type="entity-link" >BlogStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BlogTag.html" data-type="entity-link" >BlogTag</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BreadcrumbItem.html" data-type="entity-link" >BreadcrumbItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CachedPage.html" data-type="entity-link" >CachedPage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CardDetails.html" data-type="entity-link" >CardDetails</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Cart.html" data-type="entity-link" >Cart</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartAnalytics.html" data-type="entity-link" >CartAnalytics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartEvent.html" data-type="entity-link" >CartEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartFacets.html" data-type="entity-link" >CartFacets</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartFilter.html" data-type="entity-link" >CartFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartItem.html" data-type="entity-link" >CartItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartMetadata.html" data-type="entity-link" >CartMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartMetrics.html" data-type="entity-link" >CartMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartRecommendation.html" data-type="entity-link" >CartRecommendation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartSearchResult.html" data-type="entity-link" >CartSearchResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartState.html" data-type="entity-link" >CartState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartSummary.html" data-type="entity-link" >CartSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartSummary-1.html" data-type="entity-link" >CartSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartValidation.html" data-type="entity-link" >CartValidation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartValidationError.html" data-type="entity-link" >CartValidationError</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartValidationWarning.html" data-type="entity-link" >CartValidationWarning</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Category.html" data-type="entity-link" >Category</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Category-1.html" data-type="entity-link" >Category</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Category-2.html" data-type="entity-link" >Category</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryAnalytics.html" data-type="entity-link" >CategoryAnalytics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryAncestor.html" data-type="entity-link" >CategoryAncestor</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryAttribute.html" data-type="entity-link" >CategoryAttribute</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryBreadcrumb.html" data-type="entity-link" >CategoryBreadcrumb</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryCountFilters.html" data-type="entity-link" >CategoryCountFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryCountFilters-1.html" data-type="entity-link" >CategoryCountFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryExpansionState.html" data-type="entity-link" >CategoryExpansionState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryFacets.html" data-type="entity-link" >CategoryFacets</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryFilter.html" data-type="entity-link" >CategoryFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryFilterAnalytics.html" data-type="entity-link" >CategoryFilterAnalytics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryFilters.html" data-type="entity-link" >CategoryFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryGrowthData.html" data-type="entity-link" >CategoryGrowthData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryItem.html" data-type="entity-link" >CategoryItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryNavigation.html" data-type="entity-link" >CategoryNavigation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryPerformance.html" data-type="entity-link" >CategoryPerformance</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryProductAnalytics.html" data-type="entity-link" >CategoryProductAnalytics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategorySalesAnalytics.html" data-type="entity-link" >CategorySalesAnalytics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategorySearchAnalytics.html" data-type="entity-link" >CategorySearchAnalytics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategorySearchFilter.html" data-type="entity-link" >CategorySearchFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategorySearchResult.html" data-type="entity-link" >CategorySearchResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryStats.html" data-type="entity-link" >CategoryStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryTemplate.html" data-type="entity-link" >CategoryTemplate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryTree.html" data-type="entity-link" >CategoryTree</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryViewAnalytics.html" data-type="entity-link" >CategoryViewAnalytics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CommentAuthor.html" data-type="entity-link" >CommentAuthor</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompaniesFilters.html" data-type="entity-link" >CompaniesFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompaniesState.html" data-type="entity-link" >CompaniesState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Company.html" data-type="entity-link" >Company</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Company-1.html" data-type="entity-link" >Company</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyApprovalEmailData.html" data-type="entity-link" >CompanyApprovalEmailData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyFilters.html" data-type="entity-link" >CompanyFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyPricing.html" data-type="entity-link" >CompanyPricing</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyPricing-1.html" data-type="entity-link" >CompanyPricing</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyPricingSummary.html" data-type="entity-link" >CompanyPricingSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyRegistrationData.html" data-type="entity-link" >CompanyRegistrationData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyRegistrationData-1.html" data-type="entity-link" >CompanyRegistrationData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Coupon.html" data-type="entity-link" >Coupon</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CouponRestrictions.html" data-type="entity-link" >CouponRestrictions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CouponValidationResult.html" data-type="entity-link" >CouponValidationResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DashboardStats.html" data-type="entity-link" >DashboardStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Database.html" data-type="entity-link" >Database</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceInfo.html" data-type="entity-link" >DeviceInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmailRequest.html" data-type="entity-link" >EmailRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmailTemplate.html" data-type="entity-link" >EmailTemplate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EnergyEfficiency.html" data-type="entity-link" >EnergyEfficiency</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ErpStockItem.html" data-type="entity-link" >ErpStockItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ErpStockItem-1.html" data-type="entity-link" >ErpStockItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ErpStockResponse.html" data-type="entity-link" >ErpStockResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FacetItem.html" data-type="entity-link" >FacetItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FacetItem-1.html" data-type="entity-link" >FacetItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FacetItem-2.html" data-type="entity-link" >FacetItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FacetItem-3.html" data-type="entity-link" >FacetItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FacetItem-4.html" data-type="entity-link" >FacetItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FAQItem.html" data-type="entity-link" >FAQItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FilteredStockItem.html" data-type="entity-link" >FilteredStockItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FilterOption.html" data-type="entity-link" >FilterOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FooterData.html" data-type="entity-link" >FooterData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FooterLink.html" data-type="entity-link" >FooterLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FooterSection.html" data-type="entity-link" >FooterSection</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FooterState.html" data-type="entity-link" >FooterState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HeroState.html" data-type="entity-link" >HeroState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HighlightOffer.html" data-type="entity-link" >HighlightOffer</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ImagePlaceholderData.html" data-type="entity-link" >ImagePlaceholderData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemAvailability.html" data-type="entity-link" >ItemAvailability</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemShippingInfo.html" data-type="entity-link" >ItemShippingInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemTaxInfo.html" data-type="entity-link" >ItemTaxInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoginRequest.html" data-type="entity-link" >LoginRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ManufacturerCountFilters.html" data-type="entity-link" >ManufacturerCountFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ManufacturerCountFilters-1.html" data-type="entity-link" >ManufacturerCountFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MarketingPreferences.html" data-type="entity-link" >MarketingPreferences</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MonriFormParams.html" data-type="entity-link" >MonriFormParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MonriPaymentRequest.html" data-type="entity-link" >MonriPaymentRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MonriPaymentResponse.html" data-type="entity-link" >MonriPaymentResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NavbarState.html" data-type="entity-link" >NavbarState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationCounts.html" data-type="entity-link" >NotificationCounts</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationPreferences.html" data-type="entity-link" >NotificationPreferences</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Offer.html" data-type="entity-link" >Offer</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OfferFilters.html" data-type="entity-link" >OfferFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OfferSeoData.html" data-type="entity-link" >OfferSeoData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OffersState.html" data-type="entity-link" >OffersState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OgTags.html" data-type="entity-link" >OgTags</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Order.html" data-type="entity-link" >Order</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderConfirmationEmailData.html" data-type="entity-link" >OrderConfirmationEmailData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderFilter.html" data-type="entity-link" >OrderFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderItem.html" data-type="entity-link" >OrderItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderItem-1.html" data-type="entity-link" >OrderItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrdersState.html" data-type="entity-link" >OrdersState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderStatusChangeEmailData.html" data-type="entity-link" >OrderStatusChangeEmailData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderSummary.html" data-type="entity-link" >OrderSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaginationState.html" data-type="entity-link" >PaginationState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaginationState-1.html" data-type="entity-link" >PaginationState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PartnerOffer.html" data-type="entity-link" >PartnerOffer</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PartnerProduct.html" data-type="entity-link" >PartnerProduct</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentMethod.html" data-type="entity-link" >PaymentMethod</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentMethod-1.html" data-type="entity-link" >PaymentMethod</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaypalDetails.html" data-type="entity-link" >PaypalDetails</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Permission.html" data-type="entity-link" >Permission</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PersistedAuthState.html" data-type="entity-link" >PersistedAuthState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PrivacySettings.html" data-type="entity-link" >PrivacySettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Product.html" data-type="entity-link" >Product</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Product-1.html" data-type="entity-link" >Product</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Product-2.html" data-type="entity-link" >Product</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Product-3.html" data-type="entity-link" >Product</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductAvailability.html" data-type="entity-link" >ProductAvailability</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductCategory.html" data-type="entity-link" >ProductCategory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductCategory-1.html" data-type="entity-link" >ProductCategory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductCustomization.html" data-type="entity-link" >ProductCustomization</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductDetailsState.html" data-type="entity-link" >ProductDetailsState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductFacets.html" data-type="entity-link" >ProductFacets</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductFilter.html" data-type="entity-link" >ProductFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductFilters.html" data-type="entity-link" >ProductFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductFilters-1.html" data-type="entity-link" >ProductFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductFilters-2.html" data-type="entity-link" >ProductFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductImage.html" data-type="entity-link" >ProductImage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductImage-1.html" data-type="entity-link" >ProductImage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductImage-2.html" data-type="entity-link" >ProductImage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductImage-3.html" data-type="entity-link" >ProductImage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductListState.html" data-type="entity-link" >ProductListState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductListUrlState.html" data-type="entity-link" >ProductListUrlState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductRating.html" data-type="entity-link" >ProductRating</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductRelationship.html" data-type="entity-link" >ProductRelationship</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductReview.html" data-type="entity-link" >ProductReview</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductReviewSummary.html" data-type="entity-link" >ProductReviewSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductSearchResult.html" data-type="entity-link" >ProductSearchResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductSeoData.html" data-type="entity-link" >ProductSeoData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductsQuery.html" data-type="entity-link" >ProductsQuery</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductsQuery-1.html" data-type="entity-link" >ProductsQuery</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductsResponse.html" data-type="entity-link" >ProductsResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductsResponse-1.html" data-type="entity-link" >ProductsResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductsState.html" data-type="entity-link" >ProductsState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductsState-1.html" data-type="entity-link" >ProductsState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductWarranty.html" data-type="entity-link" >ProductWarranty</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductWithCustomPrice.html" data-type="entity-link" >ProductWithCustomPrice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductWithPricing.html" data-type="entity-link" >ProductWithPricing</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RecommendedProduct.html" data-type="entity-link" >RecommendedProduct</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RegisterRequest.html" data-type="entity-link" >RegisterRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RegisterRequest-1.html" data-type="entity-link" >RegisterRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RemoveFromB2BCartPayload.html" data-type="entity-link" >RemoveFromB2BCartPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ResetPasswordRequest.html" data-type="entity-link" >ResetPasswordRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Review.html" data-type="entity-link" >Review</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReviewFilter.html" data-type="entity-link" >ReviewFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReviewsState.html" data-type="entity-link" >ReviewsState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReviewSummary.html" data-type="entity-link" >ReviewSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SavedCart.html" data-type="entity-link" >SavedCart</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SearchSuggestion.html" data-type="entity-link" >SearchSuggestion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SeoMetadata.html" data-type="entity-link" >SeoMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SeoMetadata-1.html" data-type="entity-link" >SeoMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SeoMetadata-2.html" data-type="entity-link" >SeoMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SeoTemplate.html" data-type="entity-link" >SeoTemplate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ShippingAddress.html" data-type="entity-link" >ShippingAddress</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ShippingInfo.html" data-type="entity-link" >ShippingInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ShippingMethod.html" data-type="entity-link" >ShippingMethod</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ShopLocation.html" data-type="entity-link" >ShopLocation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SocialLink.html" data-type="entity-link" >SocialLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SocialLinks.html" data-type="entity-link" >SocialLinks</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SocialLogin.html" data-type="entity-link" >SocialLogin</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SocialSharingConfig.html" data-type="entity-link" >SocialSharingConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SortField.html" data-type="entity-link" >SortField</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SortOption.html" data-type="entity-link" >SortOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SortOptionDisplay.html" data-type="entity-link" >SortOptionDisplay</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/State.html" data-type="entity-link" >State</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/State-1.html" data-type="entity-link" >State</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StockItem.html" data-type="entity-link" >StockItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupabaseBlogPost.html" data-type="entity-link" >SupabaseBlogPost</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SustainabilityFeature.html" data-type="entity-link" >SustainabilityFeature</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SustainabilityState.html" data-type="entity-link" >SustainabilityState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableAction.html" data-type="entity-link" >TableAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableColumn.html" data-type="entity-link" >TableColumn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableConfig.html" data-type="entity-link" >TableConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableOfContentsItem.html" data-type="entity-link" >TableOfContentsItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Toast.html" data-type="entity-link" >Toast</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Translations.html" data-type="entity-link" >Translations</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TwitterTags.html" data-type="entity-link" >TwitterTags</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdateB2BCartItemPayload.html" data-type="entity-link" >UpdateB2BCartItemPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdatePasswordRequest.html" data-type="entity-link" >UpdatePasswordRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserActivity.html" data-type="entity-link" >UserActivity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserAddress.html" data-type="entity-link" >UserAddress</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserFacets.html" data-type="entity-link" >UserFacets</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserFilter.html" data-type="entity-link" >UserFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserMetadata.html" data-type="entity-link" >UserMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserOrder.html" data-type="entity-link" >UserOrder</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserPreferences.html" data-type="entity-link" >UserPreferences</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserProfile.html" data-type="entity-link" >UserProfile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserRole.html" data-type="entity-link" >UserRole</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserSearchResult.html" data-type="entity-link" >UserSearchResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserSession.html" data-type="entity-link" >UserSession</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserStats.html" data-type="entity-link" >UserStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserStatus.html" data-type="entity-link" >UserStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserWishlistSummary.html" data-type="entity-link" >UserWishlistSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WalletDetails.html" data-type="entity-link" >WalletDetails</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WelcomeEmailData.html" data-type="entity-link" >WelcomeEmailData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WishlistItem.html" data-type="entity-link" >WishlistItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WishlistItemDetail.html" data-type="entity-link" >WishlistItemDetail</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WishlistState.html" data-type="entity-link" >WishlistState</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#pipes-links"' :
                                'data-bs-target="#xs-pipes-links"' }>
                                <span class="icon ion-md-add"></span>
                                <span>Pipes</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="pipes-links"' : 'id="xs-pipes-links"' }>
                                <li class="link">
                                    <a href="pipes/TranslatePipe.html" data-type="entity-link" >TranslatePipe</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});