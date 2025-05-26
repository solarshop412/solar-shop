import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: number;
  category: string;
  tags: string[];
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-green-600 to-green-800 text-white py-20 px-4 md:px-8 lg:px-32">
      <div class="max-w-6xl mx-auto text-center">
        <h1 class="font-['Poppins'] font-semibold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
          Blog & Guides
        </h1>
        <p class="font-['DM_Sans'] text-base md:text-lg max-w-4xl mx-auto opacity-80 leading-relaxed">
          Welcome to the Blog & Guides section of SolarShop, your reference point for insights, practical advice and useful information on construction, systems, energy solutions and sustainability. Here you will find content designed to help you choose the right products, plan your projects and better understand the technologies and regulations of the sector.
        </p>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-16 px-4 md:px-8 lg:px-32 bg-white">
      <div class="max-w-6xl mx-auto">
        <!-- Category Filters -->
        <div class="flex flex-wrap justify-center gap-3 mb-16">
          <button class="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium font-['DM_Sans'] uppercase tracking-wider">
            General
          </button>
          <button class="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium font-['DM_Sans'] uppercase tracking-wider hover:bg-gray-200 transition-colors">
            Regulations & Benefits
          </button>
          <button class="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium font-['DM_Sans'] uppercase tracking-wider hover:bg-gray-200 transition-colors">
            Technical Guides
          </button>
          <button class="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium font-['DM_Sans'] uppercase tracking-wider hover:bg-gray-200 transition-colors">
            Success Stories
          </button>
          <button class="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium font-['DM_Sans'] uppercase tracking-wider hover:bg-gray-200 transition-colors">
            FAQ & Video Tutorials
          </button>
        </div>

        <!-- Blog Posts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <!-- Blog Post 1 -->
          <article 
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
            (click)="navigateToPost('1')"
          >
            <div class="bg-gray-200 h-60 flex items-center justify-center">
              <span class="text-gray-500 font-['DM_Sans']">Article Image</span>
            </div>
            <div class="p-6 space-y-3">
              <div class="flex items-center justify-between text-sm text-gray-500 font-['DM_Sans']">
                <span>Jan 15, 2024</span>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span>8 min</span>
                </div>
              </div>
              <h3 class="font-['DM_Sans'] font-semibold text-xl text-gray-800 leading-tight">
                Complete Guide to Solar Panel Installation
              </h3>
              <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                Step by step, learn to install solar panels, replace flooring or improve the thermal insulation of your home. Our guides are written in a clear and understandable way, ideal for both professionals and beginners.
              </p>
            </div>
          </article>

          <!-- Blog Post 2 -->
          <article 
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
            (click)="navigateToPost('2')"
          >
            <div class="bg-gradient-to-br from-blue-200 to-blue-300 h-60 flex items-center justify-center">
              <span class="text-blue-700 font-['DM_Sans']">Article Image</span>
            </div>
            <div class="p-6 space-y-3">
              <div class="flex items-center justify-between text-sm text-gray-500 font-['DM_Sans']">
                <span>Jan 10, 2024</span>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span>6 min</span>
                </div>
              </div>
              <h3 class="font-['DM_Sans'] font-semibold text-xl text-gray-800 leading-tight">
                Solar Panel Maintenance: Best Practices
              </h3>
              <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                Learn how to maintain your solar panels for maximum efficiency and longevity. Discover cleaning techniques, monitoring tips, and when to call professionals.
              </p>
            </div>
          </article>

          <!-- Blog Post 3 -->
          <article 
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
            (click)="navigateToPost('3')"
          >
            <div class="bg-gradient-to-br from-orange-200 to-orange-300 h-60 flex items-center justify-center">
              <span class="text-orange-700 font-['DM_Sans']">Article Image</span>
            </div>
            <div class="p-6 space-y-3">
              <div class="flex items-center justify-between text-sm text-gray-500 font-['DM_Sans']">
                <span>Jan 5, 2024</span>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span>7 min</span>
                </div>
              </div>
              <h3 class="font-['DM_Sans'] font-semibold text-xl text-gray-800 leading-tight">
                Understanding Solar Incentives and Tax Credits 2024
              </h3>
              <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                Maximize your savings with federal and state solar incentives available this year. Complete guide to tax credits, rebates, and financing options.
              </p>
            </div>
          </article>

          <!-- Blog Post 4 -->
          <article 
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
            (click)="navigateToPost('4')"
          >
            <div class="bg-gradient-to-br from-green-200 to-green-300 h-60 flex items-center justify-center">
              <span class="text-green-700 font-['DM_Sans']">Article Image</span>
            </div>
            <div class="p-6 space-y-3">
              <div class="flex items-center justify-between text-sm text-gray-500 font-['DM_Sans']">
                <span>Dec 28, 2023</span>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span>5 min</span>
                </div>
              </div>
              <h3 class="font-['DM_Sans'] font-semibold text-xl text-gray-800 leading-tight">
                Energy Storage Solutions: Battery Systems Guide
              </h3>
              <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                Explore the latest in solar battery technology and energy storage solutions. Learn about different battery types, costs, and installation considerations.
              </p>
            </div>
          </article>

          <!-- Blog Post 5 -->
          <article 
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
            (click)="navigateToPost('5')"
          >
            <div class="bg-gradient-to-br from-purple-200 to-purple-300 h-60 flex items-center justify-center">
              <span class="text-purple-700 font-['DM_Sans']">Article Image</span>
            </div>
            <div class="p-6 space-y-3">
              <div class="flex items-center justify-between text-sm text-gray-500 font-['DM_Sans']">
                <span>Dec 20, 2023</span>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span>6 min</span>
                </div>
              </div>
              <h3 class="font-['DM_Sans'] font-semibold text-xl text-gray-800 leading-tight">
                Smart Home Integration with Solar Systems
              </h3>
              <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                Discover how to integrate your solar system with smart home technology for optimal energy management and monitoring capabilities.
              </p>
            </div>
          </article>

          <!-- Blog Post 6 -->
          <article 
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
            (click)="navigateToPost('6')"
          >
            <div class="bg-gradient-to-br from-red-200 to-red-300 h-60 flex items-center justify-center">
              <span class="text-red-700 font-['DM_Sans']">Article Image</span>
            </div>
            <div class="p-6 space-y-3">
              <div class="flex items-center justify-between text-sm text-gray-500 font-['DM_Sans']">
                <span>Dec 15, 2023</span>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span>9 min</span>
                </div>
              </div>
              <h3 class="font-['DM_Sans'] font-semibold text-xl text-gray-800 leading-tight">
                Commercial Solar Solutions for Businesses
              </h3>
              <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                Learn about commercial solar installations, financing options, and how businesses can benefit from renewable energy solutions.
              </p>
            </div>
          </article>
        </div>

        <!-- See More Button -->
        <div class="text-center">
          <button (click)="navigateToBlog()" class="inline-flex items-center gap-2 text-gray-800 font-['DM_Sans'] font-semibold text-lg hover:text-green-600 transition-colors">
            See more
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- What You'll Find Section -->
    <section class="py-16 px-4 md:px-8 lg:px-32 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Left Column -->
          <div class="space-y-8">
            <h2 class="font-['Poppins'] font-semibold text-2xl text-gray-800 leading-tight">
              What you'll find in this section?
            </h2>
            
            <div class="space-y-6">
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">Technical Guides</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  Step by step, learn to install solar panels, replace flooring or improve the thermal insulation of your home. Our guides are written in a clear and understandable way, ideal for both professionals and beginners.
                </p>
              </div>
              
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">Regulations and Incentives Insights</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  Stay updated on tax deductions, environmental regulations and incentives for energy requalification. Discover how to get the most out of your renovation, saving time, money and energy.
                </p>
              </div>
              
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">Sustainability Tips</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  Practical advice to make your home more efficient and environmentally friendly. From the use of recycled materials to the most innovative technologies, you will find ideas and inspiration to contribute to a greener future.
                </p>
              </div>
              
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">Case Studies and Success Stories</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  Take a look at projects realized with our products, discover how other customers have transformed their spaces, and be inspired by solutions that combine functionality, aesthetics and energy efficiency.
                </p>
              </div>
              
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">FAQ and Video Tutorials</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  Find quick answers to your most common doubts. Thanks to video tutorials you will be able to better understand the key steps of a renovation or the installation of a system, learning techniques and best practices directly from experts.
                </p>
              </div>
            </div>
          </div>
          
          <!-- Right Column -->
          <div class="space-y-8">
            <h2 class="font-['Poppins'] font-semibold text-2xl text-gray-800 leading-tight">
              Your trusted partner
            </h2>
            
            <p class="font-['DM_Sans'] text-base text-gray-800 leading-relaxed">
              Our goal is to provide you with clear, reliable and up-to-date information, helping you make informed choices to improve the quality and comfort of your environment. Whether you are starting a small renovation or tackling a complex project, here you will find all the support you need, without overly technical or complicated terms.
              <br><br>
              Explore the SolarShop blog and guides, get inspired and contact us if you need further information or personalized consultation. With us, building and renovating becomes easier, more sustainable and more convenient.
            </p>
          </div>
        </div>
      </div>
    </section>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  `]
})
export class BlogComponent {
  constructor(private router: Router) { }

  navigateToPost(postId: string) {
    this.router.navigate(['/blog', postId]);
  }

  navigateToBlog() {
    this.router.navigate(['/blog']);
  }
} 