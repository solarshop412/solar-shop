import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';

@Component({
  selector: 'app-admin-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-form.component.html',
  styleUrls: ['./admin-form.component.scss']
})
export class AdminFormComponent {
  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() form!: FormGroup;
  @Input() isEditMode = false;
  @Input() isSubmitting = false;
  @Input() backRoute!: string;
  translationService = inject(TranslationService);

  @Output() formSubmit = new EventEmitter<any>();

  private router = inject(Router);

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    }
  }

  goBack(): void {
    this.router.navigate([this.backRoute]);
  }
} 