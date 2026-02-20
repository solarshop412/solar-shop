import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SupabaseService } from '../../../services/supabase.service';
import { FAQItem } from '../../../shared/models/faq-item.model';
import { ShopLocation } from '../../../shared/models/shop-location.model';
import { FAQS } from '../../../shared/data/faqs.data';
import { TranslatePipe } from "../../../shared/pipes/translate.pipe";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [TranslatePipe, CommonModule, ReactiveFormsModule],
  templateUrl: './complaints.component.html',
  styleUrl: './complaints.component.scss'
})
export class ComplaintsComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  messageSent = false;

  selectedFiles: File[] = [];
  isDragOver = false;

  faqs: FAQItem[] = FAQS;

  constructor(
    private fb: FormBuilder, 
    private supabase: SupabaseService, 
    private sanitizer: DomSanitizer) {
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
      attachments: attachmentNames.length ? attachmentNames : null,
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
      alert('Error sending form');
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
    this.selectedFiles = files;
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

    const files = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [];
    if (files.length) this.selectedFiles = files;
  }
}
