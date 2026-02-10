import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Company } from '../../../../shared/models/company.model';
import { DeleteConfirmationModalComponent } from '../../../../shared/components/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { CompanyApprovalModalComponent } from '../../../../shared/components/modals/company-approval-modal/company-approval-modal.component';
import { DataTableComponent, TableConfig } from '../../shared/data-table/data-table.component';
import * as CompaniesActions from '../store/companies.actions';
import {
  selectFilteredCompanies,
  selectCompaniesLoading,
  selectCompaniesError,
  selectTotalCompanies,
  selectPendingCompanies,
  selectApprovedCompanies,
  selectRejectedCompanies,
  selectCompaniesApproving,
  selectCompaniesRejecting,
  selectCompaniesDeleting
} from '../store/companies.selectors';
import { TranslationService } from '../../../../shared/services/translation.service';
import { AdminNotificationsService } from '../../shared/services/admin-notifications.service';

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    DeleteConfirmationModalComponent, 
    CompanyApprovalModalComponent, 
    TranslatePipe, 
    DataTableComponent
  ],
  templateUrl: './admin-companies.component.html',
  styleUrls: ['./admin-companies.component.scss']
})
export class AdminCompaniesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  translationService = inject(TranslationService);
  private notificationsService = inject(AdminNotificationsService);

  // Observables
  filteredCompanies$: Observable<Company[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  totalCompanies$: Observable<number>;
  pendingCompanies$: Observable<number>;
  approvedCompanies$: Observable<number>;
  rejectedCompanies$: Observable<number>;
  approving$: Observable<boolean>;
  rejecting$: Observable<boolean>;
  deleting$: Observable<boolean>;
  selectedCompany: Company | null = null;

  // Delete modal properties
  showDeleteModal = false;
  deleteModalTitle = '';
  deleteModalMessage = '';
  pendingDeleteCompany: Company | null = null;

  // Approval modal properties
  showApprovalModal = false;
  pendingApprovalCompany: Company | null = null;

  // Table configuration
  tableConfig: TableConfig = {
    columns: [
      {
        key: 'companyName',
        label: this.translationService.translate('admin.companiesForm.company'),
        type: 'text',
        sortable: true,
        searchable: true
      },
      {
        key: 'contactPersonName',
        label: this.translationService.translate('admin.companiesForm.contactPerson'),
        type: 'text',
        sortable: true,
        searchable: true
      },
      {
        key: 'businessType',
        label: this.translationService.translate('admin.companiesForm.businessType'),
        type: 'status',
        sortable: true,
        format: (value) => this.getBusinessTypeLabel(value)
      },
      {
        key: 'status',
        label: this.translationService.translate('admin.companiesForm.status'),
        type: 'status',
        sortable: true,
        format: (value) => this.getStatusLabel(value)
      },
      {
        key: 'createdAt',
        label: this.translationService.translate('admin.companiesForm.appliedDate'),
        type: 'date',
        sortable: true,
        format: (value) => this.formatDate(value)
      }
    ],
    actions: [
      {
        label: this.translationService.translate('admin.companiesForm.view'),
        icon: 'eye',
        action: 'view',
        class: 'text-blue-600 hover:text-blue-900'
      },
      {
        label: this.translationService.translate('admin.companiesForm.approve'),
        icon: 'check',
        action: 'approve',
        class: 'text-green-600 hover:text-green-900',
        condition: (item: Company) => item.status === 'pending'
      },
      {
        label: this.translationService.translate('admin.companiesForm.reject'),
        icon: 'x',
        action: 'reject',
        class: 'text-orange-600 hover:text-orange-900',
        condition: (item: Company) => item.status === 'pending'
      },
      {
        label: this.translationService.translate('admin.companiesForm.edit'),
        icon: 'edit',
        action: 'edit',
        class: 'text-blue-600 hover:text-blue-900'
      },
      {
        label: this.translationService.translate('admin.companiesForm.delete'),
        icon: 'trash2',
        action: 'delete',
        class: 'text-red-600 hover:text-red-900'
      }
    ],
    searchable: true,
    sortable: true,
    paginated: true,
    pageSize: 20,
    allowCsvImport: false,
    allowExport: true,
    rowClickable: true
  };

  constructor(private store: Store) {
    // Initialize observables
    this.filteredCompanies$ = this.store.select(selectFilteredCompanies);
    this.loading$ = this.store.select(selectCompaniesLoading);
    this.error$ = this.store.select(selectCompaniesError);
    this.totalCompanies$ = this.store.select(selectTotalCompanies);
    this.pendingCompanies$ = this.store.select(selectPendingCompanies);
    this.approvedCompanies$ = this.store.select(selectApprovedCompanies);
    this.rejectedCompanies$ = this.store.select(selectRejectedCompanies);
    this.approving$ = this.store.select(selectCompaniesApproving);
    this.rejecting$ = this.store.select(selectCompaniesRejecting);
    this.deleting$ = this.store.select(selectCompaniesDeleting);
  }

  ngOnInit(): void {
    this.loadCompanies();

    // Mark companies section as viewed to clear notification badge
    this.notificationsService.markSectionAsViewed('companies');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCompanies(): void {
    this.store.dispatch(CompaniesActions.loadCompanies());
  }

  onTableAction(event: { action: string, item: Company }): void {
    const { action, item } = event;

    switch (action) {
      case 'view':
        this.viewCompany(item);
        break;
      case 'approve':
        this.approveCompany(item);
        break;
      case 'reject':
        this.rejectCompany(item);
        break;
      case 'edit':
        this.editCompany(item);
        break;
      case 'delete':
        this.deleteCompany(item);
        break;
    }
  }

  onAddCompany(): void {
    this.router.navigate(['/admin/tvrtke/kreiraj']);
  }

  onRowClick(company: Company): void {
    this.viewCompany(company);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': this.translationService.translate('admin.companiesForm.pending'),
      'approved': this.translationService.translate('admin.companiesForm.approved'),
      'rejected': this.translationService.translate('admin.companiesForm.rejected')
    };
    return statusMap[status] || status;
  }

  getBusinessTypeClass(type: string): string {
    switch (type) {
      case 'retailer':
        return 'bg-blue-100 text-blue-800';
      case 'wholesaler':
        return 'bg-green-100 text-green-800';
      case 'installer':
        return 'bg-purple-100 text-purple-800';
      case 'distributor':
        return 'bg-orange-100 text-orange-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getBusinessTypeLabel(type: string): string {
    const typeMap: { [key: string]: string } = {
      'retailer': this.translationService.translate('admin.companiesForm.retailer'),
      'wholesaler': this.translationService.translate('admin.companiesForm.wholesaler'),
      'installer': this.translationService.translate('admin.companiesForm.installer'),
      'distributor': this.translationService.translate('admin.companiesForm.distributor'),
      'other': this.translationService.translate('admin.companiesForm.other')
    };
    return typeMap[type] || type;
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('hr-HR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  viewCompany(company: Company): void {
    this.selectedCompany = company;
  }

  closeModal(): void {
    this.selectedCompany = null;
  }

  approveCompany(company: Company): void {
    this.pendingApprovalCompany = company;
    this.showApprovalModal = true;
  }

  rejectCompany(company: Company): void {
    const reason = prompt(this.translationService.translate('admin.companiesForm.reasonForRejection'));
    if (reason) {
      this.store.dispatch(CompaniesActions.rejectCompany({
        companyId: company.id,
        reason: reason
      }));
      this.closeModal();
    }
  }

  editCompany(company: Company): void {
    this.router.navigate(['/admin/tvrtke/uredi', company.id]);
  }

  deleteCompany(company: Company): void {
    this.deleteModalTitle = this.translationService.translate('admin.companiesForm.confirmDeletion');
    this.deleteModalMessage = this.translationService.translate('admin.companiesForm.confirmDeletionMessage');
    this.pendingDeleteCompany = company;
    this.showDeleteModal = true;
  }

  onDeleteConfirmed(): void {
    if (this.pendingDeleteCompany) {
      this.store.dispatch(CompaniesActions.deleteCompany({
        companyId: this.pendingDeleteCompany.id
      }));
      this.pendingDeleteCompany = null;
      this.showDeleteModal = false;
      this.closeModal();
    }
  }

  onDeleteCancelled(): void {
    this.pendingDeleteCompany = null;
    this.showDeleteModal = false;
  }

  onApprovalConfirmed(): void {
    if (this.pendingApprovalCompany) {
      this.store.dispatch(CompaniesActions.approveCompany({
        companyId: this.pendingApprovalCompany.id
      }));
      this.pendingApprovalCompany = null;
      this.showApprovalModal = false;
      this.closeModal();
    }
  }

  onApprovalCancelled(): void {
    this.pendingApprovalCompany = null;
    this.showApprovalModal = false;
  }
}