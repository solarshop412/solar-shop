import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import {
  DataTableComponent,
  TableConfig,
} from '../shared/data-table/data-table.component';
import { ReactiveFormsModule } from '@angular/forms';
import { mapInquiriesToOfferRowsVM, OfferRowVM } from './admin-offers.mapper';

@Component({
  selector: 'app-admin-offers',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './admin-offers.component.html',
  styleUrls: ['./admin-offers.component.scss'],
})
export class AdminOffersComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private title = inject(Title);
  private translationService = inject(TranslationService);

  private loadingSubject = new BehaviorSubject<boolean>(true);

  private offersSubject = new BehaviorSubject<OfferRowVM[]>([]);
  offers$ = this.offersSubject.asObservable();

  loading$ = this.loadingSubject.asObservable();

  tableConfig: TableConfig = {
    columns: [
      {
        key: 'image_url',
        label: this.translationService.translate('admin.common.image'),
        type: 'image',
        sortable: false,
        searchable: false,
        width: '8%',
        minWidth: '70px',
      },
      {
        key: 'title',
        label: this.translationService.translate('admin.offersForm.offerName'),
        type: 'text',
        sortable: true,
        searchable: true,
        width: '25%',
        minWidth: '180px',
        maxWidth: '300px',
      },
      {
        key: 'user',
        label: this.translationService.translate('admin.offersForm.user'),
        type: 'text',
        sortable: true,
        searchable: true,
        width: '12%',
        minWidth: '100px'
      },
      {
        key: 'created_at',
        label: this.translationService.translate('admin.offersForm.createdAt'),
        type: 'text',
        sortable: true,
        searchable: false,
        width: '14%',
        minWidth: '140px',
        format: (value) => {
          if (!value) return '—';
          return new Date(value).toLocaleString('hr-HR'); // or dynamic locale
        },
      },
      {
        key: 'status',
        label: this.translationService.translate('admin.offersForm.status'),
        type: 'status',
        sortable: true,
        format: (value) => {
          return (
            this.translationService.translate(`admin.offersForm.${value}`) ||
            value
          );
        },
        width: '12%',
        minWidth: '100px',
      },
    ],
    actions: [
      {
        label: this.translationService.translate('common.view'),
        icon: 'eye',
        action: 'details',
        class: 'text-green-600 hover:text-green-900',
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
    allowExport: false,
    rowClickable: true,
  };

  ngOnInit(): void {
    this.title.setTitle(
      this.translationService.translate('admin.offersForm.title') +
        ' - Solar Shop Admin',
    );
    this.loadOffers();

    this.offers$.subscribe((offer) => {
      console.log("offer", offer);
    });
  }

  onTableAction(event: { action: string; item: any }): void {
    const { action, item } = event;

    switch (action) {
      case 'edit':
        this.router.navigate(['/admin/ponude/uredi', item.id]);
        break;
      case 'details':
        this.router.navigate(['/admin/ponude/detalji', item.id]);
        break;
      case 'delete':
        this.deleteOffer(item);
        break;
    }
  }

  onRowClick(item: any): void {
    this.router.navigate(['/admin/ponude/detalji', item.id]);
  }

  private async loadOffers(): Promise<void> {
    this.loadingSubject.next(true);
    try {
      const offers = await this.supabaseService.getProductsInquiryWithJoins();
      this.offersSubject.next(mapInquiriesToOfferRowsVM(offers));
    } catch (e) {
      console.error('Error loading offers:', e);
      this.offersSubject.next([]);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private async deleteOffer(offer: any): Promise<void> {
    try {
      await this.supabaseService.deleteRecord('products_inquiry', offer.id);
      this.loadOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert(this.translationService.translate('admin.offersForm.offerError'));
    }
  }
}
