import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offers-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-green-600 to-green-800 text-white py-20 px-4 md:px-8 lg:px-32">
      <div class="max-w-6xl mx-auto text-center">
        <h1 class="font-['Poppins'] font-semibold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
          Offers & Promotions
        </h1>
        <p class="font-['DM_Sans'] text-base md:text-lg max-w-4xl mx-auto opacity-80 leading-relaxed">
          Welcome to the Offers & Promotions section of HeyHome. Here you will find the best opportunities to save on the products you need for your construction, plumbing and energy solutions projects. Discover exclusive discounts, convenient packages and seasonal promotions designed to give you the best value.
        </p>
      </div>
    </section>

    <!-- Featured Deals Section -->
    <section class="py-16 px-4 md:px-8 lg:px-32 bg-white">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Deal Image -->
          <div class="order-2 lg:order-1">
            <div class="bg-gray-200 rounded-3xl h-96 flex items-center justify-center">
              <span class="text-gray-500 font-['DM_Sans']">Featured Deal Image</span>
            </div>
          </div>
          
          <!-- Deal Content -->
          <div class="order-1 lg:order-2 space-y-6">
            <h2 class="font-['Poppins'] font-semibold text-3xl md:text-4xl text-gray-800 leading-tight">
              Our Special Offer
            </h2>
            <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                HeyHome nasce dall'esperienza di professionisti del settore edilizio che, unendo le proprie competenze, hanno deciso di creare un portale dove privati, artigiani e imprese potessero trovare facilmente i migliori prodotti per i loro progetti. Anno dopo anno, abbiamo arricchito la nostra offerta, selezionato i partner più affidabili e raffinato la nostra consulenza, diventando un punto di riferimento per chi cerca qualità, efficienza e trasparenza.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="py-16 px-4 md:px-8 lg:px-32 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col lg:flex-row gap-12">
          <!-- Team Info -->
          <div class="lg:w-1/2 space-y-6">
            <h2 class="font-['Poppins'] font-semibold text-3xl md:text-4xl text-gray-800 text-center lg:text-left leading-tight">
              Our Team
            </h2>
            <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed text-right">
              Behind HeyHome is a group of passionate and competent people: engineers, architects, energy consultants and construction professionals, united by the desire to help you build better, more efficiently and more responsibly. Our team is at your disposal to advise and guide you towards the most suitable solutions for your needs.
            </p>
          </div>
          
          <!-- Team Grid -->
          <div class="lg:w-1/2">
            <!-- First Row -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div class="text-center space-y-3">
                <div class="bg-gray-300 rounded-2xl h-32 w-full"></div>
                <div>
                  <h3 class="font-['DM_Sans'] font-bold text-sm text-gray-800">Michael Harrington</h3>
                  <p class="font-['DM_Sans'] font-light text-xs text-gray-600">Founder & CEO</p>
                </div>
              </div>
              <div class="text-center space-y-3">
                <div class="bg-gray-300 rounded-2xl h-32 w-full"></div>
                <div>
                  <h3 class="font-['DM_Sans'] font-bold text-sm text-gray-800">James O'Connor</h3>
                  <p class="font-['DM_Sans'] font-light text-xs text-gray-600">Technical Consultant</p>
                </div>
              </div>
              <div class="text-center space-y-3">
                <div class="bg-gray-300 rounded-2xl h-32 w-full"></div>
                <div>
                  <h3 class="font-['DM_Sans'] font-bold text-sm text-gray-800">Ralph Edwards</h3>
                  <p class="font-['DM_Sans'] font-light text-xs text-gray-600">Senior Project Manager</p>
                </div>
              </div>
              <div class="text-center space-y-3">
                <div class="bg-gray-300 rounded-2xl h-32 w-full"></div>
                <div>
                  <h3 class="font-['DM_Sans'] font-bold text-sm text-gray-800">Liam Evans</h3>
                  <p class="font-['DM_Sans'] font-light text-xs text-gray-600">Head of Technical Solutions</p>
                </div>
              </div>
            </div>
            
            <!-- Second Row -->
            <div class="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div class="text-center space-y-3">
                <div class="bg-gray-300 rounded-2xl h-32 w-full"></div>
                <div>
                  <h3 class="font-['DM_Sans'] font-bold text-sm text-gray-800">Sophia Martinez</h3>
                  <p class="font-['DM_Sans'] font-light text-xs text-gray-600">Lead Architect</p>
                </div>
              </div>
              <div class="text-center space-y-3">
                <div class="bg-gray-300 rounded-2xl h-32 w-full"></div>
                <div>
                  <h3 class="font-['DM_Sans'] font-bold text-sm text-gray-800">James O'Connor</h3>
                  <p class="font-['DM_Sans'] font-light text-xs text-gray-600">Technical Consultant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission & Values Section -->
    <section class="relative py-16 px-4 md:px-8 lg:px-32 bg-orange-50">
      <!-- Background Decorative Element -->
      <div class="absolute top-0 right-0 w-80 h-80 opacity-20">
        <div class="w-full h-full bg-orange-200 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div class="max-w-6xl mx-auto relative z-10">
        <div class="text-center mb-12">
          <h2 class="font-['Poppins'] font-semibold text-3xl md:text-4xl text-gray-800 mb-8 leading-tight">
            Mission & Values
          </h2>
          
          <!-- Values Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- First Row -->
            <div class="flex items-start space-x-4 text-left">
              <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800 mb-2">Quality</h3>
                <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                  We offer only tested and certified products, selected from the most reliable brands in the market.
                </p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4 text-left">
              <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800 mb-2">Innovation</h3>
                <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                  We focus on the latest technologies and materials of the latest generation, to ensure efficient and durable solutions.
                </p>
              </div>
            </div>
            
            <!-- Second Row -->
            <div class="flex items-start space-x-4 text-left">
              <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012-2v-1a2 2 0 012-2h1.945M11 6.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800 mb-2">Sustainability</h3>
                <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                  We respect the planet, choosing environmentally friendly materials, encouraging the use of renewable energies and promoting responsible construction practices.
                </p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4 text-left">
              <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800 mb-2">Support</h3>
                <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                  We accompany you in every phase, from product selection to post-sale assistance, with a team of experts always ready to listen to your needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Partners Section -->
    <section class="py-16 px-4 md:px-8 lg:px-32 bg-white">
      <div class="max-w-6xl mx-auto text-center">
        <h2 class="font-['Poppins'] font-semibold text-3xl md:text-4xl text-gray-800 mb-6 leading-tight">
          Suppliers and Partners
        </h2>
        <p class="font-['DM_Sans'] text-base text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
          We collaborate with the most established brands and specialized companies, thus ensuring a wide, updated and high-quality catalog. Thanks to these solid partnerships, we can offer you competitive prices, cutting-edge products and a reliable and transparent distribution chain.
        </p>
        
        <!-- Partners Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div class="bg-orange-50 rounded-2xl p-6 text-center">
            <div class="bg-gray-200 h-16 rounded-lg mb-4 flex items-center justify-center">
              <span class="text-gray-500 text-xs">Logo</span>
            </div>
            <h3 class="font-['DM_Sans'] font-semibold text-sm text-gray-800 mb-2">Company name</h3>
            <p class="font-['DM_Sans'] text-xs text-gray-600 leading-relaxed">
              Description dolor in reprehenderit in voluptate velit esse fugiat nulla pariatur. Excepteur sint occaecat cupidatat nonproident.
            </p>
          </div>
          
          <div class="bg-orange-50 rounded-2xl p-6 text-center">
            <div class="bg-gray-200 h-16 rounded-lg mb-4 flex items-center justify-center">
              <span class="text-gray-500 text-xs">Logo</span>
            </div>
            <h3 class="font-['DM_Sans'] font-semibold text-sm text-gray-800 mb-2">Company name</h3>
            <p class="font-['DM_Sans'] text-xs text-gray-600 leading-relaxed">
              Description dolor in voluptate velit esse fugiat nulla pariatur. Excepteur sint occaecat cupidatat nonproident.
            </p>
          </div>
          
          <div class="bg-orange-50 rounded-2xl p-6 text-center">
            <div class="bg-gray-200 h-16 rounded-lg mb-4 flex items-center justify-center">
              <span class="text-gray-500 text-xs">Logo</span>
            </div>
            <h3 class="font-['DM_Sans'] font-semibold text-sm text-gray-800 mb-2">Company name</h3>
            <p class="font-['DM_Sans'] text-xs text-gray-600 leading-relaxed">
              Description dolor in reprehenderit in voluptate velit esse fugiat nulla pariatur. Excepteur sint occaecat cupidatat nonproident.
            </p>
          </div>
          
          <div class="bg-orange-50 rounded-2xl p-6 text-center">
            <div class="bg-gray-200 h-16 rounded-lg mb-4 flex items-center justify-center">
              <span class="text-gray-500 text-xs">Logo</span>
            </div>
            <h3 class="font-['DM_Sans'] font-semibold text-sm text-gray-800 mb-2">Company name</h3>
            <p class="font-['DM_Sans'] text-xs text-gray-600 leading-relaxed">
              Description dolor in reprehenderit in voluptate velit esse fugiat nulla pariatur. Excepteur sint occaecat cupidatat nonproident.
            </p>
          </div>
          
          <div class="bg-orange-50 rounded-2xl p-6 text-center">
            <div class="bg-gray-200 h-16 rounded-lg mb-4 flex items-center justify-center">
              <span class="text-gray-500 text-xs">Logo</span>
            </div>
            <h3 class="font-['DM_Sans'] font-semibold text-sm text-gray-800 mb-2">Company name</h3>
            <p class="font-['DM_Sans'] text-xs text-gray-600 leading-relaxed">
              Description dolor in reprehenderit in voluptate velit esse fugiat nulla pariatur. Excepteur sint occaecat cupidatat nonproident.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Social Responsibility Section -->
    <section class="py-16 px-4 md:px-8 lg:px-32 bg-white">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Content -->
          <div class="space-y-6">
            <h2 class="font-['Poppins'] font-semibold text-3xl md:text-4xl text-gray-800 leading-tight">
              Social and Environmental Responsibility
            </h2>
            <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
              Our commitment is not limited to the product. We commit to promoting the culture of sustainability, energy efficiency and respect for the territory. We invest in research, training and awareness, because we believe that every small gesture can contribute to a better future.
              <br><br>
              Choosing HeyHome means trusting a reality that combines experience, professionalism and passion. Browse our sections, discover our products and our advice, and do not hesitate to contact us for any request. We are here to help you build, renew and improve the spaces where you live, with the certainty of making smart and sustainable choices.
            </p>
          </div>
          
          <!-- Image -->
          <div class="relative">
            <div class="bg-gradient-to-br from-green-400 to-green-600 rounded-3xl h-96 flex items-center justify-center relative overflow-hidden">
              <!-- Logo placeholder -->
              <div class="bg-white rounded-lg p-8">
                <div class="w-32 h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  `]
})
export class OffersPageComponent {
} 