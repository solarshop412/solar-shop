import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Subject, takeUntil, switchMap, from, catchError, of } from 'rxjs';

@Component({
  selector: 'app-partners-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './partners-footer.component.html',
  styleUrls: ['./partners-footer.component.scss'],
})
export class PartnersFooterComponent implements OnInit, OnDestroy {
  private supabaseService = inject(SupabaseService);
  private destroy$ = new Subject<void>();

  currentYear = new Date().getFullYear();
  isAuthenticated = false;
  isCompanyContact = false;

  ngOnInit(): void {
    // Initialize authentication state and user data
    this.supabaseService
      .getCurrentUser()
      .pipe(
        takeUntil(this.destroy$),
        switchMap((user) => {
          this.isAuthenticated = !!user;

          if (user?.id) {
            // Check if user is a company contact person
            return from(
              this.supabaseService.client
                .from('companies')
                .select('id, status')
                .eq('contact_person_id', user.id)
                .single(),
            ).pipe(catchError(() => of({ data: null, error: null })));
          }
          return of({ data: null, error: null });
        }),
      )
      .subscribe(({ data }) => {
        this.isCompanyContact = !!data && data.status === 'approved';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
