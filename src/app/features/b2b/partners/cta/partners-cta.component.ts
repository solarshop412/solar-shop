import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { selectCurrentUser } from '../../../../core/auth/store/auth.selectors';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-partners-cta',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './partners-cta.component.html',
  styleUrls: ['./partners-cta.component.scss']
})
export class PartnersCtaComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private store = inject(Store);
  private destroy$ = new Subject<void>();
  
  isAuthenticated = false;
  currentUser: User | null = null;

  ngOnInit(): void {
    this.store.select(selectCurrentUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.isAuthenticated = !!user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateToRegister() {
    this.router.navigate(['/partneri/registracija']);
  }

  navigateToContactSales() {
    this.router.navigate(['/partneri/kontakt']);
  }
}
