import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BlogActions } from './store/blog.actions';
import { selectBlogPosts, selectIsLoading } from './store/blog.selectors';

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
    <!-- Blog Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div class="max-w-7xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <h2 class="text-4xl lg:text-5xl font-bold text-heyhome-dark-green font-['Poppins'] mb-4">
            Blog & Insights
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto font-['DM_Sans']">
            Discover the latest news, tips and insights on sustainable construction and energy efficiency
          </p>
        </div>

        <!-- Featured Post -->
        <div *ngIf="(blogPosts$ | async)?.length" class="mb-16">
          <div class="relative h-[500px] rounded-3xl overflow-hidden group cursor-pointer shadow-2xl">
            <img 
              [src]="(blogPosts$ | async)![0].imageUrl" 
              [alt]="(blogPosts$ | async)![0].title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            >
            <!-- Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
            <!-- Featured Badge -->
            <div class="absolute top-6 left-6 bg-[#0ACF83] text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
              Featured
            </div>

            <!-- Content -->
            <div class="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div class="max-w-4xl">
                <div class="flex items-center gap-4 mb-4">
                  <span class="bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full">
                    {{ (blogPosts$ | async)![0].category }}
                  </span>
                  <span class="text-white/80 text-sm">
                    {{ (blogPosts$ | async)![0].readTime }} min di lettura
                  </span>
                </div>
                
                <h3 class="text-3xl lg:text-4xl font-bold mb-4 font-['Poppins'] group-hover:text-[#0ACF83] transition-colors duration-300">
                  {{ (blogPosts$ | async)![0].title }}
                </h3>
                
                <p class="text-lg leading-relaxed mb-6 opacity-90 font-['DM_Sans'] line-clamp-2">
                  {{ (blogPosts$ | async)![0].excerpt }}
                </p>

                <!-- Author Info -->
                <div class="flex items-center gap-3">
                  <img 
                    [src]="(blogPosts$ | async)![0].author.avatar" 
                    [alt]="(blogPosts$ | async)![0].author.name"
                    class="w-10 h-10 rounded-full object-cover"
                  >
                  <div>
                    <p class="font-semibold text-white">{{ (blogPosts$ | async)![0].author.name }}</p>
                    <p class="text-white/80 text-sm">{{ (blogPosts$ | async)![0].publishedAt | date:'dd MMM yyyy' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Blog Posts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article 
            *ngFor="let post of (blogPosts$ | async)?.slice(1); trackBy: trackByPostId"
            class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <!-- Post Image -->
            <div class="relative h-56 bg-gray-50 overflow-hidden">
              <img 
                [src]="post.imageUrl" 
                [alt]="post.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              >
              <!-- Category Badge -->
              <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-heyhome-dark-green text-sm font-medium px-3 py-1 rounded-full shadow-md">
                {{ post.category }}
              </div>
            </div>

            <!-- Post Content -->
            <div class="p-6">
              <!-- Meta Info -->
              <div class="flex items-center justify-between mb-3">
                <span class="text-gray-500 text-sm">{{ post.publishedAt | date:'dd MMM yyyy' }}</span>
                <span class="text-gray-500 text-sm">{{ post.readTime }} min</span>
              </div>

              <!-- Title -->
              <h3 class="text-xl font-bold text-heyhome-dark-green mb-3 font-['Poppins'] group-hover:text-[#0ACF83] transition-colors duration-300 line-clamp-2">
                {{ post.title }}
              </h3>
              
              <!-- Excerpt -->
              <p class="text-gray-600 leading-relaxed mb-4 font-['DM_Sans'] line-clamp-3">
                {{ post.excerpt }}
              </p>

              <!-- Author & Read More -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <img 
                    [src]="post.author.avatar" 
                    [alt]="post.author.name"
                    class="w-8 h-8 rounded-full object-cover"
                  >
                  <span class="text-gray-700 text-sm font-medium">{{ post.author.name }}</span>
                </div>
                
                <button class="text-[#0ACF83] font-semibold text-sm hover:text-[#09b574] transition-colors duration-300 flex items-center gap-1 group">
                  <span>Read More</span>
                  <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              <!-- Tags -->
              <div class="flex flex-wrap gap-2 mt-4">
                <span 
                  *ngFor="let tag of post.tags.slice(0, 3)" 
                  class="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full hover:bg-[#0ACF83] hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </article>
        </div>

        <!-- View All Posts Button -->
        <div class="text-center mt-16">
          <button class="bg-[#0ACF83] text-white font-semibold text-lg px-8 py-4 rounded-xl hover:bg-[#09b574] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            View All Articles
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading$ | async" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-heyhome-primary border-t-transparent"></div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class BlogComponent implements OnInit {
  private store = inject(Store);

  blogPosts$: Observable<BlogPost[]>;
  isLoading$: Observable<boolean>;

  constructor() {
    this.blogPosts$ = this.store.select(selectBlogPosts);
    this.isLoading$ = this.store.select(selectIsLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(BlogActions.loadBlogPosts());
  }

  trackByPostId(index: number, post: BlogPost): string {
    return post.id;
  }
} 