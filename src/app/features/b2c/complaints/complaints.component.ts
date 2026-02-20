import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { FAQItem } from '../../../shared/models/faq-item.model';
import { FAQS } from '../../../shared/data/faqs.data';
import { TranslatePipe } from "../../../shared/pipes/translate.pipe";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [TranslatePipe, CommonModule, ReactiveFormsModule],
  templateUrl: './complaints.component.html',
  styleUrl: './complaints.component.scss'
})
export class ComplaintsComponent {
  private readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  contactForm: FormGroup;
  isSubmitting = false;
  messageSent = false;
  fileErrors: string[] = [];

  selectedFiles: File[] = [];
  isDragOver = false;

  faqs: FAQItem[] = FAQS;

  constructor(
    private fb: FormBuilder, 
    private supabase: SupabaseService, 
    private router: Router) {
    this.contactForm = this.fb.group({
      fullNameOrCompany: ['', [Validators.required]],
      address: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      invoiceNumber: ['', [Validators.required]],
      invoiceDate: ['', [Validators.required]],
      itemOrService: [''],
      description: ['', [Validators.required, Validators.minLength(10)]],
      // attachments are handled via selectedFiles (not inside FormGroup)
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid || this.isSubmitting) return;
    this.isSubmitting = true;
    const v = this.contactForm.value;

    // Optional: store attachment names now; upload files later if you implement storage
    const attachmentNames = this.selectedFiles.map(f => f.name);

    this.supabase.createRecord('complaints', {
      full_name_or_company: v.fullNameOrCompany,
      address: v.address || null,
      email: v.email,
      phone: v.phone || null,
      invoice_number: v.invoiceNumber,
      invoice_date: v.invoiceDate, // if input type="date" => "YYYY-MM-DD"
      item_or_service: v.itemOrService || null,
      description: v.description,
      attachments: this.selectedFiles.length
        ? this.selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
        : null,
      // extra metadata if you want:
      status: 'new'
    })
    .then(() => {
      this.isSubmitting = false;
      this.messageSent = true;
      this.contactForm.reset();
      this.selectedFiles = [];
      setTimeout(() => { this.messageSent = false; }, 5000);
    })
    .catch(error => {
      console.error('Error sending complaints form:', error);
      this.isSubmitting = false;
      this.fileErrors.push(`Error sending form`);
    });
  }

  toggleFaq(faqId: string): void {
    const faq = this.faqs.find(f => f.id === faqId);
    if (faq) {
      faq.isOpen = !faq.isOpen;
    }
  }

  trackByFaqId(index: number, faq: FAQItem): string {
    return faq.id;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    const validFiles: File[] = [];

    this.fileErrors = [];

    for (const file of files) {
      if (file.size > this.MAX_FILE_SIZE) {
        this.fileErrors.push(`File "${file.name}" is larger than 2MB.`);
        continue;
      }

      if (!this.ALLOWED_TYPES.includes(file.type)) {
        this.fileErrors.push(`File "${file.name}" is not a supported format.`);
        continue;
      }

      validFiles.push(file);
    }

    this.selectedFiles = validFiles;
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    this.fileErrors = [];

    const files = event.dataTransfer?.files
      ? Array.from(event.dataTransfer.files)
      : [];

    const validFiles: File[] = [];

    for (const file of files) {
      if (file.size > this.MAX_FILE_SIZE) {
        this.fileErrors.push(`File "${file.name}" is larger than 2MB.`);
        continue;
      }

      if (!this.ALLOWED_TYPES.includes(file.type)) {
        this.fileErrors.push(`File "${file.name}" is not a supported format.`);
        continue;
      }

      validFiles.push(file);
    }

    this.selectedFiles = validFiles;
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
