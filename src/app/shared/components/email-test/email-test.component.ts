import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmailService } from '../../../services/email.service';

@Component({
  selector: 'app-email-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './email-test.component.html',
  styleUrls: ['./email-test.component.scss']
})
export class EmailTestComponent {
  testForm: FormGroup;
  isSending = false;
  result: { success: boolean; message: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private emailService: EmailService
  ) {
    this.testForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      emailType: ['order-confirmation', [Validators.required]],
      // Company approval fields
      companyName: ['']
    });
  }

  async onSubmit(): Promise<void> {
    if (this.testForm.valid) {
      this.isSending = true;
      this.result = null;

      const formData = this.testForm.value;

      try {
        let success = false;

        switch (formData.emailType) {
          case 'order-confirmation':
            success = await this.emailService.sendOrderConfirmationEmail({
              to: formData.email,
              orderNumber: 'TEST-ORDER-123',
              orderDate: new Date().toLocaleDateString('hr-HR'),
              customerName: `${formData.firstName} ${formData.lastName}`,
              customerEmail: formData.email,
              items: [
                {
                  productName: 'Solar Panel 300W',
                  productSku: 'SP-300W-001',
                  quantity: 2,
                  unitPrice: 149.99,
                  totalPrice: 299.98
                },
                {
                  productName: 'Solar Inverter 2000W',
                  productSku: 'SI-2000W-001',
                  quantity: 1,
                  unitPrice: 299.99,
                  totalPrice: 299.99
                }
              ],
              subtotal: 599.97,
              taxAmount: 119.99,
              shippingCost: 25.00,
              totalAmount: 744.96
            });
            break;

          case 'company-approval':
            success = await this.emailService.sendCompanyApprovalEmail({
              to: formData.email,
              companyName: formData.companyName || 'Test Company Ltd.',
              companyEmail: formData.email
            });
            break;

          case 'order-status-change':
            success = await this.emailService.sendOrderStatusChangeEmail({
              to: formData.email,
              orderNumber: 'TEST-ORDER-123',
              orderId: '123',
              orderDate: new Date().toLocaleDateString('hr-HR'),
              customerName: `${formData.firstName} ${formData.lastName}`,
              customerEmail: formData.email,
              newStatus: 'Shipped',
            });
            break;

          default:
            throw new Error('Invalid email type');
        }

        this.result = {
          success,
          message: success
            ? `Test ${formData.emailType} email sent successfully to ${formData.email}`
            : `Failed to send ${formData.emailType} email. Check console for details.`
        };
      } catch (error) {
        console.error('Email test error:', error);
        this.result = {
          success: false,
          message: `Error sending email: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      } finally {
        this.isSending = false;
      }
    }
  }
}