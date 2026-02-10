import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
    private toastService = inject(ToastService);

    toasts$: Observable<Toast[]> = this.toastService.toasts$;

    trackByToastId(index: number, toast: Toast): string {
        return toast.id;
    }

    closeToast(id: string): void {
        this.toastService.removeToast(id);
    }
} 