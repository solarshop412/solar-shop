import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, switchMap, from, catchError, of } from 'rxjs';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { SupabaseService } from '../../../../services/supabase.service';
import { selectCurrentUser } from '../../../../core/auth/store/auth.selectors';

@Component({
  selector: 'app-partners-hero',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './partners-hero.component.html',
  styleUrls: ['./partners-hero.component.scss']
})
export class PartnersHeroComponent implements OnInit {
  private router = inject(Router);
  private store = inject(Store);
  private supabaseService = inject(SupabaseService);

  isCompanyContact$: Observable<boolean>;

  constructor() {
    // Initialize the observable to check if user is a company contact
    this.isCompanyContact$ = this.store.select(selectCurrentUser).pipe(
      switchMap(user => {
        if (!user?.id) {
          return of(false);
        }

        // Check if user is a company contact person
        return from(
          this.supabaseService.client
            .from('companies')
            .select('id, status')
            .eq('contact_person_id', user.id)
            .eq('status', 'approved')
            .single()
        ).pipe(
          catchError(() => of({ data: null, error: true })),
          switchMap(result => of(!!result.data))
        );
      })
    );
  }

  ngOnInit(): void {
    // Component initialization if needed
  }

  navigateToRegister(): void {
    this.router.navigate(['/partneri/registracija']);
  }

  navigateToAbout(): void {
    this.router.navigate(['/partneri/o-nama']);
  }

  navigateToProducts(): void {
    this.router.navigate(['/partneri/proizvodi']);
  }

  navigateToOffers(): void {
    this.router.navigate(['/partneri/ponude']);
  }
}
