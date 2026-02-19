import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  DataTableComponent,
  TableConfig,
} from '../shared/data-table/data-table.component';
import { SuccessModalComponent } from '../../../shared/components/modals/success-modal/success-modal.component';
import * as ReviewsActions from './store/reviews.actions';
import {
  selectReviews,
  selectReviewsLoading,
  selectReviewsError,
} from './store/reviews.selectors';
import { Review } from '../../../shared/models/review.model';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslationService } from '../../../shared/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AdminNotificationsService } from '../shared/services/admin-notifications.service';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    SuccessModalComponent,
    TranslatePipe,
  ],
  templateUrl: './admin-reviews.component.html',
  styleUrls: ['./admin-reviews.component.scss'],
})
export class AdminReviewsComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private actions$ = inject(Actions);
  private destroy$ = new Subject<void>();
  private notificationsService = inject(AdminNotificationsService);

  // Observables from store
  reviews$ = this.store.select(selectReviews);
  loading$ = this.store.select(selectReviewsLoading);
  error$ = this.store.select(selectReviewsError);

  // Success modal properties
  showSuccessModal = false;
  successModalTitle = '';
  successModalMessage = '';

  tableConfig: TableConfig = {
    columns: [
      {
        key: 'rating',
        label: this.translationService.translate(
          'admin.reviewsForm.reviewRating',
        ),
        type: 'text',
        sortable: true,
        format: (value: any) => {
          const stars = '★'.repeat(value);
          return `${stars} ${value}/5`;
        },
      },
      {
        key: 'user.firstName',
        label: this.translationService.translate(
          'admin.reviewsForm.reviewAuthor',
        ),
        type: 'text',
        sortable: true,
        searchable: true,
        format: (value: any) => `${value || 'Anonymous'}`,
      },
      {
        key: 'title',
        label: this.translationService.translate(
          'admin.reviewsForm.reviewTitle',
        ),
        type: 'text',
        sortable: true,
        searchable: true,
        format: (value) =>
          value
            ? value.length > 30
              ? value.substring(0, 30) + '...'
              : value
            : '',
      },
      {
        key: 'isApproved',
        label: this.translationService.translate(
          'admin.reviewsForm.reviewApproval',
        ),
        type: 'boolean',
        sortable: true,
        format: (value) =>
          value
            ? '✓ ' +
              this.translationService.translate('admin.reviewsForm.approved')
            : '⏳ ' +
              this.translationService.translate('admin.reviewsForm.pending'),
      },
      {
        key: 'createdAt',
        label: this.translationService.translate(
          'admin.reviewsForm.reviewDate',
        ),
        type: 'date',
        sortable: true,
      },
    ],
    actions: [
      {
        label: this.translationService.translate('common.view'),
        icon: 'eye',
        action: 'view',
        class: 'text-blue-600 hover:text-blue-900',
      },
      {
        label: this.translationService.translate('admin.reviewsForm.approved'),
        icon: 'check',
        action: 'approve',
        class: 'text-green-600 hover:text-green-900',
        condition: (item: any) => !item.isApproved,
      },
      {
        label: this.translationService.translate('admin.reviewsForm.rejected'),
        icon: 'x',
        action: 'reject',
        class: 'text-red-600 hover:text-red-900',
        condition: (item: any) => !item.isApproved,
      },
      {
        label: this.translationService.translate('common.hide'),
        icon: 'eye-off',
        action: 'hide',
        class: 'text-gray-600 hover:text-gray-900',
        condition: (item: any) => item.isApproved,
      },
      {
        label: this.translationService.translate('common.delete'),
        icon: 'trash2',
        action: 'delete',
        class: 'text-red-600 hover:text-red-900',
      },
    ],
    searchable: true,
    sortable: true,
    paginated: true,
    pageSize: 20,
    allowCsvImport: false,
    allowExport: true,
    rowClickable: true,
  };

  ngOnInit(): void {
    // Load reviews from store
    this.store.dispatch(ReviewsActions.loadReviews());

    // Mark reviews section as viewed to clear notification badge
    this.notificationsService.markSectionAsViewed('reviews');

    // Listen for success actions
    this.actions$
      .pipe(
        ofType(
          ReviewsActions.updateReviewStatusSuccess,
          ReviewsActions.approveReviewSuccess,
          ReviewsActions.rejectReviewSuccess,
          ReviewsActions.deleteReviewSuccess,
        ),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        // Reload reviews after successful action
        this.store.dispatch(ReviewsActions.loadReviews());
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTableAction(event: { action: string; item: Review }): void {
    const { action, item } = event;

    switch (action) {
      case 'view':
        this.router.navigate(['/admin/recenzije/pregled', item.id]);
        break;
      case 'approve':
        this.store.dispatch(
          ReviewsActions.approveReview({ reviewId: item.id }),
        );
        break;
      case 'reject':
        this.store.dispatch(ReviewsActions.rejectReview({ reviewId: item.id }));
        break;
      case 'hide':
        this.store.dispatch(
          ReviewsActions.updateReviewStatus({
            reviewId: item.id,
            status: 'hidden',
          }),
        );
        break;
      case 'delete':
        if (
          confirm(
            this.translationService.translate(
              'admin.reviewsForm.reviewDeleted',
            ),
          )
        ) {
          this.store.dispatch(
            ReviewsActions.deleteReview({ reviewId: item.id }),
          );
        }
        break;
    }
  }

  onRowClick(item: Review): void {
    this.router.navigate(['/admin/recenzije/detalji', item.id]);
  }

  onAddReview(): void {
    return;
  }

  async onCsvImported(csvData: any[]): Promise<void> {
    // CSV import not supported for reviews
    alert(this.translationService.translate('common.importError'));
  }

  private showSuccess(title: string, message: string): void {
    this.successModalTitle = title;
    this.successModalMessage = message;
    this.showSuccessModal = true;
  }

  onSuccessModalClosed(): void {
    this.showSuccessModal = false;
    this.successModalTitle = '';
    this.successModalMessage = '';
  }
}
