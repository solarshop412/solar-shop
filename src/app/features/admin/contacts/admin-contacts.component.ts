import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import {
  DataTableComponent,
  TableConfig,
} from '../shared/data-table/data-table.component';
import { AdminNotificationsService } from '../shared/services/admin-notifications.service';

@Component({
  selector: 'app-admin-contacts',
  standalone: true,
  imports: [CommonModule, DataTableComponent, TranslatePipe],
  templateUrl: './admin-contacts.component.html',
  styleUrls: ['./admin-contacts.component.scss'],
})
export class AdminContactsComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private translationService = inject(TranslationService);
  private notificationsService = inject(AdminNotificationsService);

  private contactsSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(true);
  contacts$ = this.contactsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  selectedContact: any | null = null;

  tableConfig: TableConfig = {
    columns: [
      {
        key: 'first_name',
        label: this.translationService.translate(
          'admin.contactsForm.contactName',
        ),
        type: 'text',
        sortable: true,
        searchable: true,
      },
      {
        key: 'last_name',
        label: this.translationService.translate(
          'admin.contactsForm.contactName',
        ),
        type: 'text',
        sortable: true,
        searchable: true,
      },
      {
        key: 'email',
        label: this.translationService.translate(
          'admin.contactsForm.contactEmail',
        ),
        type: 'text',
        sortable: true,
        searchable: true,
      },
      {
        key: 'subject',
        label: this.translationService.translate(
          'admin.contactsForm.contactSubject',
        ),
        type: 'text',
        sortable: true,
        searchable: true,
      },
      {
        key: 'is_newsletter',
        label: this.translationService.translate('footer.newsletter'),
        type: 'boolean',
        sortable: true,
        format: (value) =>
          value
            ? this.translationService.translate('admin.common.yes')
            : this.translationService.translate('admin.common.no'),
      },
      {
        key: 'created_at',
        label: this.translationService.translate('admin.orderDate'),
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
    this.loadContacts();

    // Mark contacts section as viewed to clear notification badge
    this.notificationsService.markSectionAsViewed('contacts');
  }

  onTableAction(event: { action: string; item: any }): void {
    const { action, item } = event;
    if (action === 'view') {
      this.selectedContact = item;
    } else if (action === 'delete') {
      this.deleteContact(item);
    }
  }

  onRowClick(item: any): void {
    this.selectedContact = item;
  }

  closeModal(): void {
    this.selectedContact = null;
  }

  private async loadContacts(): Promise<void> {
    this.loadingSubject.next(true);
    try {
      const contacts = await this.supabaseService.getTable('contacts');
      this.contactsSubject.next(contacts || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
      this.contactsSubject.next([]);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private async deleteContact(contact: any): Promise<void> {
    if (
      !confirm(
        this.translationService.translate('admin.contactsForm.contactDeleted'),
      )
    )
      return;
    try {
      await this.supabaseService.deleteRecord('contacts', contact.id);
      this.loadContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert(
        this.translationService.translate('admin.contactsForm.contactError'),
      );
    }
  }
}
