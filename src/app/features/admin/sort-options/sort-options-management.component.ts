import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  EventEmitter,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  SortOptionsService,
  SortOption,
  SortField,
} from '../../../shared/services/sort-options.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../shared/services/translation.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-sort-options-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './sort-options-management.component.html',
  styleUrls: ['./sort-options-management.component.scss'],
})
export class SortOptionsManagementComponent implements OnInit, OnDestroy {
  private sortOptionsService = inject(SortOptionsService);
  private translationService = inject(TranslationService);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();

  @Output() sortOptionsChanged = new EventEmitter<void>();

  sortOptions: SortOption[] = [];
  loading = true;
  saving = false;
  deleting = false;

  showModal = false;
  showDeleteModal = false;
  editingOption: SortOption | null = null;
  deletingOption: SortOption | null = null;
  codeExists = false;

  availableFields: { value: string; label_hr: string; label_en: string }[] = [];
  currentLang = 'hr';

  formData: Omit<SortOption, 'id' | 'created_at' | 'updated_at'> = {
    code: '',
    label_hr: '',
    label_en: '',
    field: 'name',
    direction: 'asc',
    sort_fields: [{ field: 'name', direction: 'asc' }],
    is_default: false,
    is_enabled: true,
    display_order: 0,
  };

  ngOnInit(): void {
    this.availableFields = this.sortOptionsService.getAvailableFields();
    this.currentLang = this.translationService.getCurrentLanguage();

    this.translationService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((lang) => {
        this.currentLang = lang;
      });

    this.sortOptionsService.sortOptions$
      .pipe(takeUntil(this.destroy$))
      .subscribe((options) => {
        this.sortOptions = options;
      });

    this.sortOptionsService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.loading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getFieldLabel(field: string): string {
    const found = this.availableFields.find((f) => f.value === field);
    if (found) {
      return this.currentLang === 'en' ? found.label_en : found.label_hr;
    }
    return field;
  }

  openAddModal(): void {
    this.editingOption = null;
    this.formData = {
      code: '',
      label_hr: '',
      label_en: '',
      field: 'name',
      direction: 'asc',
      sort_fields: [{ field: 'name', direction: 'asc' }],
      is_default: false,
      is_enabled: true,
      display_order: this.sortOptions.length,
    };
    this.codeExists = false;
    this.showModal = true;
  }

  openEditModal(option: SortOption): void {
    this.editingOption = option;
    // Get sort_fields from option, or create from legacy field/direction
    // Deep copy the sort_fields array to avoid reference issues
    const sortFields =
      option.sort_fields && option.sort_fields.length > 0
        ? option.sort_fields.map((sf) => ({
            field: sf.field,
            direction: sf.direction,
          }))
        : [{ field: option.field, direction: option.direction }];

    this.formData = {
      code: option.code,
      label_hr: option.label_hr,
      label_en: option.label_en,
      field: option.field,
      direction: option.direction,
      sort_fields: sortFields,
      is_default: option.is_default,
      is_enabled: option.is_enabled,
      display_order: option.display_order,
    };
    this.codeExists = false;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingOption = null;
  }

  async saveOption(): Promise<void> {
    if (this.saving) return;

    // Check for duplicate code when creating new
    if (!this.editingOption) {
      const existingCodes = this.sortOptions.map((o) => o.code.toLowerCase());
      if (existingCodes.includes(this.formData.code.toLowerCase())) {
        this.codeExists = true;
        return;
      }
    }

    // Sync legacy field/direction with first sort_fields entry
    if (this.formData.sort_fields.length > 0) {
      this.formData.field = this.formData.sort_fields[0].field;
      this.formData.direction = this.formData.sort_fields[0].direction;
    }

    this.saving = true;

    try {
      if (this.editingOption) {
        const success = await this.sortOptionsService.updateSortOption(
          this.editingOption.id!,
          this.formData,
        );
        if (success) {
          this.toastService.showSuccess(
            this.translationService.translate('sortOptions.sortOptionUpdated'),
          );
          this.sortOptionsChanged.emit();
        } else {
          this.toastService.showError(
            this.translationService.translate('sortOptions.errorUpdating'),
          );
        }
      } else {
        const result = await this.sortOptionsService.createSortOption(
          this.formData,
        );
        if (result) {
          this.toastService.showSuccess(
            this.translationService.translate('sortOptions.sortOptionCreated'),
          );
          this.sortOptionsChanged.emit();
        } else {
          this.toastService.showError(
            this.translationService.translate('sortOptions.errorCreating'),
          );
        }
      }
      this.closeModal();
    } catch (error) {
      console.error('Error saving sort option:', error);
      this.toastService.showError(
        this.translationService.translate('sortOptions.errorCreating'),
      );
    } finally {
      this.saving = false;
    }
  }

  confirmDelete(option: SortOption): void {
    this.deletingOption = option;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletingOption = null;
  }

  async deleteOption(): Promise<void> {
    if (!this.deletingOption || this.deleting) return;

    this.deleting = true;

    try {
      const success = await this.sortOptionsService.deleteSortOption(
        this.deletingOption.id!,
      );
      if (success) {
        this.toastService.showSuccess(
          this.translationService.translate('sortOptions.sortOptionDeleted'),
        );
        this.sortOptionsChanged.emit();
      } else {
        this.toastService.showError(
          this.translationService.translate('sortOptions.errorDeleting'),
        );
      }
      this.closeDeleteModal();
    } catch (error) {
      console.error('Error deleting sort option:', error);
      this.toastService.showError(
        this.translationService.translate('sortOptions.errorDeleting'),
      );
    } finally {
      this.deleting = false;
    }
  }

  async setAsDefault(option: SortOption): Promise<void> {
    if (option.is_default) return;

    const success = await this.sortOptionsService.setDefaultSortOption(
      option.id!,
    );
    if (success) {
      this.toastService.showSuccess(
        this.translationService.translate('sortOptions.sortOptionUpdated'),
      );
      this.sortOptionsChanged.emit();
    } else {
      this.toastService.showError(
        this.translationService.translate('sortOptions.errorUpdating'),
      );
    }
  }

  async toggleEnabled(option: SortOption): Promise<void> {
    const success = await this.sortOptionsService.toggleSortOptionEnabled(
      option.id!,
      !option.is_enabled,
    );
    if (success) {
      this.sortOptionsChanged.emit();
    } else {
      this.toastService.showError(
        this.translationService.translate('sortOptions.errorUpdating'),
      );
    }
  }

  async moveSortOption(option: SortOption, direction: -1 | 1): Promise<void> {
    const currentIndex = this.sortOptions.findIndex((o) => o.id === option.id);
    const newIndex = currentIndex + direction;

    if (newIndex < 0 || newIndex >= this.sortOptions.length) return;

    const otherOption = this.sortOptions[newIndex];

    // Swap display orders using actual index positions to ensure unique values
    const updates = [
      { id: option.id!, display_order: newIndex },
      { id: otherOption.id!, display_order: currentIndex },
    ];

    const success = await this.sortOptionsService.updateDisplayOrder(updates);
    if (success) {
      this.sortOptionsChanged.emit();
    }
  }

  // Helper to get sort fields from an option (with legacy fallback)
  getSortFields(option: SortOption): SortField[] {
    if (option.sort_fields && option.sort_fields.length > 0) {
      return option.sort_fields;
    }
    // Fallback to legacy single field/direction
    return [{ field: option.field, direction: option.direction }];
  }

  // Add a new sort field to the form
  addSortField(): void {
    this.formData.sort_fields.push({ field: 'name', direction: 'asc' });
  }

  // Remove a sort field from the form
  removeSortField(index: number): void {
    if (this.formData.sort_fields.length > 1) {
      this.formData.sort_fields.splice(index, 1);
    }
  }

  // Move a sort field up or down in the list
  moveSortField(index: number, direction: -1 | 1): void {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.formData.sort_fields.length) return;

    // Create a new array with swapped positions to trigger Angular change detection
    const newArray = [...this.formData.sort_fields];
    const temp = { ...newArray[index] };
    newArray[index] = { ...newArray[newIndex] };
    newArray[newIndex] = temp;
    this.formData.sort_fields = newArray;
  }
}
