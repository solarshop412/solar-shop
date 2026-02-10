import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { Company } from '../../../models/company.model';

@Component({
    selector: 'app-company-approval-modal',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    templateUrl: './company-approval-modal.component.html',
    styleUrls: ['./company-approval-modal.component.scss']
})
export class CompanyApprovalModalComponent {
    @Input() isOpen: boolean = false;
    @Input() company: Company | null = null;

    @Output() approved = new EventEmitter<Company>();
    @Output() cancelled = new EventEmitter<void>();

    onBackdropClick(event: Event): void {
        if (event.target === event.currentTarget) {
            this.onCancel();
        }
    }

    onApprove(): void {
        if (this.company) {
            this.approved.emit(this.company);
        }
    }

    onCancel(): void {
        this.cancelled.emit();
    }
} 