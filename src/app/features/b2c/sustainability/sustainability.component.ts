import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SustainabilityActions } from './store/sustainability.actions';
import { selectFeatures } from './store/sustainability.selectors';
import { Router } from '@angular/router';

export interface SustainabilityFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-sustainability',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Sustainability Features Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FFFAF1] to-[#F0F9FF]">
      <div class="max-w-7xl mx-auto">
        <!-- Hero Image and Content -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <!-- Image -->
          <div class="relative">
            <img 
              src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Sustainable Energy Solutions" 
              class="w-full h-[400px] object-cover rounded-3xl shadow-2xl"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-[#0B8F5C]/20 to-transparent rounded-3xl"></div>
          </div>

          <!-- Content -->
          <div>
            <h2 class="text-4xl lg:text-5xl font-bold text-heyhome-dark-green font-['Poppins'] mb-6">
              Towards Sustainability
            </h2>
            <p class="text-xl text-gray-600 leading-relaxed font-['DM_Sans'] mb-8">
              Selection of innovative sustainable solutions to reduce environmental impact and emissions.
            </p>
            <button (click)="navigateToMission()" class="bg-[#0ACF83] text-white font-semibold text-lg px-8 py-4 rounded-xl hover:bg-[#09b574] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Learn More
            </button>
          </div>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div 
            *ngFor="let feature of features$ | async; trackBy: trackByFeatureId"
            class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group"
          >
            <!-- Icon -->
            <div class="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                 [style.background]="feature.color">
              <div [innerHTML]="feature.icon" class="w-8 h-8 text-white"></div>
            </div>

            <!-- Content -->
            <h3 class="text-xl font-bold text-heyhome-dark-green mb-4 font-['Poppins']">
              {{ feature.title }}
            </h3>
            
            <p class="text-gray-600 leading-relaxed font-['DM_Sans']">
              {{ feature.description }}
            </p>
          </div>
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
export class SustainabilityComponent implements OnInit {
  private store = inject(Store);

  features$: Observable<SustainabilityFeature[]>;

  constructor(private router: Router) {
    this.features$ = this.store.select(selectFeatures);
  }

  ngOnInit(): void {
    this.store.dispatch(SustainabilityActions.loadFeatures());
  }

  trackByFeatureId(index: number, feature: SustainabilityFeature): string {
    return feature.id;
  }

  navigateToMission() {
    this.router.navigate(['/mission']);
  }
} 