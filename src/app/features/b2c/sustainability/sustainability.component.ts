import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SustainabilityActions } from './store/sustainability.actions';
import { selectFeatures } from './store/sustainability.selectors';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

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
  imports: [CommonModule, TranslatePipe],
  templateUrl: './sustainability.component.html',
  styleUrls: ['./sustainability.component.scss']
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
    this.router.navigate(['/misija']);
  }

  navigateToSustainability() {
    this.router.navigate(['/tvrtka']);
  }
} 